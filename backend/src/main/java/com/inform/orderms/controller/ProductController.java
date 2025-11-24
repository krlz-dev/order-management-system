package com.inform.orderms.controller;

import com.inform.orderms.dto.PageResponse;
import com.inform.orderms.dto.ProductCreateRequest;
import com.inform.orderms.model.Product;
import com.inform.orderms.service.ProductService;
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
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Product", description = "Product management operations")
@SecurityRequirement(name = "Bearer Authentication")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Get all products", description = "Retrieve a paginated list of all products with optional search filters")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved products")
    public ResponseEntity<PageResponse<Product>> getAllProducts(
            @Parameter(description = "General search query (searches name and converts to price if numeric)") @RequestParam(required = false) String search,
            @Parameter(description = "Search by product name (case-insensitive)") @RequestParam(required = false) String name,
            @Parameter(description = "Minimum price filter") @RequestParam(required = false) BigDecimal minPrice,
            @Parameter(description = "Maximum price filter") @RequestParam(required = false) BigDecimal maxPrice,
            @Parameter(description = "Minimum stock quantity") @RequestParam(required = false) Integer minStock,
            @Parameter(description = "Maximum stock quantity") @RequestParam(required = false) Integer maxStock,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "name") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Product> products = productService.searchProducts(search, name, minPrice, maxPrice, minStock, maxStock, pageable);
        
        PageResponse<Product> response = new PageResponse<>(
                products.getContent(),
                products.getNumber(),
                products.getSize(),
                products.getTotalElements(),
                products.getTotalPages(),
                products.isFirst(),
                products.isLast()
        );
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID", description = "Retrieve a product by its unique identifier")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product found"),
        @ApiResponse(responseCode = "404", description = "Product not found")
    })
    public ResponseEntity<Product> getProductById(
            @Parameter(description = "Product ID") @PathVariable UUID id) {
        return productService.getProductById(id)
                .map(product -> ResponseEntity.ok(product))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create new product", description = "Create a new product with the provided details")
    @ApiResponse(responseCode = "201", description = "Product created successfully")
    public ResponseEntity<Product> createProduct(
            @Parameter(description = "Product details") @Valid @RequestBody ProductCreateRequest request) {
        Product product = new Product();
        product.setName(request.getName());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        
        Product createdProduct = productService.createProduct(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProduct);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update product", description = "Update an existing product with new details")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product updated successfully"),
        @ApiResponse(responseCode = "404", description = "Product not found")
    })
    public ResponseEntity<Product> updateProduct(
            @Parameter(description = "Product ID") @PathVariable UUID id,
            @Parameter(description = "Updated product details") @RequestBody Product productDetails) {
        try {
            Product updatedProduct = productService.updateProduct(id, productDetails);
            return ResponseEntity.ok(updatedProduct);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete product", description = "Delete a product by its unique identifier")
    @ApiResponse(responseCode = "204", description = "Product deleted successfully")
    public ResponseEntity<Void> deleteProduct(
            @Parameter(description = "Product ID") @PathVariable UUID id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}