package util

import (
	model "github.com/WindyDante/toolpost/internal/model/common"
	util "github.com/WindyDante/toolpost/internal/util/log"
	"go.uber.org/zap"
)

func HandleError(se *model.ServerError) string {
	if se.Err != nil {
		if se.Msg == "" || len(se.Msg) == 0 {
			se.Msg = se.Err.Error() // 设置错误消息
		}
		util.Logger.Error(se.Msg, zap.Error(se.Err)) // 记录错误日志
	}
	return se.Msg
}

func HandlePanicError(se *model.ServerError) {
	if se.Err != nil {
		if se.Msg == "" || len(se.Msg) == 0 {
			se.Msg = se.Err.Error()
		}
		util.Logger.Panic(se.Msg, zap.Error(se.Err))
	}

	panic(se.Msg)
}
