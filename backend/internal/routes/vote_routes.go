package routes

import (
	"github.com/ayushmehta03/editorzzAdmin/internal/controllers"
	"github.com/ayushmehta03/editorzzAdmin/internal/middleware"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func VoteRoutes(router *gin.Engine, client *mongo.Client) {

	voteR := router.Group("/api/admin/vote")
	{
		voteR.Use(middleware.AuthMiddleWare())
		voteR.Use(middleware.AdminOnly())

		voteR.POST("/calculate/:id", controllers.CalculateVoteScores(client))

		voteR.POST("/publish/:id", controllers.AdminPublishVoteLeaderboard(client))

		voteR.GET("/leaderboard/:id", controllers.GetVoteLeaderboard(client))

		voteR.GET("/tournaments", controllers.GetAllVoteTournaments(client))
		voteR.GET("/total-votes/:id", controllers.GetTotalVotes(client))
	}
}