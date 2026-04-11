package controllers

import (
	"net/http"

	"github.com/ayushmehta03/editorzzAdmin/internal/database"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func CalculateVoteScore(client *mongo.Client)gin.HandlerFunc{
	return func (c *gin.Context){
		adminId:=c.GetString("admin_token");

		if adminId==""{
			c.JSON(http.StatusUnauthorized,gin.H{"error":"Unauthorized"})
			return 
		}

		tournamentCol:=database.OpenCollection("tournament",client)
		submissionCol:=database.OpenCollection("submissions",client)


		

		
	}
}