package com.inform.orderms.service;

import com.inform.orderms.dto.CartCalculationRequest;
import com.inform.orderms.dto.CartCalculationResponse;
import com.inform.orderms.dto.CartItem;
import com.inform.orderms.dto.OrderItemResponse;
import com.inform.orderms.dto.OrderSummaryResponse;
import com.inform.orderms.model.Order;
import com.inform.orderms.model.OrderItem;
import com.inform.orderms.model.Product;
import com.inform.orderms.repository.OrderRepository;
import com.inform.orderms.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Page<Order> getAllOrders(Pageable pageable) {
        Page<Order> orders = orderRepository.findAll(pageable);
        orders.getContent().forEach(order -> order.getOrderItems().size());
        return orders;
    }

    @Transactional(readOnly = true)
    public Optional<Order> getOrderById(UUID id) {
        Optional<Order> order = orderRepository.findById(id);
        order.ifPresent(o -> o.getOrderItems().size());
        return order;
    }

    public BigDecimal calculateOrderTotalPrice(List<OrderItem> orderItems) {
        if (orderItems == null || orderItems.isEmpty()) {
            return BigDecimal.ZERO;
        }
        
        return orderItems.stream()
                .map(item -> {
                    if (item.getUnitPrice() == null) {
                        throw new RuntimeException("OrderItem unit price cannot be null");
                    }
                    if (item.getQuantity() == null || item.getQuantity() <= 0) {
                        throw new RuntimeException("OrderItem quantity must be positive");
                    }
                    return item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Transactional
    public Order createOrder(Order order) {
        if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
            throw new RuntimeException("Order must contain at least one item");
        }
        
        for (OrderItem orderItem : order.getOrderItems()) {
            Product product = productRepository.findById(orderItem.getProduct().getId())
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + orderItem.getProduct().getId()));
            
            if (product.getStock() < orderItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }
            
            orderItem.setUnitPrice(product.getPrice());
            orderItem.setOrder(order);
            
            product.setStock(product.getStock() - orderItem.getQuantity());
            productRepository.save(product);
        }
        
        BigDecimal totalPrice = calculateOrderTotalPrice(order.getOrderItems());
        order.setTotalPrice(totalPrice);
        return orderRepository.save(order);
    }

    public OrderSummaryResponse convertToOrderSummaryResponse(Order order) {
        List<OrderItemResponse> orderItemResponses = order.getOrderItems().stream()
                .map(this::convertToOrderItemResponse)
                .collect(Collectors.toList());
        
        return new OrderSummaryResponse(
                order.getId(),
                order.getCreatedAt(),
                order.getTotalPrice(),
                orderItemResponses
        );
    }

    public OrderItemResponse convertToOrderItemResponse(OrderItem orderItem) {
        return new OrderItemResponse(
                orderItem.getId(),
                orderItem.getProduct().getId(),
                orderItem.getProduct().getName(),
                orderItem.getUnitPrice(),
                orderItem.getQuantity()
        );
    }

    @Transactional(readOnly = true)
    public Page<OrderSummaryResponse> getAllOrdersSummary(Pageable pageable) {
        Page<Order> orders = orderRepository.findAll(pageable);
        orders.getContent().forEach(order -> order.getOrderItems().size());
        return orders.map(this::convertToOrderSummaryResponse);
    }

    @Transactional(readOnly = true)
    public CartCalculationResponse calculateCartTotal(CartCalculationRequest request) {
        List<CartCalculationResponse.CartItemDetails> itemDetails = new ArrayList<>();
        BigDecimal totalPrice = BigDecimal.ZERO;
        int totalItems = 0;

        for (CartItem cartItem : request.getItems()) {
            Product product = productRepository.findById(cartItem.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + cartItem.getProductId()));

            boolean available = product.getStock() >= cartItem.getQuantity();
            BigDecimal itemTotal = BigDecimal.ZERO;

            if (available) {
                itemTotal = product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
                totalPrice = totalPrice.add(itemTotal);
                totalItems += cartItem.getQuantity();
            }

            CartCalculationResponse.CartItemDetails itemDetail = new CartCalculationResponse.CartItemDetails(
                    product.getId().toString(),
                    product.getName(),
                    product.getPrice(),
                    cartItem.getQuantity(),
                    itemTotal,
                    available,
                    product.getStock()
            );

            itemDetails.add(itemDetail);
        }

        return new CartCalculationResponse(itemDetails, totalPrice, totalItems);
    }

    @Transactional
    public Order createOrderFromCart(CartCalculationRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Order must contain at least one item");
        }

        Order order = new Order();
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : request.getItems()) {
            Product product = productRepository.findById(cartItem.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + cartItem.getProductId()));

            if (product.getStock() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setUnitPrice(product.getPrice());
            orderItem.setOrder(order);

            orderItems.add(orderItem);

            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);
        }

        order.setOrderItems(orderItems);
        BigDecimal totalPrice = calculateOrderTotalPrice(orderItems);
        order.setTotalPrice(totalPrice);

        return orderRepository.save(order);
    }
}