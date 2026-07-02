package com.Assessment.product_management_api.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Schema(description = "Paginated product response")
public class PaginationResponse<T> {
    @Schema(example = "0")
    private int currentPage;
    @Schema(example = "2")
    private int totalPages;
    @Schema(example = "25")
    private long totalElements;
    @Schema(example = "10")
    private int pageSize;
    @Schema(example = "false")
    private boolean isLast;
    @Schema(description = "Page content")
    private List<T> products;
}
