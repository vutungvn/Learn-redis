const { default: axios } = require("axios");
const express = require("express");
const Redis = require("ioredis");

// ================= REDIS =================
const redis = new Redis({
  host: "127.0.0.1",
  port: 6389,
  password: "123456",
});

redis.on("connect", () => {
  console.log("✅ Redis connected");
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

// ================= EXPRESS =================
const app = express();
app.use(express.json());

app.post("/pub", async (req, res) => {
  // Data fix cứng
  const channel = "news";
  const message = "Hello Redis Pub/Sub";

  await redis.publish(channel, message);

  res.json({
    channel,
    message,
  });
});

// ================= SERVER =================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
