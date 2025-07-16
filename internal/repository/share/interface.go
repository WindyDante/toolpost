package share

import model "github.com/WindyDante/toolpost/internal/model/share"

type ShareRepositoryInterface interface {
	SaveShare(share *model.Share) error
	GetShareByCode(code string) (*model.Share, error)
}
