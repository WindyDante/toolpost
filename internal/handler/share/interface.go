package share

import "github.com/gin-gonic/gin"

type ShareHandlerInterface interface {
	// 根据分享码获取分享文件或信息
	GetShareByCode() gin.HandlerFunc

	// 上传文件
	UploadAnyFile() gin.HandlerFunc
}
