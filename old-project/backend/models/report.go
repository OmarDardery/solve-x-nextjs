package models

import (
	"errors"
	"fmt"

	"gorm.io/gorm"
)

// WeeklyReport represents a student's weekly progress report (simplified - just a link)
type WeeklyReport struct {
	gorm.Model
	StudentID   uint     `json:"student_id" gorm:"not null"`
	Student     *Student `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:StudentID;references:ID"`
	RecipientID uint     `json:"recipient_id" gorm:"not null"`
	DriveLink   string   `json:"drive_link" gorm:"not null"`
}

// CreateReport creates a new weekly report and notifies the professor
func CreateReport(db *gorm.DB, studentID, recipientID uint, driveLink string) (*WeeklyReport, error) {
	// Validate recipient exists
	var prof Professor
	if err := db.First(&prof, recipientID).Error; err != nil {
		return nil, errors.New("professor not found")
	}

	// Get student info for notification
	var student Student
	if err := db.First(&student, studentID).Error; err != nil {
		return nil, errors.New("student not found")
	}

	report := &WeeklyReport{
		StudentID:   studentID,
		RecipientID: recipientID,
		DriveLink:   driveLink,
	}

	if err := db.Create(report).Error; err != nil {
		return nil, err
	}

	// Preload relationships
	db.Preload("Student").First(report, report.ID)

	// Notify professor about new report
	studentName := fmt.Sprintf("%s %s", student.FirstName, student.LastName)
	NotifyNewReport(db, recipientID, studentName)

	return report, nil
}

// GetReportsByStudentID returns all reports submitted by a student
func GetReportsByStudentID(db *gorm.DB, studentID uint) ([]WeeklyReport, error) {
	var reports []WeeklyReport
	err := db.
		Preload("Student").
		Where("student_id = ?", studentID).
		Order("created_at DESC").
		Find(&reports).
		Error
	return reports, err
}

// GetReportsByRecipientID returns all reports sent to a specific professor
func GetReportsByRecipientID(db *gorm.DB, recipientID uint) ([]WeeklyReport, error) {
	var reports []WeeklyReport
	err := db.
		Preload("Student").
		Where("recipient_id = ?", recipientID).
		Order("created_at DESC").
		Find(&reports).
		Error
	return reports, err
}

// GetReportByID retrieves a report by ID
func GetReportByID(db *gorm.DB, id uint) (*WeeklyReport, error) {
	var report WeeklyReport
	err := db.Preload("Student").First(&report, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("report not found")
		}
		return nil, err
	}
	return &report, nil
}

// DeleteReport deletes a report (only by the student who created it)
func DeleteReport(db *gorm.DB, reportID, studentID uint) error {
	result := db.Where("id = ? AND student_id = ?", reportID, studentID).Delete(&WeeklyReport{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("report not found or unauthorized")
	}
	return nil
}
