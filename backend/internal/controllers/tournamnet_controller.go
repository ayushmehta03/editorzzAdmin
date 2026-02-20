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
	"go.mongodb.org/mongo-driver/mongo/options"
)


func GetActiveTournament(client *mongo.Client)gin.HandlerFunc{
	return func(c *gin.Context){

		ctx,cancel:=context.WithTimeout(context.Background(),10*time.Second)

		defer cancel()

		var tournament models.Tournament


		collection:=database.OpenCollection("tournaments",client)



		opts := options.Find().SetSort(bson.D{{"end_time", 1}})
		cursor,err:=collection.Find(ctx,bson.M{
			"status":models.TournamentActive,

		},opts)

		if err!=nil{
			c.JSON(http.StatusInternalServerError,gin.H{"error":"Failed to fetch active tournamnets"})
			return 
		}

		defer cursor.Close(ctx)

		var tournaments models.Tournament

		if err=cursor.All(ctx,&tournaments);err!=nil{
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

func GetUpcomingTournaments(client*mongo.Client)gin.HandlerFunc{
	return func(c *gin.Context){


		ctx,cancel:=context.WithTimeout(context.Background(),10*time.Second)

		defer cancel()


		collection:=database.OpenCollection("tournaments",client)

		opts := options.Find().SetSort(bson.D{{"start_time", 1}})
		

		cursor,err:=collection.Find(ctx,bson.M{
			"status":models.TournamentUpcoming,
		},opts)

		if err!=nil{
			c.JSON(http.StatusInternalServerError,gin.H{"error":"Failed to fetch tournaments"})
			return 
		}

		defer cursor.Close(ctx)

		var tournaments []models.Tournament


		if err=cursor.All(ctx,&tournaments);err!=nil{
			c.JSON(http.StatusInternalServerError,gin.H{"error":"Failed to decode tournamnets"})
			return 
		}


		c.JSON(http.StatusOK, gin.H{
			"tournaments": tournaments,
		})

	}
}



