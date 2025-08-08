# 推奨開発コマンド

## フロントエンド開発 (front/ ディレクトリ内で実行)

### 基本的な開発コマンド
```bash
# 開発サーバー起動
npm run dev
# または
yarn dev

# プロダクションビルド
npm run build
# または
yarn build

# プロダクションサーバー起動
npm run start
# または
yarn start

# Linting
npm run lint
# または
yarn lint
```

### Docker使用時
```bash
# プロジェクトルートで全サービス起動
docker-compose up

# 特定のサービスのみ起動
docker-compose up front
docker-compose up backend
```

## バックエンド開発

### ローカル開発
```bash
# 依存関係インストール
pip install -r requirements.txt

# Flask開発サーバー起動
flask run --host=0.0.0.0
```

## システムコマンド (macOS)
- `git`: バージョン管理
- `ls`: ディレクトリ一覧
- `cd`: ディレクトリ移動
- `grep`: テキスト検索
- `find`: ファイル検索

## ポート情報
- フロントエンド: http://localhost:3000
- バックエンド: http://localhost:5001