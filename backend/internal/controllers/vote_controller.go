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

func AdminPublishVoteLeaderboard(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		tID, _ := primitive.ObjectIDFromHex(c.Param("id"))

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		tCol := database.OpenCollection("tournaments", client)

		var t models.Tournament
		tCol.FindOne(ctx, bson.M{"_id": tID}).Decode(&t)

		if t.Type != "vote_based" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid contest type"})
			return
		}

		if !t.IsScoreCalculated {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Scores not calculated"})
			return
		}

		tCol.UpdateOne(ctx,
			bson.M{"_id": tID},
			bson.M{"$set": bson.M{
				"is_leaderboard_live": true,
				"status":              models.TournamentCompleted,
			}},
		)

		c.JSON(http.StatusOK, gin.H{"message": "Leaderboard published"})
	}
}


func GetVoteLeaderboard(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		tID, err := primitive.ObjectIDFromHex(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tournament ID"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
		defer cancel()

		tCol := database.OpenCollection("tournaments", client)
		pCol := database.OpenCollection("participants", client)

		var t models.Tournament
		if err := tCol.FindOne(ctx, bson.M{"_id": tID}).Decode(&t); err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Tournament not found"})
			return
		}

		if t.Type != "vote_based" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Not a vote-based tournament"})
			return
		}

		pipeline := mongo.Pipeline{

			{{Key: "$match", Value: bson.M{
				"tournament_id": tID,
			}}},

			{{Key: "$lookup", Value: bson.M{
				"from":         "editors",
				"localField":   "user_id",
				"foreignField": "_id",
				"as":           "user",
			}}},
			{{Key: "$unwind", Value: "$user"}},

			{{Key: "$lookup", Value: bson.M{
				"from": "submissions",
				"let": bson.M{
					"uid": "$user_id",
					"tid": "$tournament_id",
				},
				"pipeline": mongo.Pipeline{
					{{
						Key: "$match",
						Value: bson.M{
							"$expr": bson.M{
								"$and": bson.A{
									bson.M{"$eq": bson.A{"$user_id", "$$uid"}},
									bson.M{"$eq": bson.A{"$tournament_id", "$$tid"}},
								},
							},
						},
					}},
					{{Key: "$sort", Value: bson.M{"created_at": -1}}},
					{{Key: "$limit", Value: 1}},
				},
				"as": "submission",
			}}},

			{{Key: "$addFields", Value: bson.M{

				"points": bson.M{
					"$ifNull": bson.A{
						bson.M{
							"$getField": bson.M{
								"field": "points",
								"input": bson.M{
									"$arrayElemAt": bson.A{"$submission", 0},
								},
							},
						},
						0,
					},
				},

				"votes_count": bson.M{
					"$ifNull": bson.A{
						bson.M{
							"$getField": bson.M{
								"field": "votes_count",
								"input": bson.M{
									"$arrayElemAt": bson.A{"$submission", 0},
								},
							},
						},
						0,
					},
				},
			}}},

			{{Key: "$project", Value: bson.M{
				"username":      "$user.username",
				"profile_image": "$user.profile_image",
				"points":        1,
				"votes_count":   1,
			}}},

			{{Key: "$sort", Value: bson.M{
				"points": -1,
			}}},
		}

		cursor, err := pCol.Aggregate(ctx, pipeline)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Aggregation failed"})
			return
		}

		var res []bson.M
		if err := cursor.All(ctx, &res); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Cursor decode failed"})
			return
		}

		last := -1.0
		rank := 0

		for i := range res {

			var pts float64

			switch v := res[i]["points"].(type) {
			case int32:
				pts = float64(v)
			case int64:
				pts = float64(v)
			case float64:
				pts = v
			default:
				pts = 0
			}

			if pts != last {
				rank = i + 1
				last = pts
			}

			res[i]["rank"] = rank
		}

		c.JSON(http.StatusOK, res)
	}
}