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
    TournamentVoting    =  "voting"  

)

type Tournament struct {
	ID                primitive.ObjectID `bson:"_id,omitempty" json:"_id"`

	Title             string             `bson:"title" json:"title"`
	Type              string             `bson:"type" json:"type"`
	Number            int                `bson:"number" json:"number"`
	Description       string             `bson:"description" json:"description"`
	Banner            string             `bson:"banner" json:"banner"`
	Slug              string             `bson:"slug" json:"slug"`

	StartTime         time.Time          `bson:"start_time" json:"start_time"`
	EndTime           time.Time          `bson:"end_time" json:"end_time"`

	MaxParticipants   int                `bson:"max_participants" json:"max_participants"`
	CurrentCount      int                `bson:"current_count" json:"current_count"`

	PrizePool         float64            `bson:"prize_pool" json:"prize_pool"`
	AssetsLink        string             `bson:"assets_link" json:"assets_link"`

	JudgeEmail        string             `bson:"judge_email,omitempty" json:"judge_email,omitempty"`
	JudgeSlug         string             `bson:"judge_slug,omitempty" json:"judge_slug,omitempty"`
	JudgeSlugExpiry   time.Time          `bson:"judge_slug_expiry,omitempty" json:"judge_slug_expiry,omitempty"`

	Status            string             `bson:"status" json:"status"`
	IsLeaderboardLive bool               `bson:"is_leaderboard_live" json:"is_leaderboard_live"`

	Cateogry          string             `bson:"cateogry,omitempty" json:"cateogry,omitempty"`
	Label             string             `bson:"label,omitempty" json:"label,omitempty"`

	VotingStartTime   time.Time          `bson:"voting_start_time" json:"voting_start_time"`
	VotingEndTime     time.Time          `bson:"voting_end_time" json:"voting_end_time"`

	IsJudgingCompleted bool              `bson:"is_judging_completed,omitempty" json:"is_judging_completed,omitempty"`
	IsScoreCalculated bool `bson:"is_score_calculated,omitempty" json:"is_score_calculated,omitempty"`
	CreatedBy         primitive.ObjectID `bson:"created_by" json:"created_by"`
	CreatedAt         time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt         time.Time          `bson:"updated_at" json:"updated_at"`
}

type Submission struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	TournamentID primitive.ObjectID `bson:"tournament_id"`
	UserID       primitive.ObjectID `bson:"user_id"`
	VotesCount   int                `bson:"votes_count"` 

	Title        string             `bson:"title"`
	MediaURL     string             `bson:"media_url"`
	MediaType    string             `bson:"media_type"`
	Points       float64            `bson:"points"`
	IsJudged     bool               `bson:"is_judged"`
	Votes int `bson:"votes,omitempty"`
	CreatedAt    time.Time          `bson:"created_at"`
}