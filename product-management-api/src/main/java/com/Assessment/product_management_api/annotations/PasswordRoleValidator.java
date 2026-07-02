package com.Assessment.product_management_api.annotations;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PasswordRoleValidator implements ConstraintValidator<PasswordRoleValidation, String> {
    @Override
    public boolean isValid(String inputValue, ConstraintValidatorContext context) {
        if(inputValue == null || inputValue.equals("")) {
            return false;
        }

        boolean isvalid=true;
        context.disableDefaultConstraintViolation();

        boolean hasUppercase=false;
        boolean hasLowercase=false;
        boolean hasDigit=false;
        boolean hasSpecialCharacters=false;

        for(char ch:inputValue.toCharArray()){
            if(Character.isUpperCase(ch)){
                hasUppercase=true;
            }
            if(Character.isLowerCase(ch)){
                hasLowercase=true;
            }
            if (Character.isDigit(ch)) {
                hasDigit = true;
            }
            if (!Character.isLetterOrDigit(ch)) {
                hasSpecialCharacters=true;
            }
        }
        if(inputValue.length()<=10){
            context.buildConstraintViolationWithTemplate("Password must be greater than 10 characters")
                    .addConstraintViolation();
            isvalid=false;
        }
        if(!hasUppercase){
            context.buildConstraintViolationWithTemplate("Password must contain uppercase letters")
                    .addConstraintViolation();
            isvalid=false;
        }
        if(!hasLowercase){
            context.buildConstraintViolationWithTemplate("Password must contain lower case letters")
                    .addConstraintViolation();
            isvalid=false;
        }
        if(!hasDigit){
            context.buildConstraintViolationWithTemplate("Password must contain at least one digit")
                    .addConstraintViolation();
            isvalid=false;
        }
        if(!hasSpecialCharacters){
            context.buildConstraintViolationWithTemplate("Password must contain at least one special character")
                    .addConstraintViolation();
            isvalid=false;
        }

        return isvalid;
    }
}
