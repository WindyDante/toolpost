package share

import (
	model "github.com/WindyDante/toolpost/internal/model/share"
	"gorm.io/gorm"
)

type ShareRepository struct {
	db *gorm.DB
}

func NewShareRepository(db *gorm.DB) ShareRepositoryInterface {
	return &ShareRepository{
		db: db,
	}
}

func (shareRepository *ShareRepository) SaveShare(share *model.Share) error {
	if err := shareRepository.db.Create(share).Error; err != nil {
		return err
	}
	return nil
}
