const Redis = require("ioredis");
require("dotenv").config();

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || null,
});

// Generate 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via SparrowSMS (same as before)
const axios = require("axios");

async function sendOtp(phone) {
  const otp = generateOtp();
  const message = `Your verification code is: ${otp}`;

  const payload = new URLSearchParams({
    token: process.env.SPARROW_API_TOKEN,
    from: process.env.SPARROW_FROM || "InfoSMS",
    to: phone,
    text: message,
  });

  try {
    // Save OTP in Redis with 5 min expiry
    await redis.set(`otp:${phone}`, otp, "EX", 300);

    const response = await axios.post("https://api.sparrowsms.com/v2/sms/", payload);
    if (!response.data || response.data.response_code !== "200") {
      throw new Error("Failed to send OTP");
    }

    console.log(`OTP sent to ${phone}: ${otp}`);
    return true;
  } catch (err) {
    console.error("OTP send error:", err.message);
    throw new Error("SMS sending failed");
  }
}

async function verifyOtp(phone, otp) {
  const storedOtp = await redis.get(`otp:${phone}`);
  if (!storedOtp) return false;

  const isValid = storedOtp === otp;
  if (isValid) {
    await redis.del(`otp:${phone}`); // delete OTP after use
  }
  return isValid;
}

module.exports = { sendOtp, verifyOtp };
