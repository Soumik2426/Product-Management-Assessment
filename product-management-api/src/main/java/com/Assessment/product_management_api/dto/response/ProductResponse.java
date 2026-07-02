package com.Assessment.product_management_api.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Schema(description = "Product details returned by the API")
public class ProductResponse {
    @Schema(example = "1")
    private Long id;
    @Schema(example = "Samsung Galaxy S25")
    private String name;
    @Schema(example = "Latest Samsung flagship smartphone")
    private String description;
    @Schema(example = "79999.99")
    private BigDecimal price;
    @Schema(example = "20")
    private Integer quantity;
    @Schema(example = "Electronics")
    private String category;
    @Schema(example = "2026-07-03T12:00:00")
    private LocalDateTime createdAt;
    @Schema(example = "2026-07-03T12:00:00")
    private LocalDateTime updatedAt;
}
