package controllers

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/ayushmehta03/editorzzAdmin/internal/database"
	"github.com/ayushmehta03/editorzzAdmin/internal/models"
	"github.com/ayushmehta03/editorzzAdmin/internal/utils"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/robfig/cron/v3"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GenerateSlug(title string) string {
	slug := strings.ToLower(title)
	slug = strings.ReplaceAll(slug, " ", "-")
	return slug + "-" + uuid.New().String()[:6]

}


// struct creation for taking frontend response
type CreateTournamentRequest struct {
	Title           string    `json:"title" binding:"required"`
	Description     string    `json:"description" binding:"required"`
	BannerURL       string    `json:"banner_url"`
	StartTime       time.Time `json:"start_time" binding:"required"`
	EndTime         time.Time `json:"end_time" binding:"required"`
	MaxParticipants int       `json:"max_participants" binding:"required"`
	PrizePool       float64   `json:"prize_pool" binding:"required"`
	AssetsLink      string    `json:"assets_link" binding:"required"`
	JudgeEmail      string    `json:"judge_email" binding:"required,email"`

   Cateogry string `json:"catreogry" `
   Label string `json:"label"`

}

type CreateVoteContest struct {
	Title           string    `json:"title" binding:"required"`
	Description     string    `json:"description" binding:"required"`
	BannerURL       string    `json:"banner_url"`
	StartTime       time.Time `json:"start_time" binding:"required"`
	EndTime         time.Time `json:"end_time" binding:"required"`

	VotingStartTime time.Time `json:"voting_start_time" binding:"required"` 
	VotingEndTime   time.Time `json:"voting_end_time" binding:"required"`   

	MaxParticipants int       `json:"max_participants" binding:"required"`
	PrizePool       float64   `json:"prize_pool" binding:"required"`
	AssetsLink      string    `json:"assets_link" binding:"required"`

   Cateogry string `json:"catreogry"`
   Label string `json:"label"`
}

func GetNextTournamentNumber(client *mongo.Client) (int64, error) {

	counterCollection := database.OpenCollection("counters", client)

	filter := bson.M{"_id": "tournament_number"}

	update := bson.M{
		"$inc": bson.M{"seq": 1},
	}


	opts := options.FindOneAndUpdate().
		SetUpsert(true).
		SetReturnDocument(options.After)

	var result struct {
		Seq int64 `bson:"seq"`
	}

	err := counterCollection.FindOneAndUpdate(
		context.TODO(),
		filter,
		update,
		opts,
	).Decode(&result)

	if err != nil {
		return 0, err
	}

	return result.Seq, nil
}

func CreateTournament(clinet *mongo.Client)gin.HandlerFunc{
	return func(c *gin.Context ){

	
		// check for role and auth if jwt is authrizied then only tournamnet posting will be allowed

		role,exists:=c.Get("role")

		if !exists|| role!="admin"{
			c.JSON(http.StatusUnauthorized,gin.H{"error":"Unauthorized"})
			return 
		}


		var req CreateTournamentRequest


		if err:=c.ShouldBindJSON(&req);err!=nil{
			c.JSON(http.StatusBadRequest,gin.H{"error":"Invlaid input"})
			return 
		}

		if req.EndTime.Before(req.StartTime){
			c.JSON(http.StatusBadRequest,gin.H{"error":"End time must be after start time"})
			return 
		}

		ctx,cancel:=context.WithTimeout(context.Background(),10*time.Second)

		defer cancel()


		collection:=database.OpenCollection("tournaments",clinet)


		tournamentNumber, err := GetNextTournamentNumber(clinet)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate tournament number"})
			return
		}

	adminID, _ := primitive.ObjectIDFromHex(c.GetString("user_id"))


	now:=time.Now()


	tournament:=models.Tournament{
		ID:primitive.NewObjectID(),
		Title: req.Title,
		Type: "judge_based",
		Number: int(tournamentNumber),
		Description: req.Description,
		IsJudgingCompleted: false,
		Banner:req.BannerURL,
		Slug:GenerateSlug(req.Title),
		StartTime: req.StartTime,
		EndTime: req.EndTime,
		MaxParticipants: req.MaxParticipants,
		CurrentCount: 0,
		PrizePool:          req.PrizePool,
			AssetsLink:         req.AssetsLink,
			JudgeEmail:         req.JudgeEmail,
			JudgeSlug:          uuid.New().String(),
			JudgeSlugExpiry:    req.EndTime.Add(48 * time.Hour), // judge can rank 2 days after
			Status:             models.TournamentUpcoming,
			IsLeaderboardLive:  false,
			Label: req.Label,
			Cateogry: req.Cateogry,
			CreatedBy:          adminID,
			CreatedAt:          now,
			UpdatedAt:          now,


	}

	_,err=collection.InsertOne(ctx,tournament)
	if err!=nil{
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create tournament"})
			return

	}

	judgeLink := "https://localhost:4000/judge-panel/" + tournament.JudgeSlug

err = utils.SendJudgeInvitationEmail(
	tournament.JudgeEmail,
	tournament.Title,
	judgeLink,
)
if err != nil {
	fmt.Println("Failed to send judge email:", err)
}



	c.JSON(http.StatusCreated, gin.H{
			"message":    "Tournament created successfully",
			"tournament": tournament,
		})





	}
}


// update tournaMENT STATUS by checking each minute



// using cron fw

func StartTournamentCron(client *mongo.Client) {
	c := cron.New()
	

	c.AddFunc("@every 1m", func() {
		UpdateTournamentStatuses(client)
	})

	c.Start()
}


// update or change in tournamnt if required 


// the required struct we will use pointer to avoid partial update 

type UpdateTournamentRequest struct {
	Title           *string    `json:"title,omitempty"`
	Description     *string    `json:"description,omitempty"`
	BannerURL       *string    `json:"banner_url,omitempty"`
	StartTime       *time.Time `json:"start_time,omitempty"`
	EndTime         *time.Time `json:"end_time,omitempty"`
	MaxParticipants *int       `json:"max_participants,omitempty"`
	PrizePool       *float64   `json:"prize_pool,omitempty"`
	AssetsLink      *string    `json:"assets_link,omitempty"`
	JudgeEmail      *string    `json:"judge_email,omitempty"`
}


func UpdateTournament(client *mongo.Client)gin.HandlerFunc{
	return func(c*gin.Context){


		role,exists:=c.Get("role")


		if !exists || role!="admin"{
			c.JSON(http.StatusUnauthorized,gin.H{"error":"Unauthorized"})
			return 
		}

		idParam:=c.Param("id")

		tournamentId,err:=primitive.ObjectIDFromHex(idParam)

		if err!=nil{
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tournament ID"})
			return
		}
		var req UpdateTournamentRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		collection := database.OpenCollection("tournaments", client)

		// Fetch tournament
		var tournament models.Tournament
		err = collection.FindOne(ctx, bson.M{"_id": tournamentId}).Decode(&tournament)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Tournament not found"})
			return
		}

		// dont aloow between on going tournaments

		if tournament.Status != models.TournamentUpcoming {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Tournament cannot be updated after it starts",
			})
			return
		}

		// fileds that need to be updated 

		updateFields := bson.M{}
			judgeLink := "https://judge.editorzzzz.com/tournamnet/" + tournament.JudgeSlug


		if req.Title != nil {
			updateFields["title"] = *req.Title
		}
		if req.Description != nil {
			updateFields["description"] = *req.Description
		}
		if req.BannerURL != nil {
			updateFields["banner_url"] = *req.BannerURL
		}
		if req.StartTime != nil {
			updateFields["start_time"] = *req.StartTime
		}
		if req.EndTime != nil {
			updateFields["end_time"] = *req.EndTime
		}
		if req.MaxParticipants != nil {
			updateFields["max_participants"] = *req.MaxParticipants
		}
		if req.PrizePool != nil {
			updateFields["prize_pool"] = *req.PrizePool
		}
		if req.AssetsLink != nil {
			updateFields["assets_link"] = *req.AssetsLink
		}
		if req.JudgeEmail != nil {
			updateFields["judge_email"] = *req.JudgeEmail
			utils.SendJudgeInvitationEmail(*req.JudgeEmail,*req.Title,judgeLink)

		
		}



		updateFields["updated_at"] = time.Now()

		_, err = collection.UpdateOne(
			ctx,
			bson.M{"_id": tournamentId},
			bson.M{"$set": updateFields},
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Update failed"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Tournament updated successfully",
		})
	}
}
func UpdateTournamentStatuses(client *mongo.Client) {

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := database.OpenCollection("tournaments", client)
	now := time.Now()

	collection.UpdateMany(
		ctx,
		bson.M{
			"status":     models.TournamentUpcoming,
			"start_time": bson.M{"$lte": now},
		},
		bson.M{"$set": bson.M{"status": models.TournamentActive}},
	)

	// Judge → Judging
	collection.UpdateMany(
		ctx,
		bson.M{
			"type":     "judge_based",
			"status":   models.TournamentActive,
			"end_time": bson.M{"$lte": now},
		},
		bson.M{"$set": bson.M{"status": models.TournamentJudging}},
	)

	collection.UpdateMany(
		ctx,
		bson.M{
			"type":              "vote_based",
			"status":            models.TournamentActive,
			"end_time":          bson.M{"$lte": now},          // contest finished
			"voting_start_time": bson.M{"$lte": now},          // voting allowed
		},
		bson.M{"$set": bson.M{"status": models.TournamentVoting}},
	)

	collection.UpdateMany(
		ctx,
		bson.M{
			"type":            "vote_based",
			"status":          models.TournamentVoting,
			"voting_end_time": bson.M{"$lte": now},
		},
		bson.M{
			"$set": bson.M{
				"status":              models.TournamentCompleted,
				"is_leaderboard_live": true,
			},
		},
	)
}

func GetAdminReview(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		tournamentID, _ := primitive.ObjectIDFromHex(c.Param("id"))
		ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
		defer cancel()

		submissionCol := database.OpenCollection("submissions", client)

		pipeline := mongo.Pipeline{
			{{Key: "$match", Value: bson.M{"tournament_id": tournamentID}}},
			{{Key: "$lookup", Value: bson.M{
				"from":         "users",
				"localField":   "user_id",
				"foreignField": "_id",
				"as":           "user_details",
			}}},
			{{Key: "$unwind", Value: "$user_details"}},
			{{Key: "$sort", Value: bson.M{"points": -1}}},
		}

		cursor, err := submissionCol.Aggregate(ctx, pipeline)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch review data"})
			return
		}

		var reviewData []bson.M
		if err = cursor.All(ctx, &reviewData); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding data"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"tournament_id": tournamentID,
			"submissions":   reviewData,
		})
	}
}

func AdminApproveTournament(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		tID, _ := primitive.ObjectIDFromHex(c.Param("id"))

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		tCol := database.OpenCollection("tournaments", client)

		var t models.Tournament
		tCol.FindOne(ctx, bson.M{"_id": tID}).Decode(&t)

		if !t.IsJudgingCompleted {
			c.JSON(http.StatusConflict, gin.H{"error": "Judge not finished"})
			return
		}

		tCol.UpdateOne(ctx,
			bson.M{"_id": tID},
			bson.M{"$set": bson.M{
				"is_leaderboard_live": true,
				"status":              models.TournamentCompleted,
			}},
		)

		c.JSON(http.StatusOK, gin.H{"message": "Leaderboard live"})
	}
}



func GetStats(client *mongo.Client) gin.HandlerFunc {

	return func(c *gin.Context) {

		editorCol := database.OpenCollection("editors", client)
		reportCol := database.OpenCollection("reports", client)

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// total users
		editorsCnt, err1 := editorCol.CountDocuments(ctx, bson.M{})

		// total reports (ONLY pending)
		reportsCnt, err2 := reportCol.CountDocuments(ctx, bson.M{
			"status": "pending",
		})

		if err1 != nil || err2 != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to fetch stats",
			})
			return
		}

		pipeline := mongo.Pipeline{
			{
				{"$group", bson.D{
					{"_id", bson.D{
						{"month", bson.D{{"$month", "$created_at"}}},
					}},
					{"users", bson.D{{"$sum", 1}}},
				}},
			},
			{
				{"$sort", bson.D{{"_id.month", 1}}},
			},
		}

		cursor, err := editorCol.Aggregate(ctx, pipeline)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to calculate growth",
			})
			return
		}

		var growth []bson.M

		if err = cursor.All(ctx, &growth); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to parse growth data",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"users":   editorsCnt,
			"reports": reportsCnt,
			"growth":  growth,
		})
	}
}


// create tournament for contest type 2
func CreateVoteContestHandler(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		// 🔐 Admin check
		role, exists := c.Get("role")
		if !exists || role != "admin" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		var req CreateVoteContest

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}

		if req.EndTime.Before(req.StartTime) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "End time must be after start time"})
			return
		}

		if req.VotingStartTime.Before(req.EndTime) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Voting must start after contest ends",
			})
			return
		}

		if req.VotingEndTime.Before(req.VotingStartTime) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Voting end must be after voting start",
			})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		collection := database.OpenCollection("tournaments", client)

		tournamentNumber, err := GetNextTournamentNumber(client)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate number"})
			return
		}

		adminID, _ := primitive.ObjectIDFromHex(c.GetString("user_id"))
		now := time.Now()

		tournament := models.Tournament{
			ID:                primitive.NewObjectID(),
			Title:             req.Title,
			Type:              "vote_based",
			Number:            int(tournamentNumber),
			Description:       req.Description,
			Banner:            req.BannerURL,
			Slug:              GenerateSlug(req.Title),

			StartTime:         req.StartTime,
			EndTime:           req.EndTime,
			VotingStartTime:   req.VotingStartTime, 
			VotingEndTime:     req.VotingEndTime,   

			MaxParticipants:   req.MaxParticipants,
			CurrentCount:      0,

			PrizePool:         req.PrizePool,
			AssetsLink:        req.AssetsLink,

			Status:            models.TournamentUpcoming,
			IsLeaderboardLive: false, 

			CreatedBy:         adminID,
			CreatedAt:         now,
			UpdatedAt:         now,
		}

		_, err = collection.InsertOne(ctx, tournament)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create contest"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message":    "Vote contest created successfully",
			"tournament": tournament,
		})
	}
}
func GetLeaderboard(client *mongo.Client) gin.HandlerFunc {
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

		// ✅ Get tournament
		var t models.Tournament
		if err := tCol.FindOne(ctx, bson.M{"_id": tID}).Decode(&t); err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Tournament not found"})
			return
		}

		// ❌ OPTIONAL: block if not live
		// if !t.IsLeaderboardLive {
		// 	c.JSON(http.StatusOK, []interface{}{})
		// 	return
		// }

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
			}}},

			{{Key: "$project", Value: bson.M{
				"username":      "$user.username",
				"profile_image": "$user.profile_image",
				"points":        1,
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

type UpdateVotingRequest struct {
	VotingStartTime *time.Time `json:"voting_start_time"`
	VotingEndTime   *time.Time `json:"voting_end_time"`
}

func UpdateVotingTime(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		role, exists := c.Get("role")
		if !exists || role != "admin" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		idParam := c.Param("id")
		tournamentID, err := primitive.ObjectIDFromHex(idParam)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
			return
		}

		var req UpdateVotingRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid body"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		col := database.OpenCollection("tournaments", client)

		update := bson.M{}

		if req.VotingStartTime != nil {
			update["voting_start_time"] = *req.VotingStartTime
		}
		if req.VotingEndTime != nil {
			update["voting_end_time"] = *req.VotingEndTime
		}

		update["updated_at"] = time.Now()

		_, err = col.UpdateOne(ctx,
			bson.M{"_id": tournamentID},
			bson.M{"$set": update},
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Update failed"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Voting time updated",
		})
	}
}