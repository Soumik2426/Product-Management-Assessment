package com.Assessment.product_management_api.controller;

import com.Assessment.product_management_api.advice.ApiResponse;
import com.Assessment.product_management_api.dto.request.ProductRequest;
import com.Assessment.product_management_api.dto.request.UpdateProductRequest;
import com.Assessment.product_management_api.dto.response.PaginationResponse;
import com.Assessment.product_management_api.dto.response.ProductResponse;
import com.Assessment.product_management_api.service.ProductService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Hidden;

import java.util.Set;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Validated
@Hidden
public class ProductController {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("id", "name", "price", "quantity", "category", "createdAt");
    private static final Set<String> ALLOWED_SORT_DIRECTIONS = Set.of("asc", "desc");

    private final ProductService productService;

    // Create Product
    @PostMapping("/createProduct")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @RequestBody @Valid ProductRequest productRequest) {

        ProductResponse productResponse =
                productService.createProduct(productRequest);

        return new ResponseEntity<>(
                new ApiResponse<>(productResponse,
                        "Product created successfully."),
                HttpStatus.CREATED
        );
    }

    // Update Product
    @PutMapping("/updateProduct/{productId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Long productId,
            @RequestBody @Valid UpdateProductRequest updateProductRequest) {

        ProductResponse productResponse =
                productService.updateProduct(productId, updateProductRequest);

        return ResponseEntity.ok(
                new ApiResponse<>(productResponse,
                        "Product updated successfully.")
        );
    }

    // Delete Product
    @DeleteMapping("/deleteProduct/{productId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteProduct(
            @PathVariable Long productId) {

        productService.deleteProduct(productId);

        return ResponseEntity.ok(
                new ApiResponse<>("Product deleted successfully.")
        );
    }

    // Get Product By id
    @GetMapping("/getProduct/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(
            @PathVariable Long productId) {

        ProductResponse productResponse =
                productService.getProductById(productId);

        return ResponseEntity.ok(
                new ApiResponse<>(productResponse,
                        "Product fetched successfully.")
        );
    }

    // Get All Products
    @GetMapping("/getProducts")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public ResponseEntity<ApiResponse<PaginationResponse<ProductResponse>>> getAllProducts(
            @RequestParam(defaultValue = "0") @Min(value = 0, message = "Page number cannot be negative") int page,
            @RequestParam(defaultValue = "10") @Min(value = 1, message = "Page size must be at least 1")
            @Max(value = 100, message = "Page size cannot be greater than 100") int size,
            @RequestParam(defaultValue = "id") @Pattern(regexp = "id|name|price|quantity|category|createdAt",
                    message = "Sort field must be one of: name, price, quantity, category, createdAt") String sortBy,
            @RequestParam(defaultValue = "asc") @Pattern(regexp = "asc|desc|ASC|DESC",
                    message = "Sort direction must be asc or desc") String direction) {
        validatePaginationSort(sortBy, direction);

        PaginationResponse<ProductResponse> productResponses =
                productService.getAllProducts(page, size, sortBy, direction);

        if (productResponses.getProducts().isEmpty()) {
            return ResponseEntity.ok(
                    new ApiResponse<>(productResponses,
                            "No products found in the database.")
            );
        }

        return ResponseEntity.ok(
                new ApiResponse<>(productResponses,
                        "Products fetched successfully.")
        );
    }

    // Get Products By Category
    @GetMapping("/category")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public ResponseEntity<ApiResponse<PaginationResponse<ProductResponse>>> getProductsByCategory(
            @RequestParam @NotBlank(message = "Category is required") String category,
            @RequestParam(defaultValue = "0") @Min(value = 0, message = "Page number cannot be negative") int page,
            @RequestParam(defaultValue = "10") @Min(value = 1, message = "Page size must be at least 1")
            @Max(value = 100, message = "Page size cannot be greater than 100") int size,
            @RequestParam(defaultValue = "id") @Pattern(regexp = "id|name|price|quantity|category|createdAt",
                    message = "Sort field must be one of: name, price, quantity, category, createdAt") String sortBy,
            @RequestParam(defaultValue = "asc") @Pattern(regexp = "asc|desc|ASC|DESC",
                    message = "Sort direction must be asc or desc") String direction) {
        validatePaginationSort(sortBy, direction);

        PaginationResponse<ProductResponse> productResponses =
                productService.getProductsByCategory(category, page, size, sortBy, direction);

        if (productResponses.getProducts().isEmpty()) {
            return new ResponseEntity<>(
                    new ApiResponse<>(productResponses,
                            "No product found with this category."),
                    HttpStatus.NOT_FOUND
            );
        }

        return ResponseEntity.ok(new ApiResponse<>(productResponses,"Products fetched successfully.")
        );
    }

    // Search Products
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public ResponseEntity<ApiResponse<PaginationResponse<ProductResponse>>> searchProducts(
            @RequestParam @NotBlank(message = "Keyword is required") String keyword,
            @RequestParam(defaultValue = "0") @Min(value = 0, message = "Page number cannot be negative") int page,
            @RequestParam(defaultValue = "10") @Min(value = 1, message = "Page size must be at least 1")
            @Max(value = 100, message = "Page size cannot be greater than 100") int size,
            @RequestParam(defaultValue = "id") @Pattern(regexp = "id|name|price|quantity|category|createdAt",
                    message = "Sort field must be one of: name, price, quantity, category, createdAt") String sortBy,
            @RequestParam(defaultValue = "asc") @Pattern(regexp = "asc|desc|ASC|DESC",
                    message = "Sort direction must be asc or desc") String direction) {
        validatePaginationSort(sortBy, direction);

        PaginationResponse<ProductResponse> productResponses =
                productService.searchProducts(keyword, page, size, sortBy, direction);

        if (productResponses.getProducts().isEmpty()) {
            return new ResponseEntity<>(
                    new ApiResponse<>(productResponses,
                            "No product found with this keyword."),
                    HttpStatus.NOT_FOUND
            );
        }

        return ResponseEntity.ok(
                new ApiResponse<>(productResponses,
                        "Products fetched successfully.")
        );
    }

    private void validatePaginationSort(String sortBy, String direction) {
        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            throw new IllegalArgumentException("Sort field must be one of: name, price, quantity, category, createdAt");
        }
        if (!ALLOWED_SORT_DIRECTIONS.contains(direction.toLowerCase())) {
            throw new IllegalArgumentException("Sort direction must be asc or desc");
        }
    }
}
