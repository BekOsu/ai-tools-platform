-- Initialize databases for AI Tools Platform

-- Main application database (already created as ai_tools_db)

-- Create additional databases for services
CREATE DATABASE trading_db;
CREATE DATABASE resume_db;
CREATE DATABASE analytics_db;

-- Create users for different services
CREATE USER trading_user WITH PASSWORD 'trading_pass';
CREATE USER resume_user WITH PASSWORD 'resume_pass';
CREATE USER analytics_user WITH PASSWORD 'analytics_pass';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE trading_db TO trading_user;
GRANT ALL PRIVILEGES ON DATABASE resume_db TO resume_user;
GRANT ALL PRIVILEGES ON DATABASE analytics_db TO analytics_user;

-- Grant general access to main database
GRANT ALL PRIVILEGES ON DATABASE ai_tools_db TO trading_user;
GRANT ALL PRIVILEGES ON DATABASE ai_tools_db TO resume_user;
GRANT ALL PRIVILEGES ON DATABASE ai_tools_db TO analytics_user;

-- Connect to trading database and create tables
\c trading_db;

-- Market data table
CREATE TABLE IF NOT EXISTS market_data (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL,
    price DECIMAL(15,4) NOT NULL,
    volume BIGINT DEFAULT 0,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    source VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historical data table
CREATE TABLE IF NOT EXISTS historical_data (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL,
    date DATE NOT NULL,
    open_price DECIMAL(15,4) NOT NULL,
    high_price DECIMAL(15,4) NOT NULL,
    low_price DECIMAL(15,4) NOT NULL,
    close_price DECIMAL(15,4) NOT NULL,
    volume BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(symbol, date)
);

-- Trading signals table
CREATE TABLE IF NOT EXISTS trading_signals (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL,
    signal_type VARCHAR(20) NOT NULL, -- BUY, SELL, HOLD
    algorithm VARCHAR(50) NOT NULL,
    confidence DECIMAL(5,4) DEFAULT 0.0,
    price DECIMAL(15,4),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_market_data_symbol ON market_data(symbol);
CREATE INDEX IF NOT EXISTS idx_market_data_timestamp ON market_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_historical_data_symbol_date ON historical_data(symbol, date);
CREATE INDEX IF NOT EXISTS idx_trading_signals_symbol ON trading_signals(symbol);
CREATE INDEX IF NOT EXISTS idx_trading_signals_timestamp ON trading_signals(timestamp);

-- Connect to resume database
\c resume_db;

-- Resume templates table
CREATE TABLE IF NOT EXISTS resume_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    template_data JSONB NOT NULL,
    preview_image TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User resumes table
CREATE TABLE IF NOT EXISTS user_resumes (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    template_id INTEGER REFERENCES resume_templates(id),
    resume_data JSONB NOT NULL,
    title VARCHAR(200),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_resumes_user_id ON user_resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_resumes_template_id ON user_resumes(template_id);

-- Connect to analytics database
\c analytics_db;

-- API usage analytics
CREATE TABLE IF NOT EXISTS api_usage (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100),
    service_name VARCHAR(50) NOT NULL,
    endpoint VARCHAR(200) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    request_size INTEGER DEFAULT 0,
    response_size INTEGER DEFAULT 0
);

-- Service health metrics
CREATE TABLE IF NOT EXISTS service_health (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL, -- UP, DOWN, DEGRADED
    cpu_usage DECIMAL(5,2),
    memory_usage DECIMAL(5,2),
    response_time_avg DECIMAL(10,2),
    error_rate DECIMAL(5,4),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_service ON api_usage(service_name);
CREATE INDEX IF NOT EXISTS idx_api_usage_timestamp ON api_usage(timestamp);
CREATE INDEX IF NOT EXISTS idx_service_health_service ON service_health(service_name);
CREATE INDEX IF NOT EXISTS idx_service_health_timestamp ON service_health(timestamp);