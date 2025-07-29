from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import asyncio
import uuid
from datetime import datetime
import re
import json
import numpy as np
from collections import Counter
import spacy
from textblob import TextBlob
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.tag import pos_tag
from nltk.chunk import ne_chunk
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
import requests

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

try:
    nltk.data.find('taggers/averaged_perceptron_tagger')
except LookupError:
    nltk.download('averaged_perceptron_tagger')

try:
    nltk.data.find('chunkers/maxent_ne_chunker')
except LookupError:
    nltk.download('maxent_ne_chunker')

try:
    nltk.data.find('corpora/words')
except LookupError:
    nltk.download('words')

app = FastAPI(title="Text Analysis Service", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load spaCy model (if available)
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    nlp = None
    print("spaCy model not found. Some features will be limited.")

class TextAnalysisRequest(BaseModel):
    text: str
    analysis_type: str  # sentiment, entities, keywords, summary, all
    language: str = "en"
    options: Dict[str, Any] = {}

class SentimentAnalysisRequest(BaseModel):
    texts: List[str]
    return_confidence: bool = True

class TextSimilarityRequest(BaseModel):
    text1: str
    text2: str
    method: str = "cosine"  # cosine, jaccard, semantic

class TextClassificationRequest(BaseModel):
    text: str
    categories: List[str]
    model_type: str = "simple"

class KeywordExtractionRequest(BaseModel):
    text: str
    num_keywords: int = 10
    method: str = "tfidf"  # tfidf, yake, textrank

class SummaryRequest(BaseModel):
    text: str
    max_sentences: int = 3
    method: str = "extractive"  # extractive, abstractive

class AnalysisResult(BaseModel):
    job_id: str
    status: str
    result: Optional[Dict[str, Any]] = None
    metadata: Dict[str, Any] = {}
    created_at: str
    completed_at: Optional[str] = None

# In-memory job storage
jobs = {}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "text-analysis",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "features": {
            "spacy_available": nlp is not None,
            "nltk_ready": True
        }
    }

@app.post("/api/text/analyze")
async def analyze_text(request: TextAnalysisRequest, background_tasks: BackgroundTasks):
    """Comprehensive text analysis"""
    job_id = str(uuid.uuid4())
    
    jobs[job_id] = AnalysisResult(
        job_id=job_id,
        status="processing",
        created_at=datetime.now().isoformat(),
        metadata={
            "analysis_type": request.analysis_type,
            "language": request.language,
            "text_length": len(request.text)
        }
    )
    
    # Start background processing
    background_tasks.add_task(
        process_text_analysis,
        job_id,
        request.text,
        request.analysis_type,
        request.language,
        request.options
    )
    
    return {"job_id": job_id, "status": "processing"}

@app.post("/api/text/sentiment")
async def analyze_sentiment(request: SentimentAnalysisRequest):
    """Analyze sentiment of text(s)"""
    results = []
    
    for text in request.texts:
        # Use TextBlob for sentiment analysis
        blob = TextBlob(text)
        sentiment = blob.sentiment
        
        # Classify sentiment
        if sentiment.polarity > 0.1:
            label = "positive"
        elif sentiment.polarity < -0.1:
            label = "negative"
        else:
            label = "neutral"
        
        result = {
            "text": text[:100] + "..." if len(text) > 100 else text,
            "sentiment": label,
            "polarity": round(sentiment.polarity, 3),
            "subjectivity": round(sentiment.subjectivity, 3)
        }
        
        if request.return_confidence:
            result["confidence"] = abs(sentiment.polarity)
        
        results.append(result)
    
    return {
        "results": results,
        "summary": {
            "total_texts": len(results),
            "positive": len([r for r in results if r["sentiment"] == "positive"]),
            "negative": len([r for r in results if r["sentiment"] == "negative"]),
            "neutral": len([r for r in results if r["sentiment"] == "neutral"]),
            "avg_polarity": round(np.mean([r["polarity"] for r in results]), 3)
        }
    }

@app.post("/api/text/similarity")
async def calculate_similarity(request: TextSimilarityRequest):
    """Calculate text similarity"""
    if request.method == "cosine":
        similarity = calculate_cosine_similarity(request.text1, request.text2)
    elif request.method == "jaccard":
        similarity = calculate_jaccard_similarity(request.text1, request.text2)
    elif request.method == "semantic" and nlp:
        similarity = calculate_semantic_similarity(request.text1, request.text2)
    else:
        similarity = calculate_cosine_similarity(request.text1, request.text2)
    
    return {
        "text1_preview": request.text1[:100] + "..." if len(request.text1) > 100 else request.text1,
        "text2_preview": request.text2[:100] + "..." if len(request.text2) > 100 else request.text2,
        "similarity_score": round(similarity, 4),
        "method": request.method,
        "interpretation": get_similarity_interpretation(similarity)
    }

@app.post("/api/text/classify")
async def classify_text(request: TextClassificationRequest):
    """Classify text into categories"""
    # Simple keyword-based classification
    text_lower = request.text.lower()
    scores = {}
    
    for category in request.categories:
        # Simple scoring based on keyword matching
        category_keywords = category.lower().split()
        score = 0
        for keyword in category_keywords:
            score += text_lower.count(keyword)
        scores[category] = score
    
    # Normalize scores
    total_score = sum(scores.values())
    if total_score > 0:
        probabilities = {cat: score/total_score for cat, score in scores.items()}
    else:
        probabilities = {cat: 1/len(request.categories) for cat in request.categories}
    
    # Get top prediction
    top_category = max(probabilities, key=probabilities.get)
    
    return {
        "text_preview": request.text[:200] + "..." if len(request.text) > 200 else request.text,
        "predicted_category": top_category,
        "confidence": round(probabilities[top_category], 3),
        "all_probabilities": {cat: round(prob, 3) for cat, prob in probabilities.items()}
    }

@app.post("/api/text/keywords")
async def extract_keywords(request: KeywordExtractionRequest):
    """Extract keywords from text"""
    if request.method == "tfidf":
        keywords = extract_tfidf_keywords(request.text, request.num_keywords)
    else:
        keywords = extract_simple_keywords(request.text, request.num_keywords)
    
    return {
        "text_preview": request.text[:200] + "..." if len(request.text) > 200 else request.text,
        "keywords": keywords,
        "method": request.method,
        "num_keywords": len(keywords)
    }

@app.post("/api/text/summarize")
async def summarize_text(request: SummaryRequest):
    """Summarize text"""
    if request.method == "extractive":
        summary = extractive_summarization(request.text, request.max_sentences)
    else:
        summary = simple_summarization(request.text, request.max_sentences)
    
    return {
        "original_length": len(request.text),
        "summary": summary,
        "summary_length": len(summary),
        "compression_ratio": round(len(summary) / len(request.text), 2),
        "method": request.method
    }

@app.post("/api/text/entities")
async def extract_entities(text: str):
    """Extract named entities from text"""
    entities = []
    
    if nlp:
        # Use spaCy for NER
        doc = nlp(text)
        for ent in doc.ents:
            entities.append({
                "text": ent.text,
                "label": ent.label_,
                "description": spacy.explain(ent.label_),
                "start": ent.start_char,
                "end": ent.end_char,
                "confidence": 0.9  # Mock confidence
            })
    else:
        # Fallback to NLTK
        tokens = word_tokenize(text)
        pos_tags = pos_tag(tokens)
        chunks = ne_chunk(pos_tags)
        
        current_chunk = []
        for chunk in chunks:
            if hasattr(chunk, 'label'):
                current_chunk.append({
                    "text": " ".join([token for token, pos in chunk]),
                    "label": chunk.label(),
                    "confidence": 0.8
                })
        entities = current_chunk
    
    return {
        "text_preview": text[:200] + "..." if len(text) > 200 else text,
        "entities": entities,
        "entity_counts": Counter([ent["label"] for ent in entities])
    }

@app.post("/api/text/language-detect")
async def detect_language(text: str):
    """Detect language of text"""
    try:
        blob = TextBlob(text)
        detected_lang = blob.detect_language()
        confidence = 0.9  # Mock confidence
    except:
        detected_lang = "unknown"
        confidence = 0.0
    
    return {
        "text_preview": text[:100] + "..." if len(text) > 100 else text,
        "detected_language": detected_lang,
        "confidence": confidence,
        "supported_languages": ["en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ar"]
    }

@app.get("/api/text/job/{job_id}")
async def get_job_status(job_id: str):
    """Get analysis job status"""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return jobs[job_id]

# Background processing function
async def process_text_analysis(job_id: str, text: str, analysis_type: str, language: str, options: dict):
    """Background text analysis processing"""
    try:
        result = {}
        
        if analysis_type == "all" or analysis_type == "sentiment":
            blob = TextBlob(text)
            sentiment = blob.sentiment
            result["sentiment"] = {
                "polarity": round(sentiment.polarity, 3),
                "subjectivity": round(sentiment.subjectivity, 3),
                "label": "positive" if sentiment.polarity > 0.1 else "negative" if sentiment.polarity < -0.1 else "neutral"
            }
        
        if analysis_type == "all" or analysis_type == "entities":
            if nlp:
                doc = nlp(text)
                entities = []
                for ent in doc.ents:
                    entities.append({
                        "text": ent.text,
                        "label": ent.label_,
                        "description": spacy.explain(ent.label_)
                    })
                result["entities"] = entities
        
        if analysis_type == "all" or analysis_type == "keywords":
            keywords = extract_tfidf_keywords(text, options.get("num_keywords", 10))
            result["keywords"] = keywords
        
        if analysis_type == "all" or analysis_type == "summary":
            summary = extractive_summarization(text, options.get("max_sentences", 3))
            result["summary"] = summary
        
        if analysis_type == "all" or analysis_type == "statistics":
            result["statistics"] = get_text_statistics(text)
        
        # Update job with results
        jobs[job_id].status = "completed"
        jobs[job_id].result = result
        jobs[job_id].completed_at = datetime.now().isoformat()
        
    except Exception as e:
        jobs[job_id].status = "failed"
        jobs[job_id].metadata["error"] = str(e)

# Helper functions
def calculate_cosine_similarity(text1: str, text2: str) -> float:
    """Calculate cosine similarity between two texts"""
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform([text1, text2])
    cosine_sim = (tfidf_matrix * tfidf_matrix.T).toarray()
    return cosine_sim[0][1]

def calculate_jaccard_similarity(text1: str, text2: str) -> float:
    """Calculate Jaccard similarity between two texts"""
    words1 = set(text1.lower().split())
    words2 = set(text2.lower().split())
    intersection = len(words1.intersection(words2))
    union = len(words1.union(words2))
    return intersection / union if union > 0 else 0

def calculate_semantic_similarity(text1: str, text2: str) -> float:
    """Calculate semantic similarity using spaCy"""
    if not nlp:
        return calculate_cosine_similarity(text1, text2)
    
    doc1 = nlp(text1)
    doc2 = nlp(text2)
    return doc1.similarity(doc2)

def get_similarity_interpretation(score: float) -> str:
    """Interpret similarity score"""
    if score >= 0.8:
        return "Very High Similarity"
    elif score >= 0.6:
        return "High Similarity"
    elif score >= 0.4:
        return "Moderate Similarity"
    elif score >= 0.2:
        return "Low Similarity"
    else:
        return "Very Low Similarity"

def extract_tfidf_keywords(text: str, num_keywords: int) -> List[Dict[str, float]]:
    """Extract keywords using TF-IDF"""
    # Simple TF-IDF implementation
    sentences = sent_tokenize(text)
    vectorizer = TfidfVectorizer(stop_words='english', max_features=num_keywords)
    tfidf_matrix = vectorizer.fit_transform(sentences)
    
    feature_names = vectorizer.get_feature_names_out()
    scores = tfidf_matrix.sum(axis=0).A1
    
    keywords = []
    for i, word in enumerate(feature_names):
        keywords.append({
            "keyword": word,
            "score": round(scores[i], 4)
        })
    
    return sorted(keywords, key=lambda x: x["score"], reverse=True)

def extract_simple_keywords(text: str, num_keywords: int) -> List[Dict[str, float]]:
    """Extract keywords using simple frequency"""
    words = word_tokenize(text.lower())
    stop_words = set(stopwords.words('english'))
    words = [word for word in words if word.isalpha() and word not in stop_words]
    
    word_freq = Counter(words)
    keywords = []
    
    for word, freq in word_freq.most_common(num_keywords):
        keywords.append({
            "keyword": word,
            "score": freq / len(words)
        })
    
    return keywords

def extractive_summarization(text: str, max_sentences: int) -> str:
    """Simple extractive summarization"""
    sentences = sent_tokenize(text)
    
    if len(sentences) <= max_sentences:
        return text
    
    # Simple scoring based on sentence length and position
    scored_sentences = []
    for i, sentence in enumerate(sentences):
        # Score based on length and position (first and last sentences get bonus)
        length_score = len(sentence.split()) / 20  # Normalize by average sentence length
        position_score = 1.0 if i == 0 or i == len(sentences) - 1 else 0.5
        
        scored_sentences.append({
            "sentence": sentence,
            "score": length_score + position_score,
            "index": i
        })
    
    # Select top sentences
    top_sentences = sorted(scored_sentences, key=lambda x: x["score"], reverse=True)[:max_sentences]
    top_sentences = sorted(top_sentences, key=lambda x: x["index"])  # Maintain original order
    
    return " ".join([s["sentence"] for s in top_sentences])

def simple_summarization(text: str, max_sentences: int) -> str:
    """Simple summarization fallback"""
    sentences = sent_tokenize(text)
    if len(sentences) <= max_sentences:
        return text
    
    # Just take first few sentences
    return " ".join(sentences[:max_sentences])

def get_text_statistics(text: str) -> Dict[str, Any]:
    """Get comprehensive text statistics"""
    words = word_tokenize(text)
    sentences = sent_tokenize(text)
    
    return {
        "character_count": len(text),
        "word_count": len(words),
        "sentence_count": len(sentences),
        "paragraph_count": len(text.split('\n\n')),
        "avg_words_per_sentence": round(len(words) / len(sentences), 2) if sentences else 0,
        "avg_characters_per_word": round(len(text) / len(words), 2) if words else 0,
        "readability": {
            "reading_time_minutes": round(len(words) / 200, 1),  # Assuming 200 WPM
            "complexity": "simple" if len(words) / len(sentences) < 15 else "moderate" if len(words) / len(sentences) < 25 else "complex"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)