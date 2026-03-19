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
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)


func GetAllUsers(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		pageStr := c.DefaultQuery("page", "1")
		limitStr := c.DefaultQuery("limit", "10")

		page, _ := strconv.Atoi(pageStr)
		limit, _ := strconv.Atoi(limitStr)

		if page < 1 {
			page = 1
		}
		if limit < 1 {
			limit = 10
		}

		skip := (page - 1) * limit

		editorCol := database.OpenCollection("editors", client)

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		opts := options.Find().
			SetSkip(int64(skip)).
			SetLimit(int64(limit)).
			SetSort(bson.D{{"created_at", -1}})

		cursor, err := editorCol.Find(ctx, bson.M{}, opts)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching users"})
			return
		}

		var users []models.User
		if err = cursor.All(ctx, &users); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding users"})
			return
		}

		total, _ := editorCol.CountDocuments(ctx, bson.M{})

		var response []gin.H
		for _, u := range users {
			response = append(response, gin.H{
				"id":                u.ID,
				"name":              u.FullName,
				"username":          u.UserName,
				"email":             u.Email,
				"phone":u.Phone,
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
			"total": total,
			"users": response,
		})
	}
}

func UpdateUserBan(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		userID := c.Param("id")

		objectID, err := primitive.ObjectIDFromHex(userID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user id"})
			return
		}

		var body struct {
			Ban bool `json:"ban"`
		}

		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}

		editorCol := database.OpenCollection("editors", client)

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		_, err = editorCol.UpdateOne(
			ctx,
			bson.M{"_id": objectID},
			bson.M{"$set": bson.M{
				"ban":        body.Ban,
				"updated_at": time.Now(),
			}},
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update ban status"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Ban status updated successfully",
		})
	}
}



func UpdateHiringStatus(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		userID := c.Param("id")

		objectID, err := primitive.ObjectIDFromHex(userID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user id"})
			return
		}

		var body struct {
			IsHiringListed bool `json:"is_hiring_listed"`
		}

		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}

		editorCol := database.OpenCollection("editors", client)

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		_, err = editorCol.UpdateOne(
			ctx,
			bson.M{"_id": objectID},
			bson.M{"$set": bson.M{
				"is_hiring_listed": body.IsHiringListed,
				"updated_at":       time.Now(),
			}},
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update hiring status"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Hiring status updated successfully",
		})
	}
}

func SearchUsersByUsername(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		search := c.Query("search")
		if search == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Search query required"})
			return
		}

		pageStr := c.DefaultQuery("page", "1")
		limitStr := c.DefaultQuery("limit", "10")

		page, _ := strconv.Atoi(pageStr)
		limit, _ := strconv.Atoi(limitStr)

		if page < 1 {
			page = 1
		}
		if limit < 1 {
			limit = 10
		}

		skip := (page - 1) * limit

		editorCol := database.OpenCollection("editors", client)

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		filter := bson.M{
			"username": bson.M{
				"$regex":   search,
				"$options": "i",
			},
		}

		opts := options.Find().
			SetSkip(int64(skip)).
			SetLimit(int64(limit)).
			SetSort(bson.D{{"created_at", -1}})

		cursor, err := editorCol.Find(ctx, filter, opts)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error searching users"})
			return
		}

		var users []models.User
		if err = cursor.All(ctx, &users); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding users"})
			return
		}

		total, _ := editorCol.CountDocuments(ctx, filter)

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
			"total": total,
			"users": response,
		})
	}
}
func GetReports(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		reportCol := database.OpenCollection("reports", client)

		opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})

		var reports []models.Report

		cursor, err := reportCol.Find(ctx, bson.M{}, opts)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching reports"})
			return
		}

		defer cursor.Close(ctx)

		if err = cursor.All(ctx, &reports); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding reports"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"reports": reports,
		})
	}
}
func GetReportByID(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		reportID, err := primitive.ObjectIDFromHex(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid report ID"})
			return
		}

		ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
		defer cancel()

		reportCol := database.OpenCollection("reports", client)
		submissionCol := database.OpenCollection("submissions", client)

		var report struct {
			ID             primitive.ObjectID `bson:"_id"`
			Reason         string             `bson:"reason"`
			Status         string             `bson:"status"`
			SuspectUname   string             `bson:"SuspectUname"`
			ReporterEmail  string             `bson:"reporter_email"`
			SubmissionID   primitive.ObjectID `bson:"SubmissionId"`
			CreatedAt      time.Time          `bson:"created_at"`
		}

		err = reportCol.FindOne(ctx, bson.M{"_id": reportID}).Decode(&report)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Report not found"})
			return
		}

		if report.SubmissionID == primitive.NilObjectID {
			c.JSON(http.StatusOK, gin.H{
				"ID":             report.ID.Hex(),
				"reason":         report.Reason,
				"status":         report.Status,
				"SuspectUname":   report.SuspectUname,
				"reporter_email": report.ReporterEmail,
				"submission":     nil,
			})
			return
		}

		var submission struct {
			Title    string `bson:"title" json:"title"`
			MediaURL string `bson:"media_url" json:"media_url"`
		}

		err = submissionCol.FindOne(
			ctx,
			bson.M{"_id": report.SubmissionID},
		).Decode(&submission)

		if err != nil {
			c.JSON(http.StatusOK, gin.H{
				"ID":             report.ID.Hex(),
				"reason":         report.Reason,
				"status":         report.Status,
				"SuspectUname":   report.SuspectUname,
				"reporter_email": report.ReporterEmail,
				"submission":     nil,
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"ID":             report.ID.Hex(),
			"reason":         report.Reason,
			"status":         report.Status,
			"SuspectUname":   report.SuspectUname,
			"reporter_email": report.ReporterEmail,
			"created_at":     report.CreatedAt,
			"submission": gin.H{
				"title":     submission.Title,
				"media_url": submission.MediaURL,
			},
		})
	}
}

func DeleteSubmission(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {


		postId := c.Param("id")
		postObjId, err := primitive.ObjectIDFromHex(postId)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post id"})
			return
		}

		
		ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
		defer cancel()

		submissionCol := database.OpenCollection("submissions", client)

		result, err := submissionCol.DeleteOne(ctx, bson.M{"_id": postObjId})
		
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete submission"})
			return
		}

		if result.DeletedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "No submission found with that ID"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Submission deleted successfully"})
	}
}

func ResolveReport(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		reportID, err := primitive.ObjectIDFromHex(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid report ID"})
			return
		}

		ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
		defer cancel()

		reportCol := database.OpenCollection("reports", client)

		update := bson.M{
			"$set": bson.M{
				"status": "resolved",
			},
		}

		result, err := reportCol.UpdateOne(ctx, bson.M{"_id": reportID}, update)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update"})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Report not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Report resolved"})
	}
}
