require('dotenv').config();

const express = require('express');
const { OpenAI } = require('openai');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// GitHub Models クライアント（OpenAI SDK 互換）
const client = new OpenAI({
  baseURL: 'https://models.inference.ai.azure.com',
  apiKey: process.env.GITHUB_TOKEN,
});

// 会話履歴（サーバーメモリ上で管理）
const conversationHistory = [];

// JSONパース
app.use(express.json());

// 静的ファイル配信（public/index.html）
app.use(express.static(path.join(__dirname, 'public')));

// レートリミット：10秒に1リクエストまで
const chatLimiter = rateLimit({
  windowMs: 10 * 1000,
  max: 1,
  message: { error: '送信が速すぎます。10秒待ってから再送信してください。' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/chat
app.post('/api/chat', chatLimiter, async (req, res) => {
  const { message } = req.body;

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

  // 直近6件のみ送信
  const recentHistory = conversationHistory.slice(-6);

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        ...recentHistory,
      ],
      max_tokens: 500,
    });

    const reply = response.choices[0].message.content;

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
});
