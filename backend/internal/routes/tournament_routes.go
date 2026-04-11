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
	protected.PUT("/update-tournament/:id",controllers.UpdateTournament(client))
	protected.GET("/review/:id",controllers.GetAdminReview(client))
	protected.PUT("approve/:id",controllers.AdminApproveTournament(client))
	protected.GET("active-tournaments",controllers.GetActiveTournament(client))
	protected.GET("upcoming-tournaments",controllers.GetUpcomingTournaments(client))
	protected.GET("completed-tournaments",controllers.GetCompletedTournaments(client))
	protected.PATCH("/update-votetime/:id",controllers.UpdateVotingTime(client))
	protected.POST("/create-vote-contest", controllers.CreateVoteContestHandler(client))
	protected.GET("/get-approveTournament",controllers.GetJudgedTournamnet(client))
	protected.GET("/leaderboard/:id",controllers.GetLeaderboard(client))

}