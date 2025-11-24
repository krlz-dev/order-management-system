package com.inform.orderms.service;

import com.inform.orderms.model.Product;
import com.inform.orderms.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(UUID id) {
        return productRepository.findById(id);
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public Product updateProduct(UUID id, Product productDetails) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        
        product.setName(productDetails.getName());
        product.setPrice(productDetails.getPrice());
        product.setStock(productDetails.getStock());
        
        return productRepository.save(product);
    }

    public void deleteProduct(UUID id) {
        productRepository.deleteById(id);
    }

    public List<Product> searchProducts(String name, BigDecimal minPrice, BigDecimal maxPrice, 
                                       Integer minStock, Integer maxStock) {
        return productRepository.findProductsByFilters(name, minPrice, maxPrice, minStock, maxStock);
    }

    public Page<Product> searchProducts(String search, String name, BigDecimal minPrice, BigDecimal maxPrice, 
                                       Integer minStock, Integer maxStock, Pageable pageable) {
        return productRepository.findProductsByFilters(search, name, minPrice, maxPrice, minStock, maxStock, pageable);
    }
}