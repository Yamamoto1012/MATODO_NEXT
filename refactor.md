## フロントエンドリファクタリング計画
### 1.なぜ行うのか？
**保守性の向上**：コードの責務を分離・依存性を明確化することで、コードを読む際の負担を減らす
**開発速度の向上**：再利用可能なUI/ロジックを整理し、レビューと実装を速くする
**不具合削減**：テスト整備・静的解析を強化し、コード品質を確保する
**パフォーマンス改善**：不要なレンダリング・過剰なJSに関する記述を改善することで、アプリケーションを軽量化
**UX/アクセシビリティ向上**：A11yに準拠
**セキュリティ/信頼性**：現在使用しているパッケージの更新、脆弱性の確認
**将来拡張性**：フォルダ構成を大胆に変更することで、機能追加を用意にする

目標: Lighthouse >= 90

### 2.スコープ
- **対象** : UI層、データ取得層、状態管理、ルーティング、ビルド設定、テスト、Storybook、Ci/CD
- **非対象** : バックエンド

### 3.現状把握
front/docs/現状把握_LastMatorix.md

### 4.目標アーキテクチャ
```
src/
  app/
    (app)/
      dashboard/
        page.tsx                 # RSC: 入口（データ取得→Clientへprops）
    api/
    layout.tsx
    providers.tsx                # Jotai Provider, 他のProvider集約
    globals.css
  components/
    ui/                          # 共有UI（ボタン等）※純プレゼン
  features/
    counter/
      atoms.ts                   # jotai atoms（状態の単一ソース）
      selectors.ts               # 派生/読み取り専用atoms
      actions.ts                 # 書き込みユースケース（Server Actions等）
      components/
        CounterView.tsx         # プレゼン（受け取ったpropsを描画）
        CounterContainer.tsx    # コンテナ（useAtomやイベント束ね）
        CounterContainer.stories.tsx
      __tests__/
        Counter.container.test.tsx
    auth/
      atoms.ts
      components/
        LoginForm.view.tsx
        LoginForm.container.tsx
  lib/
    env.ts
    test/
      render.tsx                 # Provider付きrenderユーティリティ
  styles/
public/
middleware.ts
next.config.ts
tsconfig.json
vitest.config.ts
tests/setup.ts
```

### 5.コーディング規約
~/.cursorフォルダ内に記述
- **Lint/Format** : biome

### 6.実施方針
機能単体で段階的に移行

### 7.テスト戦略
- **単体** : hooks/ユーティリティ中心(Vitest + RTL)
- **e2e** : 主要フローのみ(Playwright)

### 8.CI/CD
- **PR**: biome →　e2e →　build → LighthouseCI
- **main**: フルe2e、セキュリティ監査(npm audit)

