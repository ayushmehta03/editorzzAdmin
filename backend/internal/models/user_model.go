package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`

	// Identity
	FullName string `bson:"name" json:"name" validate:"required,min=1,max=30"`
	UserName string `bson:"username" json:"username" validate:"required,min=5,max=20"`
	Email    string `bson:"email" json:"email"`
	Phone    string `bson:"phone" json:"phone"`

	PasswordHash string `bson:"password_hash" json:"-"`

	Role string `bson:"role" json:"role"`

	// Hiring Logic
	ShowOnHiringPage bool   `bson:"show_on_hiring_page" json:"show_on_hiring_page"`
	IsHiringListed   bool   `bson:"is_hiring_listed" json:"is_hiring_listed"`
	EmploymentStatus string `bson:"employment_status" json:"employment_status"`

	Ban bool `bson:"ban" json:"ban"`

	// Verification
	IsEmailVerified bool `bson:"is_email_verified" json:"is_email_verified"`
	IsPhoneVerified bool `bson:"is_phone_verified" json:"is_phone_verified"`

	OtpHash   string    `bson:"otp_hash,omitempty" json:"-"`
	OtpExpiry time.Time `bson:"otp_expiry,omitempty" json:"-"`

	VerificationID string `bson:"verification_id,omitempty"`

	// Profile
	ProfileImage string   `bson:"profile_image,omitempty" json:"profile_image,omitempty"`
	Skills       []string `bson:"skills,omitempty" json:"skills,omitempty"`
	Bio          string   `bson:"bio,omitempty" json:"bio,omitempty"`
	PortFolio    string   `bson:"portfolio,omitempty" json:"portfolio,omitempty"`

	CreatedAt time.Time  `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time  `bson:"updated_at" json:"updated_at"`
	LastSeen  *time.Time `bson:"last_seen,omitempty" json:"last_seen,omitempty"`
}