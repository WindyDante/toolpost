package share

import "gorm.io/gorm"

type ShareRepository struct {
	db *gorm.DB
}

func NewShareRepository(db *gorm.DB) ShareRepositoryInterface {
	return &ShareRepository{
		db: db,
	}
}
