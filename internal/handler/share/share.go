package share

import (
	"github.com/WindyDante/toolpost/internal/handler/res"
	model "github.com/WindyDante/toolpost/internal/model/common"
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

func (shareHandler *ShareHandler) GetShareByCode() gin.HandlerFunc {
	return res.Execute(func(ctx *gin.Context) res.Response {
		return res.Response{}
	})
}

func (shareHandler *ShareHandler) UploadAnyFile() gin.HandlerFunc {
	return res.Execute(func(ctx *gin.Context) res.Response {
		//TODO: 需要验证上传的是文本数据还是文件数据或者说文本+文件
		// 提取上传的File数据
		file, err := ctx.FormFile("file")
		if err != nil {
			return res.Response{
				Msg: model.INVALID_REQUEST_BODY,
				Err: err,
			}
		}
		shareHandler.shareService.UploadAnyFile(file)
		return res.Response{}
	})
}
