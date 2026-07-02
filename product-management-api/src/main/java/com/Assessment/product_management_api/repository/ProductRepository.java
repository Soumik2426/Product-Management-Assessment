package com.Assessment.product_management_api.repository;

import com.Assessment.product_management_api.entity.ProductEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, Long> {

    List<ProductEntity> findByCategory(String category);
    Page<ProductEntity> findByCategory(String category, Pageable pageable);
    List<ProductEntity> findByNameContainingIgnoreCase(String keyword);
    Page<ProductEntity> findByNameContainingIgnoreCase(String keyword, Pageable pageable);
    boolean existsByName(String name);
}
