require('dotenv').config();

const express = require('express');
const { OpenAI } = require('openai');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MAX_HISTORY_MESSAGES = Number(process.env.MAX_HISTORY_MESSAGES || 6);
const MAX_OUTPUT_TOKENS = Number(process.env.MAX_OUTPUT_TOKENS || 350);
const DAILY_REQUEST_LIMIT = Number(process.env.DAILY_REQUEST_LIMIT || 100);
const RATE_LIMIT_WINDOW_SECONDS = Number(process.env.RATE_LIMIT_WINDOW_SECONDS || 10);
const RATE_LIMIT_MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS || 1);

// GitHub Models クライアント（OpenAI SDK 互換）
const client = new OpenAI({
  baseURL: 'https://models.inference.ai.azure.com',
  apiKey: process.env.GITHUB_TOKEN,
});

// 会話履歴（サーバーメモリ上で管理）
const conversationHistory = [];
let dailyRequestCount = 0;
let currentDay = new Date().toISOString().slice(0, 10);

// JSONパース
app.use(express.json());

// 静的ファイル配信（public/index.html）
app.use(express.static(path.join(__dirname, 'public')));

// レートリミット：短時間の連投を防ぐ
const chatLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_SECONDS * 1000,
  max: RATE_LIMIT_MAX_REQUESTS,
  message: { error: `送信が速すぎます。${RATE_LIMIT_WINDOW_SECONDS}秒待ってから再送信してください。` },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/chat
app.post('/api/chat', chatLimiter, async (req, res) => {
  const { message } = req.body;

  const today = new Date().toISOString().slice(0, 10);
  if (today !== currentDay) {
    currentDay = today;
    dailyRequestCount = 0;
  }
  if (dailyRequestCount >= DAILY_REQUEST_LIMIT) {
    return res.status(429).json({ error: '本日の利用上限に達しました。明日またお試しください。' });
  }

  // 入力バリデーション
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'メッセージが空です。' });
  }
  if (message.trim().length === 0) {
    return res.status(400).json({ error: 'メッセージが空です。' });
  }
  if (message.length > 200) {
    return res.status(400).json({ error: 'メッセージは200文字以内にしてください。' });
  }

  // 会話履歴にユーザーメッセージを追加
  conversationHistory.push({ role: 'user', content: message.trim() });

  // 直近の履歴のみ送信してトークン消費を抑える
  const recentHistory = conversationHistory.slice(-MAX_HISTORY_MESSAGES);

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        ...recentHistory,
      ],
      max_tokens: MAX_OUTPUT_TOKENS,
    });

    const reply = response.choices[0].message.content;
    dailyRequestCount += 1;

    // 会話履歴にAI応答を追加
    conversationHistory.push({ role: 'assistant', content: reply });

    res.json({ reply });
  } catch (err) {
    console.error('API エラー:', err.message);
    res.status(500).json({ error: 'AIの応答に失敗しました。しばらく待ってから再試行してください。' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Cost guard: ${RATE_LIMIT_WINDOW_SECONDS}s/${RATE_LIMIT_MAX_REQUESTS} req, daily ${DAILY_REQUEST_LIMIT} req, max_tokens ${MAX_OUTPUT_TOKENS}`);
});
