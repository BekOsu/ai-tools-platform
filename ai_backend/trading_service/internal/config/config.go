package config

import (
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
)

type Config struct {
	// Server Configuration
	Port string
	Env  string

	// Database Configuration
	Database DatabaseConfig

	// Redis Configuration
	Redis RedisConfig

	// Market Data APIs
	MarketDataAPIs MarketDataAPIConfig

	// Trading Configuration
	Trading TradingConfig

	// Security
	Security SecurityConfig

	// Logging
	Logging LoggingConfig

	// Performance
	Performance PerformanceConfig
}

type DatabaseConfig struct {
	Host     string
	Port     string
	Database string
	User     string
	Password string
	SSLMode  string
	MaxConns int
	MinConns int
}

type RedisConfig struct {
	Host     string
	Port     string
	Password string
	DB       int
}

type MarketDataAPIConfig struct {
	AlphaVantageKey string
	YahooFinanceKey string
	IEXCloudKey     string
	FinnhubKey      string
}

type TradingConfig struct {
	MaxConnections     int
	WebSocketBufferSize int
	RateLimitRequests  int
	RateLimitWindow    int
}

type SecurityConfig struct {
	JWTSecret           string
	CORSAllowedOrigins  []string
}

type LoggingConfig struct {
	Level  string
	Format string
}

type PerformanceConfig struct {
	WorkerPoolSize         int
	MaxConcurrentRequests  int
	RequestTimeout         time.Duration
}

// LoadConfig loads configuration from environment variables
func LoadConfig() (*Config, error) {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		logrus.Warning("No .env file found, using environment variables")
	}

	config := &Config{
		Port: getEnv("PORT", "8001"),
		Env:  getEnv("ENV", "development"),

		Database: DatabaseConfig{
			Host:     getEnv("POSTGRES_HOST", "localhost"),
			Port:     getEnv("POSTGRES_PORT", "5432"),
			Database: getEnv("POSTGRES_DB", "trading_db"),
			User:     getEnv("POSTGRES_USER", "trading_user"),
			Password: getEnv("POSTGRES_PASSWORD", ""),
			SSLMode:  getEnv("POSTGRES_SSL_MODE", "disable"),
			MaxConns: getEnvAsInt("POSTGRES_MAX_CONNS", 25),
			MinConns: getEnvAsInt("POSTGRES_MIN_CONNS", 5),
		},

		Redis: RedisConfig{
			Host:     getEnv("REDIS_HOST", "localhost"),
			Port:     getEnv("REDIS_PORT", "6379"),
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       getEnvAsInt("REDIS_DB", 0),
		},

		MarketDataAPIs: MarketDataAPIConfig{
			AlphaVantageKey: getEnv("ALPHA_VANTAGE_API_KEY", ""),
			YahooFinanceKey: getEnv("YAHOO_FINANCE_API_KEY", ""),
			IEXCloudKey:     getEnv("IEX_CLOUD_API_KEY", ""),
			FinnhubKey:      getEnv("FINNHUB_API_KEY", ""),
		},

		Trading: TradingConfig{
			MaxConnections:      getEnvAsInt("MAX_CONNECTIONS", 1000),
			WebSocketBufferSize: getEnvAsInt("WEBSOCKET_BUFFER_SIZE", 1024),
			RateLimitRequests:   getEnvAsInt("RATE_LIMIT_REQUESTS", 100),
			RateLimitWindow:     getEnvAsInt("RATE_LIMIT_WINDOW", 60),
		},

		Security: SecurityConfig{
			JWTSecret:          getEnv("JWT_SECRET", "your-secret-key"),
			CORSAllowedOrigins: getEnvAsSlice("CORS_ALLOWED_ORIGINS", []string{"http://localhost:3000"}),
		},

		Logging: LoggingConfig{
			Level:  getEnv("LOG_LEVEL", "info"),
			Format: getEnv("LOG_FORMAT", "json"),
		},

		Performance: PerformanceConfig{
			WorkerPoolSize:        getEnvAsInt("WORKER_POOL_SIZE", 50),
			MaxConcurrentRequests: getEnvAsInt("MAX_CONCURRENT_REQUESTS", 100),
			RequestTimeout:        getEnvAsDuration("REQUEST_TIMEOUT", 30*time.Second),
		},
	}

	return config, nil
}

// Helper functions
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvAsSlice(key string, defaultValue []string) []string {
	if value := os.Getenv(key); value != "" {
		// Simple comma-separated parsing
		var result []string
		for _, v := range []string{value} {
			if v != "" {
				result = append(result, v)
			}
		}
		return result
	}
	return defaultValue
}

func getEnvAsDuration(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	return defaultValue
}

// IsProduction returns true if running in production environment
func (c *Config) IsProduction() bool {
	return c.Env == "production"
}

// IsDevelopment returns true if running in development environment
func (c *Config) IsDevelopment() bool {
	return c.Env == "development"
}

// GetDatabaseURL returns the complete database connection URL
func (c *Config) GetDatabaseURL() string {
	return "postgres://" + c.Database.User + ":" + c.Database.Password + 
		   "@" + c.Database.Host + ":" + c.Database.Port + "/" + c.Database.Database + 
		   "?sslmode=" + c.Database.SSLMode
}

// GetRedisURL returns the complete Redis connection URL
func (c *Config) GetRedisURL() string {
	if c.Redis.Password != "" {
		return "redis://:" + c.Redis.Password + "@" + c.Redis.Host + ":" + c.Redis.Port + "/" + strconv.Itoa(c.Redis.DB)
	}
	return "redis://" + c.Redis.Host + ":" + c.Redis.Port + "/" + strconv.Itoa(c.Redis.DB)
}