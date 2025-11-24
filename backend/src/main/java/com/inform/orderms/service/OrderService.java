package com.inform.orderms.service;

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
import java.util.List;
import java.util.Optional;
import java.util.UUID;

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
        // Force initialization of orderItems to avoid lazy loading issues
        orders.getContent().forEach(order -> order.getOrderItems().size());
        return orders;
    }

    @Transactional(readOnly = true)
    public Optional<Order> getOrderById(UUID id) {
        Optional<Order> order = orderRepository.findById(id);
        // Force initialization of orderItems to avoid lazy loading issues
        order.ifPresent(o -> o.getOrderItems().size());
        return order;
    }

    @Transactional
    public Order createOrder(Order order) {
        if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
            throw new RuntimeException("Order must contain at least one item");
        }
        
        BigDecimal totalPrice = BigDecimal.ZERO;
        
        for (OrderItem orderItem : order.getOrderItems()) {
            Product product = productRepository.findById(orderItem.getProduct().getId())
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + orderItem.getProduct().getId()));
            
            if (product.getStock() < orderItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }
            
            orderItem.setUnitPrice(product.getPrice());
            orderItem.setOrder(order);
            
            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(orderItem.getQuantity()));
            totalPrice = totalPrice.add(itemTotal);
            
            product.setStock(product.getStock() - orderItem.getQuantity());
            productRepository.save(product);
        }
        
        order.setTotalPrice(totalPrice);
        return orderRepository.save(order);
    }
}