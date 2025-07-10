package share

import model "github.com/WindyDante/toolpost/internal/model/share"

type ShareServiceInterface interface {
	UploadAnyFile(file model.UploadFile) (string, error)
}
