package services

import (
	"fmt"
	"trading-service/internal/models"
	"github.com/shopspring/decimal"
	"github.com/sirupsen/logrus"
)

type PortfolioService struct {
	logger *logrus.Logger
}

func NewPortfolioService(logger *logrus.Logger) *PortfolioService {
	return &PortfolioService{
		logger: logger,
	}
}

func (s *PortfolioService) GetPortfolio(portfolioID string) (*models.Portfolio, error) {
	// In a real implementation, this would fetch from database
	// For demo purposes, return a mock portfolio
	
	if portfolioID == "" {
		return nil, fmt.Errorf("portfolio ID cannot be empty")
	}

	// Mock portfolio data
	portfolio := &models.Portfolio{
		ID:           portfolioID,
		UserID:       "user_123",
		Name:         "Growth Portfolio",
		Cash:         decimal.NewFromFloat(25000.00),
		TotalValue:   decimal.NewFromFloat(125000.00),
		TotalReturn:  decimal.NewFromFloat(25000.00),
		ReturnPercent: decimal.NewFromFloat(25.0),
		Beta:         decimal.NewFromFloat(1.15),
		Sharpe:       decimal.NewFromFloat(1.85),
		MaxDrawdown:  decimal.NewFromFloat(-8.5),
	}

	return portfolio, nil
}

func (s *PortfolioService) CreatePortfolio(userID, name string, initialCash decimal.Decimal) (*models.Portfolio, error) {
	if userID == "" {
		return nil, fmt.Errorf("user ID cannot be empty")
	}
	
	if name == "" {
		return nil, fmt.Errorf("portfolio name cannot be empty")
	}

	if initialCash.LessThan(decimal.Zero) {
		return nil, fmt.Errorf("initial cash cannot be negative")
	}

	// In a real implementation, this would create in database
	portfolio := &models.Portfolio{
		ID:           fmt.Sprintf("portfolio_%d", GenerateID()),
		UserID:       userID,
		Name:         name,
		Cash:         initialCash,
		TotalValue:   initialCash,
		TotalReturn:  decimal.Zero,
		ReturnPercent: decimal.Zero,
		Beta:         decimal.NewFromFloat(1.0),
		Sharpe:       decimal.Zero,
		MaxDrawdown:  decimal.Zero,
	}

	return portfolio, nil
}

func (s *PortfolioService) GetPositions(portfolioID string) ([]*models.Position, error) {
	if portfolioID == "" {
		return nil, fmt.Errorf("portfolio ID cannot be empty")
	}

	// Mock positions data
	positions := []*models.Position{
		{
			ID:           "pos_1",
			PortfolioID:  portfolioID,
			Symbol:       "AAPL",
			Quantity:     decimal.NewFromFloat(100),
			AveragePrice: decimal.NewFromFloat(145.50),
			CurrentPrice: decimal.NewFromFloat(155.75),
			MarketValue:  decimal.NewFromFloat(15575.00),
			UnrealizedPL: decimal.NewFromFloat(1025.00),
			RealizedPL:   decimal.NewFromFloat(500.00),
			TotalReturn:  decimal.NewFromFloat(7.04),
			Weight:       decimal.NewFromFloat(15.5),
		},
		{
			ID:           "pos_2",
			PortfolioID:  portfolioID,
			Symbol:       "GOOGL",
			Quantity:     decimal.NewFromFloat(50),
			AveragePrice: decimal.NewFromFloat(2450.00),
			CurrentPrice: decimal.NewFromFloat(2525.30),
			MarketValue:  decimal.NewFromFloat(126265.00),
			UnrealizedPL: decimal.NewFromFloat(3765.00),
			RealizedPL:   decimal.NewFromFloat(0.00),
			TotalReturn:  decimal.NewFromFloat(3.07),
			Weight:       decimal.NewFromFloat(63.1),
		},
		{
			ID:           "pos_3",
			PortfolioID:  portfolioID,
			Symbol:       "MSFT",
			Quantity:     decimal.NewFromFloat(75),
			AveragePrice: decimal.NewFromFloat(285.00),
			CurrentPrice: decimal.NewFromFloat(295.80),
			MarketValue:  decimal.NewFromFloat(22185.00),
			UnrealizedPL: decimal.NewFromFloat(810.00),
			RealizedPL:   decimal.NewFromFloat(150.00),
			TotalReturn:  decimal.NewFromFloat(3.79),
			Weight:       decimal.NewFromFloat(21.4),
		},
	}

	return positions, nil
}

func (s *PortfolioService) AddPosition(portfolioID, symbol string, quantity, price decimal.Decimal) (*models.Position, error) {
	if portfolioID == "" {
		return nil, fmt.Errorf("portfolio ID cannot be empty")
	}
	
	if symbol == "" {
		return nil, fmt.Errorf("symbol cannot be empty")
	}

	if quantity.LessThanOrEqual(decimal.Zero) {
		return nil, fmt.Errorf("quantity must be positive")
	}

	if price.LessThanOrEqual(decimal.Zero) {
		return nil, fmt.Errorf("price must be positive")
	}

	position := &models.Position{
		ID:           fmt.Sprintf("pos_%d", GenerateID()),
		PortfolioID:  portfolioID,
		Symbol:       symbol,
		Quantity:     quantity,
		AveragePrice: price,
		CurrentPrice: price,
		MarketValue:  quantity.Mul(price),
		UnrealizedPL: decimal.Zero,
		RealizedPL:   decimal.Zero,
		TotalReturn:  decimal.Zero,
		Weight:       decimal.Zero, // Would be calculated based on total portfolio value
	}

	return position, nil
}

func (s *PortfolioService) UpdatePosition(positionID string, quantity, currentPrice decimal.Decimal) error {
	if positionID == "" {
		return fmt.Errorf("position ID cannot be empty")
	}

	if currentPrice.LessThanOrEqual(decimal.Zero) {
		return fmt.Errorf("current price must be positive")
	}

	// In a real implementation, this would update the database
	s.logger.WithFields(logrus.Fields{
		"position_id":    positionID,
		"quantity":       quantity,
		"current_price":  currentPrice,
	}).Info("Position updated")

	return nil
}

func (s *PortfolioService) RemovePosition(positionID string) error {
	if positionID == "" {
		return fmt.Errorf("position ID cannot be empty")
	}

	// In a real implementation, this would remove from database
	s.logger.WithField("position_id", positionID).Info("Position removed")

	return nil
}

func (s *PortfolioService) CalculatePortfolioMetrics(portfolioID string) (*models.Portfolio, error) {
	portfolio, err := s.GetPortfolio(portfolioID)
	if err != nil {
		return nil, err
	}

	positions, err := s.GetPositions(portfolioID)
	if err != nil {
		return nil, err
	}

	// Calculate total market value
	totalMarketValue := decimal.Zero
	for _, position := range positions {
		totalMarketValue = totalMarketValue.Add(position.MarketValue)
	}

	// Update portfolio with calculated values
	portfolio.TotalValue = portfolio.Cash.Add(totalMarketValue)
	
	// Calculate total return (simplified)
	initialValue := decimal.NewFromFloat(100000.00) // Would be stored in database
	portfolio.TotalReturn = portfolio.TotalValue.Sub(initialValue)
	
	if !initialValue.IsZero() {
		portfolio.ReturnPercent = portfolio.TotalReturn.Div(initialValue).Mul(decimal.NewFromFloat(100))
	}

	// Update position weights
	for _, position := range positions {
		if !portfolio.TotalValue.IsZero() {
			position.Weight = position.MarketValue.Div(portfolio.TotalValue).Mul(decimal.NewFromFloat(100))
		}
	}

	return portfolio, nil
}

func (s *PortfolioService) GetPortfolioPerformance(portfolioID string, days int) (map[string]interface{}, error) {
	if portfolioID == "" {
		return nil, fmt.Errorf("portfolio ID cannot be empty")
	}

	if days <= 0 {
		days = 30 // Default to 30 days
	}

	// Mock performance data
	performance := map[string]interface{}{
		"portfolio_id":     portfolioID,
		"period_days":      days,
		"total_return":     "12.5%",
		"annualized_return": "15.8%",
		"volatility":       "18.2%",
		"sharpe_ratio":     1.85,
		"max_drawdown":     "-8.5%",
		"alpha":            "2.3%",
		"beta":             1.15,
		"daily_returns":    generateMockReturns(days),
		"top_performers": []map[string]interface{}{
			{"symbol": "GOOGL", "return": "8.5%"},
			{"symbol": "AAPL", "return": "7.0%"},
			{"symbol": "MSFT", "return": "3.8%"},
		},
		"sector_allocation": map[string]interface{}{
			"Technology": "85.5%",
			"Cash":       "14.5%",
		},
	}

	return performance, nil
}

func (s *PortfolioService) OptimizePortfolio(portfolioID string, riskTolerance string, targetReturn decimal.Decimal) (map[string]interface{}, error) {
	if portfolioID == "" {
		return nil, fmt.Errorf("portfolio ID cannot be empty")
	}

	// Mock optimization results
	optimization := map[string]interface{}{
		"portfolio_id":     portfolioID,
		"risk_tolerance":   riskTolerance,
		"target_return":    targetReturn,
		"optimized_weights": map[string]interface{}{
			"AAPL":  "25.0%",
			"GOOGL": "35.0%",
			"MSFT":  "20.0%",
			"AMZN":  "15.0%",
			"Cash":  "5.0%",
		},
		"expected_return":   "14.2%",
		"expected_volatility": "16.8%",
		"sharpe_ratio":      2.1,
		"recommendations": []string{
			"Reduce GOOGL allocation by 5% to decrease concentration risk",
			"Add AMZN position to improve diversification",
			"Consider increasing cash allocation for better risk management",
		},
		"rebalancing_trades": []map[string]interface{}{
			{"action": "SELL", "symbol": "GOOGL", "quantity": 10, "reason": "Overweight position"},
			{"action": "BUY", "symbol": "AMZN", "quantity": 15, "reason": "Diversification"},
		},
	}

	return optimization, nil
}

// Helper function to generate mock returns
func generateMockReturns(days int) []map[string]interface{} {
	returns := make([]map[string]interface{}, days)
	
	// Generate some mock daily returns
	for i := 0; i < days; i++ {
		// Simple random walk for demo
		returns[i] = map[string]interface{}{
			"date":   fmt.Sprintf("2024-07-%02d", (i%30)+1),
			"return": fmt.Sprintf("%.2f%%", (float64(i%10)-5)*0.5),
			"value":  100000.0 + float64(i)*100.0,
		}
	}
	
	return returns
}

// Helper function to generate unique IDs
func GenerateID() int64 {
	// In a real implementation, use proper UUID generation
	return 123456789 + int64(len("temp"))
}