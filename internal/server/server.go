package server

import "github.com/gin-gonic/gin"

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

}
