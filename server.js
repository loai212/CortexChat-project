import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
console.log("Loaded OpenRouter API key:", process.env.OPENROUTER_API_KEY);

const app = express();
const port = 3000;

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set EJS as view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static assets
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Render chat.ejs at root
app.get("/", (req, res) => {
  res.render("chat");
});

// POST route to OpenRouter
app.post("/api/chat", async (req, res) => {
  const { message, model = "openrouter/auto" } = req.body;

  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model,
        messages: [{ role: "user", content: message }],
        temperature: 0.7,
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000", // required by OpenRouter
          "X-Title": "EchoMind", // optional, for dashboard labeling
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("OpenRouter API error:", error.message);
    res.status(500).json({ error: "Failed to fetch AI response" });
  }
});

app.listen(port, () => {
  console.log(`EchoMind backend is running on http://localhost:${port}`);
});