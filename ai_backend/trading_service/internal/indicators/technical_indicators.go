package indicators

import (
	"math"
	"github.com/shopspring/decimal"
	"gonum.org/v1/gonum/stat"
)

// PriceData represents a single price point
type PriceData struct {
	Open   decimal.Decimal
	High   decimal.Decimal
	Low    decimal.Decimal
	Close  decimal.Decimal
	Volume int64
}

// IndicatorResult represents the result of a technical indicator calculation
type IndicatorResult struct {
	Value    decimal.Decimal        `json:"value"`
	Metadata map[string]interface{} `json:"metadata,omitempty"`
}

// RSI calculates the Relative Strength Index
func RSI(prices []decimal.Decimal, period int) ([]decimal.Decimal, error) {
	if len(prices) < period+1 {
		return nil, ErrInsufficientData
	}

	var results []decimal.Decimal
	var gains, losses []decimal.Decimal

	// Calculate initial gains and losses
	for i := 1; i < len(prices); i++ {
		change := prices[i].Sub(prices[i-1])
		if change.GreaterThan(decimal.Zero) {
			gains = append(gains, change)
			losses = append(losses, decimal.Zero)
		} else {
			gains = append(gains, decimal.Zero)
			losses = append(losses, change.Abs())
		}
	}

	// Calculate RSI values
	for i := period - 1; i < len(gains); i++ {
		var avgGain, avgLoss decimal.Decimal

		if i == period-1 {
			// Initial average
			sumGains := decimal.Zero
			sumLosses := decimal.Zero
			for j := 0; j < period; j++ {
				sumGains = sumGains.Add(gains[j])
				sumLosses = sumLosses.Add(losses[j])
			}
			avgGain = sumGains.Div(decimal.NewFromInt(int64(period)))
			avgLoss = sumLosses.Div(decimal.NewFromInt(int64(period)))
		} else {
			// Smoothed average
			prevAvgGain := results[i-period].Metadata()["avgGain"].(decimal.Decimal)
			prevAvgLoss := results[i-period].Metadata()["avgLoss"].(decimal.Decimal)
			
			avgGain = prevAvgGain.Mul(decimal.NewFromInt(int64(period-1))).Add(gains[i]).Div(decimal.NewFromInt(int64(period)))
			avgLoss = prevAvgLoss.Mul(decimal.NewFromInt(int64(period-1))).Add(losses[i]).Div(decimal.NewFromInt(int64(period)))
		}

		var rsi decimal.Decimal
		if avgLoss.IsZero() {
			rsi = decimal.NewFromInt(100)
		} else {
			rs := avgGain.Div(avgLoss)
			rsi = decimal.NewFromInt(100).Sub(decimal.NewFromInt(100).Div(decimal.NewFromInt(1).Add(rs)))
		}

		results = append(results, rsi)
	}

	return results, nil
}

// MACD calculates the Moving Average Convergence Divergence
func MACD(prices []decimal.Decimal, fastPeriod, slowPeriod, signalPeriod int) (macdLine, signalLine, histogram []decimal.Decimal, err error) {
	if len(prices) < slowPeriod {
		return nil, nil, nil, ErrInsufficientData
	}

	// Calculate EMAs
	fastEMA, err := EMA(prices, fastPeriod)
	if err != nil {
		return nil, nil, nil, err
	}

	slowEMA, err := EMA(prices, slowPeriod)
	if err != nil {
		return nil, nil, nil, err
	}

	// Calculate MACD line
	startIndex := slowPeriod - fastPeriod
	for i := startIndex; i < len(fastEMA); i++ {
		macdValue := fastEMA[i].Sub(slowEMA[i-startIndex])
		macdLine = append(macdLine, macdValue)
	}

	// Calculate signal line (EMA of MACD line)
	signalLine, err = EMA(macdLine, signalPeriod)
	if err != nil {
		return nil, nil, nil, err
	}

	// Calculate histogram
	startSignalIndex := signalPeriod - 1
	for i := startSignalIndex; i < len(macdLine); i++ {
		histValue := macdLine[i].Sub(signalLine[i-startSignalIndex])
		histogram = append(histogram, histValue)
	}

	return macdLine, signalLine, histogram, nil
}

// SMA calculates Simple Moving Average
func SMA(prices []decimal.Decimal, period int) ([]decimal.Decimal, error) {
	if len(prices) < period {
		return nil, ErrInsufficientData
	}

	var results []decimal.Decimal
	for i := period - 1; i < len(prices); i++ {
		sum := decimal.Zero
		for j := i - period + 1; j <= i; j++ {
			sum = sum.Add(prices[j])
		}
		average := sum.Div(decimal.NewFromInt(int64(period)))
		results = append(results, average)
	}

	return results, nil
}

// EMA calculates Exponential Moving Average
func EMA(prices []decimal.Decimal, period int) ([]decimal.Decimal, error) {
	if len(prices) < period {
		return nil, ErrInsufficientData
	}

	multiplier := decimal.NewFromFloat(2.0).Div(decimal.NewFromInt(int64(period + 1)))
	var results []decimal.Decimal

	// Initialize with SMA
	sma, err := SMA(prices[:period], period)
	if err != nil {
		return nil, err
	}
	results = append(results, sma[0])

	// Calculate EMA
	for i := period; i < len(prices); i++ {
		ema := prices[i].Sub(results[len(results)-1]).Mul(multiplier).Add(results[len(results)-1])
		results = append(results, ema)
	}

	return results, nil
}

// BollingerBands calculates Bollinger Bands
func BollingerBands(prices []decimal.Decimal, period int, multiplier float64) (upper, middle, lower []decimal.Decimal, err error) {
	if len(prices) < period {
		return nil, nil, nil, ErrInsufficientData
	}

	// Calculate SMA (middle band)
	middle, err = SMA(prices, period)
	if err != nil {
		return nil, nil, nil, err
	}

	mult := decimal.NewFromFloat(multiplier)

	// Calculate standard deviation and bands
	for i := period - 1; i < len(prices); i++ {
		// Calculate standard deviation for the period
		var sum decimal.Decimal
		smaValue := middle[i-period+1]
		
		for j := i - period + 1; j <= i; j++ {
			diff := prices[j].Sub(smaValue)
			sum = sum.Add(diff.Mul(diff))
		}
		
		variance := sum.Div(decimal.NewFromInt(int64(period)))
		stdDev := decimal.NewFromFloat(math.Sqrt(variance.InexactFloat64()))
		
		upperBand := smaValue.Add(stdDev.Mul(mult))
		lowerBand := smaValue.Sub(stdDev.Mul(mult))
		
		upper = append(upper, upperBand)
		lower = append(lower, lowerBand)
	}

	return upper, middle, lower, nil
}

// StochasticOscillator calculates the Stochastic Oscillator
func StochasticOscillator(highs, lows, closes []decimal.Decimal, kPeriod, dPeriod int) (kPercent, dPercent []decimal.Decimal, err error) {
	if len(highs) != len(lows) || len(lows) != len(closes) || len(closes) < kPeriod {
		return nil, nil, ErrInsufficientData
	}

	// Calculate %K
	for i := kPeriod - 1; i < len(closes); i++ {
		// Find highest high and lowest low in the period
		highestHigh := highs[i-kPeriod+1]
		lowestLow := lows[i-kPeriod+1]
		
		for j := i - kPeriod + 2; j <= i; j++ {
			if highs[j].GreaterThan(highestHigh) {
				highestHigh = highs[j]
			}
			if lows[j].LessThan(lowestLow) {
				lowestLow = lows[j]
			}
		}
		
		// Calculate %K
		numerator := closes[i].Sub(lowestLow)
		denominator := highestHigh.Sub(lowestLow)
		
		var k decimal.Decimal
		if denominator.IsZero() {
			k = decimal.NewFromInt(50) // Default to 50 if no range
		} else {
			k = numerator.Div(denominator).Mul(decimal.NewFromInt(100))
		}
		
		kPercent = append(kPercent, k)
	}

	// Calculate %D (SMA of %K)
	dPercent, err = SMA(kPercent, dPeriod)
	if err != nil {
		return nil, nil, err
	}

	return kPercent, dPercent, nil
}

// Williams %R calculates Williams %R
func WilliamsR(highs, lows, closes []decimal.Decimal, period int) ([]decimal.Decimal, error) {
	if len(highs) != len(lows) || len(lows) != len(closes) || len(closes) < period {
		return nil, ErrInsufficientData
	}

	var results []decimal.Decimal

	for i := period - 1; i < len(closes); i++ {
		// Find highest high and lowest low in the period
		highestHigh := highs[i-period+1]
		lowestLow := lows[i-period+1]
		
		for j := i - period + 2; j <= i; j++ {
			if highs[j].GreaterThan(highestHigh) {
				highestHigh = highs[j]
			}
			if lows[j].LessThan(lowestLow) {
				lowestLow = lows[j]
			}
		}
		
		// Calculate Williams %R
		numerator := highestHigh.Sub(closes[i])
		denominator := highestHigh.Sub(lowestLow)
		
		var wr decimal.Decimal
		if denominator.IsZero() {
			wr = decimal.NewFromInt(-50) // Default to -50 if no range
		} else {
			wr = numerator.Div(denominator).Mul(decimal.NewFromInt(-100))
		}
		
		results = append(results, wr)
	}

	return results, nil
}

// ADX calculates the Average Directional Index
func ADX(highs, lows, closes []decimal.Decimal, period int) (adx, plusDI, minusDI []decimal.Decimal, err error) {
	if len(highs) != len(lows) || len(lows) != len(closes) || len(closes) < period+1 {
		return nil, nil, nil, ErrInsufficientData
	}

	var trueRanges, plusDMs, minusDMs []decimal.Decimal

	// Calculate True Range, +DM, -DM
	for i := 1; i < len(closes); i++ {
		// True Range
		tr1 := highs[i].Sub(lows[i])
		tr2 := highs[i].Sub(closes[i-1]).Abs()
		tr3 := lows[i].Sub(closes[i-1]).Abs()
		
		tr := tr1
		if tr2.GreaterThan(tr) {
			tr = tr2
		}
		if tr3.GreaterThan(tr) {
			tr = tr3
		}
		trueRanges = append(trueRanges, tr)

		// +DM and -DM
		upMove := highs[i].Sub(highs[i-1])
		downMove := lows[i-1].Sub(lows[i])
		
		var plusDM, minusDM decimal.Decimal
		if upMove.GreaterThan(downMove) && upMove.GreaterThan(decimal.Zero) {
			plusDM = upMove
		}
		if downMove.GreaterThan(upMove) && downMove.GreaterThan(decimal.Zero) {
			minusDM = downMove
		}
		
		plusDMs = append(plusDMs, plusDM)
		minusDMs = append(minusDMs, minusDM)
	}

	// Calculate smoothed TR, +DM, -DM
	smoothedTR, _ := EMA(trueRanges, period)
	smoothedPlusDM, _ := EMA(plusDMs, period)
	smoothedMinusDM, _ := EMA(minusDMs, period)

	// Calculate +DI and -DI
	for i := 0; i < len(smoothedTR); i++ {
		var plusDIValue, minusDIValue decimal.Decimal
		
		if !smoothedTR[i].IsZero() {
			plusDIValue = smoothedPlusDM[i].Div(smoothedTR[i]).Mul(decimal.NewFromInt(100))
			minusDIValue = smoothedMinusDM[i].Div(smoothedTR[i]).Mul(decimal.NewFromInt(100))
		}
		
		plusDI = append(plusDI, plusDIValue)
		minusDI = append(minusDI, minusDIValue)
	}

	// Calculate DX and ADX
	var dxValues []decimal.Decimal
	for i := 0; i < len(plusDI); i++ {
		diSum := plusDI[i].Add(minusDI[i])
		diDiff := plusDI[i].Sub(minusDI[i]).Abs()
		
		var dx decimal.Decimal
		if !diSum.IsZero() {
			dx = diDiff.Div(diSum).Mul(decimal.NewFromInt(100))
		}
		dxValues = append(dxValues, dx)
	}

	// ADX is EMA of DX
	adx, err = EMA(dxValues, period)
	if err != nil {
		return nil, nil, nil, err
	}

	return adx, plusDI, minusDI, nil
}

// CCI calculates the Commodity Channel Index
func CCI(highs, lows, closes []decimal.Decimal, period int) ([]decimal.Decimal, error) {
	if len(highs) != len(lows) || len(lows) != len(closes) || len(closes) < period {
		return nil, ErrInsufficientData
	}

	// Calculate Typical Price
	var typicalPrices []decimal.Decimal
	for i := 0; i < len(closes); i++ {
		tp := highs[i].Add(lows[i]).Add(closes[i]).Div(decimal.NewFromInt(3))
		typicalPrices = append(typicalPrices, tp)
	}

	// Calculate SMA of Typical Price
	smaTP, err := SMA(typicalPrices, period)
	if err != nil {
		return nil, err
	}

	var results []decimal.Decimal
	constant := decimal.NewFromFloat(0.015)

	// Calculate CCI
	for i := period - 1; i < len(typicalPrices); i++ {
		// Calculate Mean Deviation
		var meanDev decimal.Decimal
		smaValue := smaTP[i-period+1]
		
		for j := i - period + 1; j <= i; j++ {
			meanDev = meanDev.Add(typicalPrices[j].Sub(smaValue).Abs())
		}
		meanDev = meanDev.Div(decimal.NewFromInt(int64(period)))

		// Calculate CCI
		var cci decimal.Decimal
		if !meanDev.IsZero() {
			cci = typicalPrices[i].Sub(smaValue).Div(constant.Mul(meanDev))
		}
		
		results = append(results, cci)
	}

	return results, nil
}

// Custom error for insufficient data
var ErrInsufficientData = fmt.Errorf("insufficient data for calculation")

// Helper function to convert decimal slice to float64 slice for statistical calculations
func decimalsToFloats(decimals []decimal.Decimal) []float64 {
	floats := make([]float64, len(decimals))
	for i, d := range decimals {
		floats[i], _ = d.Float64()
	}
	return floats
}

// CalculateVolatility calculates historical volatility
func CalculateVolatility(prices []decimal.Decimal, period int) (decimal.Decimal, error) {
	if len(prices) < period+1 {
		return decimal.Zero, ErrInsufficientData
	}

	// Calculate returns
	var returns []decimal.Decimal
	for i := 1; i < len(prices); i++ {
		ret := prices[i].Div(prices[i-1]).Sub(decimal.NewFromInt(1))
		returns = append(returns, ret)
	}

	// Take the last 'period' returns
	if len(returns) > period {
		returns = returns[len(returns)-period:]
	}

	// Convert to float64 for standard deviation calculation
	floatReturns := decimalsToFloats(returns)
	
	// Calculate standard deviation
	mean := stat.Mean(floatReturns, nil)
	variance := stat.Variance(floatReturns, nil)
	stdDev := math.Sqrt(variance)

	// Annualized volatility (assuming 252 trading days)
	annualizedVol := stdDev * math.Sqrt(252)
	
	return decimal.NewFromFloat(annualizedVol), nil
}

// CalculateBeta calculates beta relative to market
func CalculateBeta(stockPrices, marketPrices []decimal.Decimal, period int) (decimal.Decimal, error) {
	if len(stockPrices) != len(marketPrices) || len(stockPrices) < period+1 {
		return decimal.Zero, ErrInsufficientData
	}

	// Calculate returns
	var stockReturns, marketReturns []decimal.Decimal
	for i := 1; i < len(stockPrices); i++ {
		stockRet := stockPrices[i].Div(stockPrices[i-1]).Sub(decimal.NewFromInt(1))
		marketRet := marketPrices[i].Div(marketPrices[i-1]).Sub(decimal.NewFromInt(1))
		stockReturns = append(stockReturns, stockRet)
		marketReturns = append(marketReturns, marketRet)
	}

	// Take the last 'period' returns
	if len(stockReturns) > period {
		stockReturns = stockReturns[len(stockReturns)-period:]
		marketReturns = marketReturns[len(marketReturns)-period:]
	}

	// Convert to float64 for correlation calculation
	stockFloats := decimalsToFloats(stockReturns)
	marketFloats := decimalsToFloats(marketReturns)

	// Calculate covariance and market variance
	covariance := stat.Covariance(stockFloats, marketFloats, nil)
	marketVariance := stat.Variance(marketFloats, nil)

	if marketVariance == 0 {
		return decimal.Zero, nil
	}

	beta := covariance / marketVariance
	return decimal.NewFromFloat(beta), nil
}