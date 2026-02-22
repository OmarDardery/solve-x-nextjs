package routes

import (
	"fmt"
	"math/rand"
	"net/http"

	"github.com/OmarDardery/solve-the-x-backend/config"
	"github.com/OmarDardery/solve-the-x-backend/mail_service"
	"github.com/OmarDardery/solve-the-x-backend/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type SignUpInput struct {
	Code      int    `json:"code" binding:"required"`
	FirstName string `json:"first_name" binding:"required"`
	LastName  string `json:"last_name" binding:"required"`
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=8"`
}

// OrganizationSignUpInput has different fields for organizations
type OrganizationSignUpInput struct {
	Code     int    `json:"code" binding:"required"`
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Contact  string `json:"contact"`
	Link     string `json:"link"`
}

type SignInInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

// SendCodeHandler sends a verification code to the provided email
// For signup, it checks if the email is already registered
// For other purposes (e.g., password reset), it skips the availability check
func SendCodeHandler(db *gorm.DB, codes *map[string]int, mailman *mail_service.Mailman) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var input struct {
			Email   string `json:"email" binding:"required,email"`
			Role    string `json:"role" binding:"required"`
			Purpose string `json:"purpose"` // "signup" or "reset" - defaults to "signup" if empty
		}
		if err := ctx.ShouldBindJSON(&input); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Default purpose is signup
		if input.Purpose == "" {
			input.Purpose = "signup"
		}

		// Validate email domain based on role (always validate domain)
		switch input.Role {
		case "student":
			if !config.IsValidStudentDomain(input.Email) {
				ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email domain for student. Use a valid student email."})
				return
			}
			// Only check email availability for signup
			if input.Purpose == "signup" && models.StudentEmailExists(db, input.Email) {
				ctx.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
				return
			}
		case "professor":
			if !config.IsValidProfessorDomain(input.Email) {
				ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email domain for professor. Use a valid faculty email."})
				return
			}
			// Only check email availability for signup
			if input.Purpose == "signup" && models.ProfessorEmailExists(db, input.Email) {
				ctx.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
				return
			}
		case "organization":
			// Organizations can use any domain
			// Only check email availability for signup
			if input.Purpose == "signup" && models.OrganizationEmailExists(db, input.Email) {
				ctx.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
				return
			}
		default:
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role"})
			return
		}

		(*codes)[input.Email] = rand.Intn(900000) + 100000 // ensures value is between 100000–999999

		err := mailman.SendVerificationEmail(input.Email, fmt.Sprintf("%06d", (*codes)[input.Email]))
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		ctx.JSON(http.StatusOK, gin.H{
			"message": "Verification code sent successfully",
		})
	}
}

// SignUpHandler handles user registration for students, professors, and organizations
func SignUpHandler(db *gorm.DB, codes *map[string]int, mailman *mail_service.Mailman) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		role := ctx.Param("role")

		var err error

		// Handle organization separately due to different input structure
		if role == "organization" {
			var input OrganizationSignUpInput
			if err := ctx.ShouldBindJSON(&input); err != nil {
				ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}

			if code, exists := (*codes)[input.Email]; !exists || code != input.Code {
				ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or missing verification code"})
				return
			}

			err = models.CreateOrganization(db, input.Name, input.Email, input.Password, input.Contact, input.Link)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			// Get the created organization and generate JWT
			org, authErr := models.AuthenticateOrganization(db, input.Email, input.Password)
			if authErr != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Account created but failed to authenticate"})
				return
			}
			token, tokenErr := org.GetJWT()
			if tokenErr != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Account created but failed to generate token"})
				return
			}

			ctx.JSON(http.StatusOK, gin.H{
				"message": "organization registered successfully",
				"token":   token,
				"role":    "organization",
			})
			return
		}

		// Handle student and professor
		var input SignUpInput
		if err := ctx.ShouldBindJSON(&input); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if code, exists := (*codes)[input.Email]; !exists || code != input.Code {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or missing verification code"})
			return
		}

		// Validate email domain based on role
		var token string
		switch role {
		case "student":
			if !config.IsValidStudentDomain(input.Email) {
				ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email domain for student"})
				return
			}
			err = models.CreateStudent(db, input.FirstName, input.LastName, input.Email, input.Password)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			// Authenticate to get JWT
			student, authErr := models.AuthenticateStudent(db, input.Email, input.Password)
			if authErr != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Account created but failed to authenticate"})
				return
			}
			token, err = student.GetJWT()
		case "professor":
			if !config.IsValidProfessorDomain(input.Email) {
				ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email domain for professor"})
				return
			}
			err = models.CreateProfessor(db, input.FirstName, input.LastName, input.Email, input.Password)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			// Authenticate to get JWT
			professor, authErr := models.AuthenticateProfessor(db, input.Email, input.Password)
			if authErr != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Account created but failed to authenticate"})
				return
			}
			token, err = professor.GetJWT()
		default:
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role"})
			return
		}

		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Account created but failed to generate token"})
			return
		}

		ctx.JSON(http.StatusOK, gin.H{
			"message": role + " registered successfully",
			"token":   token,
			"role":    role,
		})
	}
}

// SignInHandler authenticates a student or professor and returns a JWT.
func SignInHandler(db *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		role := ctx.Param("role")

		var input SignInInput
		if err := ctx.ShouldBindJSON(&input); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var (
			token string
			err   error
		)

		// Validate email domain based on role
		switch role {
		case "student":
			if !config.IsValidStudentDomain(input.Email) {
				ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email domain for student"})
				return
			}
			user, authErr := models.AuthenticateStudent(db, input.Email, input.Password)
			if authErr != nil {
				ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
				return
			}
			token, err = user.GetJWT()
		case "professor":
			if !config.IsValidProfessorDomain(input.Email) {
				ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email domain for professor"})
				return
			}
			user, authErr := models.AuthenticateProfessor(db, input.Email, input.Password)
			if authErr != nil {
				ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
				return
			}
			token, err = user.GetJWT()
		case "organization":
			user, authErr := models.AuthenticateOrganization(db, input.Email, input.Password)
			if authErr != nil {
				ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
				return
			}
			token, err = user.GetJWT()
		default:
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role"})
			return
		}

		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
			return
		}

		ctx.JSON(http.StatusOK, gin.H{
			"token": token,
			"role":  role,
		})
	}
}
