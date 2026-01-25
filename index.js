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

app.post("/user/profile", async (req, res) => {
  const userProfile = {
    userId: "001",
    fullname: "John Doe",
    age: 30,
  };

  const key = `user:profile:${userProfile.userId}`;

  await redis.hmset(key, userProfile);
  await redis.expire(key, 60);

  res.json({ message: "User profile saved to Redis", data: userProfile });
});

app.get("/user/profile/:userId", async (req, res) => {
  const { userId } = req.params;
  const key = `user:profile:${userId}`;

  const [fullname, age] = await redis.hmget(key, "fullname", "age");

  res.json({
    message: "User profile retrieved from Redis",
    data: { fullname, age },
  });
});

app.put("/user/profile/:userId", async (req, res) => {
  const { userId } = req.params;
  const key = `user:profile:${userId}`;

  // Kiểm tra xem user có tồn tại không
  const exists = await redis.exists(key);
  if (!exists) {
    return res.status(404).json({ message: "User profile not found" });
  }

  // Lấy data từ request body (không bao gồm userId)
  const { fullname, age } = req.body;

  // Update hash fields
  await redis.hmset(key, {
    fullname,
    age,
  });

  res.json({
    message: "User profile updated successfully",
    data: { userId, fullname, age },
  });
});

// ================= SERVER =================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
