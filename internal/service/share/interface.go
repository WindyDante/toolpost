package share

import model "github.com/WindyDante/toolpost/internal/model/share"

type ShareServiceInterface interface {
	UploadAnyFile(file model.UploadFile) (string, error)
	GetShareByCode(code string) (string, error)
	GetDownloadUrl(key, code string) (string, error)
}
