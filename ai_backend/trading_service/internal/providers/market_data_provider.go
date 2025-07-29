package providers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"
	"github.com/shopspring/decimal"
	"trading-service/internal/models"
)

// MarketDataProvider interface for all market data providers
type MarketDataProvider interface {
	GetRealtimeData(symbol string) (*models.MarketData, error)
	GetHistoricalData(symbol string, from, to time.Time) ([]models.HistoricalData, error)
	GetIntradayData(symbol string, interval string) ([]models.HistoricalData, error)
	IsReady() bool
	GetProviderName() string
}

// AlphaVantageProvider implements Alpha Vantage API
type AlphaVantageProvider struct {
	APIKey     string
	BaseURL    string
	HTTPClient *http.Client
	RateLimit  *RateLimiter
}

type AlphaVantageQuote struct {
	GlobalQuote struct {
		Symbol           string `json:"01. symbol"`
		Open             string `json:"02. open"`
		High             string `json:"03. high"`
		Low              string `json:"04. low"`
		Price            string `json:"05. price"`
		Volume           string `json:"06. volume"`
		LatestTradingDay string `json:"07. latest trading day"`
		PreviousClose    string `json:"08. previous close"`
		Change           string `json:"09. change"`
		ChangePercent    string `json:"10. change percent"`
	} `json:"Global Quote"`
}

type AlphaVantageTimeSeries struct {
	MetaData struct {
		Information   string `json:"1. Information"`
		Symbol        string `json:"2. Symbol"`
		LastRefreshed string `json:"3. Last Refreshed"`
		OutputSize    string `json:"4. Output Size"`
		TimeZone      string `json:"5. Time Zone"`
	} `json:"Meta Data"`
	TimeSeriesDaily map[string]struct {
		Open   string `json:"1. open"`
		High   string `json:"2. high"`
		Low    string `json:"3. low"`
		Close  string `json:"4. close"`
		Volume string `json:"5. volume"`
	} `json:"Time Series (Daily)"`
}

func NewAlphaVantageProvider(apiKey string) *AlphaVantageProvider {
	return &AlphaVantageProvider{
		APIKey:  apiKey,
		BaseURL: "https://www.alphavantage.co/query",
		HTTPClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		RateLimit: NewRateLimiter(5, time.Minute), // 5 requests per minute
	}
}

func (av *AlphaVantageProvider) GetProviderName() string {
	return "Alpha Vantage"
}

func (av *AlphaVantageProvider) IsReady() bool {
	return av.APIKey != ""
}

func (av *AlphaVantageProvider) GetRealtimeData(symbol string) (*models.MarketData, error) {
	if !av.RateLimit.Allow() {
		return nil, fmt.Errorf("rate limit exceeded")
	}

	url := fmt.Sprintf("%s?function=GLOBAL_QUOTE&symbol=%s&apikey=%s", av.BaseURL, symbol, av.APIKey)
	
	resp, err := av.HTTPClient.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch data: %v", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %v", err)
	}

	var quote AlphaVantageQuote
	if err := json.Unmarshal(body, &quote); err != nil {
		return nil, fmt.Errorf("failed to parse response: %v", err)
	}

	// Convert to our MarketData model
	marketData := &models.MarketData{
		Symbol:    symbol,
		Source:    av.GetProviderName(),
		Timestamp: time.Now(),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Parse numeric values
	if price, err := decimal.NewFromString(quote.GlobalQuote.Price); err == nil {
		marketData.Price = price
	}
	if open, err := decimal.NewFromString(quote.GlobalQuote.Open); err == nil {
		marketData.Open = open
	}
	if high, err := decimal.NewFromString(quote.GlobalQuote.High); err == nil {
		marketData.High = high
	}
	if low, err := decimal.NewFromString(quote.GlobalQuote.Low); err == nil {
		marketData.Low = low
	}
	if prevClose, err := decimal.NewFromString(quote.GlobalQuote.PreviousClose); err == nil {
		marketData.PreviousClose = prevClose
	}
	if change, err := decimal.NewFromString(quote.GlobalQuote.Change); err == nil {
		marketData.Change = change
	}
	if volume, err := strconv.ParseInt(quote.GlobalQuote.Volume, 10, 64); err == nil {
		marketData.Volume = volume
	}

	// Parse change percent (remove % sign)
	changePercentStr := quote.GlobalQuote.ChangePercent
	if len(changePercentStr) > 0 && changePercentStr[len(changePercentStr)-1] == '%' {
		changePercentStr = changePercentStr[:len(changePercentStr)-1]
	}
	if changePercent, err := decimal.NewFromString(changePercentStr); err == nil {
		marketData.ChangePercent = changePercent
	}

	return marketData, nil
}

func (av *AlphaVantageProvider) GetHistoricalData(symbol string, from, to time.Time) ([]models.HistoricalData, error) {
	if !av.RateLimit.Allow() {
		return nil, fmt.Errorf("rate limit exceeded")
	}

	url := fmt.Sprintf("%s?function=TIME_SERIES_DAILY&symbol=%s&outputsize=full&apikey=%s", av.BaseURL, symbol, av.APIKey)
	
	resp, err := av.HTTPClient.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch historical data: %v", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %v", err)
	}

	var timeSeries AlphaVantageTimeSeries
	if err := json.Unmarshal(body, &timeSeries); err != nil {
		return nil, fmt.Errorf("failed to parse response: %v", err)
	}

	var historicalData []models.HistoricalData

	for dateStr, data := range timeSeries.TimeSeriesDaily {
		date, err := time.Parse("2006-01-02", dateStr)
		if err != nil {
			continue
		}

		// Filter by date range
		if date.Before(from) || date.After(to) {
			continue
		}

		histData := models.HistoricalData{
			Symbol:    symbol,
			Date:      date,
			Source:    av.GetProviderName(),
			CreatedAt: time.Now(),
		}

		// Parse OHLCV data
		if open, err := decimal.NewFromString(data.Open); err == nil {
			histData.Open = open
		}
		if high, err := decimal.NewFromString(data.High); err == nil {
			histData.High = high
		}
		if low, err := decimal.NewFromString(data.Low); err == nil {
			histData.Low = low
		}
		if close, err := decimal.NewFromString(data.Close); err == nil {
			histData.Close = close
			histData.AdjClose = close // Alpha Vantage doesn't provide separate adj close in basic plan
		}
		if volume, err := strconv.ParseInt(data.Volume, 10, 64); err == nil {
			histData.Volume = volume
		}

		historicalData = append(historicalData, histData)
	}

	return historicalData, nil
}

func (av *AlphaVantageProvider) GetIntradayData(symbol string, interval string) ([]models.HistoricalData, error) {
	if !av.RateLimit.Allow() {
		return nil, fmt.Errorf("rate limit exceeded")
	}

	url := fmt.Sprintf("%s?function=TIME_SERIES_INTRADAY&symbol=%s&interval=%s&apikey=%s", av.BaseURL, symbol, interval, av.APIKey)
	
	resp, err := av.HTTPClient.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch intraday data: %v", err)
	}
	defer resp.Body.Close()

	// Implementation similar to GetHistoricalData but for intraday intervals
	// For brevity, returning empty slice here
	return []models.HistoricalData{}, nil
}

// YahooFinanceProvider implements Yahoo Finance API (unofficial)
type YahooFinanceProvider struct {
	BaseURL    string
	HTTPClient *http.Client
	RateLimit  *RateLimiter
}

func NewYahooFinanceProvider() *YahooFinanceProvider {
	return &YahooFinanceProvider{
		BaseURL: "https://query1.finance.yahoo.com",
		HTTPClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		RateLimit: NewRateLimiter(100, time.Minute), // More generous rate limit
	}
}

func (yf *YahooFinanceProvider) GetProviderName() string {
	return "Yahoo Finance"
}

func (yf *YahooFinanceProvider) IsReady() bool {
	return true // No API key required
}

func (yf *YahooFinanceProvider) GetRealtimeData(symbol string) (*models.MarketData, error) {
	if !yf.RateLimit.Allow() {
		return nil, fmt.Errorf("rate limit exceeded")
	}

	url := fmt.Sprintf("%s/v8/finance/chart/%s", yf.BaseURL, symbol)
	
	resp, err := yf.HTTPClient.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch data: %v", err)
	}
	defer resp.Body.Close()

	// Parse Yahoo Finance response (complex JSON structure)
	// Implementation would go here
	return &models.MarketData{
		Symbol:    symbol,
		Source:    yf.GetProviderName(),
		Timestamp: time.Now(),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}, nil
}

func (yf *YahooFinanceProvider) GetHistoricalData(symbol string, from, to time.Time) ([]models.HistoricalData, error) {
	// Implementation for Yahoo Finance historical data
	return []models.HistoricalData{}, nil
}

func (yf *YahooFinanceProvider) GetIntradayData(symbol string, interval string) ([]models.HistoricalData, error) {
	// Implementation for Yahoo Finance intraday data
	return []models.HistoricalData{}, nil
}

// IEXCloudProvider implements IEX Cloud API
type IEXCloudProvider struct {
	APIKey     string
	BaseURL    string
	HTTPClient *http.Client
	RateLimit  *RateLimiter
}

func NewIEXCloudProvider(apiKey string) *IEXCloudProvider {
	return &IEXCloudProvider{
		APIKey:  apiKey,
		BaseURL: "https://cloud.iexapis.com/stable",
		HTTPClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		RateLimit: NewRateLimiter(100, time.Second), // 100 requests per second
	}
}

func (iex *IEXCloudProvider) GetProviderName() string {
	return "IEX Cloud"
}

func (iex *IEXCloudProvider) IsReady() bool {
	return iex.APIKey != ""
}

func (iex *IEXCloudProvider) GetRealtimeData(symbol string) (*models.MarketData, error) {
	if !iex.RateLimit.Allow() {
		return nil, fmt.Errorf("rate limit exceeded")
	}

	url := fmt.Sprintf("%s/stock/%s/quote?token=%s", iex.BaseURL, symbol, iex.APIKey)
	
	resp, err := iex.HTTPClient.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch data: %v", err)
	}
	defer resp.Body.Close()

	// Parse IEX Cloud response
	// Implementation would go here
	return &models.MarketData{
		Symbol:    symbol,
		Source:    iex.GetProviderName(),
		Timestamp: time.Now(),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}, nil
}

func (iex *IEXCloudProvider) GetHistoricalData(symbol string, from, to time.Time) ([]models.HistoricalData, error) {
	// Implementation for IEX Cloud historical data
	return []models.HistoricalData{}, nil
}

func (iex *IEXCloudProvider) GetIntradayData(symbol string, interval string) ([]models.HistoricalData, error) {
	// Implementation for IEX Cloud intraday data
	return []models.HistoricalData{}, nil
}

// MarketDataAggregator combines multiple providers with fallback
type MarketDataAggregator struct {
	Providers []MarketDataProvider
	Primary   MarketDataProvider
}

func NewMarketDataAggregator(providers []MarketDataProvider) *MarketDataAggregator {
	var primary MarketDataProvider
	if len(providers) > 0 {
		primary = providers[0]
	}

	return &MarketDataAggregator{
		Providers: providers,
		Primary:   primary,
	}
}

func (agg *MarketDataAggregator) GetRealtimeData(symbol string) (*models.MarketData, error) {
	// Try primary provider first
	if agg.Primary != nil && agg.Primary.IsReady() {
		data, err := agg.Primary.GetRealtimeData(symbol)
		if err == nil {
			return data, nil
		}
	}

	// Fallback to other providers
	for _, provider := range agg.Providers {
		if provider == agg.Primary {
			continue // Skip primary as we already tried it
		}
		
		if !provider.IsReady() {
			continue
		}

		data, err := provider.GetRealtimeData(symbol)
		if err == nil {
			return data, nil
		}
	}

	return nil, fmt.Errorf("all providers failed to fetch data for symbol %s", symbol)
}

func (agg *MarketDataAggregator) GetHistoricalData(symbol string, from, to time.Time) ([]models.HistoricalData, error) {
	// Try primary provider first
	if agg.Primary != nil && agg.Primary.IsReady() {
		data, err := agg.Primary.GetHistoricalData(symbol, from, to)
		if err == nil && len(data) > 0 {
			return data, nil
		}
	}

	// Fallback to other providers
	for _, provider := range agg.Providers {
		if provider == agg.Primary {
			continue
		}
		
		if !provider.IsReady() {
			continue
		}

		data, err := provider.GetHistoricalData(symbol, from, to)
		if err == nil && len(data) > 0 {
			return data, nil
		}
	}

	return nil, fmt.Errorf("all providers failed to fetch historical data for symbol %s", symbol)
}

// RateLimiter implements token bucket rate limiting
type RateLimiter struct {
	tokens   int
	capacity int
	refill   time.Duration
	lastRefill time.Time
}

func NewRateLimiter(capacity int, refillPeriod time.Duration) *RateLimiter {
	return &RateLimiter{
		tokens:     capacity,
		capacity:   capacity,
		refill:     refillPeriod,
		lastRefill: time.Now(),
	}
}

func (rl *RateLimiter) Allow() bool {
	now := time.Now()
	
	// Refill tokens based on time elapsed
	if now.Sub(rl.lastRefill) >= rl.refill {
		rl.tokens = rl.capacity
		rl.lastRefill = now
	}

	if rl.tokens > 0 {
		rl.tokens--
		return true
	}

	return false
}

// MockProvider for testing and demo purposes
type MockProvider struct {
	Name string
}

func NewMockProvider() *MockProvider {
	return &MockProvider{Name: "Mock Provider"}
}

func (mp *MockProvider) GetProviderName() string {
	return mp.Name
}

func (mp *MockProvider) IsReady() bool {
	return true
}

func (mp *MockProvider) GetRealtimeData(symbol string) (*models.MarketData, error) {
	// Generate mock data
	basePrice := decimal.NewFromFloat(150.0)
	change := decimal.NewFromFloat(-2.5 + (5.0 * time.Now().Unix() % 100 / 100.0))
	
	return &models.MarketData{
		Symbol:        symbol,
		Price:         basePrice.Add(change),
		Volume:        1000000 + time.Now().Unix()%500000,
		Change:        change,
		ChangePercent: change.Div(basePrice).Mul(decimal.NewFromInt(100)),
		Open:          basePrice,
		High:          basePrice.Add(decimal.NewFromFloat(5.0)),
		Low:           basePrice.Sub(decimal.NewFromFloat(3.0)),
		PreviousClose: basePrice.Sub(change),
		Source:        mp.GetProviderName(),
		Timestamp:     time.Now(),
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}, nil
}

func (mp *MockProvider) GetHistoricalData(symbol string, from, to time.Time) ([]models.HistoricalData, error) {
	var data []models.HistoricalData
	
	basePrice := 150.0
	current := from
	
	for current.Before(to) || current.Equal(to) {
		// Skip weekends
		if current.Weekday() == time.Saturday || current.Weekday() == time.Sunday {
			current = current.AddDate(0, 0, 1)
			continue
		}
		
		// Generate realistic price movement
		change := (float64(current.Unix()%100) - 50) / 10.0
		price := basePrice + change
		
		data = append(data, models.HistoricalData{
			Symbol:    symbol,
			Date:      current,
			Open:      decimal.NewFromFloat(price - 1.0),
			High:      decimal.NewFromFloat(price + 2.0),
			Low:       decimal.NewFromFloat(price - 2.0),
			Close:     decimal.NewFromFloat(price),
			AdjClose:  decimal.NewFromFloat(price),
			Volume:    1000000 + current.Unix()%500000,
			Source:    mp.GetProviderName(),
			CreatedAt: time.Now(),
		})
		
		current = current.AddDate(0, 0, 1)
		basePrice = price // Use last price as new base
	}
	
	return data, nil
}

func (mp *MockProvider) GetIntradayData(symbol string, interval string) ([]models.HistoricalData, error) {
	// Generate mock intraday data
	return []models.HistoricalData{}, nil
}