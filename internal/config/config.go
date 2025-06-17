package config

import (
	"path/filepath"

	model "github.com/WindyDante/toolpost/internal/model/common"
	"github.com/spf13/viper"
)

var Config ConfigUtil

type ServerConfig struct {
	Host string `yaml:"host"`
	Port string `yaml:"port"`
	Mode string `yaml:"mode"`
}

type DatabaseConfig struct {
	Type string `yaml:"type"`
	Path string `yaml:"path"`
}

// 创建yaml解析结构体
type ConfigUtil struct {
	Server   ServerConfig
	Database DatabaseConfig
}

func loadConfigFile(filename string, target any) {
	v := viper.New()
	v.SetConfigFile(filepath.Join(model.CONFIG_FILE_PREFIX, filename))
	v.SetConfigType(model.CONFIG_TYPE_YAML)
	err := v.ReadInConfig()
	if err != nil {
		panic(model.READ_CONFIG_PANIC + ": " + err.Error())
	}
	if err = v.Unmarshal(target); err != nil {
		panic(model.READ_CONFIG_PANIC + ": " + err.Error())
	}
}

func LoadConfig() {
	// 加载服务器配置
	loadConfigFile("server.yaml", &Config.Server)
	// 加载数据库配置
	loadConfigFile("database.yaml", &Config.Database)
}
