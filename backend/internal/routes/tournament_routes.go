package routes

import (
	"github.com/ayushmehta03/editorzzAdmin/internal/controllers"
	"github.com/ayushmehta03/editorzzAdmin/internal/middleware"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func ProtectedRoutes(router *gin.Engine,client *mongo.Client){

	protected:=router.Group("/api/admin")

	protected.Use(middleware.AuthMiddleWare())
	protected.Use(middleware.AdminOnly())


	protected.POST("/createtournament",controllers.CreateTournament(client))
	
}