package routes

import (
	"github.com/ayushmehta03/editorzzAdmin/internal/controllers"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func JudgeRoutes(router *gin.Engine, client *mongo.Client) {

	judge := router.Group("/judge")
	{
		judge.GET("/:slug", controllers.JudgeAccess(client))

		judge.GET("/:slug/submissions", controllers.GetJudgeSubmissions(client))

		judge.POST("/save-scores", controllers.SaveJudgeScores(client))

		judge.POST("/:slug/final-submit", controllers.SubmitFinalScores(client))

        judge.POST("/submissions/reject", controllers.JudgeRejectSubmission(client))
	}
}