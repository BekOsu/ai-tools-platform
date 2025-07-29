package handlers

import (
	"encoding/json"
	"time"
	"github.com/gorilla/websocket"
	"github.com/sirupsen/logrus"
	"trading-service/internal/models"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

// WebSocketClient represents a WebSocket client connection
type WebSocketClient struct {
	// The WebSocket connection
	conn *websocket.Conn

	// Buffered channel of outbound messages
	send chan []byte

	// Reference to the hub
	hub *WebSocketHub

	// Subscribed symbols
	subscriptions map[string]bool

	// Client ID
	id string

	// Logger
	logger *logrus.Logger
}

// WebSocketHub maintains the set of active clients and broadcasts messages to the clients
type WebSocketHub struct {
	// Registered clients
	clients map[*WebSocketClient]bool

	// Inbound messages from the clients
	broadcast chan []byte

	// Register requests from the clients
	register chan *WebSocketClient

	// Unregister requests from clients
	unregister chan *WebSocketClient

	// Symbol subscriptions
	subscriptions map[string]map[*WebSocketClient]bool

	// Logger
	logger *logrus.Logger
}

// NewWebSocketHub creates a new WebSocket hub
func NewWebSocketHub(logger *logrus.Logger) *WebSocketHub {
	return &WebSocketHub{
		broadcast:     make(chan []byte),
		register:      make(chan *WebSocketClient),
		unregister:    make(chan *WebSocketClient),
		clients:       make(map[*WebSocketClient]bool),
		subscriptions: make(map[string]map[*WebSocketClient]bool),
		logger:        logger,
	}
}

// Run starts the WebSocket hub
func (hub *WebSocketHub) Run() {
	for {
		select {
		case client := <-hub.register:
			hub.clients[client] = true
			client.subscriptions = make(map[string]bool)
			hub.logger.WithField("client_id", client.id).Info("Client registered")
			
			// Send welcome message
			welcomeMsg := models.WebSocketMessage{
				Type:      "connected",
				Data:      "Welcome to Trading Analysis Service WebSocket",
				Timestamp: time.Now(),
			}
			
			if data, err := json.Marshal(welcomeMsg); err == nil {
				select {
				case client.send <- data:
				default:
					close(client.send)
					delete(hub.clients, client)
				}
			}

		case client := <-hub.unregister:
			if _, ok := hub.clients[client]; ok {
				delete(hub.clients, client)
				close(client.send)
				
				// Remove from all symbol subscriptions
				for symbol := range client.subscriptions {
					if clients, exists := hub.subscriptions[symbol]; exists {
						delete(clients, client)
						if len(clients) == 0 {
							delete(hub.subscriptions, symbol)
						}
					}
				}
				
				hub.logger.WithField("client_id", client.id).Info("Client unregistered")
			}

		case message := <-hub.broadcast:
			// Broadcast message to all clients
			for client := range hub.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(hub.clients, client)
				}
			}
		}
	}
}

// BroadcastToSymbol broadcasts a message to all clients subscribed to a specific symbol
func (hub *WebSocketHub) BroadcastToSymbol(symbol string, message []byte) {
	if clients, exists := hub.subscriptions[symbol]; exists {
		for client := range clients {
			select {
			case client.send <- message:
			default:
				close(client.send)
				delete(hub.clients, client)
				delete(clients, client)
			}
		}
	}
}

// SubscribeToSymbol subscribes a client to a symbol
func (hub *WebSocketHub) SubscribeToSymbol(client *WebSocketClient, symbol string) {
	if _, exists := hub.subscriptions[symbol]; !exists {
		hub.subscriptions[symbol] = make(map[*WebSocketClient]bool)
	}
	
	hub.subscriptions[symbol][client] = true
	client.subscriptions[symbol] = true
	
	hub.logger.WithFields(logrus.Fields{
		"client_id": client.id,
		"symbol":    symbol,
	}).Info("Client subscribed to symbol")
}

// UnsubscribeFromSymbol unsubscribes a client from a symbol
func (hub *WebSocketHub) UnsubscribeFromSymbol(client *WebSocketClient, symbol string) {
	if clients, exists := hub.subscriptions[symbol]; exists {
		delete(clients, client)
		if len(clients) == 0 {
			delete(hub.subscriptions, symbol)
		}
	}
	
	delete(client.subscriptions, symbol)
	
	hub.logger.WithFields(logrus.Fields{
		"client_id": client.id,
		"symbol":    symbol,
	}).Info("Client unsubscribed from symbol")
}

// readPump pumps messages from the WebSocket connection to the hub
func (client *WebSocketClient) readPump() {
	defer func() {
		client.hub.unregister <- client
		client.conn.Close()
	}()

	client.conn.SetReadLimit(maxMessageSize)
	client.conn.SetReadDeadline(time.Now().Add(pongWait))
	client.conn.SetPongHandler(func(string) error {
		client.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, messageBytes, err := client.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				client.logger.WithError(err).Error("WebSocket error")
			}
			break
		}

		// Parse incoming message
		var msg models.WebSocketMessage
		if err := json.Unmarshal(messageBytes, &msg); err != nil {
			client.logger.WithError(err).Error("Failed to parse WebSocket message")
			continue
		}

		// Handle different message types
		client.handleMessage(&msg)
	}
}

// writePump pumps messages from the hub to the WebSocket connection
func (client *WebSocketClient) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		client.conn.Close()
	}()

	for {
		select {
		case message, ok := <-client.send:
			client.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				client.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := client.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued messages to the current WebSocket message
			n := len(client.send)
			for i := 0; i < n; i++ {
				w.Write([]byte{'\n'})
				w.Write(<-client.send)
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			client.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := client.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// handleMessage processes incoming WebSocket messages
func (client *WebSocketClient) handleMessage(msg *models.WebSocketMessage) {
	switch msg.Type {
	case "subscribe":
		if symbol, ok := msg.Data.(string); ok {
			client.hub.SubscribeToSymbol(client, symbol)
			
			// Send subscription confirmation
			response := models.WebSocketMessage{
				Type:      "subscription_confirmed",
				Symbol:    symbol,
				Data:      "Subscribed to " + symbol,
				Timestamp: time.Now(),
				RequestID: msg.RequestID,
			}
			client.sendMessage(response)
		}

	case "unsubscribe":
		if symbol, ok := msg.Data.(string); ok {
			client.hub.UnsubscribeFromSymbol(client, symbol)
			
			// Send unsubscription confirmation
			response := models.WebSocketMessage{
				Type:      "unsubscription_confirmed",
				Symbol:    symbol,
				Data:      "Unsubscribed from " + symbol,
				Timestamp: time.Now(),
				RequestID: msg.RequestID,
			}
			client.sendMessage(response)
		}

	case "ping":
		// Send pong response
		response := models.WebSocketMessage{
			Type:      "pong",
			Data:      "pong",
			Timestamp: time.Now(),
			RequestID: msg.RequestID,
		}
		client.sendMessage(response)

	case "get_subscriptions":
		// Send current subscriptions
		var symbols []string
		for symbol := range client.subscriptions {
			symbols = append(symbols, symbol)
		}
		
		response := models.WebSocketMessage{
			Type:      "subscriptions",
			Data:      symbols,
			Timestamp: time.Now(),
			RequestID: msg.RequestID,
		}
		client.sendMessage(response)

	default:
		// Send error for unknown message type
		response := models.WebSocketMessage{
			Type:      "error",
			Data:      "Unknown message type: " + msg.Type,
			Timestamp: time.Now(),
			RequestID: msg.RequestID,
		}
		client.sendMessage(response)
	}
}

// sendMessage sends a message to the client
func (client *WebSocketClient) sendMessage(msg models.WebSocketMessage) {
	if data, err := json.Marshal(msg); err == nil {
		select {
		case client.send <- data:
		default:
			close(client.send)
		}
	}
}

// MarketDataBroadcaster handles broadcasting market data to WebSocket clients
type MarketDataBroadcaster struct {
	hub    *WebSocketHub
	logger *logrus.Logger
}

// NewMarketDataBroadcaster creates a new market data broadcaster
func NewMarketDataBroadcaster(hub *WebSocketHub, logger *logrus.Logger) *MarketDataBroadcaster {
	return &MarketDataBroadcaster{
		hub:    hub,
		logger: logger,
	}
}

// BroadcastMarketData broadcasts market data to subscribed clients
func (broadcaster *MarketDataBroadcaster) BroadcastMarketData(marketData *models.MarketData) {
	message := models.WebSocketMessage{
		Type:      "market_data",
		Symbol:    marketData.Symbol,
		Data:      marketData,
		Timestamp: time.Now(),
	}

	if data, err := json.Marshal(message); err == nil {
		broadcaster.hub.BroadcastToSymbol(marketData.Symbol, data)
	} else {
		broadcaster.logger.WithError(err).Error("Failed to marshal market data for broadcast")
	}
}

// BroadcastTradingSignal broadcasts a trading signal to subscribed clients
func (broadcaster *MarketDataBroadcaster) BroadcastTradingSignal(signal *models.TradingSignal) {
	message := models.WebSocketMessage{
		Type:      "trading_signal",
		Symbol:    signal.Symbol,
		Data:      signal,
		Timestamp: time.Now(),
	}

	if data, err := json.Marshal(message); err == nil {
		broadcaster.hub.BroadcastToSymbol(signal.Symbol, data)
	} else {
		broadcaster.logger.WithError(err).Error("Failed to marshal trading signal for broadcast")
	}
}

// BroadcastPriceAlert broadcasts a price alert to subscribed clients
func (broadcaster *MarketDataBroadcaster) BroadcastPriceAlert(alert *models.Alert) {
	message := models.WebSocketMessage{
		Type:      "price_alert",
		Symbol:    alert.Symbol,
		Data:      alert,
		Timestamp: time.Now(),
	}

	if data, err := json.Marshal(message); err == nil {
		broadcaster.hub.BroadcastToSymbol(alert.Symbol, data)
	} else {
		broadcaster.logger.WithError(err).Error("Failed to marshal price alert for broadcast")
	}
}

// GetConnectedClientsCount returns the number of connected clients
func (hub *WebSocketHub) GetConnectedClientsCount() int {
	return len(hub.clients)
}

// GetSubscriptionStats returns subscription statistics
func (hub *WebSocketHub) GetSubscriptionStats() map[string]int {
	stats := make(map[string]int)
	for symbol, clients := range hub.subscriptions {
		stats[symbol] = len(clients)
	}
	return stats
}