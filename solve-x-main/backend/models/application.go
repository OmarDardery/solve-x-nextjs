package models

import "gorm.io/gorm"

type Application struct {
	gorm.Model
	StudentID     uint         `json:"student_id" gorm:"not null"`
	Student       *Student     `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:StudentID;references:ID"`
	OpportunityID uint         `json:"opportunity_id" gorm:"not null"`
	Opportunity   *Opportunity `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:OpportunityID;references:ID"`
	Message       string       `json:"message" gorm:"type:text"`
	ResumeLink    string       `json:"resume_link"`
	Status        string       `json:"status" gorm:"type:TEXT CHECK(status IN ('pending','accepted','rejected'));not null;default:'pending'"`
}

const (
	StatusPending  = "pending"
	StatusAccepted = "accepted"
	StatusRejected = "rejected"
)

func (s Student) CreateApplication(db *gorm.DB, opportunityID uint, message, resumeLink string) error {
	application := Application{
		StudentID:     s.ID,
		OpportunityID: opportunityID,
		Message:       message,
		ResumeLink:    resumeLink,
		Status:        StatusPending,
	}
	return db.Create(&application).Error
}

func (s Student) DeleteApplication(db *gorm.DB, opportunityID uint) error {
	return db.
		Where("student_id = ? AND opportunity_id = ?", s.ID, opportunityID).
		Delete(&Application{}).
		Error
}

func GetApplicationsByOpportunityID(db *gorm.DB, opportunityID uint) ([]Application, error) {
	var applications []Application
	err := db.
		Preload("Student").
		Preload("Opportunity").
		Where("opportunity_id = ?", opportunityID).
		Find(&applications).
		Error
	return applications, err
}

// GetApplicationsByStudentID returns all applications submitted by a student
func GetApplicationsByStudentID(db *gorm.DB, studentID uint) ([]Application, error) {
	var applications []Application
	err := db.
		Preload("Student").
		Preload("Opportunity").
		Preload("Opportunity.Professor").
		Where("student_id = ?", studentID).
		Order("created_at DESC").
		Find(&applications).
		Error
	return applications, err
}

// GetApplicationsByProfessorOpportunities returns all applications for opportunities created by a professor
func GetApplicationsByProfessorOpportunities(db *gorm.DB, professorID uint) ([]Application, error) {
	var applications []Application
	err := db.
		Preload("Student").
		Preload("Opportunity").
		Preload("Opportunity.Professor").
		Joins("JOIN opportunities ON opportunities.id = applications.opportunity_id").
		Where("opportunities.professor_id = ?", professorID).
		Order("applications.created_at DESC").
		Find(&applications).
		Error
	return applications, err
}

// GetApplicationByID returns an application by ID
func GetApplicationByID(db *gorm.DB, id uint) (*Application, error) {
	var application Application
	err := db.
		Preload("Student").
		Preload("Opportunity").
		Preload("Opportunity.Professor").
		First(&application, id).
		Error
	return &application, err
}

// UpdateApplicationStatus updates the status of an application and notifies the student
func UpdateApplicationStatus(db *gorm.DB, id uint, status string) (*Application, error) {
	// Validate status
	if status != StatusPending && status != StatusAccepted && status != StatusRejected {
		return nil, gorm.ErrInvalidValue
	}

	application, err := GetApplicationByID(db, id)
	if err != nil {
		return nil, err
	}

	oldStatus := application.Status
	application.Status = status
	if err := db.Save(application).Error; err != nil {
		return nil, err
	}

	// Notify student if status changed to accepted or rejected
	if oldStatus != status && (status == StatusAccepted || status == StatusRejected) {
		opportunityName := "this opportunity"
		if application.Opportunity != nil {
			opportunityName = application.Opportunity.Name
		}
		NotifyApplicationStatusChange(db, application.StudentID, opportunityName, status)
	}

	return application, nil
}
