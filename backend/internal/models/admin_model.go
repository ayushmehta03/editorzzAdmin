package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)
type Admin struct{
	Id primitive.ObjectID `bson:"_id" json:"id"`
	UserName string `bson:"username" json:"username"`
	Email string `bson:"email" json:"email"`
	ProfilePic string `bson:"profile_pic" json:"profile_pic"`
	Hashedpassword string `bson:"password" json:"password"`
	Role string `bson:"role" json:"role"`
CreatedAt time.Time `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`
	
}


type FeaturePost struct{
	Id  primitive.ObjectID `bson:"_id" json:"_id"`
	Banner_Url string       `bson:"banner_url" json:"banner_url"`
	Title string 			`bson:"title" json:"title"`
	IsLive bool 			`bson:"is_live" json:"is_live"`
	Descreption string 			`bson:"descreption" json:"descreption"`
	CreatedAt time.Time `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`
	
}