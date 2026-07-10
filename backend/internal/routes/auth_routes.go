package routes

import (
	"github.com/ayushmehta03/editorzzAdmin/internal/controllers"
	"github.com/ayushmehta03/editorzzAdmin/internal/middleware"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)
func AuthRoutes(router *gin.Engine,client *mongo.Client){
auth:=	router.Group("/api/auth")

auth.POST("/login",controllers.Login(client))
auth.GET("/me",middleware.AuthMiddleWare(),controllers.GetMe)

}