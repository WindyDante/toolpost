package share

import "github.com/WindyDante/toolpost/internal/repository/share"

type ShareService struct {
	shareRepository share.ShareRepositoryInterface
}

func NewShareService(shareRepository share.ShareRepositoryInterface) ShareServiceInterface {
	return &ShareService{
		shareRepository: shareRepository,
	}
}

func (s *ShareService) UploadAnyFile(file interface{}) error {
	return nil
}
