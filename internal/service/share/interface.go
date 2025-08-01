package share

import model "github.com/WindyDante/toolpost/internal/model/share"

type ShareServiceInterface interface {
	UploadAnyFile(file model.UploadFile) (model.ShareVo, error)
	GetShareByCode(code string) (string, error)
	GetDownloadUrl(key, code string) (string, error)
	GetShareDetailByCode(code string) (model.ShareDetailVo, error)
}
