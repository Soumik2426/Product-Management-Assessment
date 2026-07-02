package com.Assessment.product_management_api.controller;

import com.Assessment.product_management_api.advice.ApiResponse;
import com.Assessment.product_management_api.dto.request.ProductRequest;
import com.Assessment.product_management_api.dto.request.UpdateProductRequest;
import com.Assessment.product_management_api.dto.response.PaginationResponse;
import com.Assessment.product_management_api.dto.response.ProductResponse;
import com.Assessment.product_management_api.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Validated
@Tag(name = "Products", description = "Product CRUD, pagination, sorting, search, and category filtering")
public class V1ProductController {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("id", "name", "price", "quantity", "category", "createdAt");
    private static final Set<String> ALLOWED_SORT_DIRECTIONS = Set.of("asc", "desc");

    private final ProductService productService;

    @PostMapping("/createProduct")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create product", description = "Creates a new product. ADMIN only.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Product created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@RequestBody @Valid ProductRequest productRequest) {
        ProductResponse productResponse = productService.createProduct(productRequest);
        return new ResponseEntity<>(new ApiResponse<>(productResponse, "Product created successfully."), HttpStatus.CREATED);
    }

    @PutMapping("/updateProduct/{productId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update product", description = "Updates an existing product by id. ADMIN only.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Product updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Product not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Long productId,
            @RequestBody @Valid UpdateProductRequest updateProductRequest) {
        ProductResponse productResponse = productService.updateProduct(productId, updateProductRequest);
        return ResponseEntity.ok(new ApiResponse<>(productResponse, "Product updated successfully."));
    }

    @DeleteMapping("/deleteProduct/{productId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete product", description = "Deletes a product by id. ADMIN only.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Product deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Product not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<ApiResponse<String>> deleteProduct(@PathVariable Long productId) {
        productService.deleteProduct(productId);
        return ResponseEntity.ok(new ApiResponse<>("Product deleted successfully."));
    }

    @GetMapping("/getProduct/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @Operation(summary = "Get product by id", description = "Returns a single product by id.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Product fetched successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Product not found")
    })
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Long productId) {
        ProductResponse productResponse = productService.getProductById(productId);
        return ResponseEntity.ok(new ApiResponse<>(productResponse, "Product fetched successfully."));
    }

    @GetMapping("/getProducts")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @Operation(summary = "Get all products", description = "Returns paginated products with sorting support.")
    public ResponseEntity<ApiResponse<PaginationResponse<ProductResponse>>> getAllProducts(
            @RequestParam(defaultValue = "0") @Min(value = 0, message = "Page number cannot be negative") int page,
            @RequestParam(defaultValue = "10") @Min(value = 1, message = "Page size must be at least 1")
            @Max(value = 100, message = "Page size cannot be greater than 100") int size,
            @RequestParam(defaultValue = "id") @Pattern(regexp = "id|name|price|quantity|category|createdAt",
                    message = "Sort field must be one of: name, price, quantity, category, createdAt") String sortBy,
            @RequestParam(defaultValue = "asc") @Pattern(regexp = "asc|desc|ASC|DESC",
                    message = "Sort direction must be asc or desc") String direction) {
        validatePaginationSort(sortBy, direction);
        PaginationResponse<ProductResponse> productResponses = productService.getAllProducts(page, size, sortBy, direction);

        if (productResponses.getProducts().isEmpty()) {
            return ResponseEntity.ok(new ApiResponse<>(productResponses, "No products found in the database."));
        }

        return ResponseEntity.ok(new ApiResponse<>(productResponses, "Products fetched successfully."));
    }

    @GetMapping("/category")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @Operation(summary = "Get products by category", description = "Returns paginated products filtered by category.")
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
        PaginationResponse<ProductResponse> productResponses = productService.getProductsByCategory(category, page, size, sortBy, direction);

        if (productResponses.getProducts().isEmpty()) {
            return new ResponseEntity<>(new ApiResponse<>(productResponses, "No product found with this category."), HttpStatus.NOT_FOUND);
        }

        return ResponseEntity.ok(new ApiResponse<>(productResponses, "Products fetched successfully."));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @Operation(summary = "Search products", description = "Searches products by keyword with pagination and sorting.")
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
        PaginationResponse<ProductResponse> productResponses = productService.searchProducts(keyword, page, size, sortBy, direction);

        if (productResponses.getProducts().isEmpty()) {
            return new ResponseEntity<>(new ApiResponse<>(productResponses, "No product found with this keyword."), HttpStatus.NOT_FOUND);
        }

        return ResponseEntity.ok(new ApiResponse<>(productResponses, "Products fetched successfully."));
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