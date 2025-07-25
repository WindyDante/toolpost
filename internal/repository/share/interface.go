package share

import model "github.com/WindyDante/toolpost/internal/model/share"

type ShareRepositoryInterface interface {
	SaveShare(share *model.Share) error
	GetShareByCode(code string) (*model.Share, error)
	UpdateByStatus(id string) error
	GetShareByMD5(md5Val string) (*model.Share, error)
}
