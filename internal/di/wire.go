//go:build wireinject
// +build wireinject

package di

import (
	shareHandler "github.com/WindyDante/toolpost/internal/handler/share"
	shareRepository "github.com/WindyDante/toolpost/internal/repository/share"
	shareService "github.com/WindyDante/toolpost/internal/service/share"
	"github.com/google/wire"
	"gorm.io/gorm"
)

func BuildHandler(db *gorm.DB) (*Handlers, error) {
	wire.Build(ShareSet, NewHandlers)
	return &Handlers{}, nil
}

var ShareSet = wire.NewSet(
	shareRepository.NewShareRepository,
	shareService.NewShareService, // 修正方法名
	shareHandler.NewShareHandler, // 修正方法名
)
