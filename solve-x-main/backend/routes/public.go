package routes

import (
	"net/http"

	"github.com/OmarDardery/solve-the-x-backend/config"
	"github.com/OmarDardery/solve-the-x-backend/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// RegisterPublicRoutes registers all public (non-authenticated) routes
func RegisterPublicRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	registerPublicOpportunityRoutes(rg.Group("/opportunities"), db)
	registerPublicTagRoutes(rg.Group("/tags"), db)
	registerPublicEventRoutes(rg.Group("/events"), db)
	registerPublicOrganizationRoutes(rg.Group("/organizations"), db)
	registerDomainConfigRoutes(rg.Group("/config"))
}

// ------------------ DOMAIN CONFIG ------------------

func registerDomainConfigRoutes(rg *gin.RouterGroup) {
	rg.GET("/domains", func(c *gin.Context) {
		domainConfig := config.GetDomainConfig()
		c.JSON(http.StatusOK, gin.H{
			"student_domains":   domainConfig.StudentDomains,
			"professor_domains": domainConfig.ProfessorDomains,
		})
	})
}

// ------------------ PUBLIC OPPORTUNITIES ------------------

func registerPublicOpportunityRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	// Get all opportunities (public endpoint for browsing)
	rg.GET("", func(c *gin.Context) {
		opportunities, err := models.GetAllOpportunities(db)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, opportunities)
	})

	// Also handle with trailing slash for compatibility
	rg.GET("/", func(c *gin.Context) {
		opportunities, err := models.GetAllOpportunities(db)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, opportunities)
	})

	// Get specific opportunity by ID (public)
	rg.GET("/:id", func(c *gin.Context) {
		id := uintFromParam(c.Param("id"))
		opportunity, err := models.GetOpportunityByID(db, id)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, opportunity)
	})
}

// ------------------ PUBLIC TAGS ------------------

func registerPublicTagRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	// Get all tags (public endpoint for browsing)
	rg.GET("", func(c *gin.Context) {
		tags, err := models.GetAllTags(db)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, tags)
	})

	// Also handle with trailing slash for compatibility
	rg.GET("/", func(c *gin.Context) {
		tags, err := models.GetAllTags(db)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, tags)
	})

	// Get specific tag by ID (public)
	rg.GET("/:id", func(c *gin.Context) {
		id := uintFromParam(c.Param("id"))
		tag, err := models.GetTagByID(db, id)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, tag)
	})
}

// ------------------ PUBLIC EVENTS ------------------

func registerPublicEventRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	// Get all events (public endpoint for browsing)
	rg.GET("", func(c *gin.Context) {
		events, err := models.GetAllEvents(db)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, events)
	})

	// Also handle with trailing slash for compatibility
	rg.GET("/", func(c *gin.Context) {
		events, err := models.GetAllEvents(db)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, events)
	})

	// Get specific event by ID (public)
	rg.GET("/:id", func(c *gin.Context) {
		id := uintFromParam(c.Param("id"))
		event, err := models.GetEventByID(db, id)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, event)
	})
}

// ------------------ PUBLIC ORGANIZATIONS ------------------

func registerPublicOrganizationRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	// Get organization by ID (public)
	rg.GET("/:id", func(c *gin.Context) {
		id := uintFromParam(c.Param("id"))
		org, err := models.GetOrganizationByID(db, id)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "organization not found"})
			return
		}
		// Return organization without sensitive data (password is already hidden via json:"-")
		c.JSON(http.StatusOK, org)
	})

	// Get events by organization ID (public)
	rg.GET("/:id/events", func(c *gin.Context) {
		id := uintFromParam(c.Param("id"))
		events, err := models.GetEventsByOrganizationID(db, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, events)
	})
}
