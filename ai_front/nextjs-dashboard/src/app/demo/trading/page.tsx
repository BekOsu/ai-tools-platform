'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface TradingData {
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
  change: number;
  changePercent: number;
}

interface AnalysisResult {
  symbol: string;
  analysis: Record<string, any>;
  signals: string[];
  risk: string;
  confidence: number;
}

export default function TradingDemoPage() {
  const [symbol, setSymbol] = useState('AAPL');
  const [tradingData, setTradingData] = useState<TradingData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  // Fetch real-time price data
  const fetchPriceData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/trading/prices/${symbol}`);
      const data = await response.json();
      setTradingData(data);
    } catch (error) {
      console.error('Failed to fetch price data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Perform technical analysis
  const performAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/trading/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          timeFrame: '1D',
          indicators: ['RSI', 'MACD', 'SMA_20', 'EMA_12', 'Bollinger']
        })
      });
      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Failed to perform analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  // WebSocket connection for real-time data
  useEffect(() => {
    let ws: WebSocket;
    
    const connectWebSocket = () => {
      try {
        ws = new WebSocket('ws://localhost:8000/ws/trading');
        
        ws.onopen = () => {
          setWsConnected(true);
          console.log('WebSocket connected');
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.symbol === symbol) {
            setTradingData(data);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setWsConnected(false);
        };

        ws.onclose = () => {
          setWsConnected(false);
          // Reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setWsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [symbol]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Trading Analysis Service Demo
        </h1>
        <p className="text-gray-600">
          Real-time market data analysis with technical indicators and WebSocket feeds
        </p>
      </div>

      {/* Controls */}
      <Card className="mb-6 p-6">
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Symbol
            </label>
            <Input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="Enter symbol (e.g., AAPL)"
              className="w-40"
            />
          </div>
          <Button onClick={fetchPriceData} disabled={loading}>
            {loading ? 'Loading...' : 'Get Price Data'}
          </Button>
          <Button onClick={performAnalysis} disabled={loading} variant="secondary">
            Analyze
          </Button>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              {wsConnected ? 'Live Feed' : 'Disconnected'}
            </span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Price Data */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Real-time Price Data</h2>
          {tradingData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Symbol</p>
                  <p className="text-2xl font-bold">{tradingData.symbol}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="text-2xl font-bold">${tradingData.price.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Change</p>
                  <p className={`text-lg font-semibold ${tradingData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tradingData.change >= 0 ? '+' : ''}{tradingData.change.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Change %</p>
                  <p className={`text-lg font-semibold ${tradingData.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tradingData.changePercent >= 0 ? '+' : ''}{tradingData.changePercent.toFixed(2)}%
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Volume</p>
                <p className="text-lg">{tradingData.volume.toLocaleString()}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Last Update</p>
                <p className="text-sm">{new Date(tradingData.timestamp * 1000).toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Click "Get Price Data" to fetch real-time data</p>
            </div>
          )}
        </Card>

        {/* Technical Analysis */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Technical Analysis</h2>
          {analysis ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Risk Level</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    analysis.risk === 'LOW' ? 'bg-green-100 text-green-800' :
                    analysis.risk === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {analysis.risk}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Confidence</p>
                  <p className="text-lg font-semibold">{(analysis.confidence * 100).toFixed(1)}%</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Trading Signals</p>
                <div className="space-y-1">
                  {analysis.signals.map((signal, index) => (
                    <div key={index} className={`text-sm p-2 rounded ${
                      signal.includes('BUY') ? 'bg-green-50 text-green-800' :
                      signal.includes('SELL') ? 'bg-red-50 text-red-800' :
                      'bg-gray-50 text-gray-800'
                    }`}>
                      {signal}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Technical Indicators</p>
                <div className="space-y-2">
                  {Object.entries(analysis.analysis).map(([indicator, value]) => (
                    <div key={indicator} className="flex justify-between">
                      <span className="text-sm font-medium">{indicator}</span>
                      <span className="text-sm">
                        {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Click "Analyze" to perform technical analysis</p>
            </div>
          )}
        </Card>
      </div>

      {/* Service Information */}
      <Card className="mt-6 p-6">
        <h2 className="text-xl font-semibold mb-4">Service Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-green-600 text-2xl mb-2">⚡</div>
            <h3 className="font-semibold">Ultra-Low Latency</h3>
            <p className="text-sm text-gray-600">< 10ms response time</p>
          </div>
          <div className="text-center">
            <div className="text-blue-600 text-2xl mb-2">📊</div>
            <h3 className="font-semibold">Technical Indicators</h3>
            <p className="text-sm text-gray-600">RSI, MACD, Bollinger Bands</p>
          </div>
          <div className="text-center">
            <div className="text-purple-600 text-2xl mb-2">🔄</div>
            <h3 className="font-semibold">Real-time WebSocket</h3>
            <p className="text-sm text-gray-600">Live price updates</p>
          </div>
          <div className="text-center">
            <div className="text-orange-600 text-2xl mb-2">⚖️</div>
            <h3 className="font-semibold">Risk Assessment</h3>
            <p className="text-sm text-gray-600">Automated risk scoring</p>
          </div>
        </div>
      </Card>
    </div>
  );
}