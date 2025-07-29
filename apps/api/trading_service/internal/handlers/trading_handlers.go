package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/sirupsen/logrus"
	"trading-service/internal/algorithms"
	"trading-service/internal/models"
	"trading-service/internal/providers"
	"trading-service/internal/services"
)

// TradingHandler handles all trading-related HTTP requests
type TradingHandler struct {
	marketDataService *services.MarketDataService
	analysisService   *services.AnalysisService
	portfolioService  *services.PortfolioService
	websocketHub      *WebSocketHub
	logger            *logrus.Logger
}

func NewTradingHandler(
	marketDataService *services.MarketDataService,
	analysisService *services.AnalysisService,
	portfolioService *services.PortfolioService,
	websocketHub *WebSocketHub,
	logger *logrus.Logger,
) *TradingHandler {
	return &TradingHandler{
		marketDataService: marketDataService,
		analysisService:   analysisService,
		portfolioService:  portfolioService,
		websocketHub:      websocketHub,
		logger:            logger,
	}
}

// GetRealTimePrice handles GET /api/trading/prices/{symbol}
func (h *TradingHandler) GetRealTimePrice(c *gin.Context) {
	symbol := c.Param("symbol")
	if symbol == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success:   false,
			Message:   "Symbol is required",
			Error:     "missing symbol parameter",
			Timestamp: time.Now(),
		})
		return
	}

	// Get real-time data
	marketData, err := h.marketDataService.GetRealTimeData(symbol)
	if err != nil {
		h.logger.WithError(err).WithField("symbol", symbol).Error("Failed to get real-time data")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success:   false,
			Message:   "Failed to fetch market data",
			Error:     err.Error(),
			Timestamp: time.Now(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success:   true,
		Message:   "Market data retrieved successfully",
		Data:      marketData,
		Timestamp: time.Now(),
	})
}

// GetHistoricalPrices handles GET /api/trading/history/{symbol}
func (h *TradingHandler) GetHistoricalPrices(c *gin.Context) {
	symbol := c.Param("symbol")
	if symbol == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success:   false,
			Message:   "Symbol is required",
			Error:     "missing symbol parameter",
			Timestamp: time.Now(),
		})
		return
	}

	// Parse query parameters
	fromStr := c.DefaultQuery("from", "")
	toStr := c.DefaultQuery("to", "")
	limitStr := c.DefaultQuery("limit", "100")

	var from, to time.Time
	var err error

	if fromStr != "" {
		from, err = time.Parse("2006-01-02", fromStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, models.APIResponse{
				Success:   false,
				Message:   "Invalid from date format",
				Error:     "use YYYY-MM-DD format",
				Timestamp: time.Now(),
			})
			return
		}
	} else {
		from = time.Now().AddDate(0, 0, -30) // Default to 30 days ago
	}

	if toStr != "" {
		to, err = time.Parse("2006-01-02", toStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, models.APIResponse{
				Success:   false,
				Message:   "Invalid to date format",
				Error:     "use YYYY-MM-DD format",
				Timestamp: time.Now(),
			})
			return
		}
	} else {
		to = time.Now()
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 100
	}

	// Get historical data
	historicalData, err := h.marketDataService.GetHistoricalData(symbol, from, to)
	if err != nil {
		h.logger.WithError(err).WithField("symbol", symbol).Error("Failed to get historical data")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success:   false,
			Message:   "Failed to fetch historical data",
			Error:     err.Error(),
			Timestamp: time.Now(),
		})
		return
	}

	// Apply limit
	if len(historicalData) > limit {
		historicalData = historicalData[len(historicalData)-limit:]
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success:   true,
		Message:   "Historical data retrieved successfully",
		Data:      historicalData,
		Timestamp: time.Now(),
	})
}

// AnalyzeStock handles POST /api/trading/analyze
func (h *TradingHandler) AnalyzeStock(c *gin.Context) {
	var request models.TechnicalAnalysisRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success:   false,
			Message:   "Invalid request format",
			Error:     err.Error(),
			Timestamp: time.Now(),
		})
		return
	}

	// Validate request
	if request.Symbol == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success:   false,
			Message:   "Symbol is required",
			Error:     "missing symbol in request",
			Timestamp: time.Now(),
		})
		return
	}

	// Set defaults
	if request.TimeFrame == "" {
		request.TimeFrame = "1D"
	}
	if request.Period == 0 {
		request.Period = 30
	}
	if len(request.Indicators) == 0 {
		request.Indicators = []string{"RSI", "MACD", "SMA_20", "EMA_12", "Bollinger"}
	}

	// Get historical data for analysis
	from := time.Now().AddDate(0, 0, -request.Period)
	to := time.Now()

	historicalData, err := h.marketDataService.GetHistoricalData(request.Symbol, from, to)
	if err != nil {
		h.logger.WithError(err).WithField("symbol", request.Symbol).Error("Failed to get data for analysis")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success:   false,
			Message:   "Failed to fetch data for analysis",
			Error:     err.Error(),
			Timestamp: time.Now(),
		})
		return
	}

	if len(historicalData) < 20 {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success:   false,
			Message:   "Insufficient data for analysis",
			Error:     "need at least 20 data points",
			Timestamp: time.Now(),
		})
		return
	}

	// Perform technical analysis
	analysisResult, err := h.analysisService.PerformTechnicalAnalysis(request.Symbol, historicalData, request.Indicators)
	if err != nil {
		h.logger.WithError(err).WithField("symbol", request.Symbol).Error("Technical analysis failed")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success:   false,
			Message:   "Technical analysis failed",
			Error:     err.Error(),
			Timestamp: time.Now(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success:   true,
		Message:   "Analysis completed successfully",
		Data:      analysisResult,
		Timestamp: time.Now(),
	})
}

// GenerateSignals handles POST /api/trading/signals
func (h *TradingHandler) GenerateSignals(c *gin.Context) {
	var request struct {
		Symbol     string   `json:"symbol" binding:"required"`
		Algorithms []string `json:"algorithms"`
		TimeFrame  string   `json:"time_frame"`
		Period     int      `json:"period"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success:   false,
			Message:   "Invalid request format",
			Error:     err.Error(),
			Timestamp: time.Now(),
		})
		return
	}

	// Set defaults
	if request.TimeFrame == "" {
		request.TimeFrame = "1D"
	}
	if request.Period == 0 {
		request.Period = 50
	}
	if len(request.Algorithms) == 0 {
		request.Algorithms = []string{"momentum", "mean_reversion", "trend_following"}
	}

	// Get historical data
	from := time.Now().AddDate(0, 0, -request.Period)
	to := time.Now()

	historicalData, err := h.marketDataService.GetHistoricalData(request.Symbol, from, to)
	if err != nil {
		h.logger.WithError(err).WithField("symbol", request.Symbol).Error("Failed to get data for signal generation")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success:   false,
			Message:   "Failed to fetch data for signal generation",
			Error:     err.Error(),
			Timestamp: time.Now(),
		})
		return
	}

	// Generate signals using specified algorithms
	signals, err := h.analysisService.GenerateSignals(request.Symbol, historicalData, request.Algorithms)
	if err != nil {
		h.logger.WithError(err).WithField("symbol", request.Symbol).Error("Signal generation failed")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success:   false,
			Message:   "Signal generation failed",
			Error:     err.Error(),
			Timestamp: time.Now(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success:   true,
		Message:   "Signals generated successfully",
		Data:      signals,
		Timestamp: time.Now(),
	})
}

// GetPortfolio handles GET /api/trading/portfolio/{portfolioId}
func (h *TradingHandler) GetPortfolio(c *gin.Context) {
	portfolioID := c.Param("portfolioId")
	if portfolioID == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success:   false,
			Message:   "Portfolio ID is required",
			Error:     "missing portfolio ID parameter",
			Timestamp: time.Now(),
		})
		return
	}

	portfolio, err := h.portfolioService.GetPortfolio(portfolioID)
	if err != nil {
		h.logger.WithError(err).WithField("portfolio_id", portfolioID).Error("Failed to get portfolio")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success:   false,
			Message:   "Failed to fetch portfolio",
			Error:     err.Error(),
			Timestamp: time.Now(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success:   true,
		Message:   "Portfolio retrieved successfully",
		Data:      portfolio,
		Timestamp: time.Now(),
	})
}

// GetRiskAssessment handles GET /api/trading/risk/{symbol}
func (h *TradingHandler) GetRiskAssessment(c *gin.Context) {
	symbol := c.Param("symbol")
	if symbol == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success:   false,
			Message:   "Symbol is required",
			Error:     "missing symbol parameter",
			Timestamp: time.Now(),
		})
		return
	}

	period := c.DefaultQuery("period", "252") // Default to 1 year
	periodInt, err := strconv.Atoi(period)
	if err != nil {
		periodInt = 252
	}

	// Get historical data for risk calculation
	from := time.Now().AddDate(0, 0, -periodInt)
	to := time.Now()

	historicalData, err := h.marketDataService.GetHistoricalData(symbol, from, to)
	if err != nil {
		h.logger.WithError(err).WithField("symbol", symbol).Error("Failed to get data for risk assessment")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success:   false,
			Message:   "Failed to fetch data for risk assessment",
			Error:     err.Error(),
			Timestamp: time.Now(),
		})
		return
	}

	// Calculate risk metrics
	riskMetrics, err := h.analysisService.CalculateRiskMetrics(symbol, historicalData)
	if err != nil {
		h.logger.WithError(err).WithField("symbol", symbol).Error("Risk calculation failed")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success:   false,
			Message:   "Risk calculation failed",
			Error:     err.Error(),
			Timestamp: time.Now(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success:   true,
		Message:   "Risk assessment completed successfully",
		Data:      riskMetrics,
		Timestamp: time.Now(),
	})
}

// WebSocket handler for real-time data
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// Allow all origins for demo purposes
		// In production, implement proper origin checking
		return true
	},
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

// HandleWebSocket handles WebSocket connections for real-time data
func (h *TradingHandler) HandleWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		h.logger.WithError(err).Error("Failed to upgrade WebSocket connection")
		return
	}

	client := &WebSocketClient{
		conn:   conn,
		send:   make(chan []byte, 256),
		hub:    h.websocketHub,
		logger: h.logger,
	}

	h.websocketHub.register <- client

	// Start goroutines for handling WebSocket communication
	go client.writePump()
	go client.readPump()
}

// Health check endpoint
func (h *TradingHandler) HealthCheck(c *gin.Context) {
	status := map[string]interface{}{
		"status":    "healthy",
		"timestamp": time.Now(),
		"service":   "Trading Analysis Service",
		"version":   "1.0.0",
		"uptime":    time.Since(time.Now()).String(), // This would be actual uptime in real implementation
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success:   true,
		Message:   "Service is healthy",
		Data:      status,
		Timestamp: time.Now(),
	})
}

// GetSupportedSymbols handles GET /api/trading/symbols
func (h *TradingHandler) GetSupportedSymbols(c *gin.Context) {
	// For demo purposes, return a list of popular symbols
	symbols := []map[string]string{
		{"symbol": "AAPL", "name": "Apple Inc.", "exchange": "NASDAQ"},
		{"symbol": "GOOGL", "name": "Alphabet Inc.", "exchange": "NASDAQ"},
		{"symbol": "MSFT", "name": "Microsoft Corporation", "exchange": "NASDAQ"},
		{"symbol": "AMZN", "name": "Amazon.com Inc.", "exchange": "NASDAQ"},
		{"symbol": "TSLA", "name": "Tesla Inc.", "exchange": "NASDAQ"},
		{"symbol": "META", "name": "Meta Platforms Inc.", "exchange": "NASDAQ"},
		{"symbol": "NVDA", "name": "NVIDIA Corporation", "exchange": "NASDAQ"},
		{"symbol": "JPM", "name": "JPMorgan Chase & Co.", "exchange": "NYSE"},
		{"symbol": "JNJ", "name": "Johnson & Johnson", "exchange": "NYSE"},
		{"symbol": "V", "name": "Visa Inc.", "exchange": "NYSE"},
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success:   true,
		Message:   "Supported symbols retrieved successfully",
		Data:      symbols,
		Timestamp: time.Now(),
	})
}

// GetAlgorithms handles GET /api/trading/algorithms
func (h *TradingHandler) GetAlgorithms(c *gin.Context) {
	algorithmManager := algorithms.NewAlgorithmManager()
	algorithmNames := algorithmManager.ListAlgorithms()

	algorithmsInfo := make([]map[string]interface{}, 0)
	for _, name := range algorithmNames {
		algorithm, err := algorithmManager.GetAlgorithm(name)
		if err != nil {
			continue
		}

		info := map[string]interface{}{
			"name":        algorithm.Name(),
			"id":          name,
			"parameters":  algorithm.GetParameters(),
			"description": getAlgorithmDescription(name),
		}
		algorithmsInfo = append(algorithmsInfo, info)
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success:   true,
		Message:   "Available algorithms retrieved successfully",
		Data:      algorithmsInfo,
		Timestamp: time.Now(),
	})
}

func getAlgorithmDescription(algorithmID string) string {
	descriptions := map[string]string{
		"momentum":        "Momentum-based strategy using RSI and MACD indicators to identify trending opportunities",
		"mean_reversion":  "Mean reversion strategy using Bollinger Bands and RSI to identify overbought/oversold conditions",
		"trend_following": "Trend following strategy using EMA crossovers and ADX to ride strong trends",
		"composite":       "Composite strategy that combines multiple algorithms for robust signal generation",
	}
	
	if desc, exists := descriptions[algorithmID]; exists {
		return desc
	}
	return "Advanced trading algorithm for market analysis"
}

// SetupRoutes configures all trading service routes
func (h *TradingHandler) SetupRoutes(router *gin.Engine) {
	api := router.Group("/api/trading")
	{
		// Market data endpoints
		api.GET("/prices/:symbol", h.GetRealTimePrice)
		api.GET("/history/:symbol", h.GetHistoricalPrices)
		
		// Analysis endpoints
		api.POST("/analyze", h.AnalyzeStock)
		api.POST("/signals", h.GenerateSignals)
		api.GET("/risk/:symbol", h.GetRiskAssessment)
		
		// Portfolio endpoints
		api.GET("/portfolio/:portfolioId", h.GetPortfolio)
		
		// Utility endpoints
		api.GET("/symbols", h.GetSupportedSymbols)
		api.GET("/algorithms", h.GetAlgorithms)
		api.GET("/health", h.HealthCheck)
	}

	// WebSocket endpoint
	router.GET("/ws/trading", h.HandleWebSocket)
}