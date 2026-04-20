# チャットボット（お試し版）

GitHub Models API を使ったシンプルなチャットボットです。  
ブラウザで動作し、Node.js + Express + Docker で構成されています。

---

## 動作環境

- Docker / Docker Compose がインストールされていること
- GitHub Personal Access Token を取得済みであること

---

## セットアップ

### 1. リポジトリをクローン

```bash
git clone https://github.com/<your-username>/chatbot.git
cd chatbot
```

### 2. 環境変数を設定

`.env.example` をコピーして `.env` を作成し、トークンを記載します。

```bash
cp .env.example .env
```

`.env` を編集：

```
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxx
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

| 対策           | 内容                     |
| -------------- | ------------------------ |
| モデル         | `gpt-4o-mini`（低コスト） |
| 出力制限       | `max_tokens: 350`        |
| 履歴制限       | 直近6件のみ送信          |
| 入力文字数     | 200文字まで              |
| レートリミット | 10秒に1リクエストまで    |
| 日次上限       | 1日100リクエストまで     |

---

## 技術スタック

- **バックエンド**: Node.js / Express
- **フロントエンド**: HTML / CSS / JavaScript
- **AI**: GitHub Models API（gpt-4o-mini, OpenAI SDK 互換）
- **コンテナ**: Docker / Docker Compose
