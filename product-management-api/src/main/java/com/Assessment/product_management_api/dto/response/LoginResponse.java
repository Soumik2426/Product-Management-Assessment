package com.Assessment.product_management_api.dto.response;

import com.Assessment.product_management_api.entity.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Schema(description = "Login response containing the JWT token and user details")
public class LoginResponse {
    @Schema(example = "eyJhbGciOiJIUzI1NiJ9...")
    private String token;

    @Builder.Default
    @Schema(example = "Bearer")
    private String tokenType="Bearer";

    @Schema(description = "Authenticated user details")
    private HelperResponse user;
}
