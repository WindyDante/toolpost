package server

import (
	"fmt"

	"github.com/WindyDante/toolpost/internal/config"
	logUtil "github.com/WindyDante/toolpost/internal/util/log"
	"github.com/gin-gonic/gin"
)

type Server struct {
	GinEngine *gin.Engine // 封装Gin引擎
}

func New() *Server {
	engine := gin.Default()
	return &Server{
		GinEngine: engine,
	}
}

func (s *Server) Init() {
	logUtil.InitLogger() // 初始化日志记录

	config.LoadConfig() // 加载配置文件

	fmt.Println("this is mode->" + config.Config.Server.Mode)
}

func (s *Server) Start() {
	port := config.Config.Server.Port
	if err := s.GinEngine.Run(":" + port); err != nil {
		panic(fmt.Sprintf("Failed to start server on port %s: %v", port, err))
	}
}
