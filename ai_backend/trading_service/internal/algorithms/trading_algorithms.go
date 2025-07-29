package algorithms

import (
	"fmt"
	"math"
	"time"
	"github.com/shopspring/decimal"
	"trading-service/internal/models"
	"trading-service/internal/indicators"
)

// TradingAlgorithm interface for all trading algorithms
type TradingAlgorithm interface {
	Name() string
	Analyze(data []models.HistoricalData) (*models.TradingSignal, error)
	GetParameters() map[string]interface{}
	SetParameters(params map[string]interface{}) error
}

// MomentumStrategy implements momentum-based trading
type MomentumStrategy struct {
	RSIPeriod      int     `json:"rsi_period"`
	RSIOverBought  float64 `json:"rsi_overbought"`
	RSIOverSold    float64 `json:"rsi_oversold"`
	MACDFast       int     `json:"macd_fast"`
	MACDSlow       int     `json:"macd_slow"`
	MACDSignal     int     `json:"macd_signal"`
	VolumeThreshold float64 `json:"volume_threshold"`
}

func NewMomentumStrategy() *MomentumStrategy {
	return &MomentumStrategy{
		RSIPeriod:       14,
		RSIOverBought:   70,
		RSIOverSold:     30,
		MACDFast:        12,
		MACDSlow:        26,
		MACDSignal:      9,
		VolumeThreshold: 1.5, // 50% above average volume
	}
}

func (m *MomentumStrategy) Name() string {
	return "Momentum Strategy"
}

func (m *MomentumStrategy) GetParameters() map[string]interface{} {
	return map[string]interface{}{
		"rsi_period":       m.RSIPeriod,
		"rsi_overbought":   m.RSIOverBought,
		"rsi_oversold":     m.RSIOverSold,
		"macd_fast":        m.MACDFast,
		"macd_slow":        m.MACDSlow,
		"macd_signal":      m.MACDSignal,
		"volume_threshold": m.VolumeThreshold,
	}
}

func (m *MomentumStrategy) SetParameters(params map[string]interface{}) error {
	if val, ok := params["rsi_period"].(int); ok {
		m.RSIPeriod = val
	}
	if val, ok := params["rsi_overbought"].(float64); ok {
		m.RSIOverBought = val
	}
	if val, ok := params["rsi_oversold"].(float64); ok {
		m.RSIOverSold = val
	}
	return nil
}

func (m *MomentumStrategy) Analyze(data []models.HistoricalData) (*models.TradingSignal, error) {
	if len(data) < m.MACDSlow+m.MACDSignal {
		return nil, fmt.Errorf("insufficient data for momentum analysis")
	}

	// Extract price data
	var closes []decimal.Decimal
	var volumes []int64
	for _, d := range data {
		closes = append(closes, d.Close)
		volumes = append(volumes, d.Volume)
	}

	// Calculate RSI
	rsiValues, err := indicators.RSI(closes, m.RSIPeriod)
	if err != nil {
		return nil, fmt.Errorf("RSI calculation failed: %v", err)
	}

	// Calculate MACD
	macdLine, signalLine, histogram, err := indicators.MACD(closes, m.MACDFast, m.MACDSlow, m.MACDSignal)
	if err != nil {
		return nil, fmt.Errorf("MACD calculation failed: %v", err)
	}

	// Get latest values
	latestRSI := rsiValues[len(rsiValues)-1]
	latestMACD := macdLine[len(macdLine)-1]
	latestSignal := signalLine[len(signalLine)-1]
	latestHistogram := histogram[len(histogram)-1]
	latestPrice := closes[len(closes)-1]
	latestVolume := volumes[len(volumes)-1]

	// Calculate average volume
	avgVolume := calculateAverageVolume(volumes, 20)
	volumeRatio := float64(latestVolume) / float64(avgVolume)

	// Generate signal
	signal := &models.TradingSignal{
		Symbol:    data[len(data)-1].Symbol,
		Price:     latestPrice,
		Algorithm: m.Name(),
		CreatedAt: time.Now(),
		Indicators: map[string]interface{}{
			"rsi":           latestRSI,
			"macd":          latestMACD,
			"macd_signal":   latestSignal,
			"macd_histogram": latestHistogram,
			"volume_ratio":  volumeRatio,
		},
	}

	// Determine signal type and strength
	rsiFloat, _ := latestRSI.Float64()
	
	if rsiFloat < m.RSIOverSold && latestMACD.GreaterThan(latestSignal) && latestHistogram.GreaterThan(decimal.Zero) {
		// Strong BUY signal
		signal.Type = "BUY"
		signal.Strength = decimal.NewFromFloat(0.8)
		signal.RiskLevel = "MEDIUM"
		signal.Confidence = decimal.NewFromFloat(0.85)
		
		// Set target and stop loss
		signal.TargetPrice = latestPrice.Mul(decimal.NewFromFloat(1.05)) // 5% target
		signal.StopLoss = latestPrice.Mul(decimal.NewFromFloat(0.97))    // 3% stop loss
		
	} else if rsiFloat > m.RSIOverBought && latestMACD.LessThan(latestSignal) && latestHistogram.LessThan(decimal.Zero) {
		// Strong SELL signal
		signal.Type = "SELL"
		signal.Strength = decimal.NewFromFloat(0.8)
		signal.RiskLevel = "MEDIUM"
		signal.Confidence = decimal.NewFromFloat(0.85)
		
		// Set target and stop loss for short
		signal.TargetPrice = latestPrice.Mul(decimal.NewFromFloat(0.95)) // 5% target down
		signal.StopLoss = latestPrice.Mul(decimal.NewFromFloat(1.03))    // 3% stop loss up
		
	} else if rsiFloat < 50 && latestMACD.GreaterThan(latestSignal) {
		// Weak BUY signal
		signal.Type = "BUY"
		signal.Strength = decimal.NewFromFloat(0.5)
		signal.RiskLevel = "LOW"
		signal.Confidence = decimal.NewFromFloat(0.65)
		
	} else if rsiFloat > 50 && latestMACD.LessThan(latestSignal) {
		// Weak SELL signal
		signal.Type = "SELL"
		signal.Strength = decimal.NewFromFloat(0.5)
		signal.RiskLevel = "LOW"
		signal.Confidence = decimal.NewFromFloat(0.65)
		
	} else {
		// HOLD signal
		signal.Type = "HOLD"
		signal.Strength = decimal.NewFromFloat(0.3)
		signal.RiskLevel = "LOW"
		signal.Confidence = decimal.NewFromFloat(0.5)
	}

	// Adjust confidence based on volume
	if volumeRatio > m.VolumeThreshold {
		currentConf, _ := signal.Confidence.Float64()
		signal.Confidence = decimal.NewFromFloat(math.Min(currentConf*1.2, 1.0))
	}

	// Set expiration time
	signal.ExpirationTime = time.Now().Add(time.Hour * 4)
	signal.TimeFrame = "1h"

	return signal, nil
}

// MeanReversionStrategy implements mean reversion trading
type MeanReversionStrategy struct {
	BollingerPeriod     int     `json:"bollinger_period"`
	BollingerStdDev     float64 `json:"bollinger_std_dev"`
	RSIPeriod           int     `json:"rsi_period"`
	RSIExtremeOverbought float64 `json:"rsi_extreme_overbought"`
	RSIExtremeOversold   float64 `json:"rsi_extreme_oversold"`
	MeanReversionPeriod int     `json:"mean_reversion_period"`
}

func NewMeanReversionStrategy() *MeanReversionStrategy {
	return &MeanReversionStrategy{
		BollingerPeriod:      20,
		BollingerStdDev:      2.0,
		RSIPeriod:            14,
		RSIExtremeOverbought: 80,
		RSIExtremeOversold:   20,
		MeanReversionPeriod:  50,
	}
}

func (mr *MeanReversionStrategy) Name() string {
	return "Mean Reversion Strategy"
}

func (mr *MeanReversionStrategy) GetParameters() map[string]interface{} {
	return map[string]interface{}{
		"bollinger_period":       mr.BollingerPeriod,
		"bollinger_std_dev":      mr.BollingerStdDev,
		"rsi_period":             mr.RSIPeriod,
		"rsi_extreme_overbought": mr.RSIExtremeOverbought,
		"rsi_extreme_oversold":   mr.RSIExtremeOversold,
		"mean_reversion_period":  mr.MeanReversionPeriod,
	}
}

func (mr *MeanReversionStrategy) SetParameters(params map[string]interface{}) error {
	// Implementation similar to MomentumStrategy
	return nil
}

func (mr *MeanReversionStrategy) Analyze(data []models.HistoricalData) (*models.TradingSignal, error) {
	if len(data) < mr.MeanReversionPeriod {
		return nil, fmt.Errorf("insufficient data for mean reversion analysis")
	}

	// Extract price data
	var closes []decimal.Decimal
	for _, d := range data {
		closes = append(closes, d.Close)
	}

	// Calculate Bollinger Bands
	upperBand, middleBand, lowerBand, err := indicators.BollingerBands(closes, mr.BollingerPeriod, mr.BollingerStdDev)
	if err != nil {
		return nil, fmt.Errorf("Bollinger Bands calculation failed: %v", err)
	}

	// Calculate RSI
	rsiValues, err := indicators.RSI(closes, mr.RSIPeriod)
	if err != nil {
		return nil, fmt.Errorf("RSI calculation failed: %v", err)
	}

	// Get latest values
	latestPrice := closes[len(closes)-1]
	latestUpper := upperBand[len(upperBand)-1]
	latestMiddle := middleBand[len(middleBand)-1]
	latestLower := lowerBand[len(lowerBand)-1]
	latestRSI := rsiValues[len(rsiValues)-1]

	// Calculate distance from bands
	upperDistance := latestPrice.Sub(latestUpper).Div(latestUpper)
	lowerDistance := latestLower.Sub(latestPrice).Div(latestLower)

	signal := &models.TradingSignal{
		Symbol:    data[len(data)-1].Symbol,
		Price:     latestPrice,
		Algorithm: mr.Name(),
		CreatedAt: time.Now(),
		Indicators: map[string]interface{}{
			"rsi":            latestRSI,
			"upper_band":     latestUpper,
			"middle_band":    latestMiddle,
			"lower_band":     latestLower,
			"upper_distance": upperDistance,
			"lower_distance": lowerDistance,
		},
	}

	rsiFloat, _ := latestRSI.Float64()

	// Mean reversion logic
	if latestPrice.LessThan(latestLower) && rsiFloat < mr.RSIExtremeOversold {
		// Strong BUY signal - price below lower band and RSI oversold
		signal.Type = "BUY"
		signal.Strength = decimal.NewFromFloat(0.9)
		signal.RiskLevel = "HIGH"
		signal.Confidence = decimal.NewFromFloat(0.8)
		signal.TargetPrice = latestMiddle // Target middle band
		signal.StopLoss = latestPrice.Mul(decimal.NewFromFloat(0.95))
		
	} else if latestPrice.GreaterThan(latestUpper) && rsiFloat > mr.RSIExtremeOverbought {
		// Strong SELL signal - price above upper band and RSI overbought
		signal.Type = "SELL"
		signal.Strength = decimal.NewFromFloat(0.9)
		signal.RiskLevel = "HIGH"
		signal.Confidence = decimal.NewFromFloat(0.8)
		signal.TargetPrice = latestMiddle // Target middle band
		signal.StopLoss = latestPrice.Mul(decimal.NewFromFloat(1.05))
		
	} else {
		// HOLD signal
		signal.Type = "HOLD"
		signal.Strength = decimal.NewFromFloat(0.3)
		signal.RiskLevel = "LOW"
		signal.Confidence = decimal.NewFromFloat(0.5)
	}

	signal.ExpirationTime = time.Now().Add(time.Hour * 2)
	signal.TimeFrame = "30m"

	return signal, nil
}

// TrendFollowingStrategy implements trend following algorithms
type TrendFollowingStrategy struct {
	EMAFast      int     `json:"ema_fast"`
	EMASlow      int     `json:"ema_slow"`
	ADXPeriod    int     `json:"adx_period"`
	ADXThreshold float64 `json:"adx_threshold"`
	ATRPeriod    int     `json:"atr_period"`
	ATRMultiplier float64 `json:"atr_multiplier"`
}

func NewTrendFollowingStrategy() *TrendFollowingStrategy {
	return &TrendFollowingStrategy{
		EMAFast:       9,
		EMASlow:       21,
		ADXPeriod:     14,
		ADXThreshold:  25,
		ATRPeriod:     14,
		ATRMultiplier: 2.0,
	}
}

func (tf *TrendFollowingStrategy) Name() string {
	return "Trend Following Strategy"
}

func (tf *TrendFollowingStrategy) GetParameters() map[string]interface{} {
	return map[string]interface{}{
		"ema_fast":       tf.EMAFast,
		"ema_slow":       tf.EMASlow,
		"adx_period":     tf.ADXPeriod,
		"adx_threshold":  tf.ADXThreshold,
		"atr_period":     tf.ATRPeriod,
		"atr_multiplier": tf.ATRMultiplier,
	}
}

func (tf *TrendFollowingStrategy) SetParameters(params map[string]interface{}) error {
	// Implementation similar to other strategies
	return nil
}

func (tf *TrendFollowingStrategy) Analyze(data []models.HistoricalData) (*models.TradingSignal, error) {
	if len(data) < tf.EMASlow+tf.ADXPeriod {
		return nil, fmt.Errorf("insufficient data for trend following analysis")
	}

	// Extract OHLC data
	var highs, lows, closes []decimal.Decimal
	for _, d := range data {
		highs = append(highs, d.High)
		lows = append(lows, d.Low)
		closes = append(closes, d.Close)
	}

	// Calculate EMAs
	fastEMA, err := indicators.EMA(closes, tf.EMAFast)
	if err != nil {
		return nil, fmt.Errorf("Fast EMA calculation failed: %v", err)
	}

	slowEMA, err := indicators.EMA(closes, tf.EMASlow)
	if err != nil {
		return nil, fmt.Errorf("Slow EMA calculation failed: %v", err)
	}

	// Calculate ADX for trend strength
	adx, plusDI, minusDI, err := indicators.ADX(highs, lows, closes, tf.ADXPeriod)
	if err != nil {
		return nil, fmt.Errorf("ADX calculation failed: %v", err)
	}

	// Get latest values
	latestPrice := closes[len(closes)-1]
	latestFastEMA := fastEMA[len(fastEMA)-1]
	latestSlowEMA := slowEMA[len(slowEMA)-1]
	latestADX := adx[len(adx)-1]
	latestPlusDI := plusDI[len(plusDI)-1]
	latestMinusDI := minusDI[len(minusDI)-1]

	signal := &models.TradingSignal{
		Symbol:    data[len(data)-1].Symbol,
		Price:     latestPrice,
		Algorithm: tf.Name(),
		CreatedAt: time.Now(),
		Indicators: map[string]interface{}{
			"fast_ema":  latestFastEMA,
			"slow_ema":  latestSlowEMA,
			"adx":       latestADX,
			"plus_di":   latestPlusDI,
			"minus_di":  latestMinusDI,
		},
	}

	adxFloat, _ := latestADX.Float64()

	// Trend following logic
	if latestFastEMA.GreaterThan(latestSlowEMA) && adxFloat > tf.ADXThreshold && latestPlusDI.GreaterThan(latestMinusDI) {
		// Strong uptrend - BUY signal
		signal.Type = "BUY"
		signal.Strength = decimal.NewFromFloat(0.8)
		signal.RiskLevel = "MEDIUM"
		signal.Confidence = decimal.NewFromFloat(0.85)
		
	} else if latestFastEMA.LessThan(latestSlowEMA) && adxFloat > tf.ADXThreshold && latestMinusDI.GreaterThan(latestPlusDI) {
		// Strong downtrend - SELL signal
		signal.Type = "SELL"
		signal.Strength = decimal.NewFromFloat(0.8)
		signal.RiskLevel = "MEDIUM"
		signal.Confidence = decimal.NewFromFloat(0.85)
		
	} else {
		// No clear trend - HOLD
		signal.Type = "HOLD"
		signal.Strength = decimal.NewFromFloat(0.3)
		signal.RiskLevel = "LOW"
		signal.Confidence = decimal.NewFromFloat(0.5)
	}

	signal.ExpirationTime = time.Now().Add(time.Hour * 6)
	signal.TimeFrame = "1h"

	return signal, nil
}

// CompositeStrategy combines multiple algorithms
type CompositeStrategy struct {
	Strategies []TradingAlgorithm
	Weights    []float64
}

func NewCompositeStrategy() *CompositeStrategy {
	return &CompositeStrategy{
		Strategies: []TradingAlgorithm{
			NewMomentumStrategy(),
			NewMeanReversionStrategy(),
			NewTrendFollowingStrategy(),
		},
		Weights: []float64{0.4, 0.3, 0.3}, // Equal-ish weighting
	}
}

func (cs *CompositeStrategy) Name() string {
	return "Composite Strategy"
}

func (cs *CompositeStrategy) GetParameters() map[string]interface{} {
	params := make(map[string]interface{})
	for i, strategy := range cs.Strategies {
		strategyParams := strategy.GetParameters()
		for key, value := range strategyParams {
			params[fmt.Sprintf("%s_%s", strategy.Name(), key)] = value
		}
		params[fmt.Sprintf("weight_%d", i)] = cs.Weights[i]
	}
	return params
}

func (cs *CompositeStrategy) SetParameters(params map[string]interface{}) error {
	// Implementation to set parameters for individual strategies
	return nil
}

func (cs *CompositeStrategy) Analyze(data []models.HistoricalData) (*models.TradingSignal, error) {
	var signals []*models.TradingSignal
	var validSignals []*models.TradingSignal

	// Get signals from all strategies
	for _, strategy := range cs.Strategies {
		signal, err := strategy.Analyze(data)
		if err != nil {
			continue // Skip failed strategies
		}
		signals = append(signals, signal)
		validSignals = append(validSignals, signal)
	}

	if len(validSignals) == 0 {
		return nil, fmt.Errorf("no valid signals from any strategy")
	}

	// Combine signals using weighted average
	compositeSignal := &models.TradingSignal{
		Symbol:    data[len(data)-1].Symbol,
		Price:     data[len(data)-1].Close,
		Algorithm: cs.Name(),
		CreatedAt: time.Now(),
		Indicators: make(map[string]interface{}),
	}

	// Calculate weighted consensus
	var buyWeight, sellWeight, holdWeight float64
	var totalConfidence float64
	var riskLevels []string

	for i, signal := range validSignals {
		weight := cs.Weights[i]
		confidence, _ := signal.Confidence.Float64()
		
		switch signal.Type {
		case "BUY":
			buyWeight += weight * confidence
		case "SELL":
			sellWeight += weight * confidence
		case "HOLD":
			holdWeight += weight * confidence
		}
		
		totalConfidence += weight * confidence
		riskLevels = append(riskLevels, signal.RiskLevel)
		
		// Combine indicators
		for key, value := range signal.Indicators {
			compositeSignal.Indicators[fmt.Sprintf("%s_%s", signal.Algorithm, key)] = value
		}
	}

	// Determine final signal
	if buyWeight > sellWeight && buyWeight > holdWeight {
		compositeSignal.Type = "BUY"
		compositeSignal.Strength = decimal.NewFromFloat(buyWeight)
	} else if sellWeight > buyWeight && sellWeight > holdWeight {
		compositeSignal.Type = "SELL"
		compositeSignal.Strength = decimal.NewFromFloat(sellWeight)
	} else {
		compositeSignal.Type = "HOLD"
		compositeSignal.Strength = decimal.NewFromFloat(holdWeight)
	}

	compositeSignal.Confidence = decimal.NewFromFloat(totalConfidence / float64(len(validSignals)))
	compositeSignal.RiskLevel = determineOverallRisk(riskLevels)
	compositeSignal.ExpirationTime = time.Now().Add(time.Hour * 3)
	compositeSignal.TimeFrame = "1h"

	return compositeSignal, nil
}

// Helper functions

func calculateAverageVolume(volumes []int64, period int) int64 {
	if len(volumes) < period {
		period = len(volumes)
	}
	
	var sum int64
	start := len(volumes) - period
	for i := start; i < len(volumes); i++ {
		sum += volumes[i]
	}
	
	return sum / int64(period)
}

func determineOverallRisk(riskLevels []string) string {
	highCount := 0
	mediumCount := 0
	lowCount := 0
	
	for _, risk := range riskLevels {
		switch risk {
		case "HIGH":
			highCount++
		case "MEDIUM":
			mediumCount++
		case "LOW":
			lowCount++
		}
	}
	
	if highCount > mediumCount && highCount > lowCount {
		return "HIGH"
	} else if mediumCount > lowCount {
		return "MEDIUM"
	}
	return "LOW"
}

// AlgorithmManager manages all trading algorithms
type AlgorithmManager struct {
	algorithms map[string]TradingAlgorithm
}

func NewAlgorithmManager() *AlgorithmManager {
	return &AlgorithmManager{
		algorithms: map[string]TradingAlgorithm{
			"momentum":       NewMomentumStrategy(),
			"mean_reversion": NewMeanReversionStrategy(),
			"trend_following": NewTrendFollowingStrategy(),
			"composite":      NewCompositeStrategy(),
		},
	}
}

func (am *AlgorithmManager) GetAlgorithm(name string) (TradingAlgorithm, error) {
	algorithm, exists := am.algorithms[name]
	if !exists {
		return nil, fmt.Errorf("algorithm '%s' not found", name)
	}
	return algorithm, nil
}

func (am *AlgorithmManager) ListAlgorithms() []string {
	var names []string
	for name := range am.algorithms {
		names = append(names, name)
	}
	return names
}

func (am *AlgorithmManager) AnalyzeWithAll(data []models.HistoricalData) (map[string]*models.TradingSignal, error) {
	results := make(map[string]*models.TradingSignal)
	
	for name, algorithm := range am.algorithms {
		signal, err := algorithm.Analyze(data)
		if err != nil {
			continue // Skip failed analyses
		}
		results[name] = signal
	}
	
	if len(results) == 0 {
		return nil, fmt.Errorf("no algorithms produced valid signals")
	}
	
	return results, nil
}