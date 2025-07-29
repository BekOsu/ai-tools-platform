package services

import (
	"fmt"
	"trading-service/internal/algorithms"
	"trading-service/internal/indicators"
	"trading-service/internal/models"
	"github.com/shopspring/decimal"
	"github.com/sirupsen/logrus"
)

type AnalysisService struct {
	algorithmManager *algorithms.AlgorithmManager
	logger           *logrus.Logger
}

func NewAnalysisService(logger *logrus.Logger) *AnalysisService {
	return &AnalysisService{
		algorithmManager: algorithms.NewAlgorithmManager(),
		logger:           logger,
	}
}

func (s *AnalysisService) PerformTechnicalAnalysis(symbol string, historicalData []*models.HistoricalData, indicatorTypes []string) (map[string]interface{}, error) {
	if len(historicalData) < 20 {
		return nil, fmt.Errorf("insufficient data for analysis")
	}

	result := make(map[string]interface{})
	
	// Extract price data
	closes := make([]decimal.Decimal, len(historicalData))
	highs := make([]decimal.Decimal, len(historicalData))
	lows := make([]decimal.Decimal, len(historicalData))
	
	for i, data := range historicalData {
		closes[i] = data.Close
		highs[i] = data.High
		lows[i] = data.Low
	}

	// Calculate requested indicators
	for _, indicatorType := range indicatorTypes {
		switch indicatorType {
		case "RSI":
			rsi, err := indicators.RSI(closes, 14)
			if err == nil && len(rsi) > 0 {
				result["rsi"] = map[string]interface{}{
					"current": rsi[len(rsi)-1],
					"values":  rsi,
					"signal":  s.analyzeRSI(rsi[len(rsi)-1]),
				}
			}

		case "MACD":
			macdLine, signalLine, histogram, err := indicators.MACD(closes, 12, 26, 9)
			if err == nil && len(macdLine) > 0 {
				result["macd"] = map[string]interface{}{
					"macd_line":    macdLine,
					"signal_line":  signalLine,
					"histogram":    histogram,
					"current_macd": macdLine[len(macdLine)-1],
					"signal":       s.analyzeMacd(macdLine, signalLine, histogram),
				}
			}

		case "SMA_20":
			sma20, err := indicators.SMA(closes, 20)
			if err == nil && len(sma20) > 0 {
				result["sma_20"] = map[string]interface{}{
					"current": sma20[len(sma20)-1],
					"values":  sma20,
					"signal":  s.analyzeSMA(closes[len(closes)-1], sma20[len(sma20)-1]),
				}
			}

		case "EMA_12":
			ema12, err := indicators.EMA(closes, 12)
			if err == nil && len(ema12) > 0 {
				result["ema_12"] = map[string]interface{}{
					"current": ema12[len(ema12)-1],
					"values":  ema12,
					"signal":  s.analyzeEMA(closes[len(closes)-1], ema12[len(ema12)-1]),
				}
			}

		case "Bollinger":
			upper, middle, lower, err := indicators.BollingerBands(closes, 20, 2.0)
			if err == nil && len(upper) > 0 {
				result["bollinger_bands"] = map[string]interface{}{
					"upper":   upper,
					"middle":  middle,
					"lower":   lower,
					"current": map[string]interface{}{
						"upper":  upper[len(upper)-1],
						"middle": middle[len(middle)-1],
						"lower":  lower[len(lower)-1],
					},
					"signal": s.analyzeBollinger(closes[len(closes)-1], upper[len(upper)-1], middle[len(middle)-1], lower[len(lower)-1]),
				}
			}

		case "Stochastic":
			kPercent, dPercent, err := indicators.StochasticOscillator(highs, lows, closes, 14, 3)
			if err == nil && len(kPercent) > 0 {
				result["stochastic"] = map[string]interface{}{
					"k_percent": kPercent,
					"d_percent": dPercent,
					"current":   map[string]interface{}{
						"k": kPercent[len(kPercent)-1],
						"d": dPercent[len(dPercent)-1],
					},
					"signal": s.analyzeStochastic(kPercent[len(kPercent)-1], dPercent[len(dPercent)-1]),
				}
			}

		case "ADX":
			adx, plusDI, minusDI, err := indicators.ADX(highs, lows, closes, 14)
			if err == nil && len(adx) > 0 {
				result["adx"] = map[string]interface{}{
					"adx":      adx,
					"plus_di":  plusDI,
					"minus_di": minusDI,
					"current":  map[string]interface{}{
						"adx":      adx[len(adx)-1],
						"plus_di":  plusDI[len(plusDI)-1],
						"minus_di": minusDI[len(minusDI)-1],
					},
					"signal": s.analyzeADX(adx[len(adx)-1], plusDI[len(plusDI)-1], minusDI[len(minusDI)-1]),
				}
			}

		case "CCI":
			cci, err := indicators.CCI(highs, lows, closes, 20)
			if err == nil && len(cci) > 0 {
				result["cci"] = map[string]interface{}{
					"current": cci[len(cci)-1],
					"values":  cci,
					"signal":  s.analyzeCCI(cci[len(cci)-1]),
				}
			}
		}
	}

	// Overall sentiment analysis
	result["overall_sentiment"] = s.calculateOverallSentiment(result)
	result["symbol"] = symbol
	result["analysis_timestamp"] = historicalData[len(historicalData)-1].Date

	return result, nil
}

func (s *AnalysisService) GenerateSignals(symbol string, historicalData []*models.HistoricalData, algorithmNames []string) ([]*models.TradingSignal, error) {
	var signals []*models.TradingSignal

	for _, algorithmName := range algorithmNames {
		algorithm, err := s.algorithmManager.GetAlgorithm(algorithmName)
		if err != nil {
			s.logger.WithError(err).WithField("algorithm", algorithmName).Warn("Algorithm not found")
			continue
		}

		signal, err := algorithm.GenerateSignal(symbol, historicalData)
		if err != nil {
			s.logger.WithError(err).WithField("algorithm", algorithmName).Warn("Signal generation failed")
			continue
		}

		if signal != nil {
			signals = append(signals, signal)
		}
	}

	return signals, nil
}

func (s *AnalysisService) CalculateRiskMetrics(symbol string, historicalData []*models.HistoricalData) (*models.RiskMetrics, error) {
	if len(historicalData) < 30 {
		return nil, fmt.Errorf("insufficient data for risk calculation")
	}

	closes := make([]decimal.Decimal, len(historicalData))
	for i, data := range historicalData {
		closes[i] = data.Close
	}

	// Calculate volatility
	volatility, err := indicators.CalculateVolatility(closes, len(closes))
	if err != nil {
		return nil, err
	}

	// Calculate beta (using S&P 500 as market proxy - in real implementation, fetch market data)
	beta := decimal.NewFromFloat(1.0) // Default beta

	// Calculate other risk metrics
	riskMetrics := &models.RiskMetrics{
		Symbol:       symbol,
		Volatility:   volatility,
		Beta:         beta,
		RiskLevel:    s.determineRiskLevel(volatility),
	}

	// Calculate Sharpe ratio (simplified)
	returns := s.calculateReturns(closes)
	if len(returns) > 0 {
		avgReturn := s.calculateAverageReturn(returns)
		riskFreeRate := decimal.NewFromFloat(0.02) // 2% risk-free rate
		excessReturn := avgReturn.Sub(riskFreeRate)
		
		if !volatility.IsZero() {
			riskMetrics.SharpeRatio = excessReturn.Div(volatility)
		}
	}

	// Calculate VaR (Value at Risk) - simplified 95% confidence
	if len(returns) > 20 {
		sortedReturns := make([]decimal.Decimal, len(returns))
		copy(sortedReturns, returns)
		// Sort returns (simplified implementation)
		var95Index := int(float64(len(sortedReturns)) * 0.05)
		if var95Index < len(sortedReturns) {
			riskMetrics.VaR95 = sortedReturns[var95Index].Abs()
		}
	}

	return riskMetrics, nil
}

// Helper functions for analysis

func (s *AnalysisService) analyzeRSI(rsi decimal.Decimal) string {
	if rsi.GreaterThan(decimal.NewFromInt(70)) {
		return "OVERBOUGHT"
	} else if rsi.LessThan(decimal.NewFromInt(30)) {
		return "OVERSOLD"
	}
	return "NEUTRAL"
}

func (s *AnalysisService) analyzeMacd(macdLine, signalLine, histogram []decimal.Decimal) string {
	if len(macdLine) < 2 || len(signalLine) < 2 {
		return "NEUTRAL"
	}

	currentMACD := macdLine[len(macdLine)-1]
	currentSignal := signalLine[len(signalLine)-1]
	prevMACD := macdLine[len(macdLine)-2]
	prevSignal := signalLine[len(signalLine)-2]

	// MACD crossover signals
	if prevMACD.LessThan(prevSignal) && currentMACD.GreaterThan(currentSignal) {
		return "BULLISH_CROSSOVER"
	} else if prevMACD.GreaterThan(prevSignal) && currentMACD.LessThan(currentSignal) {
		return "BEARISH_CROSSOVER"
	}

	return "NEUTRAL"
}

func (s *AnalysisService) analyzeSMA(currentPrice, sma decimal.Decimal) string {
	if currentPrice.GreaterThan(sma) {
		return "ABOVE_SMA"
	} else if currentPrice.LessThan(sma) {
		return "BELOW_SMA"
	}
	return "AT_SMA"
}

func (s *AnalysisService) analyzeEMA(currentPrice, ema decimal.Decimal) string {
	if currentPrice.GreaterThan(ema) {
		return "ABOVE_EMA"
	} else if currentPrice.LessThan(ema) {
		return "BELOW_EMA"
	}
	return "AT_EMA"
}

func (s *AnalysisService) analyzeBollinger(currentPrice, upper, middle, lower decimal.Decimal) string {
	if currentPrice.GreaterThan(upper) {
		return "ABOVE_UPPER_BAND"
	} else if currentPrice.LessThan(lower) {
		return "BELOW_LOWER_BAND"
	} else if currentPrice.GreaterThan(middle) {
		return "UPPER_HALF"
	}
	return "LOWER_HALF"
}

func (s *AnalysisService) analyzeStochastic(k, d decimal.Decimal) string {
	if k.GreaterThan(decimal.NewFromInt(80)) && d.GreaterThan(decimal.NewFromInt(80)) {
		return "OVERBOUGHT"
	} else if k.LessThan(decimal.NewFromInt(20)) && d.LessThan(decimal.NewFromInt(20)) {
		return "OVERSOLD"
	}
	return "NEUTRAL"
}

func (s *AnalysisService) analyzeADX(adx, plusDI, minusDI decimal.Decimal) string {
	if adx.GreaterThan(decimal.NewFromInt(25)) {
		if plusDI.GreaterThan(minusDI) {
			return "STRONG_UPTREND"
		} else {
			return "STRONG_DOWNTREND"
		}
	}
	return "WEAK_TREND"
}

func (s *AnalysisService) analyzeCCI(cci decimal.Decimal) string {
	if cci.GreaterThan(decimal.NewFromInt(100)) {
		return "OVERBOUGHT"
	} else if cci.LessThan(decimal.NewFromInt(-100)) {
		return "OVERSOLD"
	}
	return "NEUTRAL"
}

func (s *AnalysisService) calculateOverallSentiment(indicators map[string]interface{}) string {
	bullishCount := 0
	bearishCount := 0
	totalSignals := 0

	// Count bullish and bearish signals
	for _, indicator := range indicators {
		if indicatorMap, ok := indicator.(map[string]interface{}); ok {
			if signal, exists := indicatorMap["signal"]; exists {
				totalSignals++
				signalStr := fmt.Sprintf("%v", signal)
				
				switch signalStr {
				case "OVERSOLD", "BULLISH_CROSSOVER", "ABOVE_SMA", "ABOVE_EMA", "STRONG_UPTREND", "BELOW_LOWER_BAND":
					bullishCount++
				case "OVERBOUGHT", "BEARISH_CROSSOVER", "BELOW_SMA", "BELOW_EMA", "STRONG_DOWNTREND", "ABOVE_UPPER_BAND":
					bearishCount++
				}
			}
		}
	}

	if totalSignals == 0 {
		return "NEUTRAL"
	}

	bullishRatio := float64(bullishCount) / float64(totalSignals)
	bearishRatio := float64(bearishCount) / float64(totalSignals)

	if bullishRatio > 0.6 {
		return "BULLISH"
	} else if bearishRatio > 0.6 {
		return "BEARISH"
	}

	return "NEUTRAL"
}

func (s *AnalysisService) calculateReturns(prices []decimal.Decimal) []decimal.Decimal {
	if len(prices) < 2 {
		return nil
	}

	returns := make([]decimal.Decimal, len(prices)-1)
	for i := 1; i < len(prices); i++ {
		returns[i-1] = prices[i].Sub(prices[i-1]).Div(prices[i-1])
	}

	return returns
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

func (s *AnalysisService) determineRiskLevel(volatility decimal.Decimal) string {
	if volatility.GreaterThan(decimal.NewFromFloat(0.3)) {
		return "HIGH"
	} else if volatility.GreaterThan(decimal.NewFromFloat(0.15)) {
		return "MEDIUM"
	}
	return "LOW"
}