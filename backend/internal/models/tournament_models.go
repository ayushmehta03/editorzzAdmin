package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Tournament struct{
	ID primitive.ObjectID `bson:"_id" json:"id"`

	// basic details of the Tournament

	Title string `bson:"title" json:"title"`

	Description string `bson:"description" json:"description"`

	Banner string `bson:"banner_url,omitempty" json:"banner_url,omitempty"`


	// time of the tournament
	StartTime time.Time `bson:"start_time" json:"start_time"`
	EndTime time.Time `bson:"end_time" json:"end_time"`

	// count details for the tournamnt

	MaxParticipants int `bson:"max_participants" json:"max_participants"`
	CurrentCount int `bson:"current_count" json:"current_count"`


	PrizePool float64 `bson:"prize_pool" json:"prize_pool"`
	AssestLink string `bson:"assest_link" json:"assest_link"`


	JudgeEmail string `bson:"judge_email" json:"judge_email"`
	JudgeSlug string `bson:"judge_slug" json:"judge_slug" `
	JudgeSlugExpiry time.Time `bson:"judge_slug_expiry" json:"judge_slug_expiry"`

	Status string `bson:"status" json:"status"`

	IsLeaderboardLive bool `bson:"is_leaderboard_live" json:"is_leaderboard_live"`



	CreatedAt time.Time `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`

	
}