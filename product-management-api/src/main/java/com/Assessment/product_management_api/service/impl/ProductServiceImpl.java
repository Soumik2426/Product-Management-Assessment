package com.Assessment.product_management_api.service.impl;

import com.Assessment.product_management_api.dto.request.ProductRequest;
import com.Assessment.product_management_api.dto.request.UpdateProductRequest;
import com.Assessment.product_management_api.dto.response.PaginationResponse;
import com.Assessment.product_management_api.dto.response.ProductResponse;
import com.Assessment.product_management_api.entity.ProductEntity;
import com.Assessment.product_management_api.exceptions.DuplicateResourceFound;
import com.Assessment.product_management_api.exceptions.ResourceNotFoundException;
import com.Assessment.product_management_api.repository.ProductRepository;
import com.Assessment.product_management_api.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Service
@Slf4j
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;

    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public ProductResponse createProduct(ProductRequest productRequest) {
        log.info("Creating product with name {}", productRequest.getName());
        if (productRepository.existsByName(productRequest.getName())) {
            log.warn("Product creation blocked because name already exists: {}", productRequest.getName());
            throw new DuplicateResourceFound("Product with this name already exists.");
        }
        ProductEntity product = ProductEntity.builder()
                .name(productRequest.getName())
                .description(productRequest.getDescription())
                .price(productRequest.getPrice())
                .quantity(productRequest.getQuantity())
                .category(productRequest.getCategory())
                .build();

        ProductEntity savedProduct = productRepository.save(product);
        log.info("Product created successfully with id {}", savedProduct.getId());

        return mapToProductResponse(savedProduct);
    }

    @Override
    public ProductResponse updateProduct(Long productId, UpdateProductRequest updateProductRequest) {
        log.info("Updating product with id {}", productId);
        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Product not found with id : " + productId));

        product.setName(updateProductRequest.getName());
        product.setDescription(updateProductRequest.getDescription());
        product.setPrice(updateProductRequest.getPrice());
        product.setQuantity(updateProductRequest.getQuantity());
        product.setCategory(updateProductRequest.getCategory());

        ProductEntity updatedProduct = productRepository.save(product);
        log.info("Product updated successfully with id {}", updatedProduct.getId());

        return mapToProductResponse(updatedProduct);
    }

    @Override
    public void deleteProduct(Long productId) {
        log.info("Deleting product with id {}", productId);
        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Product not found with id : " + productId));

        productRepository.delete(product);
        log.info("Product deleted successfully with id {}", productId);
    }

    @Override
    public ProductResponse getProductById(Long productId) {
        log.debug("Fetching product by id {}", productId);
        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Product not found with id : " + productId));

        return mapToProductResponse(product);
    }

    @Override
    public PaginationResponse<ProductResponse> getAllProducts(int page, int size, String sortBy, String direction) {
        log.debug("Fetching all products with page={}, size={}, sortBy={}, direction={}", page, size, sortBy, direction);
        Pageable pageable = buildPageable(page, size, sortBy, direction);
        Page<ProductEntity> productPage = productRepository.findAll(pageable);

        return mapToPaginationResponse(productPage);
    }

    @Override
    public PaginationResponse<ProductResponse> getProductsByCategory(String category, int page, int size, String sortBy, String direction) {
        log.debug("Fetching products by category={} with page={}, size={}, sortBy={}, direction={}", category, page, size, sortBy, direction);
        Pageable pageable = buildPageable(page, size, sortBy, direction);
        Page<ProductEntity> productPage = productRepository.findByCategory(category, pageable);

        return mapToPaginationResponse(productPage);
    }

    @Override
    public PaginationResponse<ProductResponse> searchProducts(String keyword, int page, int size, String sortBy, String direction) {
        log.debug("Searching products with keyword={} page={} size={} sortBy={} direction={}", keyword, page, size, sortBy, direction);
        Pageable pageable = buildPageable(page, size, sortBy, direction);
        Page<ProductEntity> productPage = productRepository.findByNameContainingIgnoreCase(keyword, pageable);

        return mapToPaginationResponse(productPage);
    }

    private ProductResponse mapToProductResponse(ProductEntity product) {

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .quantity(product.getQuantity())
                .category(product.getCategory())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    private Pageable buildPageable(int page, int size, String sortBy, String direction) {
        Sort.Direction sortDirection = Sort.Direction.fromString(direction);
        return PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
    }

    private PaginationResponse<ProductResponse> mapToPaginationResponse(Page<ProductEntity> productPage) {
        List<ProductResponse> products = productPage
                .stream()
                .map(this::mapToProductResponse)
                .toList();

        return PaginationResponse.<ProductResponse>builder()
                .currentPage(productPage.getNumber())
                .totalPages(productPage.getTotalPages())
                .totalElements(productPage.getTotalElements())
                .pageSize(productPage.getSize())
                .isLast(productPage.isLast())
                .products(products)
                .build();
    }
}
