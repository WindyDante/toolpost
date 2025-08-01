package share

import (
	"crypto/rand"
	"errors"
	"fmt"
	"math/big"
	"strings"
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

// extractOriginalFileName 从文件路径中提取原文件名
// 例如: "./share/template_26aad675.html" -> "template.html"
func extractOriginalFileName(filePath string) string {
	// 如果文件路径为空，返回空字符串
	if filePath == "" {
		return ""
	}

	// 找到最后一个 / 的位置，获取文件名部分
	lastSlashIndex := strings.LastIndex(filePath, "/")
	if lastSlashIndex == -1 {
		lastSlashIndex = strings.LastIndex(filePath, "\\") // 兼容Windows路径
	}

	var fileName string
	if lastSlashIndex == -1 {
		fileName = filePath // 没有路径分隔符，整个就是文件名
	} else {
		fileName = filePath[lastSlashIndex+1:] // 获取文件名部分
	}

	// 从后往前找到第一个 _ 的位置
	lastUnderscoreIndex := strings.LastIndex(fileName, "_")
	if lastUnderscoreIndex == -1 {
		// 没有找到下划线，直接返回原文件名
		return fileName
	}

	// 找到文件扩展名的位置
	lastDotIndex := strings.LastIndex(fileName, ".")
	if lastDotIndex == -1 || lastDotIndex < lastUnderscoreIndex {
		// 没有扩展名或扩展名在下划线之前，直接返回下划线之前的部分
		return fileName[:lastUnderscoreIndex]
	}

	// 提取原文件名：下划线之前的部分 + 扩展名
	baseName := fileName[:lastUnderscoreIndex]
	extension := fileName[lastDotIndex:]

	return baseName + extension
}

func (s *ShareService) GetShareDetailByCode(code string) (model.ShareDetailVo, error) {
	// 获取分享信息
	shareInfo, err := s.shareRepository.GetShareByCode(code)
	if err != nil {
		return model.ShareDetailVo{}, err
	}
	// 从文件路径中提取原文件名
	fileName := extractOriginalFileName(shareInfo.File)
	shareDetail := model.ShareDetailVo{
		Text:     shareInfo.Text,
		FileName: fileName,
	}

	return shareDetail, nil
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
	// 获取本地md5值与数据库中对应的md5值进行对比
	// 如果存在相同的md5值，则直接返回对应的分享信息
	md5Val, err := util.CalculateFileMD5(file.File)

	if err != nil {
		return model.ShareVo{}, err
	}

	// 检查是否已存在相同的文件
	shareInfo, err := s.shareRepository.GetShareByMD5(md5Val)
	if err != nil {
		return model.ShareVo{}, err
	}

	if shareInfo != nil {
		// 如果文件已存在，直接返回已存在的分享信息
		return model.ShareVo{
			FileUrl: shareInfo.File,
			Code:    shareInfo.Code,
		}, nil
	}

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
		ID:         md5Val,
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
