package com.Assessment.product_management_api.repository;

import com.Assessment.product_management_api.entity.ProductEntity;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

@DataJpaTest
class ProductRepositoryTest {

    @Autowired
    private ProductRepository productRepository;

    @Test
    void findsProductsByCategoryAndKeyword() {
        productRepository.save(product("Samsung Galaxy S25", "Electronics"));
        productRepository.save(product("Samsung TV", "Electronics"));
        productRepository.save(product("Leather Jacket", "Fashion"));

        assertEquals(2, productRepository.findByCategory("Electronics", PageRequest.of(0, 10)).getTotalElements());
        assertEquals(2, productRepository.findByNameContainingIgnoreCase("Samsung", PageRequest.of(0, 10)).getTotalElements());
        assertEquals(3, productRepository.findAll(PageRequest.of(0, 10)).getTotalElements());
    }

    private ProductEntity product(String name, String category) {
        ProductEntity productEntity = new ProductEntity();
        productEntity.setName(name);
        productEntity.setDescription(name + " description");
        productEntity.setPrice(new BigDecimal("100.00"));
        productEntity.setQuantity(5);
        productEntity.setCategory(category);
        return productEntity;
    }
}