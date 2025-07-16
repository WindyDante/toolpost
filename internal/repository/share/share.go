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

func (shareRepository *ShareRepository) GetShareByCode(code string) (*model.Share, error) {
	var share model.Share
	if err := shareRepository.db.Where("code = ?", code).First(&share).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil // 没有找到记录
		}
		return nil, err // 其他错误
	}
	return &share, nil // 返回找到的分享信息
}

func (shareRepository *ShareRepository) SaveShare(share *model.Share) error {
	if err := shareRepository.db.Create(share).Error; err != nil {
		return err
	}
	return nil
}
