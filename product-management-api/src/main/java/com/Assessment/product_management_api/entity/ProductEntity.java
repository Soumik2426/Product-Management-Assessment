package com.Assessment.product_management_api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name="products",
        indexes = {@Index(name = "idx_name", columnList = "name"),
                @Index(name="idx_category", columnList = "category")}
)
@Builder
public class ProductEntity extends BaseEntity {
    @Column(nullable = false, length = 100)
    @NotBlank
    private String name;

    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    @NotBlank
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal price;

    @Column(nullable = false)
    @NotNull
    @Min(0)
    private Integer quantity;

    @Column(nullable = false, length = 100)
    @NotBlank
    private String category;

}
