package util

import (
	"crypto/md5"
	"crypto/rand"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"

	model "github.com/WindyDante/toolpost/internal/model/common"
)

const (
	DIRECTORY_PATH = "./share"
)

// 计算文件 MD5 值的辅助函数
func CalculateFileMD5(fileHeader *multipart.FileHeader) (string, error) {
	// 打开文件
	file, err := fileHeader.Open()
	if err != nil {
		return "", err
	}
	defer file.Close()

	// 创建 MD5 哈希
	hash := md5.New()

	// 将文件内容拷贝到哈希计算器中
	if _, err := io.Copy(hash, file); err != nil {
		return "", err
	}

	// 计算 MD5 值并转换为十六进制字符串
	return fmt.Sprintf("%x", hash.Sum(nil)), nil
}

func UploadFile(file *multipart.FileHeader) (string, error) {
	if file == nil {
		return "", errors.New(model.NO_FILE_UPLOAD)
	}
	return UploadFileToLocal(file)
}

func UploadFileToLocal(file *multipart.FileHeader) (string, error) {
	// 构建目录
	if err := ensureDirectoryExists(DIRECTORY_PATH); err != nil {
		return "", err
	}

	// 保存文件
	url, err := saveUploadFile(file)
	if err != nil {
		return "", err
	}

	return url, nil
}

func saveUploadFile(file *multipart.FileHeader) (string, error) {
	// 生成随机ID
	uuid := UUID()

	// 获取文件拓展名
	ext := filepath.Ext(file.Filename)
	// 移除对应的文件后缀名,获得纯文件名
	nameWithoutExt := strings.TrimSuffix(file.Filename, ext)
	fileName := fmt.Sprintf("%s_%s%s", nameWithoutExt, uuid, ext)
	filePath := filepath.Join(DIRECTORY_PATH, fileName)

	// 打开上传的文件
	src, err := file.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	// 创建目标文件
	dest, err := os.Create(filePath)
	if err != nil {
		return "", err
	}
	defer dest.Close()

	// 复制文件内容
	if _, err := io.Copy(dest, src); err != nil {
		return "", err
	}

	// 返回文件的相对路径
	return fmt.Sprintf("%s/%s", DIRECTORY_PATH, fileName), nil
}

func ensureDirectoryExists(dirPath string) error {
	// 检查并创建目录
	if _, err := os.Stat(dirPath); os.IsNotExist(err) {
		if err := os.MkdirAll(dirPath, 0755); err != nil {
			return errors.New(model.FILE_DIRECTORY_CREATE)
		}
	}
	return nil
}

func UUID() string {
	uuid := make([]byte, 4)
	rand.Read(uuid)
	return fmt.Sprintf("%x", uuid)
}
