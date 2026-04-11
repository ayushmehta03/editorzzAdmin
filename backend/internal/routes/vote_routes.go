package routes

import (
	"github.com/ayushmehta03/editorzzAdmin/internal/middleware"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func VoteRoutes(router *gin.Engine,client*mongo.Client){

	voteR:=router.Group("/api/admin/voteC")

	voteR.Use(middleware.AuthMiddleWare())
	voteR.Use(middleware.AdminOnly())

	

 
}