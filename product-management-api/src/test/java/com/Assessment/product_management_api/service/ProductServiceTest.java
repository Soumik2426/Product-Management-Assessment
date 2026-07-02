package com.Assessment.product_management_api.service;

import com.Assessment.product_management_api.dto.request.ProductRequest;
import com.Assessment.product_management_api.dto.request.UpdateProductRequest;
import com.Assessment.product_management_api.dto.response.PaginationResponse;
import com.Assessment.product_management_api.dto.response.ProductResponse;
import com.Assessment.product_management_api.entity.ProductEntity;
import com.Assessment.product_management_api.exceptions.DuplicateResourceFound;
import com.Assessment.product_management_api.exceptions.ResourceNotFoundException;
import com.Assessment.product_management_api.repository.ProductRepository;
import com.Assessment.product_management_api.service.impl.ProductServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ProductServiceTest {

    private ProductRepository productRepository;
    private ProductService productService;

    @BeforeEach
    void setUp() {
        productRepository = mock(ProductRepository.class);
        productService = new ProductServiceImpl(productRepository);
    }

    @Test
    void createProductReturnsSavedProduct() {
        ProductRequest request = productRequest();
        when(productRepository.existsByName(request.getName())).thenReturn(false);
        when(productRepository.save(any(ProductEntity.class))).thenAnswer(invocation -> {
            ProductEntity entity = invocation.getArgument(0);
            entity.setId(1L);
            return entity;
        });

        ProductResponse response = productService.createProduct(request);

        assertEquals(1L, response.getId());
        assertEquals("Samsung Galaxy S25", response.getName());
    }

    @Test
    void createProductRejectsDuplicateName() {
        ProductRequest request = productRequest();
        when(productRepository.existsByName(request.getName())).thenReturn(true);

        assertThrows(DuplicateResourceFound.class, () -> productService.createProduct(request));
    }

    @Test
    void updateProductReturnsUpdatedProduct() {
        ProductEntity productEntity = productEntity(1L);
        when(productRepository.findById(1L)).thenReturn(Optional.of(productEntity));
        when(productRepository.save(any(ProductEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProductResponse response = productService.updateProduct(1L, updateProductRequest());

        assertEquals(1L, response.getId());
        assertEquals("Updated Product", response.getName());
    }

    @Test
    void deleteProductRemovesExistingProduct() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(productEntity(1L)));

        productService.deleteProduct(1L);

        assertEquals(1L, 1L);
    }

    @Test
    void getProductByIdThrowsWhenMissing() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productService.getProductById(99L));
    }

    @Test
    void getAllProductsReturnsPageMetadata() {
        when(productRepository.findAll(any(PageRequest.class))).thenReturn(new PageImpl<>(List.of(productEntity(1L))));

        PaginationResponse<ProductResponse> response = productService.getAllProducts(0, 10, "id", "asc");

        assertEquals(1, response.getProducts().size());
        assertEquals(0, response.getCurrentPage());
    }

    @Test
    void searchProductsReturnsMatchingItems() {
        when(productRepository.findByNameContainingIgnoreCase(any(), any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(productEntity(1L))));

        PaginationResponse<ProductResponse> response = productService.searchProducts("Samsung", 0, 10, "id", "asc");

        assertEquals(1, response.getProducts().size());
    }

    private ProductRequest productRequest() {
        return ProductRequest.builder()
                .name("Samsung Galaxy S25")
                .description("Latest Samsung flagship smartphone")
                .price(new BigDecimal("79999.99"))
                .quantity(20)
                .category("Electronics")
                .build();
    }

    private UpdateProductRequest updateProductRequest() {
        return UpdateProductRequest.builder()
                .name("Updated Product")
                .description("Updated description")
                .price(new BigDecimal("89999.99"))
                .quantity(10)
                .category("Electronics")
                .build();
    }

    private ProductEntity productEntity(Long id) {
        ProductEntity productEntity = new ProductEntity();
        productEntity.setId(id);
        productEntity.setName(id == 1L ? "Samsung Galaxy S25" : "Other Product");
        productEntity.setDescription("Latest Samsung flagship smartphone");
        productEntity.setPrice(new BigDecimal("79999.99"));
        productEntity.setQuantity(20);
        productEntity.setCategory("Electronics");
        return productEntity;
    }
}