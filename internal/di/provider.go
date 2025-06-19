package di

import "github.com/WindyDante/toolpost/internal/handler/share"

type Handlers struct {
	ShareHandler *share.ShareHandler
}

func NewHandlers(
	shareHandler *share.ShareHandler) *Handlers {
	return &Handlers{
		ShareHandler: shareHandler,
	}
}
