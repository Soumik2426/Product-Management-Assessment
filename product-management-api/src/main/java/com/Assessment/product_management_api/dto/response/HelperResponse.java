package com.Assessment.product_management_api.dto.response;

import com.Assessment.product_management_api.entity.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Schema(description = "User details embedded inside the login response")
public class HelperResponse {
    @Schema(example = "1")
    private Long id;
    @Schema(example = "Soumik")
    private String firstName;
    @Schema(example = "Das")
    private String lastName;
    @Schema(example = "soumik@example.com")
    private String email;
    @Schema(example = "USER")
    private Role role;
}
