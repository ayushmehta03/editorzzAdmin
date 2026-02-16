package controllers

import (
	"context"
	"net/http"
	"time"

	"github.com/ayushmehta03/editorzzAdmin/internal/database"
	"github.com/ayushmehta03/editorzzAdmin/internal/models"
	"github.com/ayushmehta03/editorzzAdmin/internal/utils"
	"github.com/gin-gonic/gin"
	"github.com/robfig/cron/v3"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

func Login(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		var req struct {
			Identifier string `json:"identifier"`
			Password   string `json:"password"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)

		defer cancel()

		adminCollection := database.OpenCollection("admin", client)

		var admin models.Admin

		filter := bson.M{
			"$or": []bson.M{
				{"email": req.Identifier},
				{"username": req.Identifier},
			},
		}

		if err := adminCollection.FindOne(ctx, filter).Decode(&admin); err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "No such user found"})
			return
		}

		if err := bcrypt.CompareHashAndPassword(
			[]byte(admin.Hashedpassword),
			[]byte(req.Password),
		); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Wrong email or password"})
			return
		}

		token, err := utils.GenerateToken(admin.Id.Hex(), admin.Email, admin.Role)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to login now"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Login Successful",
			"token":   token,
		})

	}
}


// update tournaMENT STATUS by checking each minute


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
		bson.M{
			"$set": bson.M{
				"status": models.TournamentActive,
			},
		},
	)

	collection.UpdateMany(
		ctx,
		bson.M{
			"status":   models.TournamentActive,
			"end_time": bson.M{"$lte": now},
		},
		bson.M{
			"$set": bson.M{
				"status": models.TournamentJudging,
			},
		},
	)
}

// using cron fw

func StartTournamentCron(client *mongo.Client) {
	c := cron.New()

	c.AddFunc("@every 1m", func() {
		UpdateTournamentStatuses(client)
	})

	c.Start()
}
