package controllers

import (
	"context"
	"net/http"
	"time"

	"github.com/ayushmehta03/editorzzAdmin/internal/database"
	"github.com/ayushmehta03/editorzzAdmin/internal/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func JudgeAccess(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		slug := c.Param("slug")

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		col := database.OpenCollection("tournaments", client)

		var t models.Tournament
		err := col.FindOne(ctx, bson.M{"judge_slug": slug}).Decode(&t)

		if err != nil || t.Type != "judge_based" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Invalid link"})
			return
		}

		if time.Now().Before(t.EndTime) {
			c.JSON(http.StatusForbidden, gin.H{"error": "Tournament not ended"})
			return
		}

		if time.Now().After(t.JudgeSlugExpiry) {
			c.JSON(http.StatusForbidden, gin.H{"error": "Link expired"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"tournament": t})
	}
}
func GetJudgeSubmissions(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		slug := c.Param("slug")

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		tCol := database.OpenCollection("tournaments", client)
		sCol := database.OpenCollection("submissions", client)

		var t models.Tournament
		err := tCol.FindOne(ctx, bson.M{
			"judge_slug": slug,
			"type":       "judge_based",
		}).Decode(&t)

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid"})
			return
		}

		cursor, _ := sCol.Find(ctx, bson.M{
			"tournament_id": t.ID,
		})

		var subs []bson.M
		cursor.All(ctx, &subs)

		c.JSON(http.StatusOK, subs)
	}
}
type ScoreUpdate struct {
	SubmissionID primitive.ObjectID `json:"submission_id"`
	Points       float64            `json:"points"`
}

func SubmitJudgeScores(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		var payload []ScoreUpdate
		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid data format"})
			return
		}

		ctx, cancel := context.WithTimeout(c.Request.Context(), 20*time.Second)
		defer cancel()

		submissionCol := database.OpenCollection("submissions", client)
        
		for _, item := range payload {
			filter := bson.M{"_id": item.SubmissionID}
			update := bson.M{
				"$set": bson.M{
					"points":    item.Points,
					"is_judged": true,
				},
			}
			_, err := submissionCol.UpdateOne(ctx, filter, update)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update some scores"})
				return
			}
		}

		c.JSON(http.StatusOK, gin.H{"message": "Scores submitted successfully for review"})
	}
}
