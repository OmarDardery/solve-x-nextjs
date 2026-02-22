package main

import (
	"log"
	"os"

	"github.com/OmarDardery/solve-the-x-backend/database"
	"github.com/OmarDardery/solve-the-x-backend/mail_service"
	"github.com/OmarDardery/solve-the-x-backend/middleware"
	"github.com/OmarDardery/solve-the-x-backend/models"
	"github.com/OmarDardery/solve-the-x-backend/routes"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, continuing...")
	}

	// Initialize database
	db, closer := database.NewDatabase()
	defer closer()

	// Auto-migrate models
	if err := db.AutoMigrate(
		&models.Professor{},
		&models.Tag{},
		&models.Student{},
		&models.Coins{},
		&models.Opportunity{},
		&models.Application{},
		&models.WeeklyReport{},
		&models.Notification{},
		&models.Organization{},
		&models.Event{},
	); err != nil {
		panic("failed to migrate database")
	}

	// Initialize mail service
	mailman := mail_service.NewMailman()

	// Initialize Gin router
	server := gin.Default()

	// Disable trailing slash redirect to avoid CORS issues
	server.RedirectTrailingSlash = false
	server.RedirectFixedPath = false

	// Configure CORS - must be before routes
	server.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://127.0.0.1:3000", "https://solvex.dardery.work", "https://www.solvex-eui.org"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Custom 404 handler to return JSON instead of plain text
	server.NoRoute(func(c *gin.Context) {
		c.JSON(404, gin.H{"error": "route not found"})
	})

	// verification code map
	verificationCodes := make(map[string]int)
	// Public routes
	server.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong"})
	})

	server.GET("/", func(c *gin.Context) {
		// Path to your PDF file
		filePath := "./doc.pdf"

		// Set headers
		c.Header("Content-Type", "application/pdf")
		c.Header("Content-Disposition", "inline; filename=example.pdf")
		c.File(filePath)
	})
	auth := server.Group("/auth")
	auth.POST("/sign-up/:role", routes.SignUpHandler(db, &verificationCodes, mailman))
	auth.POST("/sign-in/:role", routes.SignInHandler(db))
	auth.POST("/send-code", routes.SendCodeHandler(db, &verificationCodes, mailman))

	// Public routes (no authentication required)
	public := server.Group("/public")
	routes.RegisterPublicRoutes(public, db)

	// Protected routes
	protected := server.Group("/api")
	protected.Use(middleware.JWTMiddleware(db))

	// Get user profile - protected route
	protected.GET("/profile", func(c *gin.Context) {
		role, _ := c.Get("role")
		user, _ := c.Get("user")

		// Return both role and user for frontend
		c.JSON(200, gin.H{
			"role": role,
			"user": user,
		})
	})
	routes.RegisterCRUDRoutes(protected, db)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	// Run server
	if err := server.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
