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
)


type Tournament struct {
	ID primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`

	Title       string `bson:"title" json:"title"`
	Description string `bson:"description" json:"description"`
	Banner      string `bson:"banner_url,omitempty" json:"banner_url,omitempty"`

	Slug string `bson:"slug" json:"slug"`

	StartTime time.Time `bson:"start_time" json:"start_time"`
	EndTime   time.Time `bson:"end_time" json:"end_time"`

	MaxParticipants int `bson:"max_participants" json:"max_participants"`
	CurrentCount    int `bson:"current_count" json:"current_count"`

	PrizePool  float64 `bson:"prize_pool" json:"prize_pool"`
	AssetsLink string  `bson:"assets_link" json:"assets_link"`

	JudgeEmail      string    `bson:"judge_email" json:"judge_email"`
	JudgeSlug       string    `bson:"judge_slug" json:"judge_slug"`
	JudgeSlugExpiry time.Time `bson:"judge_slug_expiry" json:"judge_slug_expiry"`

	Status string `bson:"status" json:"status"`

	IsLeaderboardLive bool `bson:"is_leaderboard_live" json:"is_leaderboard_live"`

	CreatedBy primitive.ObjectID `bson:"created_by" json:"created_by"`

	CreatedAt time.Time `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`
}

