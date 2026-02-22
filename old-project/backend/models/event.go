package models

import (
	"gorm.io/gorm"
)

type Event struct {
	gorm.Model
	Title          string       `json:"title"`
	Description    string       `json:"description"`
	Date           string       `json:"date"`         // Can be a date, duration, or date range as string
	Link           string       `json:"link"`         // Learn more link
	SignUpLink     string       `json:"sign_up_link"` // Registration/signup form link
	OrganizationID uint         `json:"organization_id"`
	Organization   Organization `json:"organization,omitempty" gorm:"foreignKey:OrganizationID"`
}

// CreateEvent creates a new event
func CreateEvent(db *gorm.DB, event *Event) error {
	return db.Create(event).Error
}

// GetEventByID retrieves an event by ID
func GetEventByID(db *gorm.DB, id uint) (*Event, error) {
	var event Event
	err := db.Preload("Organization").First(&event, id).Error
	if err != nil {
		return nil, err
	}
	return &event, nil
}

// GetAllEvents retrieves all events
func GetAllEvents(db *gorm.DB) ([]Event, error) {
	var events []Event
	err := db.Preload("Organization").Order("created_at desc").Find(&events).Error
	return events, err
}

// GetEventsByOrganizationID retrieves all events for a specific organization
func GetEventsByOrganizationID(db *gorm.DB, orgID uint) ([]Event, error) {
	var events []Event
	err := db.Where("organization_id = ?", orgID).Order("created_at desc").Find(&events).Error
	return events, err
}

// UpdateEvent updates an existing event
func UpdateEvent(db *gorm.DB, event *Event) error {
	return db.Save(event).Error
}

// DeleteEvent deletes an event by ID
func DeleteEvent(db *gorm.DB, id uint) error {
	return db.Delete(&Event{}, id).Error
}

// DeleteEventByIDAndOrg deletes an event only if it belongs to the organization
func DeleteEventByIDAndOrg(db *gorm.DB, eventID, orgID uint) error {
	result := db.Where("id = ? AND organization_id = ?", eventID, orgID).Delete(&Event{})
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return result.Error
}
