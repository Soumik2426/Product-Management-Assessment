package com.Assessment.product_management_api.exceptions;

public class DuplicateResourceFound extends RuntimeException{
    public DuplicateResourceFound(String message){
        super(message);
    }
}
