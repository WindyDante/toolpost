package model

type ServerError struct {
	Msg string
	Err error
}

// 失败的常量
const (
	INVALID_REQUEST_FORM   = "无效的表单"
	INVALID_SHARE_CODE     = "无效的分享码"
	FILE_UPLOAD            = "文件上传失败"
	FILE_MAX_SIZE_EXCEEDED = "文件大小超过限制(500MB)"
	NO_FILE_UPLOAD         = "没有上传文件"
	SHARE_NOT_FOUND        = "分享不存在"
	FILE_DIRECTORY_CREATE  = "初始化文件目录失败"
)
