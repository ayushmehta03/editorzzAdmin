package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

const (
	TournamentUpcoming        = "upcoming"
	TournamentActive          = "active"
	TournamentJudging         = "judging"
	TournamentCompleted       = "completed"
    TournamentVoting    = "voting"  

)

type Tournament struct {
	ID                primitive.ObjectID `bson:"_id,omitempty"`
	Title             string             `bson:"title"`
	Type              string             `bson:"type"` 
	Number            int                `bson:"number"`
	Description       string             `bson:"description"`
	Banner            string             `bson:"banner"`
	Slug              string             `bson:"slug"`

	StartTime         time.Time          `bson:"start_time"`
	EndTime           time.Time          `bson:"end_time"`

	MaxParticipants   int                `bson:"max_participants"`
	CurrentCount      int                `bson:"current_count"`

	PrizePool         float64            `bson:"prize_pool"`
	AssetsLink        string             `bson:"assets_link"`

	JudgeEmail        string             `bson:"judge_email,omitempty"`
	JudgeSlug         string             `bson:"judge_slug,omitempty"`
	JudgeSlugExpiry   time.Time          `bson:"judge_slug_expiry,omitempty"`

	Status            string             `bson:"status"`
	IsLeaderboardLive bool               `bson:"is_leaderboard_live"`

   Cateogry string `bson:"cateogry,omitempty"`
   Label string `bson:"label,omitempty"`
	VotingStartTime time.Time `json:"voting_start_time" binding:"required"` 
	VotingEndTime   time.Time `json:"voting_end_time" binding:"required"`  

	IsJudgingCompleted bool `bson:"is_judging_completed,omitempty"`
	CreatedBy         primitive.ObjectID `bson:"created_by"`
	CreatedAt         time.Time          `bson:"created_at"`
	UpdatedAt         time.Time          `bson:"updated_at"`
}



type Submission struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	TournamentID primitive.ObjectID `bson:"tournament_id"`
	UserID       primitive.ObjectID `bson:"user_id"`
	Title        string             `bson:"title"`
	MediaURL     string             `bson:"media_url"`
	MediaType    string             `bson:"media_type"`
	Points       float64            `bson:"points"`
	IsJudged     bool               `bson:"is_judged"`
	Votes int `bson:"votes,omitempty"`
	CreatedAt    time.Time          `bson:"created_at"`
}