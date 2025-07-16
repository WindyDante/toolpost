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

// 根据访问码获取分享信息
func (shareHandler *ShareHandler) GetShareByCode() gin.HandlerFunc {
	return res.Execute(func(ctx *gin.Context) res.Response {
		code := ctx.Param("code")

		// 获取分享信息
		url, err := shareHandler.shareService.GetShareByCode(code)
		if err != nil {
			return res.Response{
				Msg: err.Error(),
				Err: err,
			}
		}

		// TODO:返回分享信息
		return res.Response{
			Msg:  commonModel.SUCCESS_MESSAGE,
			Data: url,
		}
	})
}

func (shareHandler *ShareHandler) UploadAnyFile() gin.HandlerFunc {
	return res.Execute(func(ctx *gin.Context) res.Response {
		// 绑定请求体到 UploadFile 结构体
		var uploadFile shareModel.UploadFile
		err := ctx.ShouldBind(&uploadFile)
		if err != nil {
			return res.Response{
				Msg: commonModel.INVALID_REQUEST_FORM,
				Err: err,
			}
		}
		// 上传文件
		imageUrl, err := shareHandler.shareService.UploadAnyFile(uploadFile)
		if err != nil {
			return res.Response{
				Msg: err.Error(),
				Err: err,
			}
		}
		return res.Response{
			Msg:  commonModel.SUCCESS_MESSAGE,
			Data: imageUrl,
		}
	})
}
