// Web Search Agent
// 🌐 Role: Search across multiple e-commerce websites using LLM.
//
// System Instruction:
// You are the Web Search Agent.
// Simulate searching across major Indian e-commerce platforms
// (Amazon, Flipkart, Croma, Reliance Digital, Myntra, etc.)
// based on the user's product query.
//
// Return realistic, varied product listings from multiple platforms
// in structured JSON format.
//
// Rules:
// - Return between 5 and 8 products.
// - Include products from at least 3 different platforms.
// - Vary price range (budget, mid-range, premium).
// - Include realistic Indian pricing (INR).
// - Return ONLY valid JSON. No markdown, no explanation.

import fetch from "node-fetch";

export async function webSearchAgent({ query }) {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        console.warn("No OPENROUTER_API_KEY set. Web Search Agent cannot function.");
        return null;
    }

    const systemPrompt = `You are a Multi-Website Product Search Agent for Indian e-commerce.

Your job: Given a user's product query, simulate searching across major Indian e-commerce platforms and return realistic product listings.

PLATFORMS TO SEARCH (pick 3-5 most relevant):
- Amazon India
- Flipkart
- Croma
- Reliance Digital
- Myntra
- Nykaa
- Ajio
- Tata CLiQ
- JioMart
- Meesho

RULES:
1. Return EXACTLY 6 products from at least 3 different platforms.
2. Include a mix: 2 budget options, 2 mid-range, 2 premium.
3. Use realistic Indian pricing (INR). No currency symbols in the number fields.
4. Each product MUST include ALL fields listed below. No missing fields.
5. Generate realistic but varied review snippets (5 per product).
6. Historical prices should show a realistic downward trend over 5 data points.
7. Prices must be realistic for the Indian market.
8. product_url can be a realistic-looking URL for that platform.
9. Return ONLY a valid JSON array. No markdown code fences, no explanation text.

REQUIRED JSON FORMAT (array of objects):
[
  {
    "id": "p1",
    "platform": "Amazon",
    "title": "Product Name Brand Model",
    "brand": "BrandName",
    "price": 12999,
    "original_price": 17999,
    "seller_rating": 4.3,
    "delivery_days": 2,
    "warranty": "1 year",
    "product_url": "https://www.amazon.in/dp/EXAMPLE",
    "image_placeholder": "product image",
    "review_snippets": [
      "Review 1 text here",
      "Review 2 text here",
      "Review 3 text here",
      "Review 4 text here",
      "Review 5 text here"
    ],
    "historical_price": [17999, 16499, 15999, 14499, 12999]
  }
]

IMPORTANT: Return ONLY the JSON array. No other text.`;

    const userPrompt = `Search across multiple Indian e-commerce websites for: "${query}"

Return 6 realistic product listings from different platforms, with varied pricing (budget to premium). All prices in INR.`;

    const body = {
        model: "google/gemini-2.0-flash-001",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
    };

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
                "HTTP-Referer": "http://localhost",
                "X-Title": "BuyWise Agentic Assistant"
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Web Search Agent API error:", response.status, errText);
            return null;
        }

        const json = await response.json();
        let raw = json.choices?.[0]?.message?.content || "[]";

        // Strip markdown code fences if present
        raw = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

        const products = JSON.parse(raw);

        if (!Array.isArray(products) || products.length === 0) {
            console.warn("Web Search Agent returned empty or invalid array.");
            return null;
        }

        // Validate and normalize each product
        return products.map((p, index) => ({
            id: p.id || `p${index + 1}`,
            platform: p.platform || "Unknown",
            title: p.title || "Unknown Product",
            brand: p.brand || "",
            price: typeof p.price === "number" ? p.price : 0,
            original_price: typeof p.original_price === "number" ? p.original_price : p.price || 0,
            seller_rating: typeof p.seller_rating === "number" ? Math.min(p.seller_rating, 5) : 4.0,
            delivery_days: typeof p.delivery_days === "number" ? p.delivery_days : 3,
            warranty: p.warranty || "1 year",
            product_url: p.product_url || "#",
            review_snippets: Array.isArray(p.review_snippets) ? p.review_snippets : [],
            historical_price: Array.isArray(p.historical_price) ? p.historical_price : [p.original_price || p.price, p.price]
        }));
    } catch (err) {
        console.error("Web Search Agent failed:", err);
        return null;
    }
}
