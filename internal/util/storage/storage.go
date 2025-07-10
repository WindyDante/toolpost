package util

import (
	"errors"
	"mime/multipart"
	"os"

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
	if err := saveUploadFile(file); err != nil {
		return "", err
	}

	return "", errors.New(model.FILE_UPLOAD)
}

func saveUploadFile(file *multipart.FileHeader) error {
	return nil
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
