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


     voteR.GET("/submissions/:id", controllers.GetSubmissionsWithVotes(client))
    
      voteR.POST("/submissions/score/:submission_id", controllers.UpdateSubmissionPoints(client))	
		voteR.GET("/leaderboard/:id", controllers.GetVoteLeaderboard(client))

		voteR.GET("/tournaments", controllers.GetAllVoteTournaments(client))
		voteR.GET("/total-votes/:id", controllers.GetTotalVotes(client))
	}
}