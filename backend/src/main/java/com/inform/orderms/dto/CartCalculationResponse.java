package com.inform.orderms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
public class CartCalculationResponse {
    private List<CartItemDetails> items;
    private BigDecimal totalPrice;
    private Integer totalItems;
    
    @Data
    @AllArgsConstructor
    public static class CartItemDetails {
        private String productId;
        private String productName;
        private BigDecimal unitPrice;
        private Integer quantity;
        private BigDecimal itemTotal;
        private boolean available;
        private Integer availableStock;
    }
}