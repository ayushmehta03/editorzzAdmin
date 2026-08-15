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

func GetSubmissionsWithVotes(client *mongo.Client) gin.HandlerFunc {
    return func(c *gin.Context) {
        tID, err := primitive.ObjectIDFromHex(c.Param("id"))
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tournament id"})
            return
        }

        ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
        defer cancel()

        sCol := database.OpenCollection("submissions", client)

        pipeline := mongo.Pipeline{
            {{"$match", bson.D{{"tournament_id", tID}}}},
            
            {{"$lookup", bson.D{
                {"from", "votes"},
                {"localField", "_id"},
                {"foreignField", "submission_id"},
                {"as", "matched_votes"},
            }}},
            
            {{"$project", bson.D{
                {"_id", 1},
                {"tournament_id", 1},
                {"user_id", 1}, // Add other fields you need from your submission model
                {"points", 1},
                {"is_judged", 1},
                {"votes_count", bson.D{{"$size", "$matched_votes"}}},
            }}},
        }

        cursor, err := sCol.Aggregate(ctx, pipeline)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to aggregate submissions and votes"})
            return
        }
        defer cursor.Close(ctx)

        var submissionsWithVotes []bson.M
        if err := cursor.All(ctx, &submissionsWithVotes); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse submissions"})
            return
        }

        c.JSON(http.StatusOK, gin.H{
            "tournament_id": tID.Hex(),
            "submissions":   submissionsWithVotes,
        })
    }
}



type ManualScoreInput struct {
    Points float64 `json:"points" binding:"required,min=0"`
}

func UpdateSubmissionPoints(client *mongo.Client) gin.HandlerFunc {
    return func(c *gin.Context) {
        sID, err := primitive.ObjectIDFromHex(c.Param("submission_id"))
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid submission id"})
            return
        }

        var input ManualScoreInput
        if err := c.ShouldBindJSON(&input); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }

        ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
        defer cancel()

        sCol := database.OpenCollection("submissions", client)

        result, err := sCol.UpdateOne(ctx,
            bson.M{"_id": sID},
            bson.M{"$set": bson.M{
                "points":    input.Points,
                "is_judged": true,
            }},
        )

        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update points"})
            return
        }

        if result.MatchedCount == 0 {
            c.JSON(http.StatusNotFound, gin.H{"error": "Submission not found"})
            return
        }

        c.JSON(http.StatusOK, gin.H{
            "message":       "Points manually assigned successfully",
            "submission_id": sID.Hex(),
            "points":        input.Points,
        })
    }
}
func AdminPublishVoteLeaderboard(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		tID, err := primitive.ObjectIDFromHex(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tournament ID format"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		tCol := database.OpenCollection("tournaments", client)
		userCol := database.OpenCollection("editors", client)

		var t models.Tournament
		err = tCol.FindOne(ctx, bson.M{"_id": tID}).Decode(&t)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				c.JSON(http.StatusNotFound, gin.H{"error": "Tournament not found"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database retrieval error"})
			return
		}

		if t.Type != "vote_based" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid contest type"})
			return
		}

		sCol := database.OpenCollection("submissions", client)

		cursor, err := sCol.Find(ctx, bson.M{
			"tournament_id": tID,
		})

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "unable to fetch submissions"})
			return
		}
		defer cursor.Close(ctx)

		var submissions []models.Submission

		if err := cursor.All(ctx, &submissions); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		var writes []mongo.WriteModel

		for _, submission := range submissions {
			updateDoc := bson.M{
				"$inc": bson.M{
					"total_score": int(submission.Points),
				},
			}

			
			if submission.Points > 0 && len(t.Skills) > 0 {
				skillsSet := bson.M{}
				for _, skill := range t.Skills {
					skillsSet["skills_expertise."+skill] = true
				}
				updateDoc["$set"] = skillsSet
			}

			model := mongo.NewUpdateOneModel().
				SetFilter(bson.M{"_id": submission.UserID}).
				SetUpdate(updateDoc)

			writes = append(writes, model)
		}

		if len(writes) > 0 {
			_, err = userCol.BulkWrite(ctx, writes)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		}

		_, err = tCol.UpdateOne(ctx,
			bson.M{"_id": tID},
			bson.M{"$set": bson.M{
				"is_leaderboard_live": true,
				"status":              models.TournamentCompleted,
			}},
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update leaderboard status"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Leaderboard successfully published"})
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

func GetAllVoteTournaments(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		tournamentCol := database.OpenCollection("tournaments", client)

		filter := bson.M{
			"type": "vote_based",
		}

		cursor, err := tournamentCol.Find(ctx, filter)
		if err != nil {
			fmt.Println(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tournaments"})
			return
		}
		defer cursor.Close(ctx)

		var tournaments []bson.M
		if err := cursor.All(ctx, &tournaments); err != nil {
			fmt.Println(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Decode error"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"tournaments": tournaments,
		})
	}
}

func GetTotalVotes(client *mongo.Client)gin.HandlerFunc{
	return func(c *gin.Context){
		id:=c.Param("id")

		tId,err:=primitive.ObjectIDFromHex(id);

		if err!=nil{
			c.JSON(http.StatusBadRequest,gin.H{"error":"Invalid tournament id"})
			return 
		}

		ctx,cancel:=context.WithTimeout(context.Background(),10*time.Second)

		defer cancel()


		voteCol:=database.OpenCollection("votes",client)

		count,err:=voteCol.CountDocuments(ctx,bson.M{
			"tournament_id":tId,
		})

		if err!=nil{
			c.JSON(http.StatusInternalServerError,gin.H{"error":"Unable to count total votes"})
			return 
		}

		c.JSON(http.StatusOK,gin.H{
			"tournament_id":tId,
			"total_votes":count,
		})



	}
}


