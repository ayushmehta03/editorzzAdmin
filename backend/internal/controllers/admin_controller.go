package controllers

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/ayushmehta03/editorzzAdmin/internal/database"
	"github.com/ayushmehta03/editorzzAdmin/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
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


		collection:=database.OpenCollection("tournamnets",clinet)

	adminID, _ := primitive.ObjectIDFromHex(c.GetString("user_id"))


	now:=time.Now()


	tournament:=models.Tournament{
		ID:primitive.NewObjectID(),
		Title: req.Title,
		Description: req.Description,
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
			CreatedBy:          adminID,
			CreatedAt:          now,
			UpdatedAt:          now,

	}

	_,err:=collection.InsertOne(ctx,tournament)
	if err!=nil{
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create tournament"})
			return

	}

	c.JSON(http.StatusCreated, gin.H{
			"message":    "Tournament created successfully",
			"tournament": tournament,
		})


	}
}