package share

import (
	"errors"
	"fmt"
	"time"

	errModel "github.com/WindyDante/toolpost/internal/model/common"
	model "github.com/WindyDante/toolpost/internal/model/share"
	"github.com/WindyDante/toolpost/internal/repository/share"
	cryptoUtil "github.com/WindyDante/toolpost/internal/util/crypto"
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

func (s *ShareService) GetDownloadUrl(key, code string) (string, error) {
	// 校验key是否正确
	shareInfo, err := s.shareRepository.GetShareByCode(code)
	if err != nil {
		return "", err
	}
	// 如果没有找到分享信息
	if shareInfo == nil {
		return "", errors.New(errModel.SHARE_NOT_FOUND)
	}
	// 检查是否过期
	if isExpired(shareInfo) {
		return "", errors.New(errModel.SHARE_EXPIRED)
	}

	encryptKey := cryptoUtil.EncryptShareCode(shareInfo.ID, shareInfo.Code)

	if encryptKey != key {
		// 如果key不匹配
		return "", errors.New(errModel.KEY_NOT_MATCH)
	}

	// 获取文件路径和文件名
	filePath := shareInfo.File

	return filePath, errors.New(errModel.INVALID_REQUEST_PARAMS)
}

func (s *ShareService) GetShareByCode(code string) (string, error) {
	// 获取分享信息
	shareInfo, err := s.shareRepository.GetShareByCode(code)
	if err != nil {
		return "", err
	}
	// 如果没有找到分享信息
	if shareInfo == nil {
		return "", errors.New(errModel.SHARE_NOT_FOUND)
	}
	// 检查是否过期
	if isExpired(shareInfo) {
		return "", errors.New(errModel.SHARE_EXPIRED)
	}

	key := cryptoUtil.EncryptShareCode(shareInfo.ID, shareInfo.Code)

	downloadURL := fmt.Sprintf("/share/download?key=%s&code=%s", key, code)

	return downloadURL, nil
}

// 检查是否过期的辅助方法
func isExpired(shareInfo *model.Share) bool {
	// 如果 Expire 为 0，表示永不过期
	if shareInfo.Expire == 0 {
		return false
	}

	var duration time.Duration

	// 根据过期单位转换为 time.Duration
	switch shareInfo.ExpireUnit {
	case 1: // 分钟
		duration = time.Duration(shareInfo.Expire) * time.Minute
	case 2: // 小时
		duration = time.Duration(shareInfo.Expire) * time.Hour
	case 3: // 天
		duration = time.Duration(shareInfo.Expire) * 24 * time.Hour
	default:
		// 默认按分钟处理
		duration = time.Duration(shareInfo.Expire) * time.Minute
	}

	// 计算过期时间
	expireTime := shareInfo.CreatedAt.Add(duration)

	// 检查是否已过期
	return time.Now().After(expireTime)
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
