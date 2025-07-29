package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
	"trading-service/internal/config"
	"trading-service/internal/handlers"
	"trading-service/internal/providers"
	"trading-service/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		logrus.WithError(err).Fatal("Failed to load configuration")
	}

	// Setup logger
	logger := setupLogger(cfg)
	logger.Info("Starting Trading Analysis Service")

	// Setup market data providers
	providers := setupProviders(cfg, logger)
	if len(providers) == 0 {
		logger.Fatal("No market data providers configured")
	}

	// Setup services
	marketDataService := services.NewMarketDataService(providers, logger)
	analysisService := services.NewAnalysisService(logger)
	portfolioService := services.NewPortfolioService(logger)

	// Setup WebSocket hub
	wsHub := handlers.NewWebSocketHub(logger)
	go wsHub.Run()
	
	// Start market data streaming
	wsHub.StartMarketDataStream()

	// Setup handlers
	tradingHandler := handlers.NewTradingHandler(
		marketDataService,
		analysisService,
		portfolioService,
		wsHub,
		logger,
	)

	// Setup HTTP server
	server := setupServer(cfg, tradingHandler, logger)

	// Start server in a goroutine
	go func() {
		logger.WithField("port", cfg.Server.Port).Info("Starting HTTP server")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.WithError(err).Fatal("Failed to start server")
		}
	}()

	// Wait for interrupt signal to gracefully shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down server...")

	// Give outstanding requests 30 seconds to complete
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		logger.WithError(err).Error("Server forced to shutdown")
	} else {
		logger.Info("Server shutdown complete")
	}
}

func setupLogger(cfg *config.Config) *logrus.Logger {
	logger := logrus.New()
	
	// Set log level
	level, err := logrus.ParseLevel(cfg.Logging.Level)
	if err != nil {
		level = logrus.InfoLevel
	}
	logger.SetLevel(level)

	// Set formatter
	if cfg.Logging.Format == "json" {
		logger.SetFormatter(&logrus.JSONFormatter{})
	} else {
		logger.SetFormatter(&logrus.TextFormatter{
			FullTimestamp: true,
		})
	}

	// Set output
	if cfg.Logging.Output == "file" && cfg.Logging.FilePath != "" {
		file, err := os.OpenFile(cfg.Logging.FilePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
		if err != nil {
			logger.WithError(err).Warn("Failed to open log file, using stdout")
		} else {
			logger.SetOutput(file)
		}
	}

	return logger
}

func setupProviders(cfg *config.Config, logger *logrus.Logger) []providers.MarketDataProvider {
	var providerList []providers.MarketDataProvider

	// Alpha Vantage provider
	if cfg.AlphaVantage.APIKey != "" {
		provider := providers.NewAlphaVantageProvider(cfg.AlphaVantage.APIKey, logger)
		providerList = append(providerList, provider)
		logger.Info("Alpha Vantage provider configured")
	}

	// Yahoo Finance provider (no API key required)
	yahooProvider := providers.NewYahooFinanceProvider(logger)
	providerList = append(providerList, yahooProvider)
	logger.Info("Yahoo Finance provider configured")

	// IEX Cloud provider
	if cfg.IEXCloud.APIKey != "" {
		provider := providers.NewIEXCloudProvider(cfg.IEXCloud.APIKey, cfg.IEXCloud.BaseURL, logger)
		providerList = append(providerList, provider)
		logger.Info("IEX Cloud provider configured")
	}

	// Mock provider (always available for testing)
	mockProvider := providers.NewMockProvider(logger)
	providerList = append(providerList, mockProvider)
	logger.Info("Mock provider configured")

	return providerList
}

func setupServer(cfg *config.Config, tradingHandler *handlers.TradingHandler, logger *logrus.Logger) *http.Server {
	// Set Gin mode
	if cfg.Server.Mode == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Create router
	router := gin.New()

	// Add middleware
	router.Use(gin.Recovery())
	router.Use(corsMiddleware())
	router.Use(loggingMiddleware(logger))
	
	if cfg.Security.RateLimit.Enabled {
		router.Use(rateLimitMiddleware(cfg))
	}

	// Setup routes
	tradingHandler.SetupRoutes(router)

	// Create server
	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.Server.Port),
		Handler:      router,
		ReadTimeout:  time.Duration(cfg.Server.ReadTimeout) * time.Second,
		WriteTimeout: time.Duration(cfg.Server.WriteTimeout) * time.Second,
		IdleTimeout:  time.Duration(cfg.Server.IdleTimeout) * time.Second,
	}

	return server
}

// corsMiddleware handles CORS headers
func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Header("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

// loggingMiddleware logs HTTP requests
func loggingMiddleware(logger *logrus.Logger) gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		logger.WithFields(logrus.Fields{
			"status":     param.StatusCode,
			"method":     param.Method,
			"path":       param.Path,
			"ip":         param.ClientIP,
			"latency":    param.Latency,
			"user_agent": param.Request.UserAgent(),
		}).Info("HTTP Request")
		return ""
	})
}

// rateLimitMiddleware implements basic rate limiting
func rateLimitMiddleware(cfg *config.Config) gin.HandlerFunc {
	// This is a simplified rate limiter
	// In production, use a proper rate limiting library like golang.org/x/time/rate
	
	requests := make(map[string][]time.Time)
	
	return func(c *gin.Context) {
		clientIP := c.ClientIP()
		now := time.Now()
		
		// Clean old requests (older than 1 minute)
		if clientRequests, exists := requests[clientIP]; exists {
			var validRequests []time.Time
			for _, reqTime := range clientRequests {
				if now.Sub(reqTime) < time.Minute {
					validRequests = append(validRequests, reqTime)
				}
			}
			requests[clientIP] = validRequests
		}
		
		// Check rate limit
		if len(requests[clientIP]) >= cfg.Security.RateLimit.RequestsPerMinute {
			c.JSON(429, gin.H{
				"error":   "Rate limit exceeded",
				"message": "Too many requests. Please try again later.",
			})
			c.Abort()
			return
		}
		
		// Add current request
		requests[clientIP] = append(requests[clientIP], now)
		
		c.Next()
	}
}