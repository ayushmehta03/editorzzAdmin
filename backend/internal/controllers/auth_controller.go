package controllers

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"time"

	"github.com/ayushmehta03/editorzzAdmin/internal/database"
	"github.com/ayushmehta03/editorzzAdmin/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

func RegisterAdmin(client *mongo.Client)gin.HandlerFunc{
	return func(c *gin.Context){

		var admin models.Admin

		if err:=c.ShouldBindJSON(&admin);err!=nil{
			c.JSON(http.StatusBadRequest,gin.H{"error":"Invalid input data"})
			return 

		}


		validate:=validator.New()

		if err:=validate.Struct(admin);err!=nil{
			c.JSON(http.StatusBadRequest,gin.H{
				"error":"Validation failed",
				"details":err.Error(),
			})
			return 
		}


		hashedPassword,err:=HashPassword(admin.Hashedpassword)
	
		if err!=nil{
			c.JSON(http.StatusInternalServerError,gin.H{"error":"Internal server error"})
			return 
		}

		ctx,cancel:=context.WithTimeout(context.Background(),10*time.Second)

		defer cancel()


		seed := admin.UserName
		if seed == "" {
			seed = admin.Email
		}
	
		avatarURL := fmt.Sprintf(
			"https://api.dicebear.com/7.x/initials/svg?seed=%s",
			url.QueryEscape(seed),
		)


		adminCollection:=database.OpenCollection("admin",client)

		
		admin.Role="admin"
		admin.Hashedpassword=hashedPassword
		admin.ProfilePic=avatarURL
		admin.CreatedAt=time.Now()
		admin.UpdatedAt=time.Now()

		if _,err:=adminCollection.InsertOne(ctx,admin);err!=nil{
			c.JSON(http.StatusInternalServerError,gin.H{"error":"Faield to register admin"})
			return 
		}

		c.JSON(http.StatusCreated,gin.H{"message":"Account created"})
		


	
	}
}

func HashPassword(password string)(string,error){
	bytes,err:=bcrypt.GenerateFromPassword([]byte (password),bcrypt.DefaultCost)
	if err!=nil{
		return "",err
	}

	return string(bytes),nil
}