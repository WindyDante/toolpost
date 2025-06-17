package config

import (
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

func LoadConfig() {
	viperContainer := viper.New()
	viperContainer.SetConfigFile("config/server.yaml")
	viperContainer.SetConfigType("yaml")
	err := viperContainer.ReadInConfig()
	if err != nil {
		panic(model.READ_CONFIG_PANIC + ": " + err.Error())
	}
	if err = viperContainer.Unmarshal(&Config.Server); err != nil {
		panic(model.READ_CONFIG_PANIC + ": " + err.Error())
	}

	viperContainer.SetConfigFile("config/database.yaml")
	err = viperContainer.ReadInConfig()
	if err != nil {
		panic(model.READ_CONFIG_PANIC + ": " + err.Error())
	}
	if err = viperContainer.Unmarshal(&Config.Database); err != nil {
		panic(model.READ_CONFIG_PANIC + ": " + err.Error())
	}

}
