package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

// TradingData represents market data structure
type TradingData struct {
	Symbol    string  `json:"symbol"`
	Price     float64 `json:"price"`
	Volume    int64   `json:"volume"`
	Timestamp int64   `json:"timestamp"`
	Change    float64 `json:"change"`
	ChangePercent float64 `json:"change_percent"`
}

// AnalysisRequest represents trading analysis request
type AnalysisRequest struct {
	Symbol     string `json:"symbol"`
	TimeFrame  string `json:"time_frame"`
	Indicators []string `json:"indicators"`
}

// AnalysisResponse represents analysis results
type AnalysisResponse struct {
	Symbol      string                 `json:"symbol"`
	Analysis    map[string]interface{} `json:"analysis"`
	Signals     []string              `json:"signals"`
	Risk        string                `json:"risk"`
	Confidence  float64               `json:"confidence"`
	Timestamp   int64                 `json:"timestamp"`
}

// Portfolio represents user portfolio
type Portfolio struct {
	UserID      string           `json:"user_id"`
	Holdings    []Holding        `json:"holdings"`
	TotalValue  float64          `json:"total_value"`
	DayChange   float64          `json:"day_change"`
	Performance PerformanceData  `json:"performance"`
}

type Holding struct {
	Symbol   string  `json:"symbol"`
	Quantity float64 `json:"quantity"`
	AvgPrice float64 `json:"avg_price"`
	Value    float64 `json:"value"`
	PnL      float64 `json:"pnl"`
}

type PerformanceData struct {
	Day   float64 `json:"day"`
	Week  float64 `json:"week"`
	Month float64 `json:"month"`
	Year  float64 `json:"year"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for development
	},
}

// Mock data for demonstration
var mockPrices = map[string]float64{
	"AAPL": 150.25,
	"GOOGL": 2750.80,
	"MSFT": 310.45,
	"TSLA": 850.30,
	"AMZN": 3200.15,
	"NVDA": 220.75,
	"BTC": 45000.00,
	"ETH": 3200.50,
}

func main() {
	r := mux.NewRouter()

	// REST API endpoints
	r.HandleFunc("/health", healthHandler).Methods("GET")
	r.HandleFunc("/api/trading/analyze", analyzeHandler).Methods("POST")
	r.HandleFunc("/api/trading/portfolio/{userId}", portfolioHandler).Methods("GET")
	r.HandleFunc("/api/trading/signals/{symbol}", signalsHandler).Methods("GET")
	r.HandleFunc("/api/trading/prices/{symbol}", priceHandler).Methods("GET")
	
	// WebSocket endpoint for real-time data
	r.HandleFunc("/ws/trading", wsHandler)

	// CORS middleware
	r.Use(corsMiddleware)

	fmt.Println("🚀 Trading Analysis Service starting on port 8001...")
	log.Fatal(http.ListenAndServe(":8001", r))
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		
		next.ServeHTTP(w, r)
	})
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"status":    "healthy",
		"service":   "trading-analysis",
		"timestamp": time.Now().Unix(),
		"version":   "1.0.0",
	}
	json.NewEncoder(w).Encode(response)
}

func analyzeHandler(w http.ResponseWriter, r *http.Request) {
	var req AnalysisRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Simulate AI-powered analysis
	analysis := performTechnicalAnalysis(req.Symbol, req.Indicators)
	
	response := AnalysisResponse{
		Symbol:     req.Symbol,
		Analysis:   analysis,
		Signals:    generateSignals(req.Symbol),
		Risk:       assessRisk(req.Symbol),
		Confidence: calculateConfidence(req.Symbol),
		Timestamp:  time.Now().Unix(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func portfolioHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["userId"]

	// Mock portfolio data
	portfolio := Portfolio{
		UserID: userID,
		Holdings: []Holding{
			{Symbol: "AAPL", Quantity: 10, AvgPrice: 145.0, Value: 1502.5, PnL: 52.5},
			{Symbol: "GOOGL", Quantity: 2, AvgPrice: 2700.0, Value: 5501.6, PnL: 101.6},
			{Symbol: "BTC", Quantity: 0.5, AvgPrice: 42000.0, Value: 22500.0, PnL: 1500.0},
		},
		TotalValue: 29504.1,
		DayChange:  1654.1,
		Performance: PerformanceData{
			Day:   2.5,
			Week:  5.8,
			Month: 12.3,
			Year:  28.7,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(portfolio)
}

func signalsHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	symbol := vars["symbol"]

	signals := generateDetailedSignals(symbol)
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(signals)
}

func priceHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	symbol := vars["symbol"]

	price, exists := mockPrices[symbol]
	if !exists {
		http.Error(w, "Symbol not found", http.StatusNotFound)
		return
	}

	// Add some random variation
	variation := (float64(time.Now().Second()) - 30) * 0.01
	currentPrice := price + variation

	tradingData := TradingData{
		Symbol:        symbol,
		Price:         currentPrice,
		Volume:        int64(1000000 + time.Now().Second()*10000),
		Timestamp:     time.Now().Unix(),
		Change:        variation,
		ChangePercent: (variation / price) * 100,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tradingData)
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}
	defer conn.Close()

	// Send real-time trading data
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			// Send real-time price updates
			for symbol, basePrice := range mockPrices {
				variation := (float64(time.Now().Second()) - 30) * 0.02
				currentPrice := basePrice + variation
				
				data := TradingData{
					Symbol:        symbol,
					Price:         currentPrice,
					Volume:        int64(1000000 + time.Now().Second()*10000),
					Timestamp:     time.Now().Unix(),
					Change:        variation,
					ChangePercent: (variation / basePrice) * 100,
				}
				
				if err := conn.WriteJSON(data); err != nil {
					log.Printf("WebSocket write error: %v", err)
					return
				}
			}
		}
	}
}

// Analysis helper functions
func performTechnicalAnalysis(symbol string, indicators []string) map[string]interface{} {
	analysis := make(map[string]interface{})
	
	for _, indicator := range indicators {
		switch indicator {
		case "RSI":
			analysis["RSI"] = 65.5 + float64(time.Now().Second()%20-10)
		case "MACD":
			analysis["MACD"] = map[string]float64{
				"value": 1.25,
				"signal": 1.18,
				"histogram": 0.07,
			}
		case "SMA_20":
			basePrice := mockPrices[symbol]
			analysis["SMA_20"] = basePrice * 0.98
		case "EMA_12":
			basePrice := mockPrices[symbol]
			analysis["EMA_12"] = basePrice * 1.02
		case "Bollinger":
			basePrice := mockPrices[symbol]
			analysis["Bollinger"] = map[string]float64{
				"upper": basePrice * 1.05,
				"middle": basePrice,
				"lower": basePrice * 0.95,
			}
		}
	}
	
	return analysis
}

func generateSignals(symbol string) []string {
	signals := []string{}
	
	// Mock signal generation logic
	rsi := 65.5 + float64(time.Now().Second()%20-10)
	if rsi > 70 {
		signals = append(signals, "SELL - RSI Overbought")
	} else if rsi < 30 {
		signals = append(signals, "BUY - RSI Oversold")
	}
	
	if time.Now().Second()%3 == 0 {
		signals = append(signals, "BUY - Golden Cross Detected")
	}
	
	if len(signals) == 0 {
		signals = append(signals, "HOLD - No strong signals")
	}
	
	return signals
}

func generateDetailedSignals(symbol string) map[string]interface{} {
	return map[string]interface{}{
		"symbol": symbol,
		"signals": []map[string]interface{}{
			{
				"type": "technical",
				"signal": "BUY",
				"strength": "STRONG",
				"reason": "Golden Cross - 50 MA crossed above 200 MA",
				"confidence": 0.85,
				"timeframe": "1D",
			},
			{
				"type": "momentum",
				"signal": "HOLD",
				"strength": "WEAK",
				"reason": "RSI in neutral zone (45-55)",
				"confidence": 0.60,
				"timeframe": "4H",
			},
		},
		"overall_sentiment": "BULLISH",
		"risk_level": "MEDIUM",
		"target_price": mockPrices[symbol] * 1.15,
		"stop_loss": mockPrices[symbol] * 0.92,
		"timestamp": time.Now().Unix(),
	}
}

func assessRisk(symbol string) string {
	risks := []string{"LOW", "MEDIUM", "HIGH"}
	return risks[time.Now().Second()%3]
}

func calculateConfidence(symbol string) float64 {
	return 0.6 + float64(time.Now().Second()%40)/100.0
}