package routes

import (
	"fmt"
	"net/http"

	"github.com/OmarDardery/solve-the-x-backend/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ------------------ HELPERS ------------------

// Get user from context and type-assert, returns error response if fails
func getUser[T any](c *gin.Context) (*T, bool) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found in context"})
		return nil, false
	}
	u, ok := user.(*T)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user type in context"})
		return nil, false
	}
	return u, true
}

// Require role middleware helper
func requireRole(c *gin.Context, role string) bool {
	r, _ := c.Get("role")
	if r != role {
		c.JSON(http.StatusForbidden, gin.H{"error": fmt.Sprintf("only %s can perform this action", role)})
		return false
	}
	return true
}

// Bind JSON and handle errors
func bindJSON[T any](c *gin.Context) (*T, bool) {
	var input T
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return nil, false
	}
	return &input, true
}

// Convert param to uint
func uintFromParam(param string) uint {
	var id uint
	fmt.Sscanf(param, "%d", &id)
	return id
}

// ------------------ CRUD ROUTES ------------------

func RegisterCRUDRoutes(api *gin.RouterGroup, db *gorm.DB) {
	registerStudentRoutes(api.Group("/students"), db)
	registerProfessorRoutes(api.Group("/professors"), db)
	registerOrganizationRoutes(api.Group("/organizations"), db)
	registerEventRoutes(api.Group("/events"), db)
	registerOpportunityRoutes(api.Group("/opportunities"), db)
	registerApplicationRoutes(api.Group("/applications"), db)
	registerCoinRoutes(api.Group("/coins"), db)
	registerReportRoutes(api.Group("/reports"), db)
	registerNotificationRoutes(api.Group("/notifications"), db)
	registerTagRoutes(api.Group("/tags"), db)
}

// ------------------ STUDENTS ------------------

func registerStudentRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	rg.GET("/me", func(c *gin.Context) {
		if student, ok := getUser[models.Student](c); ok {
			c.JSON(http.StatusOK, student)
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get student"})
		}
	})

	rg.PUT("/me", func(c *gin.Context) {
		student, ok := getUser[models.Student](c)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get student"})
			return
		}

		updates, ok := bindJSON[map[string]interface{}](c)
		if !ok {
			return
		}

		updated, err := models.UpdateStudent(db, student.ID, *updates)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, updated)
	})

	rg.DELETE("/me", func(c *gin.Context) {
		student, ok := getUser[models.Student](c)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get student"})
			return
		}
		if err := models.DeleteStudent(db, student.ID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "student deleted"})
	})
}

// ------------------ PROFESSORS ------------------

func registerProfessorRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	rg.GET("/me", func(c *gin.Context) {
		if prof, ok := getUser[models.Professor](c); ok {
			c.JSON(http.StatusOK, prof)
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get professor"})
		}
	})

	rg.PUT("/me", func(c *gin.Context) {
		prof, ok := getUser[models.Professor](c)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get professor"})
			return
		}

		updates, ok := bindJSON[map[string]interface{}](c)
		if !ok {
			return
		}

		updated, err := models.UpdateProfessor(db, prof.ID, *updates)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, updated)
	})

	rg.DELETE("/me", func(c *gin.Context) {
		prof, ok := getUser[models.Professor](c)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get professor"})
			return
		}
		if err := models.DeleteProfessor(db, prof.ID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "professor deleted"})
	})
}

// ------------------ ORGANIZATIONS ------------------

func registerOrganizationRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	rg.GET("/me", func(c *gin.Context) {
		if org, ok := getUser[models.Organization](c); ok {
			c.JSON(http.StatusOK, org)
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get organization"})
		}
	})

	rg.PUT("/me", func(c *gin.Context) {
		org, ok := getUser[models.Organization](c)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get organization"})
			return
		}

		updates, ok := bindJSON[map[string]interface{}](c)
		if !ok {
			return
		}

		updated, err := models.UpdateOrganization(db, org.ID, *updates)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, updated)
	})

	rg.DELETE("/me", func(c *gin.Context) {
		org, ok := getUser[models.Organization](c)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get organization"})
			return
		}
		if err := models.DeleteOrganization(db, org.ID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "organization deleted"})
	})
}

// ------------------ EVENTS ------------------

func registerEventRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	// Get all events for the current organization
	rg.GET("/me", func(c *gin.Context) {
		if !requireRole(c, "organization") {
			return
		}
		org, ok := getUser[models.Organization](c)
		if !ok {
			return
		}
		events, err := models.GetEventsByOrganizationID(db, org.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, events)
	})

	// Get a specific event by ID
	rg.GET("/:id", func(c *gin.Context) {
		event, err := models.GetEventByID(db, uintFromParam(c.Param("id")))
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
			return
		}
		c.JSON(http.StatusOK, event)
	})

	// Create a new event (organization only)
	rg.POST("", func(c *gin.Context) {
		if !requireRole(c, "organization") {
			return
		}
		org, ok := getUser[models.Organization](c)
		if !ok {
			return
		}

		input, ok := bindJSON[struct {
			Title       string `json:"title" binding:"required"`
			Description string `json:"description"`
			Date        string `json:"date"`
			Link        string `json:"link"`
			SignUpLink  string `json:"sign_up_link"`
		}](c)
		if !ok {
			return
		}

		event := &models.Event{
			Title:          input.Title,
			Description:    input.Description,
			Date:           input.Date,
			Link:           input.Link,
			SignUpLink:     input.SignUpLink,
			OrganizationID: org.ID,
		}

		if err := models.CreateEvent(db, event); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, event)
	})

	// Update an event (organization only, must own the event)
	rg.PUT("/:id", func(c *gin.Context) {
		if !requireRole(c, "organization") {
			return
		}
		org, ok := getUser[models.Organization](c)
		if !ok {
			return
		}

		eventID := uintFromParam(c.Param("id"))
		event, err := models.GetEventByID(db, eventID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
			return
		}

		// Verify ownership
		if event.OrganizationID != org.ID {
			c.JSON(http.StatusForbidden, gin.H{"error": "you can only edit your own events"})
			return
		}

		input, ok := bindJSON[struct {
			Title       string `json:"title"`
			Description string `json:"description"`
			Date        string `json:"date"`
			Link        string `json:"link"`
			SignUpLink  string `json:"sign_up_link"`
		}](c)
		if !ok {
			return
		}

		// Update fields if provided
		if input.Title != "" {
			event.Title = input.Title
		}
		if input.Description != "" {
			event.Description = input.Description
		}
		if input.Date != "" {
			event.Date = input.Date
		}
		if input.Link != "" {
			event.Link = input.Link
		}
		if input.SignUpLink != "" {
			event.SignUpLink = input.SignUpLink
		}

		if err := models.UpdateEvent(db, event); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, event)
	})

	// Delete an event (organization only, must own the event)
	rg.DELETE("/:id", func(c *gin.Context) {
		if !requireRole(c, "organization") {
			return
		}
		org, ok := getUser[models.Organization](c)
		if !ok {
			return
		}

		eventID := uintFromParam(c.Param("id"))
		if err := models.DeleteEventByIDAndOrg(db, eventID, org.ID); err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "event not found or you don't have permission to delete it"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "event deleted"})
	})
}

// ------------------ OPPORTUNITIES ------------------

func registerOpportunityRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	// GET routes first to avoid conflicts
	rg.GET("/me", func(c *gin.Context) {
		if !requireRole(c, "professor") {
			return
		}
		prof, ok := getUser[models.Professor](c)
		if !ok {
			return
		}
		ops, err := models.GetOpportunitiesByProfessorID(db, prof.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, ops)
	})

	rg.GET("/:id", func(c *gin.Context) {
		op, err := models.GetOpportunityByID(db, uintFromParam(c.Param("id")))
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, op)
	})

	// POST route - use empty string to match without trailing slash
	rg.POST("", func(c *gin.Context) {
		if !requireRole(c, "professor") {
			return
		}
		prof, ok := getUser[models.Professor](c)
		if !ok {
			return
		}

		input, ok := bindJSON[struct {
			Name         string `json:"name" binding:"required"`
			Details      string `json:"details"`
			Requirements string `json:"requirements"`
			Reward       string `json:"reward"`
			Type         string `json:"type" binding:"required"`
			TagIDs       []uint `json:"tag_ids"`
		}](c)
		if !ok {
			return
		}

		opportunity, err := models.CreateOpportunity(db, prof.ID, input.Name, input.Details, input.Requirements, input.Reward, input.Type, input.TagIDs)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, opportunity)
	})

	// PUT / DELETE
	rg.PUT("/:id", updateOrDeleteOpportunity(db, "update"))
	rg.DELETE("/:id", updateOrDeleteOpportunity(db, "delete"))
}

func updateOrDeleteOpportunity(db *gorm.DB, action string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if !requireRole(c, "professor") {
			return
		}
		prof, ok := getUser[models.Professor](c)
		if !ok {
			return
		}
		id := uintFromParam(c.Param("id"))
		op, err := models.GetOpportunityByID(db, id)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		if op.ProfessorID != prof.ID {
			c.JSON(http.StatusForbidden, gin.H{"error": "cannot modify opportunities you don't own"})
			return
		}

		switch action {
		case "update":
			updates, ok := bindJSON[map[string]interface{}](c)
			if !ok {
				return
			}
			updated, err := models.UpdateOpportunity(db, id, *updates)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, updated)
		case "delete":
			if err := models.DeleteOpportunity(db, id); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, gin.H{"message": "opportunity deleted"})
		}
	}
}

// ------------------ APPLICATIONS ------------------

func registerApplicationRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	// POST - Student submits an application
	rg.POST("", func(c *gin.Context) {
		if !requireRole(c, "student") {
			return
		}
		student, ok := getUser[models.Student](c)
		if !ok {
			return
		}

		input, ok := bindJSON[struct {
			OpportunityID uint   `json:"opportunity_id" binding:"required"`
			Message       string `json:"message"`
			ResumeLink    string `json:"resume_link"`
		}](c)
		if !ok {
			return
		}

		// Check if opportunity exists
		_, err := models.GetOpportunityByID(db, input.OpportunityID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "opportunity not found"})
			return
		}

		// Create application with message and resume link
		if err := student.CreateApplication(db, input.OpportunityID, input.Message, input.ResumeLink); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"message": "application submitted successfully"})
	})

	// GET /me - Get applications (student: their apps, professor: apps for their opportunities)
	rg.GET("/me", func(c *gin.Context) {
		role, _ := c.Get("role")

		if role == "student" {
			student, ok := getUser[models.Student](c)
			if !ok {
				return
			}
			apps, err := models.GetApplicationsByStudentID(db, student.ID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, apps)
		} else if role == "professor" {
			prof, ok := getUser[models.Professor](c)
			if !ok {
				return
			}
			apps, err := models.GetApplicationsByProfessorOpportunities(db, prof.ID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, apps)
		} else {
			c.JSON(http.StatusForbidden, gin.H{"error": "only students and professors can access applications"})
		}
	})

	// PUT /:id/status - Professor updates application status
	rg.PUT("/:id/status", func(c *gin.Context) {
		if !requireRole(c, "professor") {
			return
		}
		prof, ok := getUser[models.Professor](c)
		if !ok {
			return
		}

		appID := uintFromParam(c.Param("id"))
		app, err := models.GetApplicationByID(db, appID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "application not found"})
			return
		}

		// Verify professor owns the opportunity
		if app.Opportunity.ProfessorID != prof.ID {
			c.JSON(http.StatusForbidden, gin.H{"error": "cannot modify applications for opportunities you don't own"})
			return
		}

		input, ok := bindJSON[struct {
			Status string `json:"status" binding:"required"`
		}](c)
		if !ok {
			return
		}

		updatedApp, err := models.UpdateApplicationStatus(db, appID, input.Status)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid status value"})
			return
		}

		c.JSON(http.StatusOK, updatedApp)
	})

	rg.GET("/opportunity/:id", func(c *gin.Context) {
		if !requireRole(c, "professor") {
			return
		}
		prof, ok := getUser[models.Professor](c)
		if !ok {
			return
		}
		op, err := models.GetOpportunityByID(db, uintFromParam(c.Param("id")))
		if err != nil || op.ProfessorID != prof.ID {
			c.JSON(http.StatusForbidden, gin.H{"error": "cannot view applications"})
			return
		}
		apps, err := models.GetApplicationsByOpportunityID(db, op.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, apps)
	})

	rg.DELETE("/", func(c *gin.Context) {
		if !requireRole(c, "student") {
			return
		}
		student, _ := getUser[models.Student](c)
		req, ok := bindJSON[struct {
			OpportunityID uint `json:"opportunity_id"`
		}](c)
		if !ok {
			return
		}

		if err := student.DeleteApplication(db, req.OpportunityID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "application deleted"})
	})
}

// ------------------ COINS ------------------

func registerCoinRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	rg.GET("/me", func(c *gin.Context) {
		if !requireRole(c, "student") {
			return
		}
		student, ok := getUser[models.Student](c)
		if !ok {
			return
		}
		coins, err := models.GetCoinsByStudentID(db, student.ID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, coins)
	})

	rg.PUT("/increment", func(c *gin.Context) {
		if !requireRole(c, "student") {
			return
		}
		student, ok := getUser[models.Student](c)
		if !ok {
			return
		}
		req, ok := bindJSON[struct {
			Amount int `json:"amount"`
		}](c)
		if !ok {
			return
		}

		if err := models.IncrementCoins(db, student.ID, req.Amount); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "coins incremented"})
	})
}

// ------------------ REPORTS ------------------

func registerReportRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	// POST - Create new report (student only)
	rg.POST("", func(c *gin.Context) {
		if !requireRole(c, "student") {
			return
		}
		student, ok := getUser[models.Student](c)
		if !ok {
			return
		}

		input, ok := bindJSON[struct {
			RecipientID uint   `json:"recipient_id" binding:"required"`
			DriveLink   string `json:"drive_link" binding:"required"`
		}](c)
		if !ok {
			return
		}

		report, err := models.CreateReport(db, student.ID, input.RecipientID, input.DriveLink)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, report)
	})

	// GET /me - Get reports (student: their reports, professor: reports to them)
	rg.GET("/me", func(c *gin.Context) {
		role, _ := c.Get("role")

		if role == "student" {
			student, ok := getUser[models.Student](c)
			if !ok {
				return
			}
			reports, err := models.GetReportsByStudentID(db, student.ID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, reports)
		} else if role == "professor" {
			prof, ok := getUser[models.Professor](c)
			if !ok {
				return
			}
			reports, err := models.GetReportsByRecipientID(db, prof.ID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, reports)
		} else {
			c.JSON(http.StatusForbidden, gin.H{"error": "only students and professors can access reports"})
		}
	})

	// GET /student/:id - Get reports by student (professor only)
	rg.GET("/student/:id", func(c *gin.Context) {
		if !requireRole(c, "professor") {
			return
		}
		studentID := uintFromParam(c.Param("id"))
		reports, err := models.GetReportsByStudentID(db, studentID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, reports)
	})

	// DELETE /:id - Delete report (student only, own reports)
	rg.DELETE("/:id", func(c *gin.Context) {
		if !requireRole(c, "student") {
			return
		}
		student, ok := getUser[models.Student](c)
		if !ok {
			return
		}
		reportID := uintFromParam(c.Param("id"))

		if err := models.DeleteReport(db, reportID, student.ID); err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "report deleted"})
	})
}

// ------------------ NOTIFICATIONS ------------------

func registerNotificationRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	// GET /me - Get my notifications
	rg.GET("/me", func(c *gin.Context) {
		role, _ := c.Get("role")
		var recipientID uint
		var recipientRole string

		if role == "student" {
			student, ok := getUser[models.Student](c)
			if !ok {
				return
			}
			recipientID = student.ID
			recipientRole = "student"
		} else if role == "professor" {
			prof, ok := getUser[models.Professor](c)
			if !ok {
				return
			}
			recipientID = prof.ID
			recipientRole = "professor"
		} else {
			c.JSON(http.StatusForbidden, gin.H{"error": "invalid role"})
			return
		}

		// Check for unread_only query param
		unreadOnly := c.Query("unread_only") == "true"

		notifications, err := models.GetNotificationsByRecipient(db, recipientID, recipientRole, unreadOnly)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, notifications)
	})

	// GET /me/count - Get unread notification count
	rg.GET("/me/count", func(c *gin.Context) {
		role, _ := c.Get("role")
		var recipientID uint
		var recipientRole string

		if role == "student" {
			student, ok := getUser[models.Student](c)
			if !ok {
				return
			}
			recipientID = student.ID
			recipientRole = "student"
		} else if role == "professor" {
			prof, ok := getUser[models.Professor](c)
			if !ok {
				return
			}
			recipientID = prof.ID
			recipientRole = "professor"
		} else {
			c.JSON(http.StatusForbidden, gin.H{"error": "invalid role"})
			return
		}

		count, err := models.GetUnreadNotificationCount(db, recipientID, recipientRole)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"count": count})
	})

	// PUT /:id/read - Mark notification as read
	rg.PUT("/:id/read", func(c *gin.Context) {
		role, _ := c.Get("role")
		var recipientID uint

		if role == "student" {
			student, ok := getUser[models.Student](c)
			if !ok {
				return
			}
			recipientID = student.ID
		} else if role == "professor" {
			prof, ok := getUser[models.Professor](c)
			if !ok {
				return
			}
			recipientID = prof.ID
		} else {
			c.JSON(http.StatusForbidden, gin.H{"error": "invalid role"})
			return
		}

		notificationID := uintFromParam(c.Param("id"))
		if err := models.MarkNotificationAsRead(db, notificationID, recipientID); err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "notification marked as read"})
	})

	// PUT /read-all - Mark all notifications as read
	rg.PUT("/read-all", func(c *gin.Context) {
		role, _ := c.Get("role")
		var recipientID uint
		var recipientRole string

		if role == "student" {
			student, ok := getUser[models.Student](c)
			if !ok {
				return
			}
			recipientID = student.ID
			recipientRole = "student"
		} else if role == "professor" {
			prof, ok := getUser[models.Professor](c)
			if !ok {
				return
			}
			recipientID = prof.ID
			recipientRole = "professor"
		} else {
			c.JSON(http.StatusForbidden, gin.H{"error": "invalid role"})
			return
		}

		if err := models.MarkAllNotificationsAsRead(db, recipientID, recipientRole); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "all notifications marked as read"})
	})

	// DELETE /:id - Delete notification
	rg.DELETE("/:id", func(c *gin.Context) {
		role, _ := c.Get("role")
		var recipientID uint

		if role == "student" {
			student, ok := getUser[models.Student](c)
			if !ok {
				return
			}
			recipientID = student.ID
		} else if role == "professor" {
			prof, ok := getUser[models.Professor](c)
			if !ok {
				return
			}
			recipientID = prof.ID
		} else {
			c.JSON(http.StatusForbidden, gin.H{"error": "invalid role"})
			return
		}

		notificationID := uintFromParam(c.Param("id"))
		if err := models.DeleteNotification(db, notificationID, recipientID); err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "notification deleted"})
	})
}

// ------------------ TAGS ------------------

func registerTagRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	// POST - Create new tag (professor only)
	rg.POST("", func(c *gin.Context) {
		if !requireRole(c, "professor") {
			return
		}

		input, ok := bindJSON[struct {
			Name        string `json:"name" binding:"required"`
			Description string `json:"description"`
		}](c)
		if !ok {
			return
		}

		tag, err := models.CreateTag(db, input.Name, input.Description)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, tag)
	})

	// GET /:id - Get tag by ID
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
