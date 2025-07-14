package util

import (
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

	// 保留原文件拓展名
	ext := filepath.Ext(file.Filename)
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
