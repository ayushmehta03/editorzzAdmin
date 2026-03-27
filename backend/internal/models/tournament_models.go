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


	VotingStartTime time.Time `json:"voting_start_time" binding:"required"` 
	VotingEndTime   time.Time `json:"voting_end_time" binding:"required"`  

	CreatedBy         primitive.ObjectID `bson:"created_by"`
	CreatedAt         time.Time          `bson:"created_at"`
	UpdatedAt         time.Time          `bson:"updated_at"`
}