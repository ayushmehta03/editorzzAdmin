package controllers

import (
	"context"
	"fmt"
	"net/http"
	"strings"
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

		c.JSON(http.StatusOK, gin.H{
			"submissions": subs, 
		})

	}
}

func SaveJudgeScores(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		var body struct {
			JudgeSlug string `json:"judge_slug"`

			Scores []struct {
				SubmissionID string  `json:"submission_id"`
				Points       float64 `json:"points"`
				Remark       string  `json:"remark,omitempty"`
			} `json:"scores"`
		}

		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid request body",
			})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
		defer cancel()

		tCol := database.OpenCollection("tournaments", client)
		sCol := database.OpenCollection("submissions", client)

		var tournament models.Tournament

		err := tCol.FindOne(
			ctx,
			bson.M{"judge_slug": body.JudgeSlug},
		).Decode(&tournament)

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Unauthorized",
			})
			return
		}

		if tournament.IsJudgingCompleted {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Judging is locked",
			})
			return
		}

		for _, score := range body.Scores {

			submissionID, err := primitive.ObjectIDFromHex(score.SubmissionID)
			if err != nil {
				continue
			}

			update := bson.M{
				"points":     score.Points,
				"is_judged":  true,
			}

			// Save remark only if provided
			if strings.TrimSpace(score.Remark) != "" {
				update["remark"] = score.Remark
			}

			_, err = sCol.UpdateOne(
				ctx,
				bson.M{
					"_id": submissionID,
				},
				bson.M{
					"$set": update,
				},
			)

			if err != nil {
				fmt.Println("Update Error:", err)
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Scores and remarks saved successfully",
		})
	}
}


func SubmitFinalScores(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		slug := c.Param("slug")

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		col := database.OpenCollection("tournaments", client)

		var tournament struct {
			IsJudgingCompleted bool `bson:"is_judging_completed"`
		}

		err := col.FindOne(ctx, bson.M{"judge_slug": slug}).Decode(&tournament)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				c.JSON(http.StatusNotFound, gin.H{"error": "Tournament not found with this slug"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database lookup failed"})
			return
		}

		if tournament.IsJudgingCompleted {
			c.JSON(http.StatusConflict, gin.H{"error": "Judging has already been finalized and locked for this tournament"})
			return
		}

		_, err = col.UpdateOne(ctx,
			bson.M{"judge_slug": slug},
			bson.M{"$set": bson.M{
				"is_judging_completed": true,
			}},
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to lock judging scores"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Final scores locked successfully"})
	}
}








func JudgeRejectSubmission(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			JudgeSlug    string `json:"judge_slug" binding:"required"`
			SubmissionID string `json:"submission_id" binding:"required"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request parameters"})
			return
		}

		subObjID, err := primitive.ObjectIDFromHex(req.SubmissionID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid submission id"})
			return
		}

		ctx, cancel := context.WithTimeout(c.Request.Context(), 15*time.Second)
		defer cancel()

		tCol := database.OpenCollection("tournaments", client)
		sCol := database.OpenCollection("submissions", client)

		var tournament models.Tournament
		err = tCol.FindOne(ctx, bson.M{"judge_slug": req.JudgeSlug}).Decode(&tournament)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized or invalid judge link"})
			return
		}

		if tournament.IsJudgingCompleted {
			c.JSON(http.StatusForbidden, gin.H{"error": "Judging phase has closed and is locked"})
			return
		}

		
		result, err := sCol.DeleteOne(ctx, bson.M{
			"_id":           subObjID,
			"tournament_id": tournament.ID, 
		})

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reject submission"})
			return
		}

		if result.DeletedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Submission not found in this tournament scope"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Submission rejected and deleted immediately"})
	}
}