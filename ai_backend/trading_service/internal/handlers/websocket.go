package handlers

import (
	"encoding/json"
	"time"
	"trading-service/internal/models"
	"github.com/gorilla/websocket"
	"github.com/sirupsen/logrus"
)

// WebSocketHub manages all WebSocket connections
type WebSocketHub struct {
	clients    map[*WebSocketClient]bool
	register   chan *WebSocketClient
	unregister chan *WebSocketClient
	broadcast  chan []byte
	logger     *logrus.Logger
}

// WebSocketClient represents a WebSocket client connection
type WebSocketClient struct {
	conn         *websocket.Conn
	send         chan []byte
	hub          *WebSocketHub
	subscriptions map[string]bool // symbol subscriptions
	logger       *logrus.Logger
}

// NewWebSocketHub creates a new WebSocket hub
func NewWebSocketHub(logger *logrus.Logger) *WebSocketHub {
	return &WebSocketHub{
		clients:    make(map[*WebSocketClient]bool),
		register:   make(chan *WebSocketClient),
		unregister: make(chan *WebSocketClient),
		broadcast:  make(chan []byte),
		logger:     logger,
	}
}

// Run starts the WebSocket hub
func (h *WebSocketHub) Run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
			h.logger.WithField("clients_count", len(h.clients)).Info("Client registered")
			
			// Send welcome message
			welcome := models.WebSocketMessage{
				Type:      "welcome",
				Data:      map[string]interface{}{"message": "Connected to Trading Service"},
				Timestamp: time.Now(),
			}
			if data, err := json.Marshal(welcome); err == nil {
				select {
				case client.send <- data:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}

		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				h.logger.WithField("clients_count", len(h.clients)).Info("Client unregistered")
			}

		case message := <-h.broadcast:
			// Broadcast message to all clients
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}

// BroadcastMarketData sends market data to subscribed clients
func (h *WebSocketHub) BroadcastMarketData(symbol string, data interface{}) {
	message := models.WebSocketMessage{
		Type:      "market_data",
		Symbol:    symbol,
		Data:      data,
		Timestamp: time.Now(),
	}

	messageData, err := json.Marshal(message)
	if err != nil {
		h.logger.WithError(err).Error("Failed to marshal market data")
		return
	}

	// Send to clients subscribed to this symbol
	for client := range h.clients {
		if client.subscriptions[symbol] || client.subscriptions["*"] {
			select {
			case client.send <- messageData:
			default:
				close(client.send)
				delete(h.clients, client)
			}
		}
	}
}

// BroadcastSignal sends trading signals to all clients
func (h *WebSocketHub) BroadcastSignal(signal *models.TradingSignal) {
	message := models.WebSocketMessage{
		Type:      "trading_signal",
		Symbol:    signal.Symbol,
		Data:      signal,
		Timestamp: time.Now(),
	}

	messageData, err := json.Marshal(message)
	if err != nil {
		h.logger.WithError(err).Error("Failed to marshal trading signal")
		return
	}

	h.broadcast <- messageData
}

// BroadcastAlert sends alerts to all clients
func (h *WebSocketHub) BroadcastAlert(alert *models.Alert) {
	message := models.WebSocketMessage{
		Type:      "alert",
		Symbol:    alert.Symbol,
		Data:      alert,
		Timestamp: time.Now(),
	}

	messageData, err := json.Marshal(message)
	if err != nil {
		h.logger.WithError(err).Error("Failed to marshal alert")
		return
	}

	h.broadcast <- messageData
}

// GetClientsCount returns the number of connected clients
func (h *WebSocketHub) GetClientsCount() int {
	return len(h.clients)
}

// readPump pumps messages from the websocket connection to the hub
func (c *WebSocketClient) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	// Set read limits and timeouts
	c.conn.SetReadLimit(512)
	c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, messageData, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				c.logger.WithError(err).Error("WebSocket error")
			}
			break
		}

		// Parse incoming message
		var message models.WebSocketMessage
		if err := json.Unmarshal(messageData, &message); err != nil {
			c.logger.WithError(err).Error("Failed to parse WebSocket message")
			c.sendError("Invalid message format")
			continue
		}

		// Handle message based on type
		c.handleMessage(&message)
	}
}

// writePump pumps messages from the hub to the websocket connection
func (c *WebSocketClient) writePump() {
	ticker := time.NewTicker(54 * time.Second)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued messages to the current message
			n := len(c.send)
			for i := 0; i < n; i++ {
				w.Write([]byte{'\n'})
				w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// handleMessage processes incoming WebSocket messages
func (c *WebSocketClient) handleMessage(message *models.WebSocketMessage) {
	if c.subscriptions == nil {
		c.subscriptions = make(map[string]bool)
	}

	switch message.Type {
	case "subscribe":
		symbol := message.Symbol
		if symbol == "" {
			c.sendError("Symbol is required for subscription")
			return
		}

		c.subscriptions[symbol] = true
		c.logger.WithField("symbol", symbol).Info("Client subscribed to symbol")
		
		// Send confirmation
		response := models.WebSocketMessage{
			Type:      "subscription_confirmed",
			Symbol:    symbol,
			Data:      map[string]interface{}{"status": "subscribed"},
			Timestamp: time.Now(),
		}
		c.sendMessage(&response)

	case "unsubscribe":
		symbol := message.Symbol
		if symbol == "" {
			c.sendError("Symbol is required for unsubscription")
			return
		}

		delete(c.subscriptions, symbol)
		c.logger.WithField("symbol", symbol).Info("Client unsubscribed from symbol")
		
		// Send confirmation
		response := models.WebSocketMessage{
			Type:      "unsubscription_confirmed",
			Symbol:    symbol,
			Data:      map[string]interface{}{"status": "unsubscribed"},
			Timestamp: time.Now(),
		}
		c.sendMessage(&response)

	case "ping":
		// Respond with pong
		response := models.WebSocketMessage{
			Type:      "pong",
			Data:      map[string]interface{}{"timestamp": time.Now().Unix()},
			Timestamp: time.Now(),
		}
		c.sendMessage(&response)

	case "get_subscriptions":
		// Return current subscriptions
		subscriptions := make([]string, 0, len(c.subscriptions))
		for symbol := range c.subscriptions {
			subscriptions = append(subscriptions, symbol)
		}
		
		response := models.WebSocketMessage{
			Type:      "subscriptions",
			Data:      map[string]interface{}{"symbols": subscriptions},
			Timestamp: time.Now(),
		}
		c.sendMessage(&response)

	default:
		c.sendError("Unknown message type: " + message.Type)
	}
}

// sendMessage sends a message to the client
func (c *WebSocketClient) sendMessage(message *models.WebSocketMessage) {
	data, err := json.Marshal(message)
	if err != nil {
		c.logger.WithError(err).Error("Failed to marshal message")
		return
	}

	select {
	case c.send <- data:
	default:
		c.logger.Warn("Client send channel is full, dropping message")
	}
}

// sendError sends an error message to the client
func (c *WebSocketClient) sendError(errorMsg string) {
	message := models.WebSocketMessage{
		Type:      "error",
		Data:      map[string]interface{}{"message": errorMsg},
		Timestamp: time.Now(),
	}
	c.sendMessage(&message)
}

// StartMarketDataStream simulates real-time market data streaming
func (h *WebSocketHub) StartMarketDataStream() {
	// This would typically connect to real market data feeds
	// For demo purposes, we'll simulate data
	
	symbols := []string{"AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"}
	
	go func() {
		ticker := time.NewTicker(5 * time.Second) // Update every 5 seconds
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				for _, symbol := range symbols {
					// Generate mock market data
					mockData := generateMockMarketData(symbol)
					h.BroadcastMarketData(symbol, mockData)
				}
			}
		}
	}()
}

// generateMockMarketData creates mock market data for testing
func generateMockMarketData(symbol string) *models.MarketData {
	// This is simplified mock data
	// In reality, you'd get this from market data providers
	
	basePrices := map[string]float64{
		"AAPL":  155.50,
		"GOOGL": 2525.30,
		"MSFT":  295.80,
		"AMZN":  3285.40,
		"TSLA":  745.20,
	}

	basePrice := basePrices[symbol]
	if basePrice == 0 {
		basePrice = 100.0
	}

	// Add some random variation (±2%)
	variation := (float64(time.Now().Unix()%100) - 50) * 0.02 * basePrice / 100
	currentPrice := basePrice + variation

	return &models.MarketData{
		Symbol:        symbol,
		Price:         decimal.NewFromFloat(currentPrice),
		Volume:        int64(time.Now().Unix() % 1000000),
		Timestamp:     time.Now(),
		Change:        decimal.NewFromFloat(variation),
		ChangePercent: decimal.NewFromFloat(variation / basePrice * 100),
		High:          decimal.NewFromFloat(currentPrice * 1.02),
		Low:           decimal.NewFromFloat(currentPrice * 0.98),
		Open:          decimal.NewFromFloat(basePrice),
		Source:        "mock_provider",
	}
}