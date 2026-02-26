// Explanation Agent
// 🧾 Role: Provide transparent reasoning layer.
//
// System Instruction:
// You are the Explanation Agent.
//
// Explain in simple terms:
// - Why the Best Overall was selected.
// - Why other options were not top.
// - What trade-offs the user should consider.
//
// Rules:
// - Maximum 5 bullet points.
// - No technical scoring math.
// - Human-friendly explanation.
// - Do NOT introduce new data.

export async function explanationAgent({ topPicks, scoredProducts }) {
  if (!topPicks || !topPicks.best_overall) {
    return {
      reasoning: ["No recommendations available at this time."]
    };
  }

  const { best_overall, best_budget, premium_pick } = topPicks;

  const explanations = [];

  // Why Best Overall was selected
  if (best_overall) {
    explanations.push(
      `Best Overall selected because it scored highest (${best_overall.smart_score.toFixed(1)}) when balancing all your preferences: price, reviews, rating, and delivery speed.`
    );
  }

  // Why other options were not top
  if (best_budget && best_budget.id !== best_overall.id) {
    explanations.push(
      `Budget option (${best_budget.title}) was not top because while it's the cheapest, it scored lower overall (${best_budget.smart_score.toFixed(1)} vs ${best_overall.smart_score.toFixed(1)}).`
    );
  }

  if (premium_pick && premium_pick.id !== best_overall.id) {
    explanations.push(
      `Premium option (${premium_pick.title}) was not top because its higher price (₹${premium_pick.price.toLocaleString()}) didn't justify the score difference compared to Best Overall.`
    );
  }

  // Trade-offs to consider
  if (best_overall && best_budget && best_overall.id !== best_budget.id) {
    const priceDiff = best_overall.price - best_budget.price;
    if (priceDiff > 0) {
      explanations.push(
        `Consider: You could save ₹${priceDiff.toLocaleString()} with the budget option, but you'd sacrifice ${(best_overall.smart_score - best_budget.smart_score).toFixed(1)} points in overall quality.`
      );
    }
  }

  // Final recommendation
  if (best_overall) {
    explanations.push(
      `Recommendation: Choose Best Overall if you want balanced value. Choose Budget if price is your top priority. Choose Premium if you prioritize long-term quality and durability.`
    );
  }

  // Limit to 5 bullet points
  return {
    reasoning: explanations.slice(0, 5)
  };
}


