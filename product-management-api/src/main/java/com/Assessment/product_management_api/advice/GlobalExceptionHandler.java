package com.Assessment.product_management_api.advice;

import com.Assessment.product_management_api.exceptions.DuplicateResourceFound;
import com.Assessment.product_management_api.exceptions.ResourceNotFoundException;
import jakarta.validation.ConstraintViolationException;
import lombok.Builder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    //Resource Not Found Exception
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<ApiError>> handleResourceNotFoundException(ResourceNotFoundException e){
        log.warn("Resource not found: {}", e.getMessage());
        return ApiResponseError(HttpStatus.NOT_FOUND, e.getMessage(),null);
    }

    //Duplicate Resource Found
    @ExceptionHandler(DuplicateResourceFound.class)
    public ResponseEntity<ApiResponse<ApiError>> handleDuplicateResource(DuplicateResourceFound e){
        log.warn("Duplicate resource error: {}", e.getMessage());
        return ApiResponseError(HttpStatus.CONFLICT, e.getMessage(),null);
    }

    //All type of Exceptions
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<ApiError>> handleExceptions(Exception e){
        log.error("Unhandled exception", e);
        return ApiResponseError(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage(),null);
    }

    //Binding Errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<ApiError>> handleMethodException(MethodArgumentNotValidException exception){
        List<String> errors=exception
                .getBindingResult()
                .getAllErrors()
                .stream()
                .map(error->error.getDefaultMessage())
                .collect(Collectors.toList());

        log.warn("Validation failure: {}", errors);
        return ApiResponseError(HttpStatus.BAD_REQUEST, "Validation Error", errors);
    }

    //Request Parameter Validation Errors
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<ApiError>> handleConstraintViolationException(ConstraintViolationException exception){
        List<String> errors=exception
                .getConstraintViolations()
                .stream()
                .map(error->error.getMessage())
                .collect(Collectors.toList());

        log.warn("Constraint violation: {}", errors);
        return ApiResponseError(HttpStatus.BAD_REQUEST, "Validation Error", errors);
    }

    //Invalid Request Parameter Values
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<ApiError>> handleIllegalArgumentException(IllegalArgumentException exception){
        log.warn("Illegal argument: {}", exception.getMessage());
        return ApiResponseError(HttpStatus.BAD_REQUEST, "Validation Error", List.of(exception.getMessage()));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<ApiError>> handleMethodArgumentTypeMismatchException(MethodArgumentTypeMismatchException exception){
        log.warn("Method argument type mismatch: {}", exception.getMessage());
        return ApiResponseError(HttpStatus.BAD_REQUEST, "Validation Error", List.of("Invalid value for parameter: " + exception.getName()));
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<ApiError>> handleMissingServletRequestParameterException(MissingServletRequestParameterException exception){
        log.warn("Missing request parameter: {}", exception.getParameterName());
        return ApiResponseError(HttpStatus.BAD_REQUEST, "Validation Error", List.of(exception.getMessage()));
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<ApiError>> handleHttpRequestMethodNotSupportedException(HttpRequestMethodNotSupportedException exception){
        log.warn("Method not supported: {}", exception.getMethod());
        return ApiResponseError(HttpStatus.METHOD_NOT_ALLOWED, "Method Not Allowed", List.of(exception.getMessage()));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<ApiError>> handleAuthenticationException(AuthenticationException exception){
        log.warn("Authentication failure: {}", exception.getMessage());
        return ApiResponseError(HttpStatus.UNAUTHORIZED, "Authentication required", List.of(exception.getMessage()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<ApiError>> handleAccessDeniedException(AccessDeniedException exception){
        log.warn("Access denied: {}", exception.getMessage());
        return ApiResponseError(HttpStatus.FORBIDDEN, "Access denied", List.of(exception.getMessage()));
    }

    //Helper Method
    public ResponseEntity<ApiResponse<ApiError>> ApiResponseError(HttpStatus status, String message,
                                                                  List<String> subErrors){
        ApiError apiError=ApiError.builder()
                .status(status)
                .message(message)
                .subErrors(subErrors)
                .build();
        ApiResponse<ApiError> apiResponseError=new ApiResponse<>(apiError, message);
        return new ResponseEntity<>(apiResponseError, status);
    }
}
