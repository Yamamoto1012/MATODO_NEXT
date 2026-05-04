# Phase2.5: ESLint移行完了

## 概要 (Overview)

Phase2.1で段階的共存を開始したESLintからBiomeへの移行を完了します。`.eslintrc.json`の無効化、`package.json`スクリプトの置き換え、CI/CD設定の更新を行い、Biomeを正式な開発ツールとして採用します。

## 前提条件 (Prerequisites)

- Phase2.1でBiomeの導入と基本設定が完了している
- Phase2.2-2.4でVitestとStorybookでの動作確認が済んでいる
- BiomeとESLintの並行運用による検証が完了している

## 実装ステップ (Implementation Steps)

### ステップ1: Biomeルール最終調整

既存コードに対するBiomeのチェック結果を確認し、プロジェクト固有のルールを調整:

```bash
# 全ファイルでのBiomeチェック実行
yarn lint:biome

# フォーマット差分確認
yarn format:biome --write
```

#### `biome.json` の最終調整:

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "style": {
        "noNonNullAssertion": "off",
        "useConst": "error",
        "useImportType": "error"
      },
      "suspicious": {
        "noExplicitAny": "warn",
        "noArrayIndexKey": "off"
      },
      "correctness": {
        "useJsxKeyInIterable": "error",
        "noUndeclaredVariables": "error"
      },
      "complexity": {
        "noBannedTypes": "error",
        "noUselessFragments": "error"
      },
      "performance": {
        "noDelete": "error"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100,
    "lineEnding": "lf"
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "jsxQuoteStyle": "double",
      "trailingCommas": "es5",
      "semicolons": "always",
      "arrowParentheses": "always"
    }
  },
  "json": {
    "formatter": {
      "enabled": true
    }
  },
  "files": {
    "include": [
      "**/*.js",
      "**/*.jsx", 
      "**/*.ts",
      "**/*.tsx",
      "**/*.json"
    ],
    "ignore": [
      "node_modules/**",
      ".next/**",
      "out/**",
      "dist/**",
      "build/**",
      "storybook-static/**",
      "coverage/**",
      "**/*.config.js",
      "**/*.config.ts"
    ]
  }
}
```

### ステップ2: ESLint設定の無効化

`.eslintrc.json` をバックアップに移行:

```bash
# バックアップ作成（Phase2.1で実施済みの場合は確認のみ）
cp .eslintrc.json .eslintrc.json.backup

# ESLintファイルを無効化（リネーム）
mv .eslintrc.json .eslintrc.json.disabled
```

### ステップ3: package.jsonスクリプトの完全置き換え

`package.json` のscriptsセクションを更新:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build", 
    "start": "next start",
    "lint": "biome lint ./src",
    "lint:fix": "biome lint --write ./src",
    "format": "biome format --write ./src",
    "check": "biome check --write ./src",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest --coverage",
    "storybook": "storybook dev -p 6006",
    "storybook:build": "storybook build"
  }
}
```

### ステップ4: VSCode設定更新

`.vscode/settings.json` を作成・更新:

```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  },
  "[javascript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[json]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  // ESLint拡張を無効化
  "eslint.enable": false,
  "prettier.enable": false
}
```

### ステップ5: VSCode拡張の推奨設定

`.vscode/extensions.json` を作成・更新:

```json
{
  "recommendations": [
    "biomejs.biome",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss"
  ],
  "unwantedRecommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

### ステップ6: CI/CD設定更新

#### GitHub Actions設定（`.github/workflows/ci.yml`）:

```yaml
name: CI
on: [push, pull_request]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'yarn'
      
      - name: Install dependencies
        run: yarn install --frozen-lockfile
      
      - name: Biome Check
        run: yarn check
      
      - name: Type Check
        run: yarn type-check
      
      - name: Run Tests
        run: yarn test:run
      
      - name: Build Storybook
        run: yarn storybook:build
      
      - name: Build Next.js
        run: yarn build
```

#### pre-commit Hook設定:

```bash
# Huskyインストール（必要な場合）
yarn add --dev husky

# pre-commitフック設定
npx husky add .husky/pre-commit "yarn check && yarn type-check"
```

### ステップ7: チーム共有とドキュメント更新

#### README.md の開発セクション更新:

```markdown
## 開発環境

### Linting & Formatting
このプロジェクトではBiomeを使用してコードの品質とスタイルを管理しています。

```bash
# Lint & Format チェック
yarn check

# 自動修正
yarn lint:fix
yarn format

# Lint のみ
yarn lint

# Format のみ  
yarn format
```

### VSCode設定
推奨拡張機能をインストールしてください：
- Biome (biomejs.biome)

ESLintとPrettier拡張機能は無効化してください。
```

### ステップ8: パフォーマンス比較測定

移行完了後のパフォーマンス測定:

```bash
# Biomeでの処理時間測定
time yarn check

# 過去のESLint処理時間と比較（記録がある場合）
time yarn lint:eslint:old

# 結果をドキュメント化
```

## 検証項目 (Verification Items)

### 機能検証
- [ ] `yarn lint` でBiomeによるlintingが実行される
- [ ] `yarn format` で統一されたフォーマットが適用される
- [ ] `yarn check` で lint + format + import整理が実行される
- [ ] VSCodeでの保存時自動フォーマットが動作する

### 開発環境統合検証
- [ ] Next.js開発サーバー（`yarn dev`）が正常に動作する
- [ ] ビルド（`yarn build`）が正常に完了する
- [ ] Vitestテスト（`yarn test`）が正常に実行される
- [ ] Storybook（`yarn storybook`）が正常に動作する

### CI/CD検証
- [ ] GitHub Actionsでのlint checkが通る
- [ ] pre-commitフックが正常に動作する
- [ ] 既存のワークフローが影響を受けない

### チーム開発検証
- [ ] 他の開発者が同じ設定でセットアップできる
- [ ] コードレビュー時のフォーマット競合が発生しない
- [ ] ESLintとの競合エラーが発生しない

## パフォーマンス改善確認

### 測定項目
```bash
# ベンチマーク測定例
echo "Biome lint performance:"
time yarn lint

echo "Biome format performance:"
time yarn format

echo "Biome check performance:"  
time yarn check
```

### 期待される改善
- **Lint時間**: ESLintと比較して2-5倍の高速化
- **Format時間**: Prettierと比較して5-10倍の高速化
- **統合チェック時間**: 全体的な処理時間の短縮

## トラブルシューティング (Troubleshooting)

### よくある問題

1. **既存コードでBiomeエラーが大量発生**
   ```bash
   # 段階的修正
   yarn lint:fix
   
   # 手動修正が必要な箇所の確認
   yarn lint --reporter=verbose
   ```

2. **VSCodeでBiome拡張が認識されない**
   ```bash
   # 拡張機能の再インストール
   code --install-extension biomejs.biome
   
   # VSCode設定リロード
   # Ctrl+Shift+P → "Developer: Reload Window"
   ```

3. **CI/CDでbiome commandが見つからない**
   ```yaml
   # package.jsonに確実にbiomeが含まれているか確認
   - name: Install Biome
     run: yarn add --dev @biomejs/biome
   ```

4. **Import整理の動作が期待と異なる**
   ```json
   // biome.json の organizeImports 設定確認
   {
     "organizeImports": {
       "enabled": true
     }
   }
   ```

### 緊急時のロールバック手順

```bash
# 1. ESLint設定の復元
mv .eslintrc.json.disabled .eslintrc.json

# 2. package.json scripts の復元 
# （Git履歴から復元またはバックアップから復元）

# 3. VSCode設定の無効化
# .vscode/settings.json の biome設定を削除

# 4. 依存関係の調整
yarn add --dev eslint prettier
```

## 完了の定義 (Definition of Done)

- [ ] `.eslintrc.json` が無効化されている
- [ ] `package.json` スクリプトがBiomeコマンドに更新されている
- [ ] VSCode設定が更新され、保存時自動フォーマットが動作する
- [ ] CI/CD設定がBiomeを使用するよう更新されている
- [ ] 全ての開発コマンド（dev、build、test、storybook）が正常動作する
- [ ] パフォーマンス改善が確認されている
- [ ] チームメンバーに移行内容が共有されている
- [ ] ロールバック手順が文書化されている

## 次のステップ

Phase2.5完了後は [Phase2.6: Tailwind CSS v4移行計画](./06_TailwindCSS_v4移行計画.md) の検討に進みます。

この時点で、Phase2の主要な開発環境刷新（Biome、Vitest、Storybook）は完了し、次のPhase（状態管理導入、リファクタリング）に進む準備が整います。