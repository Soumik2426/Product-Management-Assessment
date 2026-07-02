package com.Assessment.product_management_api.controller;

import com.Assessment.product_management_api.advice.GlobalExceptionHandler;
import com.Assessment.product_management_api.dto.request.ProductRequest;
import com.Assessment.product_management_api.dto.request.UpdateProductRequest;
import com.Assessment.product_management_api.dto.response.PaginationResponse;
import com.Assessment.product_management_api.dto.response.ProductResponse;
import com.Assessment.product_management_api.exceptions.ResourceNotFoundException;
import com.Assessment.product_management_api.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ProductControllerTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private ProductService productService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        productService = mock(ProductService.class);
        mockMvc = MockMvcBuilders
                .standaloneSetup(new ProductController(productService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void createProductReturnsCreatedProduct() throws Exception {
        ProductRequest request = productRequest();
        when(productService.createProduct(any(ProductRequest.class))).thenReturn(productResponse(1L));

        mockMvc.perform(post("/products/createProduct")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Product created successfully."))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.name").value("Samsung Galaxy S25"))
                .andExpect(jsonPath("$.data.price").value(79999.99));
    }

    @Test
    void createProductRejectsInvalidPrice() throws Exception {
        ProductRequest request = productRequest();
        request.setPrice(BigDecimal.ZERO);

        mockMvc.perform(post("/products/createProduct")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.message").value("Validation Error"))
                .andExpect(jsonPath("$.error.subErrors[0]").value("Price must be greater than 0"));
    }

    @Test
    void updateProductReturnsUpdatedProduct() throws Exception {
        UpdateProductRequest request = updateProductRequest();
        when(productService.updateProduct(eq(1L), any(UpdateProductRequest.class))).thenReturn(productResponse(1L));

        mockMvc.perform(put("/products/updateProduct/{productId}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Product updated successfully."))
                .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    void deleteProductReturnsSuccessMessage() throws Exception {
        doNothing().when(productService).deleteProduct(1L);

        mockMvc.perform(delete("/products/deleteProduct/{productId}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value("Product deleted successfully."));

        verify(productService).deleteProduct(1L);
    }

    @Test
    void getProductByIdReturnsProduct() throws Exception {
        when(productService.getProductById(1L)).thenReturn(productResponse(1L));

        mockMvc.perform(get("/products/getProduct/{productId}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Product fetched successfully."))
                .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    void getProductByIdReturnsNotFoundForMissingProduct() throws Exception {
        when(productService.getProductById(99L))
                .thenThrow(new ResourceNotFoundException("Product not found with id : 99"));

        mockMvc.perform(get("/products/getProduct/{productId}", 99L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Product not found with id : 99"))
                .andExpect(jsonPath("$.error.message").value("Product not found with id : 99"));
    }

    @Test
    void getAllProductsReturnsProducts() throws Exception {
        when(productService.getAllProducts(0, 10, "id", "asc"))
                .thenReturn(paginationResponse(List.of(productResponse(1L), productResponse(2L)), 0, 10, 2));

        mockMvc.perform(get("/products/getProducts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Products fetched successfully."))
                .andExpect(jsonPath("$.data.currentPage").value(0))
                .andExpect(jsonPath("$.data.totalElements").value(2))
                .andExpect(jsonPath("$.data.pageSize").value(10))
                .andExpect(jsonPath("$.data.products", hasSize(2)));
    }

    @Test
    void getAllProductsReturnsEmptyDatabaseMessage() throws Exception {
        when(productService.getAllProducts(0, 10, "id", "asc"))
                .thenReturn(paginationResponse(List.of(), 0, 10, 0));

        mockMvc.perform(get("/products/getProducts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("No products found in the database."))
                .andExpect(jsonPath("$.data.products", hasSize(0)));
    }

    @Test
    void getAllProductsAcceptsPaginationAndSortingParams() throws Exception {
        when(productService.getAllProducts(1, 5, "price", "desc"))
                .thenReturn(paginationResponse(List.of(productResponse(1L)), 1, 5, 6));

        mockMvc.perform(get("/products/getProducts")
                        .param("page", "1")
                        .param("size", "5")
                        .param("sortBy", "price")
                        .param("direction", "desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.currentPage").value(1))
                .andExpect(jsonPath("$.data.pageSize").value(5))
                .andExpect(jsonPath("$.data.products", hasSize(1)));
    }

    @Test
    void getAllProductsRejectsInvalidSortField() throws Exception {
        mockMvc.perform(get("/products/getProducts").param("sortBy", "description"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation Error"))
                .andExpect(jsonPath("$.error.subErrors[0]")
                        .value("Sort field must be one of: name, price, quantity, category, createdAt"));
    }

    @Test
    void getProductsByCategoryReturnsProducts() throws Exception {
        when(productService.getProductsByCategory("Electronics", 0, 10, "id", "asc"))
                .thenReturn(paginationResponse(List.of(productResponse(1L)), 0, 10, 1));

        mockMvc.perform(get("/products/category").param("category", "Electronics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Products fetched successfully."))
                .andExpect(jsonPath("$.data.products[0].category").value("Electronics"));
    }

    @Test
    void getProductsByCategoryReturnsNotFoundWhenNoProductsMatch() throws Exception {
        when(productService.getProductsByCategory("Clothing", 0, 10, "id", "asc"))
                .thenReturn(paginationResponse(List.of(), 0, 10, 0));

        mockMvc.perform(get("/products/category").param("category", "Clothing"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("No product found with this category."))
                .andExpect(jsonPath("$.data.products", hasSize(0)));
    }

    @Test
    void searchProductsReturnsProducts() throws Exception {
        when(productService.searchProducts("Samsung", 0, 10, "id", "asc"))
                .thenReturn(paginationResponse(List.of(productResponse(1L)), 0, 10, 1));

        mockMvc.perform(get("/products/search").param("keyword", "Samsung"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Products fetched successfully."))
                .andExpect(jsonPath("$.data.products[0].name").value("Samsung Galaxy S25"));
    }

    @Test
    void searchProductsReturnsNotFoundWhenNoProductsMatch() throws Exception {
        when(productService.searchProducts("iPhone", 0, 10, "id", "asc"))
                .thenReturn(paginationResponse(List.of(), 0, 10, 0));

        mockMvc.perform(get("/products/search").param("keyword", "iPhone"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("No product found with this keyword."))
                .andExpect(jsonPath("$.data.products", hasSize(0)));
    }

    @Test
    void searchProductsAcceptsPaginationAndSortingParams() throws Exception {
        when(productService.searchProducts("Samsung", 0, 20, "createdAt", "asc"))
                .thenReturn(paginationResponse(List.of(productResponse(1L)), 0, 20, 1));

        mockMvc.perform(get("/products/search")
                        .param("keyword", "Samsung")
                        .param("page", "0")
                        .param("size", "20")
                        .param("sortBy", "createdAt")
                        .param("direction", "asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.pageSize").value(20))
                .andExpect(jsonPath("$.data.products", hasSize(1)));
    }

    @Test
    void categoryProductsAcceptsPaginationAndSortingParams() throws Exception {
        when(productService.getProductsByCategory("Electronics", 0, 20, "quantity", "desc"))
                .thenReturn(paginationResponse(List.of(productResponse(1L)), 0, 20, 1));

        mockMvc.perform(get("/products/category")
                        .param("category", "Electronics")
                        .param("page", "0")
                        .param("size", "20")
                        .param("sortBy", "quantity")
                        .param("direction", "desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.pageSize").value(20))
                .andExpect(jsonPath("$.data.products", hasSize(1)));
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
                .name("Samsung Galaxy S25")
                .description("Latest Samsung flagship smartphone")
                .price(new BigDecimal("79999.99"))
                .quantity(20)
                .category("Electronics")
                .build();
    }

    private ProductResponse productResponse(Long id) {
        return ProductResponse.builder()
                .id(id)
                .name("Samsung Galaxy S25")
                .description("Latest Samsung flagship smartphone")
                .price(new BigDecimal("79999.99"))
                .quantity(20)
                .category("Electronics")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    private PaginationResponse<ProductResponse> paginationResponse(List<ProductResponse> products, int page, int size, long totalElements) {
        return PaginationResponse.<ProductResponse>builder()
                .currentPage(page)
                .totalPages(totalElements == 0 ? 0 : (int) Math.ceil((double) totalElements / size))
                .totalElements(totalElements)
                .pageSize(size)
                .isLast(true)
                .products(products)
                .build();
    }
}
