package controllers

import (
	"context"
	"net/http"
	"time"

	"github.com/ayushmehta03/editorzzAdmin/internal/database"
	"github.com/ayushmehta03/editorzzAdmin/internal/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)


func GetActiveTournament(client *mongo.Client)gin.HandlerFunc{
	return func(c *gin.Context){

		ctx,cancel:=context.WithTimeout(context.Background(),10*time.Second)

		defer cancel()

		var tournament models.Tournament


		collection:=database.OpenCollection("tournaments",client)


		err:=collection.FindOne(ctx,bson.M{
			"status":models.TournamentActive,
		}).Decode(&tournament)

		if err!=nil{
			c.JSON(http.StatusNotFound, gin.H{
				"message": "No active tournament found",
			})

						return

			

		}

		c.JSON(http.StatusOK,gin.H{
			"tournament":tournament,
		})

	}
}

