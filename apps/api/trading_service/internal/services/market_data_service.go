package services

import (
	"fmt"
	"time"
	"github.com/sirupsen/logrus"
	"trading-service/internal/models"
	"trading-service/internal/providers"
)

// MarketDataService handles market data operations
type MarketDataService struct {
	aggregator *providers.MarketDataAggregator
	logger     *logrus.Logger
}

// NewMarketDataService creates a new market data service
func NewMarketDataService(aggregator *providers.MarketDataAggregator, logger *logrus.Logger) *MarketDataService {
	return &MarketDataService{
		aggregator: aggregator,
		logger:     logger,
	}
}

// GetRealTimeData retrieves real-time market data for a symbol
func (s *MarketDataService) GetRealTimeData(symbol string) (*models.MarketData, error) {
	s.logger.WithField("symbol", symbol).Debug("Fetching real-time data")
	
	data, err := s.aggregator.GetRealtimeData(symbol)
	if err != nil {
		s.logger.WithError(err).WithField("symbol", symbol).Error("Failed to get real-time data")
		return nil, fmt.Errorf("failed to get real-time data for %s: %v", symbol, err)
	}

	// Add some metadata
	data.ID = fmt.Sprintf("%s_%d", symbol, time.Now().Unix())
	
	s.logger.WithFields(logrus.Fields{
		"symbol": symbol,
		"price":  data.Price,
		"source": data.Source,
	}).Debug("Real-time data retrieved")

	return data, nil
}

// GetHistoricalData retrieves historical market data for a symbol
func (s *MarketDataService) GetHistoricalData(symbol string, from, to time.Time) ([]models.HistoricalData, error) {
	s.logger.WithFields(logrus.Fields{
		"symbol": symbol,
		"from":   from.Format("2006-01-02"),
		"to":     to.Format("2006-01-02"),
	}).Debug("Fetching historical data")

	data, err := s.aggregator.GetHistoricalData(symbol, from, to)
	if err != nil {
		s.logger.WithError(err).WithFields(logrus.Fields{
			"symbol": symbol,
			"from":   from,
			"to":     to,
		}).Error("Failed to get historical data")
		return nil, fmt.Errorf("failed to get historical data for %s: %v", symbol, err)
	}

	// Add IDs to historical data
	for i := range data {
		data[i].ID = fmt.Sprintf("%s_%s", symbol, data[i].Date.Format("2006-01-02"))
	}

	s.logger.WithFields(logrus.Fields{
		"symbol":     symbol,
		"data_points": len(data),
	}).Debug("Historical data retrieved")

	return data, nil
}

// GetMultipleSymbolsData retrieves real-time data for multiple symbols
func (s *MarketDataService) GetMultipleSymbolsData(symbols []string) (map[string]*models.MarketData, error) {
	s.logger.WithField("symbols", symbols).Debug("Fetching multiple symbols data")

	results := make(map[string]*models.MarketData)
	errors := make(map[string]error)

	for _, symbol := range symbols {
		data, err := s.GetRealTimeData(symbol)
		if err != nil {
			errors[symbol] = err
			continue
		}
		results[symbol] = data
	}

	// Log any errors but don't fail the entire request
	if len(errors) > 0 {
		s.logger.WithField("errors", errors).Warn("Some symbols failed to fetch")
	}

	if len(results) == 0 {
		return nil, fmt.Errorf("failed to fetch data for any symbols")
	}

	s.logger.WithFields(logrus.Fields{
		"requested": len(symbols),
		"successful": len(results),
		"failed":    len(errors),
	}).Debug("Multiple symbols data retrieved")

	return results, nil
}

// GetIntradayData retrieves intraday data for a symbol
func (s *MarketDataService) GetIntradayData(symbol string, interval string) ([]models.HistoricalData, error) {
	s.logger.WithFields(logrus.Fields{
		"symbol":   symbol,
		"interval": interval,
	}).Debug("Fetching intraday data")

	// For now, use the first available provider that supports intraday data
	// In production, you might want to have a more sophisticated selection mechanism
	for _, provider := range s.aggregator.Providers {
		if !provider.IsReady() {
			continue
		}

		data, err := provider.GetIntradayData(symbol, interval)
		if err != nil {
			s.logger.WithError(err).WithFields(logrus.Fields{
				"symbol":   symbol,
				"interval": interval,
				"provider": provider.GetProviderName(),
			}).Warn("Provider failed to get intraday data")
			continue
		}

		// Add IDs to intraday data
		for i := range data {
			data[i].ID = fmt.Sprintf("%s_%s_%s", symbol, data[i].Date.Format("2006-01-02_15:04"), interval)
		}

		s.logger.WithFields(logrus.Fields{
			"symbol":      symbol,
			"interval":    interval,
			"data_points": len(data),
			"provider":    provider.GetProviderName(),
		}).Debug("Intraday data retrieved")

		return data, nil
	}

	return nil, fmt.Errorf("no providers available for intraday data")
}

// ValidateSymbol checks if a symbol is valid and tradeable
func (s *MarketDataService) ValidateSymbol(symbol string) (bool, error) {
	s.logger.WithField("symbol", symbol).Debug("Validating symbol")

	// Try to get real-time data as a validation method
	_, err := s.GetRealTimeData(symbol)
	if err != nil {
		s.logger.WithError(err).WithField("symbol", symbol).Warn("Symbol validation failed")
		return false, err
	}

	s.logger.WithField("symbol", symbol).Debug("Symbol validated successfully")
	return true, nil
}

// GetMarketStatus returns current market status (open/closed)
func (s *MarketDataService) GetMarketStatus() *models.MarketStatus {
	now := time.Now()
	
	// Simple market hours check (NYSE/NASDAQ: 9:30 AM - 4:00 PM ET on weekdays)
	// This is a simplified version - in production, you'd want to account for holidays, etc.
	
	// Convert to ET
	etLocation, _ := time.LoadLocation("America/New_York")
	etTime := now.In(etLocation)
	
	isWeekday := etTime.Weekday() >= time.Monday && etTime.Weekday() <= time.Friday
	hour := etTime.Hour()
	minute := etTime.Minute()
	
	var isOpen bool
	var nextOpen, nextClose time.Time
	
	if isWeekday && ((hour == 9 && minute >= 30) || (hour > 9 && hour < 16)) {
		isOpen = true
		// Next close is today at 4:00 PM ET
		nextClose = time.Date(etTime.Year(), etTime.Month(), etTime.Day(), 16, 0, 0, 0, etLocation)
	} else {
		isOpen = false
		// Calculate next open
		if isWeekday && hour < 9 || (hour == 9 && minute < 30) {
			// Next open is today at 9:30 AM ET
			nextOpen = time.Date(etTime.Year(), etTime.Month(), etTime.Day(), 9, 30, 0, 0, etLocation)
		} else {
			// Next open is next weekday at 9:30 AM ET
			daysToAdd := 1
			if etTime.Weekday() == time.Friday {
				daysToAdd = 3 // Skip weekend
			} else if etTime.Weekday() == time.Saturday {
				daysToAdd = 2
			}
			nextOpen = time.Date(etTime.Year(), etTime.Month(), etTime.Day()+daysToAdd, 9, 30, 0, 0, etLocation)
		}
	}
	
	status := &models.MarketStatus{
		IsOpen:       isOpen,
		MarketHours:  "9:30 AM - 4:00 PM ET",
		TimeZone:     "America/New_York",
		CurrentTime:  etTime,
		NextOpen:     nextOpen,
		NextClose:    nextClose,
		UpdatedAt:    time.Now(),
	}
	
	s.logger.WithFields(logrus.Fields{
		"is_open":     isOpen,
		"current_time": etTime.Format("15:04:05 MST"),
	}).Debug("Market status retrieved")
	
	return status
}

// GetProviderStatus returns the status of all configured providers
func (s *MarketDataService) GetProviderStatus() map[string]models.ProviderStatus {
	status := make(map[string]models.ProviderStatus)
	
	for _, provider := range s.aggregator.Providers {
		providerStatus := models.ProviderStatus{
			Name:      provider.GetProviderName(),
			IsReady:   provider.IsReady(),
			LastCheck: time.Now(),
		}
		
		// Test provider with a simple request
		if provider.IsReady() {
			_, err := provider.GetRealtimeData("AAPL") // Test with AAPL
			if err != nil {
				providerStatus.IsReady = false
				providerStatus.LastError = err.Error()
			}
		}
		
		status[provider.GetProviderName()] = providerStatus
	}
	
	s.logger.WithField("providers", len(status)).Debug("Provider status retrieved")
	return status
}

// GetSupportedSymbols returns a list of supported symbols
func (s *MarketDataService) GetSupportedSymbols() []models.SymbolInfo {
	// For demo purposes, return a curated list of popular symbols
	// In production, this might come from a database or external service
	symbols := []models.SymbolInfo{
		{Symbol: "AAPL", Name: "Apple Inc.", Exchange: "NASDAQ", Sector: "Technology", MarketCap: "3T+"},
		{Symbol: "GOOGL", Name: "Alphabet Inc.", Exchange: "NASDAQ", Sector: "Technology", MarketCap: "1T+"},
		{Symbol: "MSFT", Name: "Microsoft Corporation", Exchange: "NASDAQ", Sector: "Technology", MarketCap: "2T+"},
		{Symbol: "AMZN", Name: "Amazon.com Inc.", Exchange: "NASDAQ", Sector: "Consumer Discretionary", MarketCap: "1T+"},
		{Symbol: "TSLA", Name: "Tesla Inc.", Exchange: "NASDAQ", Sector: "Consumer Discretionary", MarketCap: "500B+"},
		{Symbol: "META", Name: "Meta Platforms Inc.", Exchange: "NASDAQ", Sector: "Technology", MarketCap: "500B+"},
		{Symbol: "NVDA", Name: "NVIDIA Corporation", Exchange: "NASDAQ", Sector: "Technology", MarketCap: "1T+"},
		{Symbol: "JPM", Name: "JPMorgan Chase & Co.", Exchange: "NYSE", Sector: "Financial Services", MarketCap: "400B+"},
		{Symbol: "JNJ", Name: "Johnson & Johnson", Exchange: "NYSE", Sector: "Healthcare", MarketCap: "400B+"},
		{Symbol: "V", Name: "Visa Inc.", Exchange: "NYSE", Sector: "Financial Services", MarketCap: "400B+"},
		{Symbol: "WMT", Name: "Walmart Inc.", Exchange: "NYSE", Sector: "Consumer Staples", MarketCap: "400B+"},
		{Symbol: "PG", Name: "Procter & Gamble Co.", Exchange: "NYSE", Sector: "Consumer Staples", MarketCap: "300B+"},
		{Symbol: "UNH", Name: "UnitedHealth Group Inc.", Exchange: "NYSE", Sector: "Healthcare", MarketCap: "400B+"},
		{Symbol: "HD", Name: "Home Depot Inc.", Exchange: "NYSE", Sector: "Consumer Discretionary", MarketCap: "300B+"},
		{Symbol: "MA", Name: "Mastercard Inc.", Exchange: "NYSE", Sector: "Financial Services", MarketCap: "300B+"},
		{Symbol: "BAC", Name: "Bank of America Corp.", Exchange: "NYSE", Sector: "Financial Services", MarketCap: "200B+"},
		{Symbol: "DIS", Name: "Walt Disney Co.", Exchange: "NYSE", Sector: "Communication Services", MarketCap: "200B+"},
		{Symbol: "ADBE", Name: "Adobe Inc.", Exchange: "NASDAQ", Sector: "Technology", MarketCap: "200B+"},
		{Symbol: "NFLX", Name: "Netflix Inc.", Exchange: "NASDAQ", Sector: "Communication Services", MarketCap: "200B+"},
		{Symbol: "CRM", Name: "Salesforce Inc.", Exchange: "NYSE", Sector: "Technology", MarketCap: "200B+"},
	}
	
	s.logger.WithField("symbols_count", len(symbols)).Debug("Supported symbols retrieved")
	return symbols
}

// Additional models for market data service
type MarketStatus struct {
	IsOpen      bool      `json:"is_open"`
	MarketHours string    `json:"market_hours"`
	TimeZone    string    `json:"time_zone"`
	CurrentTime time.Time `json:"current_time"`
	NextOpen    time.Time `json:"next_open,omitempty"`
	NextClose   time.Time `json:"next_close,omitempty"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type ProviderStatus struct {
	Name      string    `json:"name"`
	IsReady   bool      `json:"is_ready"`
	LastCheck time.Time `json:"last_check"`
	LastError string    `json:"last_error,omitempty"`
}

type SymbolInfo struct {
	Symbol    string `json:"symbol"`
	Name      string `json:"name"`
	Exchange  string `json:"exchange"`
	Sector    string `json:"sector"`
	MarketCap string `json:"market_cap"`
}