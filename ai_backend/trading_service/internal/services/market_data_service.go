package services

import (
	"context"
	"fmt"
	"time"
	"trading-service/internal/models"
	"trading-service/internal/providers"
	"github.com/sirupsen/logrus"
)

type MarketDataService struct {
	providers []providers.MarketDataProvider
	logger    *logrus.Logger
}

func NewMarketDataService(providerList []providers.MarketDataProvider, logger *logrus.Logger) *MarketDataService {
	return &MarketDataService{
		providers: providerList,
		logger:    logger,
	}
}

func (s *MarketDataService) GetRealTimeData(symbol string) (*models.MarketData, error) {
	for _, provider := range s.providers {
		data, err := provider.GetRealTimeData(context.Background(), symbol)
		if err != nil {
			s.logger.WithError(err).WithField("provider", provider.Name()).Warn("Provider failed, trying next")
			continue
		}
		return data, nil
	}
	return nil, fmt.Errorf("all providers failed to get real-time data for %s", symbol)
}

func (s *MarketDataService) GetHistoricalData(symbol string, from, to time.Time) ([]*models.HistoricalData, error) {
	for _, provider := range s.providers {
		data, err := provider.GetHistoricalData(context.Background(), symbol, from, to)
		if err != nil {
			s.logger.WithError(err).WithField("provider", provider.Name()).Warn("Provider failed, trying next")
			continue
		}
		return data, nil
	}
	return nil, fmt.Errorf("all providers failed to get historical data for %s", symbol)
}

func (s *MarketDataService) IsMarketOpen() bool {
	now := time.Now()
	
	// Simple market hours check (NYSE/NASDAQ)
	// Monday-Friday, 9:30 AM - 4:00 PM EST
	if now.Weekday() == time.Saturday || now.Weekday() == time.Sunday {
		return false
	}
	
	// Convert to EST
	est, _ := time.LoadLocation("America/New_York")
	estTime := now.In(est)
	
	hour := estTime.Hour()
	minute := estTime.Minute()
	
	// Market opens at 9:30 AM
	if hour < 9 || (hour == 9 && minute < 30) {
		return false
	}
	
	// Market closes at 4:00 PM
	if hour >= 16 {
		return false
	}
	
	return true
}

func (s *MarketDataService) ValidateSymbol(symbol string) error {
	if symbol == "" {
		return fmt.Errorf("symbol cannot be empty")
	}
	
	if len(symbol) > 10 {
		return fmt.Errorf("symbol too long")
	}
	
	return nil
}