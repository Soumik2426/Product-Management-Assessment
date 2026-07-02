package com.Assessment.product_management_api.advice;

import lombok.*;
import org.springframework.http.HttpStatus;

import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApiError {
    private HttpStatus status;
    private String message;
    List<String> subErrors;
}
