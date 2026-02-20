package routes

import (
	"github.com/ayushmehta03/editorzzAdmin/internal/controllers"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func JudgeRoutes(router *gin.Engine, client *mongo.Client) {
	
	judgeGroup := router.Group("/judge/:judge_slug")
	{
		
		judgeGroup.GET("/access", controllers.JudgeAccess(client))

		judgeGroup.GET("/submissions", controllers.GetJudgeSubmissions(client))

		judgeGroup.POST("/submit-scores", controllers.SubmitJudgeScores(client))
	}
}
