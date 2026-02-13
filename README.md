
# BuyWise: System Architecture & Functional Documentation

## 1. Executive Summary

**BuyWise** is an autonomous multi-agent AI assistant designed to eliminate "decision fatigue" in e-commerce. Instead of requiring users to manually compare dozens of products across different websites, BuyWise employs a team of specialized AI agents to research, analyze, score, and curate the best buying options in real-time.

The system delivers three optimized recommendations—**Best Overall**, **Best Budget**, and **Premium Choice**—accompanied by transparent, human-readable reasoning.

---

## 2. Core Philosophy & Architecture

The system is built on a **Modular Agentic Architecture** inspired by the "Ralph" autonomous loop model. Rather than a single AI trying to do everything, the workload is distributed among specialized agents.

### The "Hub-and-Spoke" Model

* **The Supervisor (Hub):** A central intelligence that plans tasks and delegates them.
* **The Agents (Spokes):** Specialized workers that handle specific tasks (Search, Analysis, Pricing, Scoring).

This separation ensuring that the logic for finding a product is distinct from the logic for judging its quality, preventing bias and hallucinations.

---

## 3. The Agent Ecosystem

The system comprises eight distinct agents working in a sequential pipeline.

### 1. Supervisor Agent (The Orchestrator)

* **Role:** The project manager.
* **Function:** It receives the user's request and preference weights (e.g., "I care more about price than delivery speed"). It breaks the request into subtasks and triggers the other agents in the correct order.
* **Key Rule:** It never generates product data itself; it only coordinates the flow of information.

### 2. Web Search Agent (The Researcher)

* **Role:** Multi-platform searcher.
* **Function:** Simulates a human researching products across multiple major e-commerce platforms simultaneously. It looks for products that match the user's query across varying price points and brands.
* **Output:** A list of raw product candidates with titles, prices, and links.

### 3. Product Retrieval Agent (The Validator)

* **Role:** Quality control.
* **Function:** It takes the raw list from the Search Agent and "cleans" the data. It ensures every product has a valid price, image, and description. If data is missing or corrupt, it filters those products out to prevent errors downstream.

### 4. Review Intelligence Agent (The Analyst)

* **Role:** Sentiment analysis.
* **Function:** Reads through customer reviews to extract objective insights. It identifies the **Top 5 Pros** and **Top 5 Cons** for every product.
* **Metrics Calculated:**
* Sentiment Score (How positive are the reviews?)
* Durability Assessment (Will the product last?)
* Common Complaints (What do people hate about it?).



### 5. Price Intelligence Agent (The Economist)

* **Role:** Financial analysis.
* **Function:** Evaluates the fairness of a deal using pure mathematics, not opinions.
* **Key Checks:**
* **Discount Authenticity:** Is the "50% off" tag real, or was the original price inflated?
* **Price History:** Is the current price lower or higher than the historical average?
* **Buying Advice:** Outputs a clear "Buy Now," "Wait," or "Neutral" recommendation.



### 6. Scoring & Personalization Agent (The Judge)

* **Role:** Ranking engine.
* **Function:** Assigns a "Smart Score" (0–100) to each product based on the user's unique priorities.
* **The Logic:**
* If the user values **Price**, cheaper items get a massive score boost.
* If the user values **Ratings**, higher-rated items take the lead.
* If the user values **Speed**, products with 1-day delivery are prioritized.


* **Result:** A fully ranked list of products from #1 to #10.

### 7. Decision Simplification Agent (The Curator)

* **Role:** Decision maker.
* **Function:** Filters the long list down to exactly three choices to prevent decision paralysis:
1. **Best Overall:** The product with the highest mathematical Smart Score.
2. **Best Budget:** The lowest-priced option that still meets quality safety thresholds.
3. **Premium Choice:** The option with the highest build quality and ratings, regardless of price.



### 8. Explanation Agent (The Communicator)

* **Role:** Transparency layer.
* **Function:** Writes a human-friendly explanation for the choices. It explicitly states trade-offs (e.g., *"We chose X because it has better battery life, even though Y is cheaper"*) so the user understands the "Why" behind the recommendation.

---

## 4. The Decision Logic (Smart Scoring)

The core differentiation of BuyWise is that it does not just recommend "popular" items. It recommends items based on a **Weighted Smart Score**.

The system accepts four user-defined weights (ranging from 0% to 100% importance):

1. **Price Weight:** Preference for savings.
2. **Review Weight:** Preference for high customer satisfaction.
3. **Rating Weight:** Preference for high star ratings.
4. **Delivery Weight:** Preference for speed.

**The Calculation:**
The system normalizes all data points (converting prices and delivery days into comparable 0–10 scales) and applies the user's weights.

> *Example:* If a user sets "Price" to maximum importance, a $50 product with 4 stars may outrank a $200 product with 5 stars.

---

## 5. User Data Flow

1. **Input:** User types a query (e.g., *"Best running shoes for flat feet"*) and adjusts preference sliders.
2. **Processing:**
* **Stage 1:** Search Agent finds 8–10 relevant pairs of shoes.
* **Stage 2:** Review Agent reads comments to find which ones offer good arch support.
* **Stage 3:** Price Agent checks which ones are actually on sale.
* **Stage 4:** Scoring Agent calculates which shoe matches the user's budget and support needs best.


3. **Output:** The user sees a comparison table and three clear "Winner" cards, along with a price trend chart.
