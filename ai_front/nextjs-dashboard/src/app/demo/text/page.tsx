'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface AnalysisJob {
  job_id: string;
  status: 'processing' | 'completed' | 'failed';
  result?: any;
  metadata: any;
}

interface SentimentResult {
  results: Array<{
    text: string;
    sentiment: string;
    polarity: number;
    subjectivity: number;
    confidence?: number;
  }>;
  summary: {
    total_texts: number;
    positive: number;
    negative: number;
    neutral: number;
    avg_polarity: number;
  };
}

export default function TextDemoPage() {
  const [inputText, setInputText] = useState('I absolutely love this new AI platform! The features are amazing and the interface is so intuitive. However, the loading times could be improved.');
  const [analysisJob, setAnalysisJob] = useState<AnalysisJob | null>(null);
  const [sentimentResult, setSentimentResult] = useState<SentimentResult | null>(null);
  const [similarityResult, setSimilarityResult] = useState<any>(null);
  const [keywordsResult, setKeywordsResult] = useState<any>(null);
  const [summaryResult, setSummaryResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('sentiment');

  // Sample texts for comparison
  const [compareText, setCompareText] = useState('This AI platform is fantastic! I really enjoy using all the advanced features.');

  // Comprehensive text analysis
  const performFullAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/text/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          analysis_type: 'all',
          language: 'en',
          options: {
            num_keywords: 10,
            max_sentences: 3
          }
        })
      });
      
      const data = await response.json();
      setAnalysisJob(data);
      
      if (data.job_id) {
        pollJobStatus(data.job_id);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sentiment analysis
  const analyzeSentiment = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/text/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texts: [inputText],
          return_confidence: true
        })
      });
      
      const data = await response.json();
      setSentimentResult(data);
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Text similarity
  const calculateSimilarity = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/text/similarity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text1: inputText,
          text2: compareText,
          method: 'cosine'
        })
      });
      
      const data = await response.json();
      setSimilarityResult(data);
    } catch (error) {
      console.error('Similarity calculation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Keyword extraction
  const extractKeywords = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/text/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          num_keywords: 10,
          method: 'tfidf'
        })
      });
      
      const data = await response.json();
      setKeywordsResult(data);
    } catch (error) {
      console.error('Keyword extraction failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Text summarization
  const summarizeText = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/text/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          max_sentences: 2,
          method: 'extractive'
        })
      });
      
      const data = await response.json();
      setSummaryResult(data);
    } catch (error) {
      console.error('Summarization failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Poll job status for comprehensive analysis
  const pollJobStatus = async (jobId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/text/job/${jobId}`);
        const jobData = await response.json();
        setAnalysisJob(jobData);
        
        if (jobData.status === 'processing') {
          setTimeout(poll, 2000);
        }
      } catch (error) {
        console.error('Status check failed:', error);
      }
    };
    poll();
  };

  // Sample texts for quick testing
  const sampleTexts = [
    "I absolutely love this new AI platform! The features are amazing and the interface is so intuitive. However, the loading times could be improved.",
    "The artificial intelligence revolution is transforming industries worldwide. Machine learning algorithms are becoming increasingly sophisticated, enabling computers to perform tasks that once required human intelligence. Natural language processing, computer vision, and predictive analytics are just a few examples of AI applications that are reshaping our digital landscape.",
    "This product is terrible. I hate the design and the functionality is completely broken. The customer service was unhelpful and rude. I would never recommend this to anyone.",
    "Climate change represents one of the most pressing challenges of our time. Rising global temperatures, melting ice caps, and extreme weather events are clear indicators that urgent action is needed. Governments, businesses, and individuals must work together to reduce greenhouse gas emissions and transition to renewable energy sources."
  ];

  const tabs = [
    { id: 'sentiment', label: 'Sentiment Analysis', icon: '😊' },
    { id: 'similarity', label: 'Text Similarity', icon: '🔗' },
    { id: 'keywords', label: 'Keywords', icon: '🏷️' },
    { id: 'summary', label: 'Summary', icon: '📝' },
    { id: 'comprehensive', label: 'Full Analysis', icon: '🔍' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Advanced Text Analysis Demo
        </h1>
        <p className="text-gray-600">
          Comprehensive NLP with sentiment analysis, entity recognition, keyword extraction, and summarization
        </p>
      </div>

      {/* Input Section */}
      <Card className="mb-6 p-6">
        <h2 className="text-xl font-semibold mb-4">Text Input</h2>
        
        {/* Sample texts */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Quick samples:</p>
          <div className="flex flex-wrap gap-2">
            {sampleTexts.map((sample, index) => (
              <button
                key={index}
                onClick={() => setInputText(sample)}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                Sample {index + 1}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter your text for analysis..."
          className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        <div className="mt-4 text-sm text-gray-500">
          Character count: {inputText.length} | Word count: {inputText.split(' ').filter(word => word.length > 0).length}
        </div>
      </Card>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Sentiment Analysis */}
        {activeTab === 'sentiment' && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Sentiment Analysis</h2>
              <Button onClick={analyzeSentiment} disabled={loading || !inputText}>
                {loading ? 'Analyzing...' : 'Analyze Sentiment'}
              </Button>
            </div>
            
            {sentimentResult && (
              <div className="space-y-4">
                {sentimentResult.results.map((result, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        result.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                        result.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {result.sentiment.toUpperCase()}
                      </span>
                      {result.confidence && (
                        <span className="text-sm text-gray-600">
                          Confidence: {(result.confidence * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Polarity:</span>
                        <span className={`ml-2 font-medium ${
                          result.polarity > 0 ? 'text-green-600' : 
                          result.polarity < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {result.polarity.toFixed(3)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Subjectivity:</span>
                        <span className="ml-2 font-medium">{result.subjectivity.toFixed(3)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {sentimentResult.summary && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-green-600 font-semibold">{sentimentResult.summary.positive}</div>
                        <div className="text-gray-600">Positive</div>
                      </div>
                      <div className="text-center">
                        <div className="text-red-600 font-semibold">{sentimentResult.summary.negative}</div>
                        <div className="text-gray-600">Negative</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-600 font-semibold">{sentimentResult.summary.neutral}</div>
                        <div className="text-gray-600">Neutral</div>
                      </div>
                      <div className="text-center">
                        <div className="text-blue-600 font-semibold">{sentimentResult.summary.avg_polarity.toFixed(2)}</div>
                        <div className="text-gray-600">Avg Polarity</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        {/* Text Similarity */}
        {activeTab === 'similarity' && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Text Similarity</h2>
              <Button onClick={calculateSimilarity} disabled={loading || !inputText || !compareText}>
                {loading ? 'Calculating...' : 'Calculate Similarity'}
              </Button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compare with:
              </label>
              <textarea
                value={compareText}
                onChange={(e) => setCompareText(e.target.value)}
                placeholder="Enter second text for comparison..."
                className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {similarityResult && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {(similarityResult.similarity_score * 100).toFixed(1)}%
                  </div>
                  <div className="text-lg font-medium text-gray-700">
                    {similarityResult.interpretation}
                  </div>
                  <div className="text-sm text-gray-500">
                    Method: {similarityResult.method}
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${similarityResult.similarity_score * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Keywords */}
        {activeTab === 'keywords' && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Keyword Extraction</h2>
              <Button onClick={extractKeywords} disabled={loading || !inputText}>
                {loading ? 'Extracting...' : 'Extract Keywords'}
              </Button>
            </div>
            
            {keywordsResult && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {keywordsResult.keywords.map((keyword: any, index: number) => (
                    <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                      <div className="font-medium text-blue-900">{keyword.keyword}</div>
                      <div className="text-xs text-blue-600">Score: {keyword.score.toFixed(3)}</div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                  <strong>Method:</strong> {keywordsResult.method} | 
                  <strong> Keywords found:</strong> {keywordsResult.num_keywords}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Summary */}
        {activeTab === 'summary' && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Text Summarization</h2>
              <Button onClick={summarizeText} disabled={loading || !inputText}>
                {loading ? 'Summarizing...' : 'Summarize Text'}
              </Button>
            </div>
            
            {summaryResult && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Summary</h3>
                  <p className="text-gray-800 leading-relaxed">{summaryResult.summary}</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="font-semibold text-blue-600">{summaryResult.original_length}</div>
                    <div className="text-gray-600">Original Length</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="font-semibold text-green-600">{summaryResult.summary_length}</div>
                    <div className="text-gray-600">Summary Length</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="font-semibold text-purple-600">{summaryResult.compression_ratio}</div>
                    <div className="text-gray-600">Compression Ratio</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="font-semibold text-orange-600">{summaryResult.method}</div>
                    <div className="text-gray-600">Method</div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Comprehensive Analysis */}
        {activeTab === 'comprehensive' && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Comprehensive Analysis</h2>
              <Button onClick={performFullAnalysis} disabled={loading || !inputText}>
                {loading ? 'Analyzing...' : 'Full Analysis'}
              </Button>
            </div>
            
            {analysisJob && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full ${
                    analysisJob.status === 'completed' ? 'bg-green-500' :
                    analysisJob.status === 'processing' ? 'bg-yellow-500 animate-pulse' :
                    'bg-red-500'
                  }`} />
                  <span className="capitalize font-medium">{analysisJob.status}</span>
                  <span className="text-sm text-gray-600">Job ID: {analysisJob.job_id}</span>
                </div>
                
                {analysisJob.status === 'completed' && analysisJob.result && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sentiment */}
                    {analysisJob.result.sentiment && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Sentiment</h3>
                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          analysisJob.result.sentiment.label === 'positive' ? 'bg-green-100 text-green-800' :
                          analysisJob.result.sentiment.label === 'negative' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {analysisJob.result.sentiment.label.toUpperCase()}
                        </div>
                        <div className="mt-2 text-sm">
                          Polarity: {analysisJob.result.sentiment.polarity}
                        </div>
                      </div>
                    )}
                    
                    {/* Keywords */}
                    {analysisJob.result.keywords && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Top Keywords</h3>
                        <div className="flex flex-wrap gap-2">
                          {analysisJob.result.keywords.slice(0, 5).map((keyword: any, index: number) => (
                            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              {keyword.keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Summary */}
                    {analysisJob.result.summary && (
                      <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                        <h3 className="font-semibold mb-2">Summary</h3>
                        <p className="text-sm text-gray-700">{analysisJob.result.summary}</p>
                      </div>
                    )}
                    
                    {/* Statistics */}
                    {analysisJob.result.statistics && (
                      <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                        <h3 className="font-semibold mb-2">Text Statistics</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="font-medium">{analysisJob.result.statistics.word_count}</div>
                            <div className="text-gray-600">Words</div>
                          </div>
                          <div>
                            <div className="font-medium">{analysisJob.result.statistics.sentence_count}</div>
                            <div className="text-gray-600">Sentences</div>
                          </div>
                          <div>
                            <div className="font-medium">{analysisJob.result.statistics.avg_words_per_sentence}</div>
                            <div className="text-gray-600">Avg Words/Sentence</div>
                          </div>
                          <div>
                            <div className="font-medium">{analysisJob.result.statistics.readability?.reading_time_minutes}min</div>
                            <div className="text-gray-600">Reading Time</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Service Features */}
      <Card className="mt-6 p-6">
        <h2 className="text-xl font-semibold mb-4">Service Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-purple-600 text-2xl mb-2">🧠</div>
            <h3 className="font-semibold">Advanced NLP</h3>
            <p className="text-sm text-gray-600">spaCy & NLTK powered analysis</p>
          </div>
          <div className="text-center">
            <div className="text-green-600 text-2xl mb-2">😊</div>
            <h3 className="font-semibold">Sentiment Analysis</h3>
            <p className="text-sm text-gray-600">Polarity & subjectivity scoring</p>
          </div>
          <div className="text-center">
            <div className="text-blue-600 text-2xl mb-2">🏷️</div>
            <h3 className="font-semibold">Entity Recognition</h3>
            <p className="text-sm text-gray-600">Named entities & keywords</p>
          </div>
          <div className="text-center">
            <div className="text-orange-600 text-2xl mb-2">📝</div>
            <h3 className="font-semibold">Text Summarization</h3>
            <p className="text-sm text-gray-600">Extractive & abstractive methods</p>
          </div>
        </div>
      </Card>
    </div>
  );
}