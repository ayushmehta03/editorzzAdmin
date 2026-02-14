package utils

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)


type JWTClaims struct{
	UserId string `json:"user_id"`
	Email string `json:"email"`
	Role string `json:"role"`
	jwt.RegisteredClaims
	
}

func GenerateToken(userid,email,role string)(string,error){
	secret:=os.Getenv("JWT_SECRET")


	claims:=JWTClaims{
		UserId: userid,
		Email: email,
		Role: role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24*time.Hour)),
			IssuedAt: jwt.NewNumericDate(time.Now()),
		},
	}

	token:=jwt.NewWithClaims(jwt.SigningMethodHS256,claims)

	return token.SignedString([]byte(secret))
	}
