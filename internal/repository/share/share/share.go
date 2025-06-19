package share

import "gorm.io/gorm"

type ShareRepository struct {
	db *gorm.DB
}

func NewShareRepository(db *gorm.DB) *ShareRepository {
	return &ShareRepository{
		db: db,
	}
}
