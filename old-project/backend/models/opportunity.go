package models

import (
	"errors"
	"time"

	"gorm.io/gorm"
)

// Opportunity represents a research/project/internship post.
type Opportunity struct {
	gorm.Model
	ProfessorID  uint       `json:"professor_id" gorm:"not null"`
	Professor    *Professor `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:ProfessorID;references:ID"`
	Name         string     `json:"name" gorm:"not null"`
	Details      string     `json:"details" gorm:"type:text"`
	Requirements string     `json:"requirements" gorm:"type:text"`
	Reward       string     `json:"reward" gorm:"type:text"`
	// Relationship: each opportunity can have multiple tags
	RequirementTags []Tag `json:"requirement_tags" gorm:"many2many:opportunity_tags;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

	// Enforce type constraint
	Type string `json:"type" gorm:"type:TEXT CHECK(type IN ('research','project','internship'));not null"`
}

// CreateOpportunity creates a new opportunity
func CreateOpportunity(db *gorm.DB, professorID uint, name, details, requirements, reward, opType string, tagIDs []uint) (*Opportunity, error) {
	// Validate type
	if opType != "research" && opType != "project" && opType != "internship" {
		return nil, errors.New("invalid opportunity type")
	}

	opportunity := Opportunity{
		ProfessorID:  professorID,
		Name:         name,
		Details:      details,
		Requirements: requirements,
		Reward:       reward,
		Type:         opType,
	}

	// Create the opportunity
	if err := db.Create(&opportunity).Error; err != nil {
		return nil, err
	}

	// Associate tags if provided
	if len(tagIDs) > 0 {
		var tags []Tag
		if err := db.Find(&tags, tagIDs).Error; err != nil {
			return nil, err
		}
		if err := db.Model(&opportunity).Association("RequirementTags").Append(&tags); err != nil {
			return nil, err
		}
	}

	// Reload with associations
	if err := db.Preload("Professor").Preload("RequirementTags").First(&opportunity, opportunity.ID).Error; err != nil {
		return nil, err
	}

	return &opportunity, nil
}

func GetOpportunityByID(db *gorm.DB, id uint) (*Opportunity, error) {
	var opportunity Opportunity
	if err := db.Preload("Professor").Preload("RequirementTags").First(&opportunity, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("opportunity not found")
		}
		return nil, err
	}
	return &opportunity, nil
}

// UpdateOpportunity updates an opportunity’s fields
func UpdateOpportunity(db *gorm.DB, id uint, updates map[string]interface{}) (*Opportunity, error) {
	opportunity, err := GetOpportunityByID(db, id)
	if err != nil {
		return nil, err
	}

	// Automatically update the "updated_at" timestamp
	updates["updated_at"] = time.Now()

	if err := db.Model(opportunity).Updates(updates).Error; err != nil {
		return nil, err
	}

	// Refresh record with relations
	if err := db.Preload("Professor").Preload("RequirementTags").First(opportunity, id).Error; err != nil {
		return nil, err
	}

	return opportunity, nil
}

// DeleteOpportunity deletes an opportunity by ID
func DeleteOpportunity(db *gorm.DB, id uint) error {
	opportunity, err := GetOpportunityByID(db, id)
	if err != nil {
		return err
	}

	if err := db.Delete(opportunity).Error; err != nil {
		return err
	}

	return nil
}

// GetOpportunitiesByProfessorID returns all opportunities created by a given professor
func GetOpportunitiesByProfessorID(db *gorm.DB, professorID uint) ([]Opportunity, error) {
	var opportunities []Opportunity
	if err := db.Preload("Professor").Preload("RequirementTags").
		Where("professor_id = ?", professorID).
		Find(&opportunities).Error; err != nil {
		return nil, err
	}

	// Return empty array instead of error when no opportunities found
	return opportunities, nil
}

// GetAllOpportunities returns all opportunities
func GetAllOpportunities(db *gorm.DB) ([]Opportunity, error) {
	var opportunities []Opportunity
	if err := db.Preload("Professor").Preload("RequirementTags").
		Order("created_at DESC").
		Find(&opportunities).Error; err != nil {
		return nil, err
	}

	return opportunities, nil
}
