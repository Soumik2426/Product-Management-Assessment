package com.Assessment.product_management_api.dto.request;

import com.Assessment.product_management_api.annotations.PasswordRoleValidation;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Schema(description = "Login payload for issuing a JWT token")
public class LoginRequest {
    @NotBlank(message="Email is required")
    /*@Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}$",
            message = "Email must end with a valid domain(e.g: .com, .org)")*/
    @Schema(example = "soumik@example.com", description = "Registered user email")
    @Email(message = "Provide a valid email format")
    private String email;

    @NotBlank(message="Password is required")
    @Schema(example = "StrongPass@123", description = "Registered user password")
    @PasswordRoleValidation
    private String password;
}
