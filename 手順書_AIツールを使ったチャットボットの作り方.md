# AIツールを使ったチャットボットの作り方

> この手順書は、プログラミングの経験がない方でも  
> **GitHub Copilot などの AI ツールを活用して**チャットボットを作れるように書かれています。

---

## この手順書でできること

- ブラウザで動くチャットボットをゼロから作る
- ChatGPT（OpenAI API）を使って AI と会話できるようにする
- Docker を使って、誰のパソコンでも同じように動かせるようにする
- GitHub でコードを管理する

---

## ℹ️ AIエンジンは2パターンあります

AI のバックエンドには2つの選択肢があります。自分の状況に合った導入方法を選んでください。

| | パターンA: GitHub Models | パターンB: Google Gemini API |
|--|---|---|
| **向いている人** | GitHub Copilot 加入者 | 誤れない初心者向けに教える場合 |
| **無料枠** | Copilot 加入済みなら追加費用なし | 無料枠あり（Gemini 2.0 Flash）|
| **必要なアカウント** | GitHub（持っていればOK） | Google アカウント |
| **コードの差異** | 最小限 | SDK と呼び出し方が少し専用 |

---

## 必要なものを準備する

以下を事前にインストール・登録してください。

| 必要なもの | 用途 | 入手先 |
|-----------|------|--------|
| VS Code | コードを書くエディタ | https://code.visualstudio.com |
| GitHub Copilot（VS Code 拡張） | AI がコードを書いてくれる | VS Code の拡張機能から「Copilot」で検索 |
| Docker Desktop | アプリをコンテナで動かす | https://www.docker.com/products/docker-desktop |
| Git | コードのバージョン管理 | https://git-scm.com |
| GitHub アカウント | コードをクラウド保存 | https://github.com |
| **パターンAのみ** GitHub Personal Access Token | GitHub Models の認証 | https://github.com/settings/tokens で発行 |
| **パターンBのみ** Google アカウント + Gemini API キー | Gemini API の認証 | https://aistudio.google.com |

---

## 全体の流れ

```
STEP 1: 設計書を作る（何を作るかを整理する）
  ↓
STEP 2: ファイル構成を作る
  ↓
STEP 3: AI（Copilot）にコードを書いてもらう
  ↓
STEP 4: 動作確認する
  ↓
STEP 5: GitHub にアップロードする
```

---

## STEP 1: 設計書を作る

> **ポイント**: いきなりコードを書かず、まず「何を作るか」を整理します。  
> AI ツールも「指示が明確なほど良いコードを生成します」

### やること

1. VS Code を開き、作業フォルダを作る（例: `chatbot`）
2. Copilot Chat（左サイドバーのチャットアイコン）を開く
3. 以下のように聞く：

```
シンプルなチャットボットを作りたいです。
以下の条件で設計書を作ってください。

- ブラウザで動く
- Node.js + Express のサーバー
- OpenAI API (gpt-5-mini) を使う
- Docker で起動する
- コストを抑えるため、入力200文字制限・出力500トークン制限・10秒レートリミットをつける
- フロントエンドは HTML/JS の1ファイル
```

4. 出力された内容を `設計書.md` というファイルに保存する

---

## STEP 2: ファイル構成を作る

### 作成するファイル一覧

```
chatbot/
├── Dockerfile
├── docker-compose.yml
├── server.js
├── package.json
├── .env               ← 自分で作成（APIキーを書く）
├── .env.example       ← テンプレート
├── .gitignore
└── public/
    └── index.html
```

### フォルダの作り方

VS Code のターミナル（`Ctrl + @` で開く）に以下を入力：

```bash
mkdir public
```

---

## STEP 3: AI（Copilot）にコードを書いてもらう

> **コツ**: ファイルごとに1つずつ依頼する。一度に全部頼まない。

### 3-1. `package.json` を作ってもらう

Copilot Chat に以下を貼り付ける：

```
Node.js + Express のプロジェクト用の package.json を作成してください。
使用するパッケージは express、openai、dotenv です。
start スクリプトは `node server.js` にしてください。
```

→ 出力されたコードを `package.json` に貼り付けて保存

---

### 3-2. `server.js` を作ってもらう

**パターンA（GitHub Models）の場合：**

```
以下の条件で Express サーバーの server.js を作成してください。

- dotenv で .env を読み込む
- `public` フォルダの静的ファイルを配信する
- POST /api/chat エンドポイントを作る
  - リクエスト: { message: "テキスト" }
  - レスポンス: { reply: "AIの返答" }
- OpenAI SDK を使い、エンドポイントは https://models.inference.ai.azure.com 、
  認証は環境変数 GITHUB_TOKEN を使う
- モデルは gpt-4o-mini
- 会話履歴を配列で管理し、直近6件だけ送る
- max_tokens は 500 に設定する
- 10秒に1リクエストのレートリミットをつける
- システムプロンプトは "You are a helpful assistant."
```

**パターンB（Google Gemini API）の場合：**

```
以下の条件で Express サーバーの server.js を作成してください。

- dotenv で .env を読み込む
- `public` フォルダの静的ファイルを配信する
- POST /api/chat エンドポイントを作る
  - リクエスト: { message: "テキスト" }
  - レスポンス: { reply: "AIの返答" }
- @google/genai パッケージを使い、環境変数 GEMINI_API_KEY で認証する
- モデルは gemini-2.0-flash
- 会話履歴を配列で管理し、直近6件だけ送る
- 10秒に1リクエストのレートリミットをつける
- システムプロンプトは "You are a helpful assistant."
```

→ 出力されたコードを `server.js` に貼り付けて保存

---

### 3-3. `public/index.html` を作ってもらう

```
チャットボットのフロントエンド HTML を1ファイルで作成してください。

- デザインはシンプルで見やすいもの
- メッセージ入力欄と送信ボタン
- チャット履歴を表示するエリア
- 入力は200文字まで（それ以上は送信できない）
- 送信中はボタンを無効化してローディング表示
- POST /api/chat にリクエストを送り、返答を表示する
```

→ 出力されたコードを `public/index.html` に貼り付けて保存

---

### 3-4. `Dockerfile` を作ってもらう

```
Node.js アプリ用の Dockerfile を作成してください。
- ベースイメージは node:20-alpine
- 作業ディレクトリは /app
- package.json をコピーして npm install
- その後全ファイルをコピー
- ポート3000を公開
- 起動コマンドは node server.js
```

---

### 3-5. `docker-compose.yml` を作ってもらう

```
docker-compose.yml を作成してください。
- サービス名は chatbot
- Dockerfile をビルドする
- ポートは 3000:3000
- .env ファイルを env_file として読み込む
- コンテナ名は chatbot-app
```

---

### 3-6. `.gitignore` を作ってもらう

```
Node.js プロジェクト用の .gitignore を作成してください。
.env ファイル、node_modules、.DS_Store を除外してください。
```

---

### 3-7. `.env` を自分で作成する

> ⚠️ `.env` は AI に作ってもらわず、**自分で作成**してください。  
> API キーは絶対に他人に見せてはいけません。

**パターンA（GitHub Models）の場合：**

1. https://github.com/settings/tokens で Personal Access Token を発行
   - `Token name` に任意の名前を入力（例: `chatbot`）
   - `Expiration` は 30 days 程度でOK
   - スコープは最小限（**何も選択しなくてもOK**）
2. `.env` ファイルを新規作成して以下を記載：

```
GITHUB_TOKEN=ghp_ここにトークンを貼り付ける
PORT=3000
```

**パターンB（Google Gemini API）の場合：**

1. https://aistudio.google.com にアクセス
2. 「Get API key」→「Create API key」でキーを発行
3. `.env` ファイルを新規作成して以下を記載：

```
GEMINI_API_KEY=ここにAPIキーを貼り付ける
PORT=3000
```

---

## STEP 4: 動作確認する

### 起動する

VS Code のターミナルで：

```bash
docker compose up --build
```

初回は数分かかります。  
`Server is running on port 3000` のようなメッセージが出たら起動成功です。

### ブラウザで確認

```
http://localhost:3000
```

にアクセスして、チャット画面が表示されれば完成です！

### うまく動かないときは

Copilot Chat に以下のように貼り付けると解決策を教えてくれます：

```
以下のエラーが出て動きません。解決方法を教えてください。

[エラーメッセージをここに貼り付ける]
```

### 停止する

```bash
docker compose down
```

---

## STEP 5: GitHub にアップロードする

### 5-1. GitHub でリポジトリを作成

1. https://github.com にログイン
2. 右上の `+` → `New repository`
3. リポジトリ名を入力（例: `chatbot`）
4. `Private`（非公開）を選択
5. `Create repository` をクリック
6. 表示された SSH URL をコピー（例: `git@github.com:yourname/chatbot.git`）

### 5-2. アップロード（プッシュ）

VS Code のターミナルで以下を順番に実行：

```bash
git init
git add .
git commit -m "初回コミット"
git branch -m main
git remote add origin git@github.com:yourname/chatbot.git  ← URLは自分のものに変える
git push -u origin main
```

### 5-3. 確認

GitHub のリポジトリページを開いてファイルが表示されれば完了です。

---

## コードを修正するときの流れ

```
1. ファイルを修正する
2. 動作確認する（docker compose up）
3. 問題なければ GitHub にアップする

git add .
git commit -m "変更内容を一言で書く"
git push
```

---

## よくあるつまずきポイント

| 症状 | 原因 | 対処法 |
|------|------|--------|
| `docker: command not found` | Docker Desktop が起動していない | Docker Desktop を起動する |
| `Invalid API key` | `.env` の API キーが間違っている | 各サービスで再発行して貼り直す |
| `Unauthorized` | GitHub Token のスコープ不足 | Token を再発行する |
| 画面が真っ白 | `index.html` のパスが間違っている | `public/index.html` に置かれているか確認 |
| 返答が来ない | レートリミットにかかった | 10秒待って再送信する |

---

## AI ツールをうまく使うコツ

1. **一度に全部頼まない** → ファイルごとに1つずつ依頼する
2. **条件を箇条書きで渡す** → 曖昧な指示より具体的な条件のほうが良い結果になる
3. **エラーはそのまま貼り付ける** → 「このエラーを直して」とエラー文をそのまま渡せばOK
4. **コードを理解しようとする** → 「このコードは何をしているの？」と聞くと説明してくれる
5. **設計書を先に作る** → 何を作るかを整理してから依頼すると、手戻りが減る
