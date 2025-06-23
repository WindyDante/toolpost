package share

import "github.com/gin-gonic/gin"

type ShareHandlerInterface interface {
	GetShareByCode() gin.HandlerFunc
}
