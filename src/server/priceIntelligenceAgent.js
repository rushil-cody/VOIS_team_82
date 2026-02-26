// Price Intelligence Agent
// 💰 Role: Evaluate whether the current price is good or manipulated.
//
// System Instruction:
// You are the Price Intelligence Agent.
//
// Analyze:
// - Current price
// - Original price
// - Historical trend (if available)
//
// Determine:
// - Discount authenticity (true/false)
// - Price fairness score (0–10)
// - Is this a good time to buy? (Buy / Wait / Neutral)
// - Risk level of price increase (Low/Medium/High)
//
// Rules:
// - Base conclusions only on provided numbers.
// - Do NOT consider reviews.
// - Do NOT rank products.
// - Return structured output only.

function computeAverage(arr) {
  if (!arr || !arr.length) return 0;
  return arr.reduce((sum, x) => sum + x, 0) / arr.length;
}

export async function priceIntelligenceAgent({ products }) {
  return products.map((p) => {
    const avgHistorical = computeAverage(p.historical_price || []);
    const current = p.price;
    const original = p.original_price || current;

    const discountPercent = original > 0 ? ((original - current) / original) * 100 : 0;
    const vsHistoryPercent =
      avgHistorical > 0 ? ((avgHistorical - current) / avgHistorical) * 100 : 0;

    const discount_authentic = discountPercent > 10 && vsHistoryPercent > 5;

    // Price score heuristic from 0–10
    let price_score = 5;
    if (discount_authentic && discountPercent > 20) price_score = 8.5;
    else if (discount_authentic) price_score = 7.5;
    else if (discountPercent > 5) price_score = 6.5;
    else price_score = 5;

    let buy_recommendation = "Neutral";
    if (discount_authentic && price_score >= 8) {
      buy_recommendation = "Buy";
    } else if (discount_authentic) {
      buy_recommendation = "Buy";
    } else if (vsHistoryPercent < -5) {
      buy_recommendation = "Wait";
    }

    // Determine price risk level
    let price_risk_level = "Low";
    if (vsHistoryPercent < -10) {
      price_risk_level = "High"; // Price is much higher than historical average
    } else if (vsHistoryPercent < -5) {
      price_risk_level = "Medium";
    } else if (discount_authentic && discountPercent > 20) {
      price_risk_level = "Low"; // Good discount, low risk of missing it
    }

    return {
      productId: p.id,
      discount_authentic,
      price_score,
      buy_recommendation,
      price_risk_level
    };
  });
}







