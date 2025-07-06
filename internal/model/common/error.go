package model

type ServerError struct {
	Msg string
	Err error
}

// 失败的常量
const (
	INVALID_REQUEST_BODY = "无效的请求体"
	INVALID_SHARE_CODE   = "无效的分享码"
	File_Upload          = "文件上传失败"
)
