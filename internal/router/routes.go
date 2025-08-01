package router

import (
	"github.com/WindyDante/toolpost/internal/di"
	"github.com/WindyDante/toolpost/internal/middleware"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
)

func SetupRoute(r *gin.Engine, h *di.Handlers) {
	// Setup Frontend
	r.Use(static.Serve("/", static.LocalFile("./template", true)))

	r.Use(middleware.Cors())

	shareGroup := r.Group("/api")
	shareGroup.POST("/upload", h.ShareHandler.UploadAnyFile())
	shareGroup.GET("/share/:code", h.ShareHandler.GetShareByCode())
	shareGroup.GET("/share/detail/:code", h.ShareHandler.GetShareDetailByCode())
	r.GET("/share/download", h.ShareHandler.DownloadFile())
}
