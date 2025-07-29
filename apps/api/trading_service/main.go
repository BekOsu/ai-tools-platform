package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"trading-service/internal/config"
	"trading-service/internal/handlers"
	"trading-service/internal/providers"
	"trading-service/internal/services"
)

func main() {
	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Setup logger
	logger := setupLogger(cfg)
	logger.Info("Starting Trading Analysis Service")

	// Initialize market data providers
	marketDataProviders := initializeMarketDataProviders(cfg, logger)
	
	// Create market data aggregator
	aggregator := providers.NewMarketDataAggregator(marketDataProviders)

	// Initialize services
	marketDataService := services.NewMarketDataService(aggregator, logger)
	analysisService := services.NewAnalysisService(logger)
	portfolioService := services.NewPortfolioService(logger)

	// Initialize WebSocket hub
	websocketHub := handlers.NewWebSocketHub(logger)
	go websocketHub.Run()

	// Initialize handlers
	tradingHandler := handlers.NewTradingHandler(
		marketDataService,
		analysisService,
		portfolioService,
		websocketHub,
		logger,
	)

	// Setup Gin router
	router := setupRouter(cfg, logger)
	
	// Setup routes
	tradingHandler.SetupRoutes(router)

	// Start market data streaming service (for demo purposes)
	go startMarketDataStreaming(marketDataService, websocketHub, logger)

	// Start HTTP server
	server := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      router,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	// Graceful shutdown
	go func() {
		logger.WithField("port", cfg.Port).Info("Trading Analysis Service started")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.WithError(err).Fatal("Failed to start server")
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down Trading Analysis Service...")
	
	// Graceful shutdown implementation would go here
	logger.Info("Trading Analysis Service stopped")
}

func setupLogger(cfg *config.Config) *logrus.Logger {
	logger := logrus.New()

	// Set log level
	switch cfg.Logging.Level {
	case "debug":
		logger.SetLevel(logrus.DebugLevel)
	case "info":
		logger.SetLevel(logrus.InfoLevel)
	case "warn":
		logger.SetLevel(logrus.WarnLevel)
	case "error":
		logger.SetLevel(logrus.ErrorLevel)
	default:
		logger.SetLevel(logrus.InfoLevel)
	}

	// Set log format
	if cfg.Logging.Format == "json" {
		logger.SetFormatter(&logrus.JSONFormatter{
			TimestampFormat: time.RFC3339,
		})
	} else {
		logger.SetFormatter(&logrus.TextFormatter{
			FullTimestamp:   true,
			TimestampFormat: time.RFC3339,
		})
	}

	return logger
}

func initializeMarketDataProviders(cfg *config.Config, logger *logrus.Logger) []providers.MarketDataProvider {
	var marketDataProviders []providers.MarketDataProvider

	// Alpha Vantage provider
	if cfg.MarketDataAPIs.AlphaVantageKey != "" {
		alphaVantage := providers.NewAlphaVantageProvider(cfg.MarketDataAPIs.AlphaVantageKey)
		marketDataProviders = append(marketDataProviders, alphaVantage)
		logger.Info("Alpha Vantage provider initialized")
	}

	// Yahoo Finance provider (no API key required)
	yahooFinance := providers.NewYahooFinanceProvider()
	marketDataProviders = append(marketDataProviders, yahooFinance)
	logger.Info("Yahoo Finance provider initialized")

	// IEX Cloud provider
	if cfg.MarketDataAPIs.IEXCloudKey != "" {
		iexCloud := providers.NewIEXCloudProvider(cfg.MarketDataAPIs.IEXCloudKey)
		marketDataProviders = append(marketDataProviders, iexCloud)
		logger.Info("IEX Cloud provider initialized")
	}

	// Mock provider for demo purposes (always available)
	mockProvider := providers.NewMockProvider()
	marketDataProviders = append(marketDataProviders, mockProvider)
	logger.Info("Mock provider initialized")

	if len(marketDataProviders) == 0 {
		logger.Fatal("No market data providers configured")
	}

	logger.WithField("providers", len(marketDataProviders)).Info("Market data providers initialized")
	return marketDataProviders
}

func setupRouter(cfg *config.Config, logger *logrus.Logger) *gin.Engine {
	// Set Gin mode based on environment
	if cfg.IsProduction() {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	router := gin.New()

	// Middleware
	router.Use(gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		return fmt.Sprintf("%s - [%s] \"%s %s %s %d %s \"%s\" %s\"\n",
			param.ClientIP,
			param.TimeStamp.Format(time.RFC1123),
			param.Method,
			param.Path,
			param.Request.Proto,
			param.StatusCode,
			param.Latency,
			param.Request.UserAgent(),
			param.ErrorMessage,
		)
	}))

	router.Use(gin.Recovery())

	// CORS middleware
	router.Use(corsMiddleware(cfg))

	// Rate limiting middleware (basic implementation)
	router.Use(rateLimitMiddleware(cfg))

	// Health check endpoint (global)
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "healthy",
			"service":   "Trading Analysis Service",
			"version":   "1.0.0",
			"timestamp": time.Now(),
		})
	})

	// API version endpoint
	router.GET("/version", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"version":    "1.0.0",
			"go_version": "1.21",
			"build_time": time.Now().Format(time.RFC3339),
		})
	})

	return router
}

func corsMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		
		// Check if origin is allowed
		allowed := false
		for _, allowedOrigin := range cfg.Security.CORSAllowedOrigins {
			if origin == allowedOrigin || allowedOrigin == "*" {
				allowed = true
				break
			}
		}

		if allowed {
			c.Header("Access-Control-Allow-Origin", origin)
		}
		
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		c.Header("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

func rateLimitMiddleware(cfg *config.Config) gin.HandlerFunc {
	// Basic rate limiting implementation
	// In production, use a more sophisticated rate limiter like redis-based
	clients := make(map[string]time.Time)
	
	return func(c *gin.Context) {
		clientIP := c.ClientIP()
		lastRequest, exists := clients[clientIP]
		
		if exists && time.Since(lastRequest) < time.Second {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":   "Rate limit exceeded",
				"message": "Too many requests",
			})
			c.Abort()
			return
		}
		
		clients[clientIP] = time.Now()
		c.Next()
	}
}

// startMarketDataStreaming simulates real-time market data streaming
func startMarketDataStreaming(marketDataService *services.MarketDataService, hub *handlers.WebSocketHub, logger *logrus.Logger) {
	logger.Info("Starting market data streaming service")
	
	// Popular symbols to stream
	symbols := []string{"AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"}
	
	ticker := time.NewTicker(5 * time.Second) // Update every 5 seconds
	defer ticker.Stop()

	broadcaster := handlers.NewMarketDataBroadcaster(hub, logger)

	for {
		select {
		case <-ticker.C:
			// Get subscription stats to see which symbols are being watched
			stats := hub.GetSubscriptionStats()
			
			for _, symbol := range symbols {
				// Only stream data for symbols that have subscribers
				if subscribers, exists := stats[symbol]; !exists || subscribers == 0 {
					continue
				}

				// Get real-time data
				marketData, err := marketDataService.GetRealTimeData(symbol)
				if err != nil {
					logger.WithError(err).WithField("symbol", symbol).Warn("Failed to get market data for streaming")
					continue
				}

				// Broadcast to WebSocket clients
				broadcaster.BroadcastMarketData(marketData)
				
				logger.WithFields(logrus.Fields{
					"symbol":      symbol,
					"price":       marketData.Price,
					"subscribers": subscribers,
				}).Debug("Streamed market data")
			}
		}
	}
}