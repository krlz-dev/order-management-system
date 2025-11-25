package com.inform.orderms.controller;

import com.inform.orderms.dto.CartCalculationRequest;
import com.inform.orderms.dto.CartCalculationResponse;
import com.inform.orderms.dto.ErrorResponse;
import com.inform.orderms.dto.OrderSummaryResponse;
import com.inform.orderms.dto.PageResponse;
import com.inform.orderms.model.Order;
import com.inform.orderms.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Order", description = "Order management operations")
@SecurityRequirement(name = "Bearer Authentication")
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    @Operation(summary = "Get all orders", description = "Retrieve a paginated list of all orders with optimized response structure")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved orders")
    public ResponseEntity<PageResponse<OrderSummaryResponse>> getAllOrders(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<OrderSummaryResponse> orders = orderService.getAllOrdersSummary(pageable);
        
        PageResponse<OrderSummaryResponse> response = new PageResponse<>(
                orders.getContent(),
                orders.getNumber(),
                orders.getSize(),
                orders.getTotalElements(),
                orders.getTotalPages(),
                orders.isFirst(),
                orders.isLast()
        );
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID", description = "Retrieve an order by its unique identifier")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order found"),
        @ApiResponse(responseCode = "404", description = "Order not found")
    })
    public ResponseEntity<Order> getOrderById(
            @Parameter(description = "Order ID") @PathVariable UUID id) {
        return orderService.getOrderById(id)
                .map(order -> ResponseEntity.ok(order))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create new order", description = "Create a new order with products. Total price is calculated automatically.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Order created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid order data or insufficient stock")
    })
    public ResponseEntity<?> createOrder(
            @Parameter(description = "Cart items with products and quantities") @Valid @RequestBody CartCalculationRequest request) {
        try {
            Order createdOrder = orderService.createOrderFromCart(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
        } catch (RuntimeException e) {
            ErrorResponse errorResponse = new ErrorResponse("BAD_REQUEST", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/calculate")
    @Operation(summary = "Calculate cart total", description = "Calculate total price and validate stock for cart items before order creation")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cart calculation completed successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid cart data")
    })
    public ResponseEntity<?> calculateCartTotal(
            @Parameter(description = "Cart items for calculation") @Valid @RequestBody CartCalculationRequest request) {
        try {
            CartCalculationResponse response = orderService.calculateCartTotal(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            ErrorResponse errorResponse = new ErrorResponse("BAD_REQUEST", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}