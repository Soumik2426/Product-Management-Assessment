package com.Assessment.product_management_api.controller;

import com.Assessment.product_management_api.config.SecurityConfig;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:product_security_test;MODE=MySQL;DB_CLOSE_DELAY=-1",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.hibernate.ddl-auto=create-drop",
        "app.cors.allowed-origins=http://localhost:3000"
})
class ProductSecurityTest {

    @Autowired
    private SecurityConfig securityConfig;

    @Test
    void authenticationEntryPointReturnsUnauthorizedResponse() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        securityConfig.authenticationEntryPoint().commence(
                request,
                response,
                new BadCredentialsException("Missing token")
        );

        assertEquals(HttpServletResponse.SC_UNAUTHORIZED, response.getStatus());
        assertEquals("Authentication required", response.getContentAsString().contains("Authentication required") ? "Authentication required" : "");
    }

    @Test
    void accessDeniedHandlerReturnsForbiddenResponse() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        securityConfig.accessDeniedHandler().handle(
                request,
                response,
                new AccessDeniedException("Denied")
        );

        assertEquals(HttpServletResponse.SC_FORBIDDEN, response.getStatus());
        assertEquals("Access denied", response.getContentAsString().contains("Access denied") ? "Access denied" : "");
    }
}