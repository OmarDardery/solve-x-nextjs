package models

import (
	"errors"
	"fmt"
	"time"

	"gorm.io/gorm"
)

// Notification represents an in-app notification
type Notification struct {
	gorm.Model
	RecipientID uint   `json:"recipient_id" gorm:"not null"`
	RecipientRole string `json:"recipient_role" gorm:"type:TEXT CHECK(recipient_role IN ('student','professor'));not null"`
	Title       string `json:"title" gorm:"not null"`
	Message     string `json:"message" gorm:"type:text;not null"`
	Type        string `json:"type" gorm:"type:TEXT CHECK(type IN ('info','success','warning','error'));default:'info'"`
	Read        bool   `json:"read" gorm:"default:false"`
	ReadAt      *time.Time `json:"read_at"`
}

// CreateNotification creates a new notification
func CreateNotification(db *gorm.DB, recipientID uint, recipientRole, title, message, notifType string) (*Notification, error) {
	// Validate recipient role
	if recipientRole != "student" && recipientRole != "professor" {
		return nil, errors.New("invalid recipient role")
	}

	// Validate type
	if notifType == "" {
		notifType = "info"
	}
	if notifType != "info" && notifType != "success" && notifType != "warning" && notifType != "error" {
		return nil, errors.New("invalid notification type")
	}

	notification := &Notification{
		RecipientID:   recipientID,
		RecipientRole: recipientRole,
		Title:         title,
		Message:       message,
		Type:          notifType,
		Read:          false,
	}

	if err := db.Create(notification).Error; err != nil {
		return nil, err
	}

	return notification, nil
}

// GetNotificationsByRecipient returns all notifications for a specific user
func GetNotificationsByRecipient(db *gorm.DB, recipientID uint, recipientRole string, unreadOnly bool) ([]Notification, error) {
	var notifications []Notification
	query := db.Where("recipient_id = ? AND recipient_role = ?", recipientID, recipientRole)
	
	if unreadOnly {
		query = query.Where("read = ?", false)
	}
	
	err := query.Order("created_at DESC").Find(&notifications).Error
	return notifications, err
}

// MarkNotificationAsRead marks a notification as read
func MarkNotificationAsRead(db *gorm.DB, notificationID, recipientID uint) error {
	now := time.Now()
	result := db.Model(&Notification{}).
		Where("id = ? AND recipient_id = ?", notificationID, recipientID).
		Updates(map[string]interface{}{
			"read":    true,
			"read_at": &now,
		})

	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("notification not found or unauthorized")
	}
	return nil
}

// MarkAllNotificationsAsRead marks all notifications as read for a user
func MarkAllNotificationsAsRead(db *gorm.DB, recipientID uint, recipientRole string) error {
	now := time.Now()
	return db.Model(&Notification{}).
		Where("recipient_id = ? AND recipient_role = ? AND read = ?", recipientID, recipientRole, false).
		Updates(map[string]interface{}{
			"read":    true,
			"read_at": &now,
		}).Error
}

// DeleteNotification deletes a notification
func DeleteNotification(db *gorm.DB, notificationID, recipientID uint) error {
	result := db.Where("id = ? AND recipient_id = ?", notificationID, recipientID).Delete(&Notification{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("notification not found or unauthorized")
	}
	return nil
}

// GetUnreadCount returns the count of unread notifications
func GetUnreadNotificationCount(db *gorm.DB, recipientID uint, recipientRole string) (int64, error) {
	var count int64
	err := db.Model(&Notification{}).
		Where("recipient_id = ? AND recipient_role = ? AND read = ?", recipientID, recipientRole, false).
		Count(&count).
		Error
	return count, err
}

// NotifyApplicationStatusChange notifies a student when their application status changes
func NotifyApplicationStatusChange(db *gorm.DB, studentID uint, opportunityName, status string) error {
	title := "Application Update"
	message := fmt.Sprintf("Your application for '%s' has been %s", opportunityName, status)
	notifType := "info"
	
	if status == "accepted" {
		title = "🎉 Application Accepted!"
		notifType = "success"
	} else if status == "rejected" {
		message = fmt.Sprintf("Your application for '%s' was not accepted this time", opportunityName)
	}
	
	_, err := CreateNotification(db, studentID, "student", title, message, notifType)
	return err
}

// NotifyNewReport notifies a professor when a student submits a weekly report
func NotifyNewReport(db *gorm.DB, professorID uint, studentName string) error {
	title := "📝 Weekly Report Submitted"
	message := fmt.Sprintf("%s submitted a weekly report", studentName)
	_, err := CreateNotification(db, professorID, "professor", title, message, "info")
	return err
}
