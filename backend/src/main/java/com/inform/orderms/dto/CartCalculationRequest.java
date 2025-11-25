package com.inform.orderms.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartCalculationRequest {
    @NotEmpty(message = "Cart items cannot be empty")
    @Valid
    private List<CartItem> items;
}