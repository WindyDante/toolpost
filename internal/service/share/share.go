package share

import "github.com/WindyDante/toolpost/internal/repository/share/share"

type ShareService struct {
	shareRepository share.ShareRepositoryInterface
}

func NewShareService(shareRepository share.ShareRepositoryInterface) *ShareService {
	return &ShareService{
		shareRepository: shareRepository,
	}
}
