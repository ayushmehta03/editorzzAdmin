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
}