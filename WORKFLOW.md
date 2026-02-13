# BuyWise – Multi-Agent Product Search Workflow

## Overview

BuyWise is a **multi-agent AI buying assistant** that searches across multiple e-commerce websites to find the best product for the user. Instead of the user manually comparing dozens of listings across Amazon, Flipkart, Croma, etc., BuyWise deploys a **pipeline of specialized AI agents**, each responsible for one part of the decision-making process.

The user simply describes what they want — **any product, any category** — and BuyWise returns 3 optimized picks: **Best Overall**, **Best Budget**, and **Premium Choice**, along with transparent reasoning.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERFACE                         │
│  User enters: "best wireless earbuds under 3000 for gym"    │
│  + adjusts weight sliders (price, reviews, rating, delivery)│
└─────────────────────┬───────────────────────────────────────┘
                      │  POST /api/recommendations
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              1. SUPERVISOR AGENT (Orchestrator)              │
│                                                             │
│  • Receives user query + weight preferences                 │
│  • Breaks query into structured subtasks                    │
│  • Triggers each agent in the correct sequence              │
│  • Aggregates all structured outputs                        │
│  • Returns final formatted recommendation                   │
│                                                             │
│  RULES: Does NOT generate product data. Does NOT rank.      │
│         Only coordinates and passes structured data.         │
└─────────┬───────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│         2. WEB SEARCH AGENT (Multi-Website Searcher)         │
│                                                             │
│  • Uses OpenRouter LLM to search across multiple websites   │
│  • Searches: Amazon, Flipkart, Croma, Reliance Digital,     │
│    Myntra, Nykaa, etc. (depending on product category)      │
│  • Returns structured product data for each listing:        │
│    - Platform name & product URL                            │
│    - Product title & brand                                  │
│    - Current price & original MRP                           │
│    - Seller rating (0-5)                                    │
│    - Delivery time (days)                                   │
│    - Warranty info                                          │
│    - Historical price trend (if available)                  │
│    - Customer review snippets                               │
│                                                             │
│  OUTPUT: Array of 5-8 products from different platforms      │
└─────────┬───────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│    3. PRODUCT RETRIEVAL AGENT (Parser & Normalizer)          │
│                                                             │
│  • Calls the Web Search Agent                               │
│  • Validates and normalizes the response                    │
│  • Ensures every product has all required fields            │
│  • Falls back to mock data if the LLM call fails           │
│  • Deduplicates products across platforms                   │
│                                                             │
│  OUTPUT: Clean, validated array of product objects            │
└─────────┬───────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│       4. REVIEW INTELLIGENCE AGENT (Sentiment Analyzer)      │
│                                                             │
│  • Takes the product list from Step 3                       │
│  • Uses OpenRouter LLM to analyze review snippets           │
│  • Extracts for each product:                               │
│    - Top 5 pros                                             │
│    - Top 5 cons                                             │
│    - Sentiment score (0-10)                                 │
│    - Most frequent complaints                               │
│    - Durability assessment (Low / Medium / High)            │
│                                                             │
│  RULES: Objective. No exaggeration. No purchase advice.      │
│                                                             │
│  OUTPUT: Array of review insights per product                │
└─────────┬───────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│       5. PRICE INTELLIGENCE AGENT (Discount Analyzer)        │
│                                                             │
│  • Takes the product list from Step 3                       │
│  • Analyzes: current price vs. original price vs. history   │
│  • Determines for each product:                             │
│    - Is the discount authentic? (true/false)                │
│    - Price fairness score (0-10)                            │
│    - Buy recommendation: "Buy" / "Wait" / "Neutral"        │
│    - Risk level of price increase (Low/Medium/High)         │
│                                                             │
│  RULES: Based only on numbers. No opinions.                  │
│                                                             │
│  OUTPUT: Array of price intelligence per product             │
└─────────┬───────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│    6. SCORING & PERSONALIZATION AGENT (Weighted Ranker)       │
│                                                             │
│  INPUTS:                                                    │
│  • Products (Step 3)                                        │
│  • Review insights (Step 4)                                 │
│  • Price intelligence (Step 5)                              │
│  • User weight preferences                                 │
│                                                             │
│  FORMULA:                                                   │
│  Smart Score = (price_score × weight_price)                 │
│              + (sentiment_score × weight_reviews)           │
│              + (rating_score × weight_rating)               │
│              + (delivery_score × weight_delivery)           │
│                                                             │
│  • Normalizes all scores to 0-10                            │
│  • Applies the weighted formula                             │
│  • Generates final Smart Score (0-100)                      │
│  • Ranks products from highest to lowest                    │
│                                                             │
│  OUTPUT: Ranked product list with Smart Scores               │
└─────────┬───────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│    7. DECISION SIMPLIFICATION AGENT (Top 3 Selector)         │
│                                                             │
│  • Takes the ranked list from Step 6                        │
│  • Selects exactly 3 products:                              │
│                                                             │
│    🥇 Best Overall  → Highest Smart Score                   │
│    💰 Best Budget   → Lowest price with acceptable score    │
│    ⭐ Premium Pick  → Highest rating + premium features     │
│                                                             │
│  • For each pick, provides:                                 │
│    - Why it was selected (2 bullet points)                  │
│    - Key trade-off to consider                              │
│                                                             │
│  RULES: Max 3 options. Concise. No marketing language.       │
│                                                             │
│  OUTPUT: 3 structured recommendation objects                 │
└─────────┬───────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│         8. EXPLANATION AGENT (Reasoning Layer)               │
│                                                             │
│  • Takes the top 3 picks + full scored list                 │
│  • Generates human-friendly explanations:                   │
│    - Why the Best Overall was selected                      │
│    - Why other options were not top                         │
│    - What trade-offs the user should consider               │
│    - Final recommendation summary                          │
│                                                             │
│  RULES: Max 5 bullet points. No technical math. Simple.      │
│                                                             │
│  OUTPUT: Array of 5 reasoning strings                        │
└─────────┬───────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    FINAL API RESPONSE                        │
│                                                             │
│  {                                                          │
│    "query": "best wireless earbuds under 3000 for gym",     │
│    "weights": { price: 0.3, reviews: 0.3, ... },           │
│    "products": [ ... ranked list with Smart Scores ],       │
│    "topPicks": {                                            │
│      "best_overall": { ... },                               │
│      "best_budget": { ... },                                │
│      "premium_pick": { ... }                                │
│    },                                                       │
│    "explanation": {                                         │
│      "reasoning": [ "...", "...", "...", "...", "..." ]      │
│    }                                                        │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Detailed Agent Descriptions

### 1. Supervisor Agent (`supervisorAgent.js`)

**Role**: Orchestrator — the "brain" that coordinates everything.

**What it does**:
- Receives the user's natural language query (e.g., "best wireless earbuds under 3000 for gym")
- Receives the user's personalization weights (how much they care about price vs. reviews vs. rating vs. delivery)
- Creates a task plan and executes each agent **in sequence**
- Collects outputs from all agents and assembles the final response

**Key design decision**: The supervisor **never generates product data itself**. It only passes data between agents. This ensures each agent is independently responsible for its own domain, making the system modular and testable.

---

### 2. Web Search Agent (`webSearchAgent.js`)

**Role**: Multi-website product searcher — the "eyes" of the system.

**What it does**:
- Takes the user's query and determines which e-commerce platforms to search
- Uses the OpenRouter LLM (with a carefully crafted system prompt) to generate realistic product listings from multiple platforms
- The LLM acts as if it is searching across Amazon, Flipkart, Croma, Reliance Digital, Myntra, etc.
- Returns 5-8 product listings with complete structured data

**Why LLM-based search?**:
- Real e-commerce APIs (Amazon Product Advertising API, Flipkart Affiliate API) require merchant/affiliate accounts and have strict rate limits
- Web scraping is unreliable and legally risky
- The LLM has been trained on vast amounts of product data and can generate realistic, relevant product listings
- This approach works for **any product category** — shoes, electronics, kitchen appliances, books, etc.

**Prompt engineering**: The agent uses a detailed system prompt that instructs the LLM to:
- Search across 3-5 relevant platforms based on the product category
- Include realistic prices in INR
- Include actual review sentiments
- Vary the products (budget, mid-range, premium)
- Return clean JSON only

---

### 3. Product Retrieval Agent (`productRetrievalAgent.js`)

**Role**: Parser and validator — ensures data quality.

**What it does**:
- Calls the Web Search Agent to get raw product data
- Validates every field (price is a number, rating is 0-5, etc.)
- Fills in missing fields with sensible defaults
- If the LLM call fails entirely, falls back to hardcoded mock data so the user still gets a result

---

### 4. Review Intelligence Agent (`reviewIntelligenceAgent.js`)

**Role**: Sentiment analyzer — extracts insights from reviews.

**What it does**:
- Takes the review snippets from each product
- Uses the OpenRouter LLM to analyze sentiment and extract patterns
- Produces structured insights: pros, cons, sentiment score, common complaints, durability assessment

**Fallback**: If the LLM is unavailable, uses a heuristic-based fallback that generates reasonable default review summaries.

---

### 5. Price Intelligence Agent (`priceIntelligenceAgent.js`)

**Role**: Discount analyzer — determines if a deal is genuine.

**What it does**:
- Compares current price vs. original MRP vs. historical average
- Calculates discount authenticity (is the "50% off" real or inflated MRP?)
- Assigns a price fairness score (0-10)
- Gives a buy/wait recommendation
- Assesses risk of price increase

**Note**: This agent is purely **mathematical** — no LLM calls. It uses the numerical data from the product listings to make objective assessments.

---

### 6. Scoring & Personalization Agent (`scoringAgent.js`)

**Role**: Weighted ranker — applies the user's preferences.

**What it does**:
- Normalizes all scores to a 0-10 scale
- Applies the weighted formula using the user's slider preferences
- Generates a final **Smart Score (0-100)** for each product
- Ranks products from highest to lowest

**Formula**:
```
Smart Score = (price_score × weight_price) 
            + (sentiment_score × weight_reviews) 
            + (rating_score × weight_rating) 
            + (delivery_score × weight_delivery)
```

The result is multiplied by 10 to get a 0-100 scale.

---

### 7. Decision Simplification Agent (`decisionSimplificationAgent.js`)

**Role**: Choice reducer — eliminates decision fatigue.

**What it does**:
- Takes the full ranked list and selects exactly **3 products**:
  - 🥇 **Best Overall**: Highest Smart Score (best balance)
  - 💰 **Best Budget**: Cheapest product that still has an acceptable quality score
  - ⭐ **Premium Pick**: Highest rating + best build quality (for users who value longevity)
- For each pick, provides 2 reasons why it was selected and 1 key trade-off

---

### 8. Explanation Agent (`explanationAgent.js`)

**Role**: Transparency layer — builds user trust.

**What it does**:
- Generates 5 human-readable bullet points explaining:
  - Why the Best Overall was chosen
  - Why Budget and Premium were not ranked #1
  - What trade-offs the user should consider
  - A final recommendation based on user priorities

---

## Data Flow Summary

```
User Query → Supervisor → Web Search → Product Retrieval
                                              │
                              ┌────────────────┤
                              ▼                ▼
                        Review Agent    Price Agent
                              │                │
                              └────────┬───────┘
                                       ▼
                                Scoring Agent
                                       │
                                       ▼
                              Decision Agent
                                       │
                                       ▼
                             Explanation Agent
                                       │
                                       ▼
                              Final Response → UI
```

---

## API Endpoint

### `POST /api/recommendations`

**Request Body**:
```json
{
  "query": "best wireless earbuds under 3000 for gym",
  "weights": {
    "price": 0.3,
    "reviews": 0.3,
    "rating": 0.2,
    "delivery": 0.2
  }
}
```

**Response Structure**:
```json
{
  "query": "best wireless earbuds under 3000 for gym",
  "weights": { ... },
  "products": [
    {
      "id": "p1",
      "platform": "Amazon",
      "title": "boAt Airdopes 141",
      "price": 1299,
      "original_price": 2990,
      "seller_rating": 4.3,
      "delivery_days": 2,
      "warranty": "1 year",
      "smart_score": 82.5,
      "rank": 1,
      "review_summary": { ... },
      "price_intel": { ... }
    }
  ],
  "topPicks": {
    "best_overall": { ... },
    "best_budget": { ... },
    "premium_pick": { ... }
  },
  "explanation": {
    "reasoning": [
      "Best Overall selected because ...",
      "Budget option was not top because ...",
      "Consider: You could save ₹X with ...",
      "Recommendation: Choose ..."
    ]
  }
}
```

---

## How to Run

```bash
# 1. Install dependencies
npm install

# 2. Set your OpenRouter API key
# Edit .env file:
# OPENROUTER_API_KEY=your-key-here
# PORT=4000

# 3. Start the server
npm run dev

# 4. Open in browser
# http://localhost:4000
```

---

## Technology Stack

| Component       | Technology               |
|-----------------|--------------------------|
| Backend         | Node.js + Express.js     |
| AI / LLM        | OpenRouter API           |
| Frontend        | React 18 + Tailwind CSS  |
| Charts          | Chart.js                 |
| Architecture    | Multi-Agent Pipeline     |
