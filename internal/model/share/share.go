package model

import (
	"mime/multipart"
	"time"
)

type Share struct {
	ID         string    `json:"id" gorm:"primaryKey"`
	File       string    `json:"url" gorm:"unique;not null"` // URL是一个文件路径
	Text       string    `json:"text"`                       // 文本内容
	Expire     int64     `json:"expire"`
	ExpireUnit int64     `json:"expire_unit"` // 过期单位，秒、分钟、小时等
	Status     int       `json:"status"`      // 状态，0表示未使用，1表示已使用，2表示已过期
	Code       string    `json:"code"`        // 访问码
	CreatedAt  time.Time `json:"createdAt"`   // 创建时间
}

type UploadFile struct {
	File       *multipart.FileHeader `form:"file" `       // 非必须,文件
	ExpireTime int64                 `form:"expireTime" ` // 数量集
	ExpireUnit int64                 `form:"expireUnit"`  // 过期单位，秒、分钟、小时等,无时间表示长期有效
	Text       string                `form:"text"`        // 文本内容
	Code       string                `form:"code"`        // 访问码,存在访问码时，为自定义访问码
}

type ShareVo struct {
	FileUrl string `json:"fileUrl"` // 文件URL
	Code    string `json:"code"`    // 访问码
}
