package database

import (
	"os"

	"github.com/WindyDante/toolpost/internal/config"
	commonModel "github.com/WindyDante/toolpost/internal/model/common"
	shareModel "github.com/WindyDante/toolpost/internal/model/share"
	util "github.com/WindyDante/toolpost/internal/util/err"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDatabase() {
	dbType := config.Config.Database.Type
	dbPath := config.Config.Database.Path

	dir := dbPath[:len(dbPath)-len("/share.db")]
	if err := os.MkdirAll(dir, os.ModePerm); err != nil {
		util.HandlePanicError(&commonModel.ServerError{
			Msg: commonModel.CREATE_DB_PATH_PANIC,
			Err: err,
		})
	}

	if dbType == "sqlite" {
		var err error
		DB, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
		if err != nil {
			util.HandlePanicError(&commonModel.ServerError{
				Msg: commonModel.INIT_DATABASE_PANIC,
				Err: err,
			})
		}
	}

	if err := MigrateDB(); err != nil {
		util.HandlePanicError(&commonModel.ServerError{
			Msg: commonModel.DATABASE_MIGRATE_ERROR,
			Err: err,
		})
	}
}

// MigrateDB 执行数据库迁移
func MigrateDB() error {
	models := []interface{}{
		shareModel.Share{},
	}

	return DB.AutoMigrate(
		models...,
	)
}
