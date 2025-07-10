package share

import (
	"errors"

	errModel "github.com/WindyDante/toolpost/internal/model/common"
	model "github.com/WindyDante/toolpost/internal/model/share"
	"github.com/WindyDante/toolpost/internal/repository/share"
)

type ShareService struct {
	shareRepository share.ShareRepositoryInterface
}

func NewShareService(shareRepository share.ShareRepositoryInterface) ShareServiceInterface {
	return &ShareService{
		shareRepository: shareRepository,
	}
}

func (s *ShareService) UploadAnyFile(file model.UploadFile) (string, error) {
	if file.File.Size > int64(1024*1024*500) {
		// 限制文件大小为500MB,不写为常量,仅在此处使用
		return "", errors.New(errModel.FILE_MAX_SIZE_EXCEEDED)
	}
	// TODO:保存到数据库

	// TODO：以保存到数据库后的id来创建对应的目录，根据目录去获取目录下的文件或文件夹
	return "", nil
}
