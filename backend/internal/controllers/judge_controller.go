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
func JudgeAccess(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		slug := c.Param("slug")

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		collection := database.OpenCollection("tournaments", client)

		var tournament models.Tournament

		err := collection.FindOne(ctx, bson.M{
			"judge_slug": slug,
		}).Decode(&tournament)

		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Invalid judge link"})
			return
		}

		if time.Now().Before(tournament.EndTime) {
			c.JSON(http.StatusForbidden, gin.H{"error": "Tournament not completed yet"})
			return
		}

		if time.Now().After(tournament.JudgeSlugExpiry) {
			c.JSON(http.StatusForbidden, gin.H{"error": "Judge link expired"})
			return
		}

		if tournament.Status != models.TournamentJudging &&
			tournament.Status != models.TournamentCompleted {
			c.JSON(http.StatusForbidden, gin.H{"error": "Judging not allowed"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message":    "Access granted",
			"tournament": tournament,
		})
	}
}
