package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/ayushmehta03/editorzzAdmin/internal/database"
	"github.com/ayushmehta03/editorzzAdmin/internal/routes"
	"github.com/gin-contrib/cors" 
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {

	if os.Getenv("ENV") != "production" {
		if err := godotenv.Load(); err != nil {
			log.Println("warning: .env file is missing in the system env")
		}
	}

	router := gin.Default()

	// 2. Add CORS Middleware here
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:4000", "http://localhost:3000"}, // Allow your frontend ports
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	client := database.ConnectMongo()

	defer func() {
		if err := client.Disconnect(context.Background()); err != nil {
			log.Printf("Mongo disconnect error: %v", err)
		}
	}()


	// Routes must come AFTER the CORS middleware
	routes.AuthRoutes(router, client)
	routes.ProtectedRoutes(router, client)
	routes.UserRoutes(router, client)
	routes.JudgeRoutes(router, client)

	port := os.Getenv("PORT")
	if port == "" {
		port = "1001"
	}

	log.Printf("Server started on port %s", port)

	if err := router.Run(":" + port); err != nil {
		fmt.Println("Failed to start server:", err)
	}
}