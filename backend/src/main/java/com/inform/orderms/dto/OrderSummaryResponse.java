package com.inform.orderms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
public class OrderSummaryResponse {
    private UUID id;
    private LocalDateTime createdAt;
    private BigDecimal totalPrice;
    private UUID userId;
    private String userEmail;
    private Integer totalItems;
    private List<OrderItemResponse> orderItems;

    public OrderSummaryResponse(UUID id, LocalDateTime createdAt, BigDecimal totalPrice, UUID userId, String userEmail, List<OrderItemResponse> orderItems) {
        this.id = id;
        this.createdAt = createdAt;
        this.totalPrice = totalPrice;
        this.userId = userId;
        this.userEmail = userEmail;
        this.orderItems = orderItems;
        this.totalItems = orderItems.stream()
                .mapToInt(OrderItemResponse::getQuantity)
                .sum();
    }
}