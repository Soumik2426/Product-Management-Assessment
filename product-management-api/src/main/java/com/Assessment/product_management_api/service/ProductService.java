package com.Assessment.product_management_api.service;


import com.Assessment.product_management_api.dto.request.ProductRequest;
import com.Assessment.product_management_api.dto.request.UpdateProductRequest;
import com.Assessment.product_management_api.dto.response.PaginationResponse;
import com.Assessment.product_management_api.dto.response.ProductResponse;
import jakarta.validation.Valid;

import java.util.List;

public interface ProductService {

    //To create a new Product
    ProductResponse createProduct(@Valid ProductRequest productRequest);

    //To update an existing product
    ProductResponse updateProduct(Long productId, @Valid UpdateProductRequest updateproductRequest);

    //To delete an existing product
    void deleteProduct(Long productId);

    //To get product by ID
    ProductResponse getProductById(Long productId);

    //To get all the products
    PaginationResponse<ProductResponse> getAllProducts(int page, int size, String sortBy, String direction);

    //To get products by category
    PaginationResponse<ProductResponse> getProductsByCategory(String category, int page, int size, String sortBy, String direction);

    //To search product using name
    PaginationResponse<ProductResponse> searchProducts(String keyword, int page, int size, String sortBy, String direction);
}
