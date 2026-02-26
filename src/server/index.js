import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { runSupervisorAgent } from "./supervisorAgent.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Serve static frontend
app.use(express.static(path.join(__dirname, "../../public")));

app.get("/health", (req, res) => {
  res.json({
    name: "BuyWise – Agentic AI Buying Assistant",
    status: "ok",
    message: "Backend is running. Frontend is served from /."
  });
});

app.post("/api/recommendations", async (req, res) => {
  try {
    const { query, weights, userProfile } = req.body || {};
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'query' field" });
    }

    const result = await runSupervisorAgent({
      query,
      weights: weights || {
        price: 0.3,
        reviews: 0.3,
        rating: 0.2,
        delivery: 0.2
      },
      userProfile: userProfile || {}
    });

    res.json(result);
  } catch (err) {
    console.error("Error in /api/recommendations:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`BuyWise backend listening on http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser to use BuyWise.`);
});


