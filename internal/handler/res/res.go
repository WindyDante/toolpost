package res

import (
	"net/http"

	common "github.com/WindyDante/toolpost/internal/model/common"
	util "github.com/WindyDante/toolpost/internal/util/err"
	"github.com/gin-gonic/gin"
)

type Response struct {
	Code int
	Data any
	Msg  string
	Err  error
}

// Execute 包装器,自动根据Response返回统一格式的HTTP响应
func Execute(fn func(ctx *gin.Context) Response) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		res := fn(ctx)
		if res.Err != nil {
			ctx.JSON(http.StatusInternalServerError, common.Fail[string](
				util.HandleError(&common.ServerError{
					Msg: res.Msg,
					Err: res.Err,
				}),
			))
			return
		}

		if res.Code != 0 {
			ctx.JSON(http.StatusOK, common.OKWithCode(res.Data, res.Code, res.Msg))
		} else {
			ctx.JSON(http.StatusOK, common.OK(res.Data, res.Msg))
		}
	}
}
