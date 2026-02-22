package models

import (
	"errors"

	"gorm.io/gorm"
)

type Tag struct {
	gorm.Model
	Name        string `json:"name" gorm:"unique;not null"`
	Description string `json:"description"`
}

func CreateTag(db *gorm.DB, name, description string) (*Tag, error) {
	var existing Tag
	if err := db.Where("name = ?", name).First(&existing).Error; err == nil {
		return &existing, nil // Tag already exists, return it
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	tag := &Tag{
		Name:        name,
		Description: description,
	}
	if err := db.Create(tag).Error; err != nil {
		return nil, err
	}
	return tag, nil
}

// GetAllTags retrieves all tags
func GetAllTags(db *gorm.DB) ([]Tag, error) {
	var tags []Tag
	err := db.Find(&tags).Error
	return tags, err
}

// GetTagByID retrieves a tag by ID
func GetTagByID(db *gorm.DB, id uint) (*Tag, error) {
	var tag Tag
	err := db.First(&tag, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("tag not found")
		}
		return nil, err
	}
	return &tag, nil
}
