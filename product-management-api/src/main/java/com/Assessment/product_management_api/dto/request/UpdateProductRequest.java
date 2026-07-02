package com.Assessment.product_management_api.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Schema(description = "Payload used to update an existing product")
public class UpdateProductRequest {
    @NotBlank(message = "Name is required")
    @Schema(example = "Samsung Galaxy S25", description = "Product name")
    private String name;

    @NotBlank(message = "Description is required")
    @Schema(example = "Latest Samsung flagship smartphone", description = "Product description")
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    @Schema(example = "79999.99", description = "Product price")
    private BigDecimal price;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    @Schema(example = "20", description = "Available quantity")
    private Integer quantity;

    @NotBlank(message = "Category is required")
    @Schema(example = "Electronics", description = "Product category")
    private String category;
}
