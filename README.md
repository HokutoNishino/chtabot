# チャットボット（お試し版）

OpenAI の API を使ったシンプルなチャットボットです。  
ブラウザで動作し、Node.js + Express + Docker で構成されています。

---

## 動作環境

- Docker / Docker Compose がインストールされていること
- OpenAI の API キーを取得済みであること

---

## セットアップ

### 1. リポジトリをクローン

```bash
git clone https://github.com/<your-username>/chatbot.git
cd chatbot
```

### 2. 環境変数を設定

`.env.example` をコピーして `.env` を作成し、API キーを記載します。

```bash
cp .env.example .env
```

`.env` を編集：

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
PORT=3000
```

### 3. Docker で起動

```bash
docker compose up --build
```

### 4. ブラウザでアクセス

```
http://localhost:3000
```

---

## 停止方法

```bash
docker compose down
```

---

## ディレクトリ構成

```
chatbot/
├── Dockerfile
├── docker-compose.yml
├── server.js
├── package.json
├── .env               # APIキー（Gitに含めない）
├── .env.example       # 環境変数のテンプレート
├── .gitignore
└── public/
    └── index.html
```

---

## コスト対策（無料枠で運用）

| 対策 | 内容 |
|------|------|
| モデル | `gpt-5-mini`（低コスト）|
| 出力制限 | `max_tokens: 500` |
| 履歴制限 | 直近6件のみ送信 |
| 入力文字数 | 200文字まで |
| レートリミット | 10秒に1リクエストまで |

---

## 技術スタック

- **バックエンド**: Node.js / Express
- **フロントエンド**: HTML / CSS / JavaScript
- **AI**: OpenAI Chat Completions API（gpt-5-mini）
- **コンテナ**: Docker / Docker Compose
