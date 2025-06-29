package share

type Share struct {
	ID         string `json:"id" gorm:"primaryKey"`
	Content    string `json:"url" gorm:"unique;not null"` // URL是一个文件路径或文本内容
	Expire     int64  `json:"expire"`
	ExpireUnit int64  `json:"expire_unit"` // 过期单位，秒、分钟、小时等
	Status     int    `json:"status"`      // 状态，0表示未使用，1表示已使用，2表示已过期
	Code       string `json:"code"`        // 访问码
}
