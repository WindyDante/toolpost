package share

import (
	"crypto/rand"
	"errors"
	"fmt"
	"math/big"
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

	return filePath, nil
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

	// 更新访问次数
	if err := s.shareRepository.UpdateByStatus(shareInfo.ID); err != nil {
		return "", err
	}

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
	expireTime := shareInfo.CreatedAt.Add(8*time.Hour + duration)

	// 检查是否已过期
	return time.Now().Add(8 * time.Hour).After(expireTime)
}

func (s *ShareService) UploadAnyFile(file model.UploadFile) (model.ShareVo, error) {
	var storageShare model.Share
	if file.File.Size > int64(1024*1024*500) {
		// 限制文件大小为500MB,不写为常量,仅在此处使用
		return model.ShareVo{}, errors.New(errModel.FILE_MAX_SIZE_EXCEEDED)
	}
	// 调用上传的本地工具类,上传后返回url自动拼接
	url, err := util.UploadFile(file.File)
	if err != nil {
		return model.ShareVo{}, err
	}

	// 定义随机数的最大值 (1,000,000)
	max := big.NewInt(1000000)

	// 生成一个 [0, max) 区间的密码学安全的随机整数
	n, _ := rand.Int(rand.Reader, max)

	// 若code不为空，是有自定义code
	// 否则使用 fmt.Sprintf 格式化为6位数字，不足6位的前面补0
	code := file.Code
	if file.Code == "" {
		code = fmt.Sprintf("%06d", n.Int64())
	}

	// 设置Share结构体的信息
	storageShare = model.Share{
		ID:         cryptoUtil.GenerateUUID(),
		File:       url,
		Expire:     file.ExpireTime,
		ExpireUnit: file.ExpireUnit,
		Text:       file.Text,
		Code:       code, // 生成6位随机数作为访问码
	}

	// 保存信息
	if err := s.shareRepository.SaveShare(&storageShare); err != nil {
		return model.ShareVo{}, err
	}

	return model.ShareVo{
		FileUrl: url,
		Code:    storageShare.Code,
	}, nil
}
