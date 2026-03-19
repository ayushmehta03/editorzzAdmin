package routes

import (
	"github.com/ayushmehta03/editorzzAdmin/internal/controllers"
	"github.com/ayushmehta03/editorzzAdmin/internal/middleware"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func UserRoutes(router *gin.Engine, client *mongo.Client) {

	admin := router.Group("/api/admin")
	admin.Use(middleware.AuthMiddleWare())
	admin.Use(middleware.AdminOnly())

	// 🔹 Users
	admin.GET("/users", controllers.GetAllUsers(client))
	admin.GET("/users/search", controllers.SearchUsersByUsername(client))
	admin.PATCH("/users/:id/ban", controllers.UpdateUserBan(client))
	admin.PATCH("/users/:id/hiring", controllers.UpdateHiringStatus(client))

	// 🔹 Dashboard
	admin.GET("/dashboard", controllers.GetStats(client))

	// 🔹 Reports
	admin.GET("/reports", controllers.GetReports(client))
	admin.GET("/reports/:id", controllers.GetReportByID(client))          // ✅ NEW
	admin.PATCH("/reports/:id/resolve", controllers.ResolveReport(client)) // ✅ NEW

	// 🔹 Submissions
	admin.GET("/submission/:id", controllers.GetSubmissionByID(client))
	admin.DELETE("/submission/:id", controllers.DeleteSubmission(client))
}