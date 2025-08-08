# MATODO_NEXT プロジェクト概要

## プロジェクトの目的
MATODO_NEXTは緊急度と重要度に基づいたTodoアプリです。アイゼンハワーマトリックスの概念を活用し、タスクを重要度と緊急度で分類して管理できるWebアプリケーションです。

## 技術スタック

### フロントエンド
- **フレームワーク**: Next.js 14.0.3 (App Router使用)
- **言語**: JavaScript/TypeScript (TypeScript設定あり、strictモードは無効)
- **UIライブラリ**: 
  - Material-UI (@mui/material, @mui/icons-material)
  - TailwindCSS
- **状態管理・機能**:
  - React 18
  - @dnd-kit (ドラッグアンドドロップ)
  - Firebase 10.6.0 (認証・データベース)
  - Axios (HTTP通信)
  - React DatePicker
- **開発ツール**:
  - ESLint (Next.js設定 + Prettier)
  - PostCSS + Autoprefixer

### バックエンド
- **言語**: Python
- **フレームワーク**: Flask 3.0.0
- **デプロイ**: Gunicorn 21.2.0
- **その他**: Web scraping機能あり (BeautifulSoup使用)

### インフラ・開発環境
- **コンテナ**: Docker + Docker Compose
- **ポート**: フロントエンド 3000, バックエンド 5001

## プロジェクト構造
```
LastMatorix/
├── front/           # Next.jsフロントエンド
│   ├── app/         # App Routerディレクトリ
│   │   ├── (auth)/  # 認証関連ページ
│   │   ├── Home/    # メインホーム画面
│   │   └── Profile/ # プロフィール画面
│   └── ui/          # 再利用可能UIコンポーネント
├── backend/         # Flaskバックエンド
└── docker-compose.yml
```

## 主な機能
1. 認証機能 (Firebase Auth + Google認証)
2. タスク管理 (アイゼンハワーマトリックス)
3. ドラッグアンドドロップでのタスク移動
4. 完了タスクの管理
5. プロフィール機能
6. Web scraping機能 (履修情報取得)