// Decision Simplification Agent
// 🎯 Role: Reduce cognitive overload by selecting top 3 meaningful choices.
//
// System Instruction:
// You are the Decision Simplification Agent.
//
// Input:
// - Ranked product list with Smart Scores.
//
// Select:
// 1. Best Overall (highest Smart Score)
// 2. Best Budget (lowest price with acceptable score threshold)
// 3. Premium Option (highest rating + highest durability)
//
// Provide:
// - Product name
// - Why selected (2 logical bullet points)
// - Key trade-off
//
// Rules:
// - Do NOT show more than 3 options.
// - Keep explanations concise.
// - No emotional marketing language.
// - No raw data tables.

export async function decisionSimplificationAgent({ scoredProducts }) {
  if (!scoredProducts || !scoredProducts.length) {
    return {
      best_overall: null,
      best_budget: null,
      premium_pick: null
    };
  }

  const sortedByPrice = [...scoredProducts].sort((a, b) => a.price - b.price);
  const sortedByScore = [...scoredProducts].sort(
    (a, b) => b.smart_score - a.smart_score
  );

  // Best Overall: Highest Smart Score
  const best_overall = sortedByScore[0];

  // Best Budget: Lowest price product that is NOT the best_overall
  // If only one product exists, use it but with different messaging
  const best_budget = sortedByPrice.find((p) => p.id !== best_overall.id) || sortedByPrice[0];

  // Premium Pick: Highest rating + highest price (premium segment)
  // Exclude both best_overall and best_budget to ensure diversity
  const premiumCandidates = scoredProducts
    .filter((p) => p.id !== best_overall.id && p.id !== best_budget.id)
    .sort((a, b) => {
      // Sort by rating first, then by price (higher = more premium)
      if (Math.abs(b.seller_rating - a.seller_rating) > 0.1) {
        return b.seller_rating - a.seller_rating;
      }
      return b.price - a.price; // Higher price = more premium
    });

  // If no candidates after filtering, use highest-rated product that's not best_overall
  let premium_pick = premiumCandidates[0];
  if (!premium_pick) {
    premium_pick = scoredProducts
      .filter((p) => p.id !== best_overall.id)
      .sort((a, b) => {
        if (Math.abs(b.seller_rating - a.seller_rating) > 0.1) {
          return b.seller_rating - a.seller_rating;
        }
        return b.price - a.price;
      })[0] || sortedByScore[1] || sortedByScore[0]; // Fallback to second best or same if only one
  }

  // Adjust explanations based on whether products are different
  const isBudgetSameAsOverall = best_budget.id === best_overall.id;
  const isPremiumSameAsOverall = premium_pick.id === best_overall.id;
  const isPremiumSameAsBudget = premium_pick.id === best_budget.id;

  return {
    best_overall: {
      ...best_overall,
      why_selected: [
        `Highest Smart Score (${best_overall.smart_score.toFixed(1)}) based on your preferences`,
        "Best balance across all factors: price, reviews, rating, and delivery"
      ],
      trade_off: "May not be the cheapest or most premium, but offers the best overall value"
    },
    best_budget: {
      ...best_budget,
      why_selected: isBudgetSameAsOverall
        ? [
            `Lowest price (₹${best_budget.price.toLocaleString()}) with highest Smart Score`,
            "This product offers the best value at the lowest price point"
          ]
        : [
            `Lowest price (₹${best_budget.price.toLocaleString()}) with acceptable quality`,
            `Maintains Smart Score of ${best_budget.smart_score.toFixed(1)} while being most affordable`
          ],
      trade_off: isBudgetSameAsOverall
        ? "Same as Best Overall - offers best value at lowest price"
        : "Lower price may mean longer delivery time or fewer premium features"
    },
    premium_pick: {
      ...premium_pick,
      why_selected: isPremiumSameAsOverall || isPremiumSameAsBudget
        ? [
            `Highest rating (${premium_pick.seller_rating}) with premium features`,
            "Optimized for quality and long-term value"
          ]
        : [
            `Highest rating (${premium_pick.seller_rating}) with premium build quality`,
            "Optimized for long-term value and premium experience"
          ],
      trade_off: isPremiumSameAsOverall || isPremiumSameAsBudget
        ? "Same product selected for multiple categories due to limited options"
        : "Higher price point, but offers superior quality and longevity"
    }
  };
}







