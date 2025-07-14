package server

import (
	"fmt"

	"github.com/WindyDante/toolpost/internal/config"
	"github.com/WindyDante/toolpost/internal/database"
	"github.com/WindyDante/toolpost/internal/di"
	model "github.com/WindyDante/toolpost/internal/model/common"
	"github.com/WindyDante/toolpost/internal/router"
	util "github.com/WindyDante/toolpost/internal/util/err"
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

	if config.Config.Server.Mode == "debug" {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	database.InitDatabase()

	handlers, err := di.BuildHandler(database.DB)
	if err != nil {
		util.HandlePanicError(&model.ServerError{
			Msg: model.INIT_HANDLERS_PANIC,
			Err: err,
		})
	}

	router.SetupRoute(s.GinEngine, handlers) // 设置路由
}

func (s *Server) Start() {
	port := config.Config.Server.Port
	if err := s.GinEngine.Run(":" + port); err != nil {
		panic(fmt.Sprintf("Failed to start server on port %s: %v", port, err))
	}
}
