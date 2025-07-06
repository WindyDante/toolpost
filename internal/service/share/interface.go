package share

type ShareServiceInterface interface {
	UploadAnyFile(file interface{}) error
}
