package models

import (
	"errors"
	"time"

	jwt_service "github.com/OmarDardery/solve-the-x-backend/jwt_service"
	mail_service "github.com/OmarDardery/solve-the-x-backend/mail_service"
	"gorm.io/gorm"
)

type Organization struct {
	gorm.Model
	Name                string    `json:"name"`
	Email               string    `json:"email" gorm:"unique"`
	Password            string    `json:"-"`       // Hide password in JSON responses
	Contact             string    `json:"contact"` // Phone, email, or other contact info
	Link                string    `json:"link"`    // Website, LinkedIn, Instagram, etc.
	LastChangedPassword time.Time `json:"last_changed_password"`
}

// Generate JWT for the organization
func (o *Organization) GetJWT() (string, error) {
	return jwt_service.GenerateJWT(o.ID, o.Email, "organization")
}

// AuthenticateOrganization checks credentials and returns the organization if valid
func AuthenticateOrganization(db *gorm.DB, email, password string) (*Organization, error) {
	var organization Organization

	// Find by email
	if err := db.Where("email = ?", email).First(&organization).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("organization not found")
		}
		return nil, err
	}

	// Check password hash
	if !CheckPasswordHash(password, organization.Password) {
		return nil, errors.New("invalid credentials")
	}

	return &organization, nil
}

// CreateOrganization registers a new organization with hashed password
func CreateOrganization(db *gorm.DB, name, email, password, contact, link string) error {
	var existing Organization
	if err := db.Where("email = ?", email).First(&existing).Error; err == nil {
		return errors.New("email already registered")
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	passwordHash, err := HashPassword(password)
	if err != nil {
		return err
	}

	organization := &Organization{
		Name:                name,
		Email:               email,
		Password:            passwordHash,
		Contact:             contact,
		Link:                link,
		LastChangedPassword: time.Now(),
	}

	return db.Create(organization).Error
}

func (o Organization) Notify(mailman *mail_service.Mailman, subject, content string) error {
	if mailman == nil {
		return mail_service.SendNotification(o.Email, subject, content)
	}
	return mailman.SendNotification(o.Email, subject, content)
}

// GetOrganizationByID retrieves an organization by ID
func GetOrganizationByID(db *gorm.DB, id uint) (*Organization, error) {
	var organization Organization
	if err := db.First(&organization, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("organization not found")
		}
		return nil, err
	}
	return &organization, nil
}

// GetOrganizationByEmail retrieves an organization by email
func GetOrganizationByEmail(db *gorm.DB, email string) (*Organization, error) {
	var organization Organization
	if err := db.Where("email = ?", email).First(&organization).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("organization not found")
		}
		return nil, err
	}
	return &organization, nil
}

// UpdateOrganization updates an organization's fields
func UpdateOrganization(db *gorm.DB, id uint, updates map[string]interface{}) (*Organization, error) {
	organization, err := GetOrganizationByID(db, id)
	if err != nil {
		return nil, err
	}

	updates["updated_at"] = time.Now()

	if err := db.Model(organization).Updates(updates).Error; err != nil {
		return nil, err
	}

	return organization, nil
}

// DeleteOrganization deletes an organization by ID
func DeleteOrganization(db *gorm.DB, id uint) error {
	return db.Delete(&Organization{}, id).Error
}

// OrganizationEmailExists checks if an organization with the given email exists
func OrganizationEmailExists(db *gorm.DB, email string) bool {
	var organization Organization
	err := db.Where("email = ?", email).First(&organization).Error
	return err == nil
}
