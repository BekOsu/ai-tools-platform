package models

import (
	"time"
	"github.com/shopspring/decimal"
)

// MarketData represents real-time market data for a security
type MarketData struct {
	ID                string          `json:"id" db:"id"`
	Symbol            string          `json:"symbol" db:"symbol" validate:"required"`
	Price             decimal.Decimal `json:"price" db:"price" validate:"required"`
	Volume            int64           `json:"volume" db:"volume"`
	Timestamp         time.Time       `json:"timestamp" db:"timestamp"`
	Change            decimal.Decimal `json:"change" db:"change"`
	ChangePercent     decimal.Decimal `json:"change_percent" db:"change_percent"`
	Open              decimal.Decimal `json:"open" db:"open"`
	High              decimal.Decimal `json:"high" db:"high"`
	Low               decimal.Decimal `json:"low" db:"low"`
	PreviousClose     decimal.Decimal `json:"previous_close" db:"previous_close"`
	MarketCap         decimal.Decimal `json:"market_cap" db:"market_cap"`
	Beta              decimal.Decimal `json:"beta" db:"beta"`
	PE                decimal.Decimal `json:"pe" db:"pe"`
	EPS               decimal.Decimal `json:"eps" db:"eps"`
	DividendYield     decimal.Decimal `json:"dividend_yield" db:"dividend_yield"`
	Week52High        decimal.Decimal `json:"week_52_high" db:"week_52_high"`
	Week52Low         decimal.Decimal `json:"week_52_low" db:"week_52_low"`
	AverageVolume     int64           `json:"average_volume" db:"average_volume"`
	Source            string          `json:"source" db:"source"`
	CreatedAt         time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time       `json:"updated_at" db:"updated_at"`
}

// HistoricalData represents historical price data
type HistoricalData struct {
	ID        string          `json:"id" db:"id"`
	Symbol    string          `json:"symbol" db:"symbol" validate:"required"`
	Date      time.Time       `json:"date" db:"date" validate:"required"`
	Open      decimal.Decimal `json:"open" db:"open"`
	High      decimal.Decimal `json:"high" db:"high"`
	Low       decimal.Decimal `json:"low" db:"low"`
	Close     decimal.Decimal `json:"close" db:"close" validate:"required"`
	Volume    int64           `json:"volume" db:"volume"`
	AdjClose  decimal.Decimal `json:"adj_close" db:"adj_close"`
	Source    string          `json:"source" db:"source"`
	CreatedAt time.Time       `json:"created_at" db:"created_at"`
}

// TechnicalIndicator represents calculated technical indicators
type TechnicalIndicator struct {
	ID        string                 `json:"id" db:"id"`
	Symbol    string                 `json:"symbol" db:"symbol" validate:"required"`
	Date      time.Time              `json:"date" db:"date" validate:"required"`
	Type      string                 `json:"type" db:"type" validate:"required"` // RSI, MACD, SMA, EMA, etc.
	Value     decimal.Decimal        `json:"value" db:"value"`
	Metadata  map[string]interface{} `json:"metadata" db:"metadata"` // Additional indicator-specific data
	CreatedAt time.Time              `json:"created_at" db:"created_at"`
}

// TradingSignal represents generated trading signals
type TradingSignal struct {
	ID            string                 `json:"id" db:"id"`
	Symbol        string                 `json:"symbol" db:"symbol" validate:"required"`
	Type          string                 `json:"type" db:"type" validate:"required"` // BUY, SELL, HOLD
	Strength      decimal.Decimal        `json:"strength" db:"strength"`              // Signal strength 0-1
	Price         decimal.Decimal        `json:"price" db:"price"`
	TargetPrice   decimal.Decimal        `json:"target_price" db:"target_price"`
	StopLoss      decimal.Decimal        `json:"stop_loss" db:"stop_loss"`
	Confidence    decimal.Decimal        `json:"confidence" db:"confidence"` // 0-1
	Algorithm     string                 `json:"algorithm" db:"algorithm"`   // Algorithm that generated the signal
	Indicators    map[string]interface{} `json:"indicators" db:"indicators"` // Supporting indicators
	RiskLevel     string                 `json:"risk_level" db:"risk_level"` // LOW, MEDIUM, HIGH
	TimeFrame     string                 `json:"time_frame" db:"time_frame"` // 1m, 5m, 15m, 1h, 1d
	ExpirationTime time.Time             `json:"expiration_time" db:"expiration_time"`
	CreatedAt     time.Time              `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time              `json:"updated_at" db:"updated_at"`
}

// Portfolio represents a trading portfolio
type Portfolio struct {
	ID           string          `json:"id" db:"id"`
	UserID       string          `json:"user_id" db:"user_id" validate:"required"`
	Name         string          `json:"name" db:"name" validate:"required"`
	Cash         decimal.Decimal `json:"cash" db:"cash"`
	TotalValue   decimal.Decimal `json:"total_value" db:"total_value"`
	TotalReturn  decimal.Decimal `json:"total_return" db:"total_return"`
	ReturnPercent decimal.Decimal `json:"return_percent" db:"return_percent"`
	Beta         decimal.Decimal `json:"beta" db:"beta"`
	Sharpe       decimal.Decimal `json:"sharpe" db:"sharpe"`
	MaxDrawdown  decimal.Decimal `json:"max_drawdown" db:"max_drawdown"`
	CreatedAt    time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time       `json:"updated_at" db:"updated_at"`
}

// Position represents a stock position in a portfolio
type Position struct {
	ID           string          `json:"id" db:"id"`
	PortfolioID  string          `json:"portfolio_id" db:"portfolio_id" validate:"required"`
	Symbol       string          `json:"symbol" db:"symbol" validate:"required"`
	Quantity     decimal.Decimal `json:"quantity" db:"quantity"`
	AveragePrice decimal.Decimal `json:"average_price" db:"average_price"`
	CurrentPrice decimal.Decimal `json:"current_price" db:"current_price"`
	MarketValue  decimal.Decimal `json:"market_value" db:"market_value"`
	UnrealizedPL decimal.Decimal `json:"unrealized_pl" db:"unrealized_pl"`
	RealizedPL   decimal.Decimal `json:"realized_pl" db:"realized_pl"`
	TotalReturn  decimal.Decimal `json:"total_return" db:"total_return"`
	Weight       decimal.Decimal `json:"weight" db:"weight"` // Portfolio weight
	CreatedAt    time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time       `json:"updated_at" db:"updated_at"`
}

// RiskMetrics represents risk analysis for symbols or portfolios
type RiskMetrics struct {
	ID              string          `json:"id" db:"id"`
	Symbol          string          `json:"symbol" db:"symbol"`
	PortfolioID     string          `json:"portfolio_id" db:"portfolio_id"`
	Volatility      decimal.Decimal `json:"volatility" db:"volatility"`           // Standard deviation
	Beta            decimal.Decimal `json:"beta" db:"beta"`                       // Market beta
	Alpha           decimal.Decimal `json:"alpha" db:"alpha"`                     // Jensen's alpha
	SharpeRatio     decimal.Decimal `json:"sharpe_ratio" db:"sharpe_ratio"`       // Risk-adjusted return
	SortinoRatio    decimal.Decimal `json:"sortino_ratio" db:"sortino_ratio"`     // Downside risk ratio
	MaxDrawdown     decimal.Decimal `json:"max_drawdown" db:"max_drawdown"`       // Maximum drawdown
	VaR95           decimal.Decimal `json:"var_95" db:"var_95"`                   // Value at Risk 95%
	VaR99           decimal.Decimal `json:"var_99" db:"var_99"`                   // Value at Risk 99%
	ConditionalVaR  decimal.Decimal `json:"conditional_var" db:"conditional_var"` // Expected Shortfall
	InformationRatio decimal.Decimal `json:"information_ratio" db:"information_ratio"`
	TrackingError   decimal.Decimal `json:"tracking_error" db:"tracking_error"`
	Correlation     decimal.Decimal `json:"correlation" db:"correlation"` // Market correlation
	RiskLevel       string          `json:"risk_level" db:"risk_level"`   // LOW, MEDIUM, HIGH
	CreatedAt       time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at" db:"updated_at"`
}

// Alert represents price or condition-based alerts
type Alert struct {
	ID          string    `json:"id" db:"id"`
	UserID      string    `json:"user_id" db:"user_id" validate:"required"`
	Symbol      string    `json:"symbol" db:"symbol" validate:"required"`
	Type        string    `json:"type" db:"type" validate:"required"` // PRICE_ABOVE, PRICE_BELOW, VOLUME_SPIKE, etc.
	Condition   string    `json:"condition" db:"condition"`           // JSON condition
	IsActive    bool      `json:"is_active" db:"is_active"`
	IsTriggered bool      `json:"is_triggered" db:"is_triggered"`
	Message     string    `json:"message" db:"message"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
	TriggeredAt *time.Time `json:"triggered_at" db:"triggered_at"`
}

// MarketDataRequest represents a request for market data
type MarketDataRequest struct {
	Symbol    string    `json:"symbol" validate:"required"`
	TimeFrame string    `json:"time_frame"` // 1m, 5m, 15m, 1h, 1d
	StartDate time.Time `json:"start_date"`
	EndDate   time.Time `json:"end_date"`
	Limit     int       `json:"limit"`
}

// TechnicalAnalysisRequest represents a request for technical analysis
type TechnicalAnalysisRequest struct {
	Symbol     string   `json:"symbol" validate:"required"`
	TimeFrame  string   `json:"time_frame"`  // 1m, 5m, 15m, 1h, 1d
	Indicators []string `json:"indicators"`  // RSI, MACD, SMA_20, EMA_12, etc.
	Period     int      `json:"period"`      // Analysis period in days
}

// WebSocketMessage represents WebSocket message structure
type WebSocketMessage struct {
	Type      string      `json:"type"`      // subscribe, unsubscribe, data, error
	Symbol    string      `json:"symbol"`    
	Data      interface{} `json:"data"`
	Timestamp time.Time   `json:"timestamp"`
	RequestID string      `json:"request_id"`
}

// APIResponse represents standard API response format
type APIResponse struct {
	Success   bool        `json:"success"`
	Message   string      `json:"message"`
	Data      interface{} `json:"data,omitempty"`
	Error     string      `json:"error,omitempty"`
	Timestamp time.Time   `json:"timestamp"`
	RequestID string      `json:"request_id,omitempty"`
}