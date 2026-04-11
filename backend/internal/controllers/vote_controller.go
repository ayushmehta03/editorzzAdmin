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
func CalculateVoteScores(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		tID, err := primitive.ObjectIDFromHex(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tournament id"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		tCol := database.OpenCollection("tournaments", client)
		vCol := database.OpenCollection("votes", client)
		sCol := database.OpenCollection("submissions", client)

		var t models.Tournament
		err = tCol.FindOne(ctx, bson.M{"_id": tID}).Decode(&t)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Tournament not found"})
			return
		}

		if t.Type != "vote_based" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Not a vote-based contest"})
			return
		}

		if t.IsScoreCalculated {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Scores already calculated"})
			return
		}

		if time.Now().Before(t.VotingEndTime) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Voting still active"})
			return
		}

		_, err = sCol.UpdateMany(ctx,
			bson.M{"tournament_id": tID},
			bson.M{"$set": bson.M{
				"votes_count": 0,
				"points":      0,
			}},
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reset submissions"})
			return
		}

		pipeline := mongo.Pipeline{
			{{"$match", bson.D{{"tournament_id", tID}}}},
			{{"$group", bson.D{
				{"_id", "$submission_id"},
				{"votes", bson.D{{"$sum", 1}}},
			}}},
		}

		cursor, err := vCol.Aggregate(ctx, pipeline)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Aggregation failed"})
			return
		}

		var results []struct {
			ID    primitive.ObjectID `bson:"_id"`
			Votes int                `bson:"votes"`
		}

		if err := cursor.All(ctx, &results); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse results"})
			return
		}

		if len(results) == 0 {
			tCol.UpdateOne(ctx,
				bson.M{"_id": tID},
				bson.M{"$set": bson.M{"is_score_calculated": true}},
			)

			c.JSON(http.StatusOK, gin.H{
				"message": "No votes found, all scores set to 0",
			})
			return
		}

		maxVotes := 0
		for _, r := range results {
			if r.Votes > maxVotes {
				maxVotes = r.Votes
			}
		}

		for _, r := range results {

			var score float64 = 0
			if maxVotes > 0 {
				score = (float64(r.Votes) / float64(maxVotes)) * 100
			}

			_, err := sCol.UpdateOne(ctx,
				bson.M{"_id": r.ID},
				bson.M{"$set": bson.M{
					"votes_count": r.Votes,
					"points":      score,
				}},
			)

			if err != nil {
				fmt.Println("Update error:", err)
			}
		}

		_, err = tCol.UpdateOne(ctx,
			bson.M{"_id": tID},
			bson.M{"$set": bson.M{
				"is_score_calculated": true,
			}},
		)
		if err != nil {
			fmt.Println("Tournament update error:", err)
		}

		c.JSON(http.StatusOK, gin.H{
			"message":        "Scores calculated successfully",
			"max_votes":      maxVotes,
			"total_entries":  len(results),
		})
	}
}