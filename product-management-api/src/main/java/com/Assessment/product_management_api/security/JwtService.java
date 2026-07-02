package com.Assessment.product_management_api.security;

import com.Assessment.product_management_api.entity.UserEntity;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {
    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private Long jwtExpirationInMs;

    private SecretKey getJwtSigningKey(){
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateJwtToken(UserEntity userEntity){
        return Jwts.builder()
                .subject(userEntity.getEmail())
                .claim("role", userEntity.getRole().name())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationInMs))
                .signWith(getJwtSigningKey())
                .compact();
    }

    //Extracts the username(email) from the token
    public String extractUsername(String token){
        return extractClaim(token, Claims::getSubject);
    }

    //Extracts the expiration date from the token
    public Date extractExpiration(String token){
        return extractClaim(token, Claims::getExpiration);
    }

    //Generic method to extract any claim
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver){
        Claims claims=extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    //Parse the JWT and return all claims
    private Claims extractAllClaims(String token){
        return Jwts.parser()
                .verifyWith(getJwtSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    //Check Whether the token has expired
    private Boolean isTokenExpired(String token){
        return extractExpiration(token).before(new Date());
    }

    //Validate the token
    public Boolean isTokenValid(String token, UserDetails userDetails){
        String username = extractUsername(token);

        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }
}
