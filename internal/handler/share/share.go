package share

import (
	"github.com/WindyDante/toolpost/internal/handler/res"
	commonModel "github.com/WindyDante/toolpost/internal/model/common"
	shareModel "github.com/WindyDante/toolpost/internal/model/share"
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
		var uploadFile shareModel.UploadFile
		ctx.BindJSON(&uploadFile)
		// 提取上传的File数据
		file, err := ctx.FormFile("file")
		if err != nil {
			return res.Response{
				Msg: commonModel.INVALID_REQUEST_BODY,
				Err: err,
			}
		}
		shareHandler.shareService.UploadAnyFile(file)
		return res.Response{}
	})
}
