package database

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func ConnectMongo()*mongo.Client{


	mongoURI:=os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		log.Fatal("MONGODB_URI not set")
	}

	// Create client options for database
	clientOptions := options.Client().
		ApplyURI(mongoURI).
		SetConnectTimeout(10 * time.Second)

	// Create context for connection to manage  time errors
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Connect to MongoDB with client options and context
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal("Mongo connection failed:", err)
	}

	// Ping MongoDB to verify connection for network check and stability
	if err := client.Ping(ctx, nil); err != nil {
		log.Fatal("Mongo ping failed:", err)
	}

	log.Println("MongoDB connected successfully")


	// return the client once everything is done
	return client

}

func OpenCollection(name string,client *mongo.Client)*mongo.Collection{
	dbName := os.Getenv("DATABASE_NAME")
	if dbName == "" {
		log.Fatal("DATABASE_NAME not set")
	}

	return client.Database(dbName).Collection(name)
}


