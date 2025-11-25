package com.inform.orderms.service;

import com.inform.orderms.model.OrderItem;
import com.inform.orderms.model.Product;
import com.inform.orderms.repository.OrderRepository;
import com.inform.orderms.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;
    
    @Mock
    private ProductRepository productRepository;
    
    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderService = new OrderService(orderRepository, productRepository);
    }

    @Test
    @DisplayName("Should calculate total price correctly for single item")
    void shouldCalculateTotalPriceForSingleItem() {
        OrderItem item = createOrderItem(new BigDecimal("10.50"), 2);
        List<OrderItem> orderItems = List.of(item);

        BigDecimal totalPrice = orderService.calculateOrderTotalPrice(orderItems);

        assertEquals(new BigDecimal("21.00"), totalPrice);
    }

    @Test
    @DisplayName("Should calculate total price correctly for multiple items")
    void shouldCalculateTotalPriceForMultipleItems() {
        OrderItem item1 = createOrderItem(new BigDecimal("10.00"), 2);
        OrderItem item2 = createOrderItem(new BigDecimal("15.50"), 1);
        OrderItem item3 = createOrderItem(new BigDecimal("5.25"), 4);
        List<OrderItem> orderItems = Arrays.asList(item1, item2, item3);

        BigDecimal totalPrice = orderService.calculateOrderTotalPrice(orderItems);

        assertEquals(new BigDecimal("56.50"), totalPrice);
    }

    @Test
    @DisplayName("Should return zero for null order items list")
    void shouldReturnZeroForNullOrderItems() {
        BigDecimal totalPrice = orderService.calculateOrderTotalPrice(null);

        assertEquals(BigDecimal.ZERO, totalPrice);
    }

    @Test
    @DisplayName("Should return zero for empty order items list")
    void shouldReturnZeroForEmptyOrderItems() {
        List<OrderItem> orderItems = new ArrayList<>();

        BigDecimal totalPrice = orderService.calculateOrderTotalPrice(orderItems);

        assertEquals(BigDecimal.ZERO, totalPrice);
    }

    @Test
    @DisplayName("Should throw exception when unit price is null")
    void shouldThrowExceptionWhenUnitPriceIsNull() {
        OrderItem item = createOrderItem(null, 2);
        List<OrderItem> orderItems = List.of(item);

        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> orderService.calculateOrderTotalPrice(orderItems));
        assertEquals("OrderItem unit price cannot be null", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw exception when quantity is null")
    void shouldThrowExceptionWhenQuantityIsNull() {
        OrderItem item = new OrderItem();
        item.setUnitPrice(new BigDecimal("10.00"));
        item.setQuantity(null);
        List<OrderItem> orderItems = List.of(item);

        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> orderService.calculateOrderTotalPrice(orderItems));
        assertEquals("OrderItem quantity must be positive", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw exception when quantity is zero")
    void shouldThrowExceptionWhenQuantityIsZero() {
        OrderItem item = createOrderItem(new BigDecimal("10.00"), 0);
        List<OrderItem> orderItems = List.of(item);

        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> orderService.calculateOrderTotalPrice(orderItems));
        assertEquals("OrderItem quantity must be positive", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw exception when quantity is negative")
    void shouldThrowExceptionWhenQuantityIsNegative() {
        OrderItem item = createOrderItem(new BigDecimal("10.00"), -1);
        List<OrderItem> orderItems = List.of(item);

        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> orderService.calculateOrderTotalPrice(orderItems));
        assertEquals("OrderItem quantity must be positive", exception.getMessage());
    }

    @Test
    @DisplayName("Should handle decimal precision correctly")
    void shouldHandleDecimalPrecisionCorrectly() {
        OrderItem item1 = createOrderItem(new BigDecimal("10.333"), 3);
        OrderItem item2 = createOrderItem(new BigDecimal("5.667"), 2);
        List<OrderItem> orderItems = Arrays.asList(item1, item2);

        BigDecimal totalPrice = orderService.calculateOrderTotalPrice(orderItems);

        assertEquals(new BigDecimal("42.333"), totalPrice);
    }

    @Test
    @DisplayName("Should handle large quantities")
    void shouldHandleLargeQuantities() {
        OrderItem item = createOrderItem(new BigDecimal("1.00"), 1000);
        List<OrderItem> orderItems = List.of(item);

        BigDecimal totalPrice = orderService.calculateOrderTotalPrice(orderItems);

        assertEquals(new BigDecimal("1000.00"), totalPrice);
    }

    @Test
    @DisplayName("Should handle very small unit prices")
    void shouldHandleVerySmallUnitPrices() {
        OrderItem item = createOrderItem(new BigDecimal("0.01"), 1);
        List<OrderItem> orderItems = List.of(item);

        BigDecimal totalPrice = orderService.calculateOrderTotalPrice(orderItems);

        assertEquals(new BigDecimal("0.01"), totalPrice);
    }

    private OrderItem createOrderItem(BigDecimal unitPrice, Integer quantity) {
        OrderItem item = new OrderItem();
        item.setId(UUID.randomUUID());
        item.setUnitPrice(unitPrice);
        item.setQuantity(quantity);
        
        Product product = new Product();
        product.setId(UUID.randomUUID());
        product.setName("Test Product");
        product.setPrice(unitPrice);
        product.setStock(100);
        item.setProduct(product);
        
        return item;
    }
}