package models

import "time"
type Admin struct{
	UserName string `bson:"username" json:"username"`
	Email string `bson:"email" json:"email"`
	ProfilePic string `bson:"profile_pic" json:"profile_pic"`
	Hashedpassword string `bson:"password" json:"password"`
	Role string `bson:"role" json:"role"`
CreatedAt time.Time `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`
	
}
