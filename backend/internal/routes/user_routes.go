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

	admin.GET("/users", controllers.GetAllUsers(client))
	admin.GET("/users/search", controllers.SearchUsersByUsername(client))
	admin.PATCH("/users/:id/ban", controllers.UpdateUserBan(client))
	admin.PATCH("/users/:id/hiring", controllers.UpdateHiringStatus(client))

	admin.GET("/dashboard", controllers.GetStats(client))

	admin.GET("/reports", controllers.GetReports(client))
	admin.GET("/reports/:id", controllers.GetReportByID(client))          
	admin.PATCH("/reports/:id/resolve", controllers.ResolveReport(client)) 

	admin.POST("/create-feature-post",controllers.CreateFeaturePost(client))
	admin.POST("/fetch-current-featurep",controllers.GetLiveFeaturePost(client))
	

	admin.DELETE("/submission/:id", controllers.DeleteSubmission(client))
	
}