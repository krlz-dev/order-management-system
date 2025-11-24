package com.inform.orderms.repository;

import com.inform.orderms.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    
    @Query("SELECT p FROM Product p WHERE " +
           "(:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
           "(:minStock IS NULL OR p.stock >= :minStock) AND " +
           "(:maxStock IS NULL OR p.stock <= :maxStock)")
    List<Product> findProductsByFilters(@Param("name") String name,
                                       @Param("minPrice") BigDecimal minPrice,
                                       @Param("maxPrice") BigDecimal maxPrice,
                                       @Param("minStock") Integer minStock,
                                       @Param("maxStock") Integer maxStock);

    @Query("SELECT p FROM Product p WHERE " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')))" +
           " AND (:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
           "(:minStock IS NULL OR p.stock >= :minStock) AND " +
           "(:maxStock IS NULL OR p.stock <= :maxStock)")
    Page<Product> findProductsByFilters(@Param("search") String search,
                                       @Param("name") String name,
                                       @Param("minPrice") BigDecimal minPrice,
                                       @Param("maxPrice") BigDecimal maxPrice,
                                       @Param("minStock") Integer minStock,
                                       @Param("maxStock") Integer maxStock,
                                       Pageable pageable);
}