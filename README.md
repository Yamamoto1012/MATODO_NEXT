# Matodo (LastMatorix)

緊急度 × 重要度（アイゼンハワー・マトリクス）に基づいてタスクを整理・管理するフルスタックアプリです。フロントは Next.js 14（App Router）+ Firebase（Auth/Firestore/Storage）+ Tailwind CSS、バックエンドは Flask（スクレイピング用）で構成されています。Docker Compose でフロント/バックエンドを開発起動できます。

## 機能概要

- 認証
  - メール/パスワードログイン
  - Google アカウントでのログイン
  - 初回ログイン時、プロフィール（ユーザー名・役職・アイコン）を作成
- タスク管理（Firestore）
  - タスク作成（Enter で追加）
  - 緊急度（`high`/`low`）× 重要度（`high`/`low`）で自動分類
  - 締切日、メモの編集、削除、完了/未完了の切替
  - 完了済みタスク一覧の閲覧・未完了への戻し
- UI
  - アイゼンハワー・マトリクスに基づく 2×2 グリッド表示（色分け）
  - プロフィールカード、タスクリスト、完了済みリンク
- バックエンド（Flask）
  - 学内ポータルにログインして情報取得するスクレイピング実験コード（`.env`から認証情報を読み込み）

## ディレクトリ構成

```
backend/         Flask アプリ（スクレイピング）
front/           Next.js アプリ（App Router）
docker-compose.yml
```

主なファイル:
- `front/app/(auth)/Auth/page.jsx` 認証トップ（Google ログイン/メールログイン/アカウント作成導線）
- `front/app/(auth)/Login/page.jsx` メール/パスワードログイン
- `front/app/(auth)/CreateProfile/page.jsx` 初回プロフィール作成
- `front/app/Home/page.jsx` マトリクス画面（`ui/Menu` と `ui/MatrixArea`）
- `front/app/Profile/page.jsx` プロフィール表示
- `front/app/CompletedTaskList/page.jsx` 完了済タスク一覧
- `front/app/firebase.js` Firebase 初期化（env 依存）
- `front/ui/*` UI コンポーネント群（`AddTask`, `TaskList`, `TaskCard`, `MatrixArea`, ほか）
- `backend/app.py` Flask アプリ（スクレイピング用の関数/ルート）

## 動作要件

- Node.js 20 以上 / Yarn
- Python 3.12
- Docker (任意、Compose での起動をサポート)
- Firebase プロジェクト（Auth, Firestore, Storage を有効化）

## 環境変数

フロント（`front/.env.local`）

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGE_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

バックエンド（`backend/.env` など）

```
uid=ポータルID
pw=パスワード
```

`docker-compose.yml` は `front/.env.local` を読み込みます。

## ローカル開発（Docker あり）

1) ルートで以下を実行

```bash
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5001`（内部で Flask 5000 → 外部 5001）

補足: `front/dockerfile` と `backend/dockerfile` は OS によって大文字/小文字が区別されます。`docker-compose.yml` は `front/Dockerfile` を参照しているため、ファイル名は `Dockerfile` 推奨です（必要に応じてプロジェクト内の表記を統一してください）。

## ローカル開発（手動）

フロントエンド:

```bash
cd front
yarn install
yarn dev
```

バックエンド:

```bash
cd backend
pip install -r requirements.txt
pip install beautifulsoup4 requests python-dotenv
export FLASK_APP=app
flask run --host=0.0.0.0 --port 5000
```

## Firebase セットアップ

1) Firebase コンソールでプロジェクト作成
2) Authentication 有効化（Email/Password と Google）
3) Firestore データベースを作成（Native モード）
4) Storage を有効化
5) ウェブアプリを追加し、API キー等を `front/.env.local` に設定

## Firestore データモデル（想定）

- `users/{uid}`
  - `name`: string
  - `position`: string
  - `iconUrl`: string
- `tasks/{taskId}`
  - `userId`: string (作成者 UID)
  - `title`: string
  - `memo`: string | null
  - `importance`: "high" | "low"
  - `urgency`: "high" | "low"
  - `deadline`: YYYY-MM-DD 文字列
  - `isDone`: boolean

現状 `AddTask` では `setDoc(doc(db, "tasks", newTask.title), newTask)` のため、タイトル重複で上書きされる可能性があります。実運用では `addDoc(collection(db, "tasks"), newTask)` など ID 自動採番を推奨です。

## 主な画面フロー

1) ルート `/` → `/Auth` に自動リダイレクト
2) `/Auth` から Google ログイン or メールログイン or アカウント作成へ
3) 初回ユーザーは `/CreateProfile` でプロフィール作成 → `/Home`
4) `/Home` でマトリクス表示・タスク追加/編集
5) `/CompletedTaskList` で完了済タスク確認・戻し
6) `/Profile` でプロフィール表示/ログアウト

## バックエンド（スクレイピング）

`backend/app.py` は学内ポータルへのログインと科目取得の試験的コードを含みます。実際の運用では法令・規約順守、MFA 対応、例外処理、CSRF/SSL 検証、API 化（JSON 返却）などの強化が必要です。

起動（Docker なし）:

```bash
cd backend
python app.py
```

## 開発メモ

- Next.js: 14.0.3（App Router）
- UI: Tailwind CSS, MUI
- 画像: `next.config.js` で `firebasestorage.googleapis.com` を許可
- スタイル: `front/app/globals.css`