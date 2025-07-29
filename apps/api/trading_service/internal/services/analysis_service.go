package services

import (
	"fmt"
	"math"
	"time"
	"github.com/shopspring/decimal"
	"github.com/sirupsen/logrus"
	"trading-service/internal/algorithms"
	"trading-service/internal/indicators"
	"trading-service/internal/models"
)

// AnalysisService handles technical analysis and signal generation
type AnalysisService struct {
	algorithmManager *algorithms.AlgorithmManager
	logger           *logrus.Logger
}

// NewAnalysisService creates a new analysis service
func NewAnalysisService(logger *logrus.Logger) *AnalysisService {
	return &AnalysisService{
		algorithmManager: algorithms.NewAlgorithmManager(),
		logger:           logger,
	}
}

// PerformTechnicalAnalysis performs comprehensive technical analysis
func (s *AnalysisService) PerformTechnicalAnalysis(symbol string, data []models.HistoricalData, indicatorNames []string) (*TechnicalAnalysisResult, error) {
	s.logger.WithFields(logrus.Fields{
		"symbol":     symbol,
		"data_points": len(data),
		"indicators": indicatorNames,
	}).Debug("Performing technical analysis")

	if len(data) < 20 {
		return nil, fmt.Errorf("insufficient data for technical analysis: need at least 20 data points, got %d", len(data))
	}

	result := &TechnicalAnalysisResult{
		Symbol:     symbol,
		Timestamp:  time.Now(),
		Indicators: make(map[string]interface{}),
		Summary:    make(map[string]interface{}),
	}

	// Extract price data
	var closes, highs, lows, opens []decimal.Decimal
	var volumes []int64
	
	for _, d := range data {
		closes = append(closes, d.Close)
		highs = append(highs, d.High)
		lows = append(lows, d.Low)
		opens = append(opens, d.Open)
		volumes = append(volumes, d.Volume)
	}

	// Calculate requested indicators
	for _, indicatorName := range indicatorNames {
		indicatorResult, err := s.calculateIndicator(indicatorName, highs, lows, closes, opens, volumes)
		if err != nil {
			s.logger.WithError(err).WithFields(logrus.Fields{
				"symbol":    symbol,
				"indicator": indicatorName,
			}).Warn("Failed to calculate indicator")
			continue
		}
		result.Indicators[indicatorName] = indicatorResult
	}

	// Generate analysis summary
	s.generateAnalysisSummary(result, closes)

	s.logger.WithFields(logrus.Fields{
		"symbol":           symbol,
		"indicators_count": len(result.Indicators),
	}).Debug("Technical analysis completed")

	return result, nil
}

// calculateIndicator calculates a specific technical indicator
func (s *AnalysisService) calculateIndicator(name string, highs, lows, closes, opens []decimal.Decimal, volumes []int64) (interface{}, error) {
	switch name {
	case "RSI":
		rsi, err := indicators.RSI(closes, 14)
		if err != nil {
			return nil, err
		}
		latest := rsi[len(rsi)-1]
		latestFloat, _ := latest.Float64()
		
		return map[string]interface{}{
			"value":        latest,
			"interpretation": s.interpretRSI(latestFloat),
			"signal":       s.getRSISignal(latestFloat),
			"period":       14,
		}, nil

	case "MACD":
		macdLine, signalLine, histogram, err := indicators.MACD(closes, 12, 26, 9)
		if err != nil {
			return nil, err
		}
		
		latestMACD := macdLine[len(macdLine)-1]
		latestSignal := signalLine[len(signalLine)-1]
		latestHistogram := histogram[len(histogram)-1]
		
		return map[string]interface{}{
			"macd_line":  latestMACD,
			"signal_line": latestSignal,
			"histogram":  latestHistogram,
			"signal":     s.getMACDSignal(latestMACD, latestSignal, latestHistogram),
			"fast_period": 12,
			"slow_period": 26,
			"signal_period": 9,
		}, nil

	case "SMA_20":
		sma, err := indicators.SMA(closes, 20)
		if err != nil {
			return nil, err
		}
		latest := sma[len(sma)-1]
		currentPrice := closes[len(closes)-1]
		
		return map[string]interface{}{
			"value":       latest,
			"current_price": currentPrice,
			"deviation":   currentPrice.Sub(latest).Div(latest).Mul(decimal.NewFromInt(100)),
			"signal":      s.getSMASignal(currentPrice, latest),
			"period":      20,
		}, nil

	case "EMA_12":
		ema, err := indicators.EMA(closes, 12)
		if err != nil {
			return nil, err
		}
		latest := ema[len(ema)-1]
		currentPrice := closes[len(closes)-1]
		
		return map[string]interface{}{
			"value":       latest,
			"current_price": currentPrice,
			"deviation":   currentPrice.Sub(latest).Div(latest).Mul(decimal.NewFromInt(100)),
			"signal":      s.getEMASignal(currentPrice, latest),
			"period":      12,
		}, nil

	case "Bollinger":
		upper, middle, lower, err := indicators.BollingerBands(closes, 20, 2.0)
		if err != nil {
			return nil, err
		}
		
		latestUpper := upper[len(upper)-1]
		latestMiddle := middle[len(middle)-1]
		latestLower := lower[len(lower)-1]
		currentPrice := closes[len(closes)-1]
		
		// Calculate %B (position within bands)
		bandWidth := latestUpper.Sub(latestLower)
		var percentB decimal.Decimal
		if !bandWidth.IsZero() {
			percentB = currentPrice.Sub(latestLower).Div(bandWidth)
		}
		
		return map[string]interface{}{
			"upper_band":  latestUpper,
			"middle_band": latestMiddle,
			"lower_band":  latestLower,
			"percent_b":   percentB,
			"signal":      s.getBollingerSignal(currentPrice, latestUpper, latestLower, percentB),
			"period":      20,
			"std_dev":     2.0,
		}, nil

	case "Stochastic":
		kPercent, dPercent, err := indicators.StochasticOscillator(highs, lows, closes, 14, 3)
		if err != nil {
			return nil, err
		}
		
		latestK := kPercent[len(kPercent)-1]
		latestD := dPercent[len(dPercent)-1]
		
		return map[string]interface{}{
			"k_percent": latestK,
			"d_percent": latestD,
			"signal":    s.getStochasticSignal(latestK, latestD),
			"k_period":  14,
			"d_period":  3,
		}, nil

	case "ADX":
		adx, plusDI, minusDI, err := indicators.ADX(highs, lows, closes, 14)
		if err != nil {
			return nil, err
		}
		
		latestADX := adx[len(adx)-1]
		latestPlusDI := plusDI[len(plusDI)-1]
		latestMinusDI := minusDI[len(minusDI)-1]
		
		return map[string]interface{}{
			"adx":      latestADX,
			"plus_di":  latestPlusDI,
			"minus_di": latestMinusDI,
			"signal":   s.getADXSignal(latestADX, latestPlusDI, latestMinusDI),
			"period":   14,
		}, nil

	case "CCI":
		cci, err := indicators.CCI(highs, lows, closes, 20)
		if err != nil {
			return nil, err
		}
		
		latest := cci[len(cci)-1]
		latestFloat, _ := latest.Float64()
		
		return map[string]interface{}{
			"value":  latest,
			"signal": s.getCCISignal(latestFloat),
			"period": 20,
		}, nil

	default:
		return nil, fmt.Errorf("unsupported indicator: %s", name)
	}
}

// generateAnalysisSummary creates a comprehensive analysis summary
func (s *AnalysisService) generateAnalysisSummary(result *TechnicalAnalysisResult, closes []decimal.Decimal) {
	// Calculate basic statistics
	currentPrice := closes[len(closes)-1]
	
	// Price change analysis
	if len(closes) >= 2 {
		previousPrice := closes[len(closes)-2]
		change := currentPrice.Sub(previousPrice)
		changePercent := change.Div(previousPrice).Mul(decimal.NewFromInt(100))
		
		result.Summary["price_change"] = map[string]interface{}{
			"absolute": change,
			"percent":  changePercent,
			"trend":    s.getTrendFromChange(changePercent),
		}
	}

	// Overall signal strength
	signals := s.extractSignalsFromIndicators(result.Indicators)
	overallSignal := s.calculateOverallSignal(signals)
	
	result.Summary["overall_signal"] = overallSignal
	result.Summary["signal_strength"] = s.calculateSignalStrength(signals)
	result.Summary["recommendation"] = s.generateRecommendation(overallSignal)
	
	// Volatility analysis
	if len(closes) >= 20 {
		volatility, _ := indicators.CalculateVolatility(closes, 20)
		result.Summary["volatility"] = map[string]interface{}{
			"value":  volatility,
			"level":  s.getVolatilityLevel(volatility),
		}
	}
}

// GenerateSignals generates trading signals using specified algorithms
func (s *AnalysisService) GenerateSignals(symbol string, data []models.HistoricalData, algorithmNames []string) (map[string]*models.TradingSignal, error) {
	s.logger.WithFields(logrus.Fields{
		"symbol":     symbol,
		"data_points": len(data),
		"algorithms": algorithmNames,
	}).Debug("Generating trading signals")

	signals := make(map[string]*models.TradingSignal)

	for _, algorithmName := range algorithmNames {
		algorithm, err := s.algorithmManager.GetAlgorithm(algorithmName)
		if err != nil {
			s.logger.WithError(err).WithFields(logrus.Fields{
				"symbol":    symbol,
				"algorithm": algorithmName,
			}).Warn("Failed to get algorithm")
			continue
		}

		signal, err := algorithm.Analyze(data)
		if err != nil {
			s.logger.WithError(err).WithFields(logrus.Fields{
				"symbol":    symbol,
				"algorithm": algorithmName,
			}).Warn("Algorithm analysis failed")
			continue
		}

		signals[algorithmName] = signal
	}

	if len(signals) == 0 {
		return nil, fmt.Errorf("no algorithms produced valid signals")
	}

	s.logger.WithFields(logrus.Fields{
		"symbol":      symbol,
		"signals_count": len(signals),
	}).Debug("Trading signals generated")

	return signals, nil
}

// CalculateRiskMetrics calculates comprehensive risk metrics
func (s *AnalysisService) CalculateRiskMetrics(symbol string, data []models.HistoricalData) (*models.RiskMetrics, error) {
	s.logger.WithFields(logrus.Fields{
		"symbol":     symbol,
		"data_points": len(data),
	}).Debug("Calculating risk metrics")

	if len(data) < 30 {
		return nil, fmt.Errorf("insufficient data for risk calculation: need at least 30 data points")
	}

	// Extract price data
	var closes []decimal.Decimal
	for _, d := range data {
		closes = append(closes, d.Close)
	}

	riskMetrics := &models.RiskMetrics{
		Symbol:    symbol,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Calculate volatility
	volatility, err := indicators.CalculateVolatility(closes, len(closes))
	if err == nil {
		riskMetrics.Volatility = volatility
	}

	// Calculate returns for additional metrics
	var returns []decimal.Decimal
	for i := 1; i < len(closes); i++ {
		ret := closes[i].Div(closes[i-1]).Sub(decimal.NewFromInt(1))
		returns = append(returns, ret)
	}

	// Calculate Value at Risk (simple method)
	if len(returns) >= 20 {
		var returnFloats []float64
		for _, ret := range returns {
			f, _ := ret.Float64()
			returnFloats = append(returnFloats, f)
		}

		// Sort returns for percentile calculation
		for i := 0; i < len(returnFloats)-1; i++ {
			for j := i + 1; j < len(returnFloats); j++ {
				if returnFloats[i] > returnFloats[j] {
					returnFloats[i], returnFloats[j] = returnFloats[j], returnFloats[i]
				}
			}
		}

		// VaR at 95% confidence (5th percentile)
		var95Index := int(float64(len(returnFloats)) * 0.05)
		if var95Index < len(returnFloats) {
			riskMetrics.VaR95 = decimal.NewFromFloat(returnFloats[var95Index])
		}

		// VaR at 99% confidence (1st percentile)
		var99Index := int(float64(len(returnFloats)) * 0.01)
		if var99Index < len(returnFloats) {
			riskMetrics.VaR99 = decimal.NewFromFloat(returnFloats[var99Index])
		}
	}

	// Calculate maximum drawdown
	maxDrawdown := s.calculateMaxDrawdown(closes)
	riskMetrics.MaxDrawdown = maxDrawdown

	// Calculate Sharpe ratio (simplified)
	if len(returns) > 0 {
		avgReturn := s.calculateAverageReturn(returns)
		vol, _ := riskMetrics.Volatility.Float64()
		if vol > 0 {
			avgRetFloat, _ := avgReturn.Float64()
			// Assuming risk-free rate of 2% annually
			riskFreeRate := 0.02 / 252 // Daily risk-free rate
			sharpe := (avgRetFloat - riskFreeRate) / vol
			riskMetrics.SharpeRatio = decimal.NewFromFloat(sharpe)
		}
	}

	// Determine risk level
	riskMetrics.RiskLevel = s.determineRiskLevel(riskMetrics)

	s.logger.WithFields(logrus.Fields{
		"symbol":        symbol,
		"volatility":    riskMetrics.Volatility,
		"max_drawdown":  riskMetrics.MaxDrawdown,
		"sharpe_ratio":  riskMetrics.SharpeRatio,
		"risk_level":    riskMetrics.RiskLevel,
	}).Debug("Risk metrics calculated")

	return riskMetrics, nil
}

// Helper functions for signal interpretation

func (s *AnalysisService) interpretRSI(rsi float64) string {
	if rsi > 70 {
		return "Overbought"
	} else if rsi < 30 {
		return "Oversold"
	}
	return "Neutral"
}

func (s *AnalysisService) getRSISignal(rsi float64) string {
	if rsi > 80 {
		return "STRONG_SELL"
	} else if rsi > 70 {
		return "SELL"
	} else if rsi < 20 {
		return "STRONG_BUY"
	} else if rsi < 30 {
		return "BUY"
	}
	return "HOLD"
}

func (s *AnalysisService) getMACDSignal(macd, signal, histogram decimal.Decimal) string {
	if macd.GreaterThan(signal) && histogram.GreaterThan(decimal.Zero) {
		return "BUY"
	} else if macd.LessThan(signal) && histogram.LessThan(decimal.Zero) {
		return "SELL"
	}
	return "HOLD"
}

func (s *AnalysisService) getSMASignal(price, sma decimal.Decimal) string {
	if price.GreaterThan(sma.Mul(decimal.NewFromFloat(1.02))) {
		return "BUY"
	} else if price.LessThan(sma.Mul(decimal.NewFromFloat(0.98))) {
		return "SELL"
	}
	return "HOLD"
}

func (s *AnalysisService) getEMASignal(price, ema decimal.Decimal) string {
	if price.GreaterThan(ema) {
		return "BUY"
	} else if price.LessThan(ema) {
		return "SELL"
	}
	return "HOLD"
}

func (s *AnalysisService) getBollingerSignal(price, upper, lower, percentB decimal.Decimal) string {
	percentBFloat, _ := percentB.Float64()
	
	if price.GreaterThan(upper) || percentBFloat > 1.0 {
		return "SELL"
	} else if price.LessThan(lower) || percentBFloat < 0.0 {
		return "BUY"
	}
	return "HOLD"
}

func (s *AnalysisService) getStochasticSignal(k, d decimal.Decimal) string {
	kFloat, _ := k.Float64()
	dFloat, _ := d.Float64()
	
	if kFloat > 80 && dFloat > 80 {
		return "SELL"
	} else if kFloat < 20 && dFloat < 20 {
		return "BUY"
	}
	return "HOLD"
}

func (s *AnalysisService) getADXSignal(adx, plusDI, minusDI decimal.Decimal) string {
	adxFloat, _ := adx.Float64()
	
	if adxFloat > 25 {
		if plusDI.GreaterThan(minusDI) {
			return "BUY"
		} else {
			return "SELL"
		}
	}
	return "HOLD"
}

func (s *AnalysisService) getCCISignal(cci float64) string {
	if cci > 100 {
		return "SELL"
	} else if cci < -100 {
		return "BUY"
	}
	return "HOLD"
}

func (s *AnalysisService) getTrendFromChange(changePercent decimal.Decimal) string {
	changeFloat, _ := changePercent.Float64()
	
	if changeFloat > 2 {
		return "STRONG_UP"
	} else if changeFloat > 0.5 {
		return "UP"
	} else if changeFloat < -2 {
		return "STRONG_DOWN"
	} else if changeFloat < -0.5 {
		return "DOWN"
	}
	return "FLAT"
}

func (s *AnalysisService) extractSignalsFromIndicators(indicators map[string]interface{}) []string {
	var signals []string
	
	for _, indicator := range indicators {
		if indicatorMap, ok := indicator.(map[string]interface{}); ok {
			if signal, exists := indicatorMap["signal"]; exists {
				if signalStr, ok := signal.(string); ok {
					signals = append(signals, signalStr)
				}
			}
		}
	}
	
	return signals
}

func (s *AnalysisService) calculateOverallSignal(signals []string) string {
	buyCount := 0
	sellCount := 0
	
	for _, signal := range signals {
		switch signal {
		case "BUY", "STRONG_BUY":
			buyCount++
		case "SELL", "STRONG_SELL":
			sellCount++
		}
	}
	
	if buyCount > sellCount {
		return "BUY"
	} else if sellCount > buyCount {
		return "SELL"
	}
	return "HOLD"
}

func (s *AnalysisService) calculateSignalStrength(signals []string) float64 {
	if len(signals) == 0 {
		return 0.0
	}
	
	strongCount := 0
	for _, signal := range signals {
		if signal == "STRONG_BUY" || signal == "STRONG_SELL" {
			strongCount++
		}
	}
	
	return float64(strongCount) / float64(len(signals))
}

func (s *AnalysisService) generateRecommendation(signal string) string {
	switch signal {
	case "BUY":
		return "Consider buying if it fits your risk tolerance and investment strategy"
	case "SELL":
		return "Consider selling or avoiding this position"
	default:
		return "Hold current position or wait for clearer signals"
	}
}

func (s *AnalysisService) getVolatilityLevel(volatility decimal.Decimal) string {
	vol, _ := volatility.Float64()
	
	if vol > 0.30 {
		return "HIGH"
	} else if vol > 0.20 {
		return "MEDIUM"
	}
	return "LOW"
}

func (s *AnalysisService) calculateMaxDrawdown(prices []decimal.Decimal) decimal.Decimal {
	if len(prices) < 2 {
		return decimal.Zero
	}
	
	maxDrawdown := decimal.Zero
	peak := prices[0]
	
	for _, price := range prices[1:] {
		if price.GreaterThan(peak) {
			peak = price
		}
		
		drawdown := peak.Sub(price).Div(peak)
		if drawdown.GreaterThan(maxDrawdown) {
			maxDrawdown = drawdown
		}
	}
	
	return maxDrawdown
}

func (s *AnalysisService) calculateAverageReturn(returns []decimal.Decimal) decimal.Decimal {
	if len(returns) == 0 {
		return decimal.Zero
	}
	
	sum := decimal.Zero
	for _, ret := range returns {
		sum = sum.Add(ret)
	}
	
	return sum.Div(decimal.NewFromInt(int64(len(returns))))
}

func (s *AnalysisService) determineRiskLevel(metrics *models.RiskMetrics) string {
	vol, _ := metrics.Volatility.Float64()
	maxDD, _ := metrics.MaxDrawdown.Float64()
	
	riskScore := 0
	
	// Volatility score
	if vol > 0.30 {
		riskScore += 2
	} else if vol > 0.20 {
		riskScore += 1
	}
	
	// Drawdown score
	if maxDD > 0.20 {
		riskScore += 2
	} else if maxDD > 0.10 {
		riskScore += 1
	}
	
	if riskScore >= 3 {
		return "HIGH"
	} else if riskScore >= 1 {
		return "MEDIUM"
	}
	return "LOW"
}

// TechnicalAnalysisResult represents the result of technical analysis
type TechnicalAnalysisResult struct {
	Symbol     string                 `json:"symbol"`
	Timestamp  time.Time              `json:"timestamp"`
	Indicators map[string]interface{} `json:"indicators"`
	Summary    map[string]interface{} `json:"summary"`
}