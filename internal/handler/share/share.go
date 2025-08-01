package share

import (
	"fmt"

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

// GetShareDetailByCode 根据访问码获取分享详情
func (shareHandler *ShareHandler) GetShareDetailByCode() gin.HandlerFunc {
	return res.Execute(func(ctx *gin.Context) res.Response {
		code := ctx.Param("code")

		// 根据分享码获取分享详情
		detail, err := shareHandler.shareService.GetShareDetailByCode(code)
		if err != nil {
			return res.Response{
				Msg: err.Error(),
			}
		}

		// 获取分享详情
		return res.Response{}
	})
}

// DownloadFile 获取key和code分析来比对下载路径是否正确
func (shareHandler *ShareHandler) DownloadFile() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		// 获取查询参数中的 key 和 code
		key := ctx.Query("key")
		code := ctx.Query("code")
		if key == "" || code == "" {
			ctx.JSON(0, gin.H{
				"msg": commonModel.INVALID_REQUEST_PARAMS,
			})
		}
		// 调用服务层方法获取下载链接
		filePath, err := shareHandler.shareService.GetDownloadUrl(key, code)
		if err != nil {
			ctx.JSON(0, gin.H{
				"msg": err.Error(),
			})
		}
		// 设置下载响应头
		ctx.Header("Content-Description", "File Transfer")
		ctx.Header("Content-Transfer-Encoding", "binary")
		ctx.Header("Content-Disposition", "attachment; filename=\""+filePath+"\"")
		ctx.Header("Content-Type", "application/octet-stream")

		// 返回文件内容
		ctx.File(filePath)
	}
}

// GetShareByCode 根据访问码获取分享信息
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
		scheme := "http"
		if ctx.Request.TLS != nil {
			scheme = "https"
		}
		url = fmt.Sprintf("%s://%s%s", scheme, ctx.Request.Host, url)

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
		vo, err := shareHandler.shareService.UploadAnyFile(uploadFile)
		if err != nil {
			return res.Response{
				Msg: err.Error(),
				Err: err,
			}
		}
		return res.Response{
			Msg:  commonModel.SUCCESS_MESSAGE,
			Data: vo,
		}
	})
}
