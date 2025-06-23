package share

import (
	"github.com/WindyDante/toolpost/internal/handler/res"
	"github.com/WindyDante/toolpost/internal/service/share"
	"github.com/gin-gonic/gin"
)

type ShareHandler struct {
	shareService share.ShareServiceInterface
}

func NewShareHandler(shareService share.ShareServiceInterface) *ShareHandler {
	return &ShareHandler{
		shareService: shareService,
	}
}

func (shareService *ShareHandler) GetShareByCode() gin.HandlerFunc {
	return res.Execute(func(ctx *gin.Context) res.Response {
		return res.Response{}
	})
}
