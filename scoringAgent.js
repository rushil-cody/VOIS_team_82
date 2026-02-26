// Scoring & Personalization Agent
// ⚖️ Role: Apply weighted scoring model based on user preferences.
//
// System Instruction:
// You are the Scoring & Personalization Agent.
//
// Inputs:
// - Product data
// - Review sentiment data
// - Price intelligence data
// - User-defined weight preferences
//
// Your task:
// 1. Normalize all scores to 0–10.
// 2. Apply weighted scoring formula.
// 3. Generate final Smart Score (0–100).
// 4. Rank products from highest to lowest.
//
// Formula:
// Smart Score =
// (price_score × weight_price) +
// (sentiment_score × weight_reviews) +
// (rating_score × weight_rating) +
// (delivery_score × weight_delivery)
//
// Rules:
// - Do NOT generate explanations.
// - Do NOT simplify choices.
// - Only compute and rank.
// - Return structured ranked list.

function normalizeRating(rating) {
  // Assume rating is 0–5; convert to 0–10
  if (rating == null) return 5;
  return (rating / 5) * 10;
}

function normalizeDeliveryDays(delivery_days) {
  // Fewer days => higher score (0–10)
  if (!delivery_days || delivery_days <= 0) return 5;
  if (delivery_days <= 1) return 10;
  if (delivery_days <= 2) return 9;
  if (delivery_days <= 3) return 8;
  if (delivery_days <= 5) return 7;
  if (delivery_days <= 7) return 6;
  return 5;
}

export async function scoringAgent({
  products,
  reviewInsights,
  priceInsights,
  weights,
  userProfile
}) {
  const {
    price: weight_price = 0.3,
    reviews: weight_reviews = 0.3,
    rating: weight_rating = 0.2,
    delivery: weight_delivery = 0.2
  } = weights || {};

  const reviewMap = new Map(reviewInsights.map((r) => [r.productId, r]));
  const priceMap = new Map(priceInsights.map((p) => [p.productId, p]));

  const scored = products.map((p) => {
    const reviewInfo = reviewMap.get(p.id);
    const priceInfo = priceMap.get(p.id);

    const sentiment_score = reviewInfo?.sentiment_score ?? 7;
    const rating_score = normalizeRating(p.seller_rating);
    const delivery_score = normalizeDeliveryDays(p.delivery_days);
    const price_score = priceInfo?.price_score ?? 5;

    const smartScore =
      price_score * weight_price +
      sentiment_score * weight_reviews +
      rating_score * weight_rating +
      delivery_score * weight_delivery;

    return {
      ...p,
      smart_score: parseFloat((smartScore * 10).toFixed(2)), // 0–100
      components: {
        price_score,
        sentiment_score,
        rating_score,
        delivery_score,
        weights: {
          price: weight_price,
          reviews: weight_reviews,
          rating: weight_rating,
          delivery: weight_delivery
        }
      },
      review_summary: reviewInfo || null,
      price_intel: priceInfo || null
    };
  });

  // Rank products from highest to lowest Smart Score
  const ranked = scored
    .sort((a, b) => b.smart_score - a.smart_score)
    .map((p, index) => ({
      ...p,
      rank: index + 1
    }));

  return ranked;
}







