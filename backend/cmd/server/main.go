package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/ayushmehta03/editorzzAdmin/internal/database"
	"github.com/ayushmehta03/editorzzAdmin/internal/routes"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)


func main(){
	

	if os.Getenv("ENV")!="production"{
		if err:=godotenv.Load();err!=nil{
			log.Println("warning: .env file is missing in the system env")

		}
	}

	// create the router with the help of gin 
	router:=gin.Default()


	// connect to the database
	client:=database.ConnectMongo()



	// while closing of application we must disconnect from database to improve runtime

	// defer points to the last func inside a func 

	
	defer func(){
		if err:=client.Disconnect(context.Background());err!=nil{
			log.Printf("Mongo disconnect error: %v",err)
		}
	}()


	routes.AuthRoutes(router,client)

		port:=os.Getenv("PORT")

	if port==""{
		port="1001"
	}

	log.Printf("Server started on port %s",port)
	
	if err:=router.Run(":"+port);err!=nil{
		fmt.Println("Failed to start server:",err)
	}





}