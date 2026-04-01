package controllers

import (
	"context"
	"fmt"
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

		c.JSON(http.StatusOK, gin.H{
			"submissions": subs, 
		})

	}
}

func SaveJudgeScores(client *mongo.Client) gin.HandlerFunc {
    return func(c *gin.Context) {
        var body struct {
            JudgeSlug string `json:"judge_slug"`
            Scores    []struct {
                SubmissionID string  `json:"submission_id"`
                Points       float64 `json:"points"`
            } `json:"scores"`
        }

        if err := c.ShouldBindJSON(&body); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
            return
        }

        ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
        defer cancel()

        tCol := database.OpenCollection("tournaments", client)
        sCol := database.OpenCollection("submissions", client)

        // Verify Tournament
        var t models.Tournament
        err := tCol.FindOne(ctx, bson.M{"judge_slug": body.JudgeSlug}).Decode(&t)
        if err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
            return
        }

        if t.IsJudgingCompleted {
            c.JSON(http.StatusForbidden, gin.H{"error": "Judging is locked"})
            return
        }

        // Update Submissions
        for _, s := range body.Scores {
            objID, err := primitive.ObjectIDFromHex(s.SubmissionID)
            if err != nil {
                continue 
            }

            _, updateErr := sCol.UpdateOne(ctx,
                bson.M{"_id": objID},
                bson.M{"$set": bson.M{
                    "points":    s.Points,
                    "is_judged": true,
                }},
            )
            
            if updateErr != nil {
                fmt.Println("Update Error:", updateErr)
            }
		
        }

        c.JSON(http.StatusOK, gin.H{"message": "Saved successfully"})
    }
}



func SubmitFinalScores(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		slug := c.Param("slug")

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		col := database.OpenCollection("tournaments", client)

		col.UpdateOne(ctx,
			bson.M{"judge_slug": slug},
			bson.M{"$set": bson.M{
				"is_judging_completed": true,
			}},
		)

		c.JSON(http.StatusOK, gin.H{"message": "Final submitted"})
	}
}