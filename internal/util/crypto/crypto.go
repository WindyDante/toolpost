package util

import (
	"encoding/base64"
)

func EncryptShareCode(id string, code string) string {
	// 简单的base64编码加密
	rawData := id + code
	return base64.URLEncoding.EncodeToString([]byte(rawData))
}
