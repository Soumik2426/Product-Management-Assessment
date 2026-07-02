package com.Assessment.product_management_api.dto.request;

import com.Assessment.product_management_api.annotations.PasswordRoleValidation;
import jakarta.validation.constraints.*;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.websocket.server.ServerEndpoint;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Registration payload for creating a new user")
@Builder
public class RegisterRequest {
    @Schema(example = "Soumik", description = "User first name")
    @NotBlank(message="First Name is required")
    @Size(max=100)
    private String firstName;

    @Schema(example = "Das", description = "User last name")
    @NotBlank(message="Last Name is required")
    @Size(max=100)
    private String lastName;

    @Schema(example = "soumik@example.com", description = "User email address")
    @NotBlank(message="Email is required")
    /*@Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}$",
            message = "Email must end with a valid domain(e.g: .com, .org)")*/
    @Email(message = "Provide a valid email format")
    private String email;

    @Schema(example = "StrongPass@123", description = "Password meeting the custom complexity rule")
    @NotBlank(message="Password is required")
    @PasswordRoleValidation
    private String password;
}
