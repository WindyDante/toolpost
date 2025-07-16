package share

import (
	"errors"

	errModel "github.com/WindyDante/toolpost/internal/model/common"
	model "github.com/WindyDante/toolpost/internal/model/share"
	"github.com/WindyDante/toolpost/internal/repository/share"
	util "github.com/WindyDante/toolpost/internal/util/storage"
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
	var storageShare model.Share
	if file.File.Size > int64(1024*1024*500) {
		// 限制文件大小为500MB,不写为常量,仅在此处使用
		return "", errors.New(errModel.FILE_MAX_SIZE_EXCEEDED)
	}
	// 调用上传的本地工具类,上传后返回url自动拼接
	url, err := util.UploadFile(file.File)
	if err != nil {
		return "", err
	}

	// 设置Share结构体的信息
	storageShare = model.Share{
		File:       url,
		Expire:     file.ExpireTime,
		ExpireUnit: file.ExpireUnit,
		Text:       file.Text,
	}

	// 保存信息
	if err := s.shareRepository.SaveShare(&storageShare); err != nil {
		return "", err
	}

	return url, nil
}
