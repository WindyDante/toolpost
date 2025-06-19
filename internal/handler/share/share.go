package share

import "github.com/WindyDante/toolpost/internal/service/share"

type ShareHandler struct {
	shareService share.ShareServiceInterface
}

func NewShareHandler(shareService share.ShareServiceInterface) *ShareHandler {
	return &ShareHandler{
		shareService: shareService,
	}
}
