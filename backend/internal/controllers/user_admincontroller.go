package controllers

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"github.com/ayushmehta03/editorzzAdmin/internal/database"
	"github.com/ayushmehta03/editorzzAdmin/internal/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)


func GetAllUsers(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		search := c.Query("search")
		pageStr := c.DefaultQuery("page", "1")
		limitStr := c.DefaultQuery("limit", "10")

		page, _ := strconv.Atoi(pageStr)
		limit, _ := strconv.Atoi(limitStr)

		skip := (page - 1) * limit

		editorCol := database.OpenCollection("editors", client)

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		filter := bson.M{}

		if search != "" {
			filter["username"] = bson.M{
				"$regex":   search,
				"$options": "i",
			}
		}

		opts := options.Find().
			SetSkip(int64(skip)).
			SetLimit(int64(limit)).
			SetSort(bson.D{{"created_at", -1}})

		cursor, err := editorCol.Find(ctx, filter, opts)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching users"})
			return
		}

		var users []models.User
    	if err = cursor.All(ctx, &users); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding users"})
			return
		}
		

		// Remove sensitive fields manually
		var response []gin.H
		for _, u := range users {
			response = append(response, gin.H{
				"id":                u.ID,
				"name":              u.FullName,
				"username":          u.UserName,
				"email":             u.Email,
				"role":              u.Role,
				"ban":               u.Ban,
				"is_hiring_listed":  u.IsHiringListed,
				"employment_status": u.EmploymentStatus,
				"created_at":        u.CreatedAt,
			})
		}

		c.JSON(http.StatusOK, gin.H{
			"page":  page,
			"limit": limit,
			"users": response,
		})
	}
}


