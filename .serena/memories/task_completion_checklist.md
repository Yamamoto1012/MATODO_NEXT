# タスク完了時のチェックリスト

## 開発完了時に実行すべきコマンド

### 必須チェック
1. **Linting**: `npm run lint` (front/ディレクトリ内)
2. **ビルドテスト**: `npm run build` (front/ディレクトリ内)

### 推奨チェック
3. **開発サーバー起動テスト**: `npm run dev`
4. **Docker環境テスト**: `docker-compose up`

## エラー対応

### よくあるエラーとその対応
- **ESLint エラー**: ルール違反の修正が必要
- **ビルドエラー**: TypeScript型エラーや未使用インポートの確認
- **Docker エラー**: ポート競合 (3000, 5001) の確認

## Git管理
- 現在のブランチ: `feature/45`
- メインブランチ: `main`

### 注意事項
- `.cursor/`, `.mcp.json`, `.serena/` はgitignoreに追加を検討
- Firebase設定ファイル（`.env.local`）の機密情報管理に注意

## 品質保証
- ESLintルールに従ったコード
- TailwindCSSクラスの適切な使用
- コンポーネントの適切な分割と再利用性
- Firebase認証の適切な実装