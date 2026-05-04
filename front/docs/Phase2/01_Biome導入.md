# Phase2.1: Biome導入

## 概要 (Overview)

ESLint + PrettierからBiomeへの移行を行い、高速で一貫したlinting・formatting環境を構築します。段階的移行により、既存の開発フローを維持しながら安全に移行を進めます。

## 技術選定理由 (Technical Selection Rationale)

* **Biome**: ESLint + Prettierより高速、Rustベースで安定、設定が簡単
* **段階的移行**: リスクを最小化し、問題発生時の迅速なロールバックを可能にする
* **設定の簡素化**: 複雑なESLint + Prettier設定から単一ツールへの統合

## 実装ステップ (Implementation Steps)

### ステップ1: パッケージインストール

```bash
# Biome本体のインストール
yarn add --dev @biomejs/biome

# 確認
npx @biomejs/biome --version
```

### ステップ2: 基本設定ファイル作成

`biome.json` を作成:

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
        "useConst": "error"
      },
      "suspicious": {
        "noExplicitAny": "warn"
      },
      "correctness": {
        "useJsxKeyInIterable": "error"
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
      "semicolons": "always"
    }
  },
  "files": {
    "include": ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    "ignore": [
      "node_modules/**",
      ".next/**",
      "out/**",
      "dist/**",
      "build/**"
    ]
  }
}
```

### ステップ3: ESLintとの段階的共存設定

既存の `.eslintrc.json` を `.eslintrc.json.backup` にバックアップ:

```bash
cp .eslintrc.json .eslintrc.json.backup
```

### ステップ4: package.jsonスクリプト追加

```json
{
  "scripts": {
    "lint:biome": "biome lint ./src",
    "lint:biome:fix": "biome lint --write ./src",
    "format:biome": "biome format --write ./src",
    "check:biome": "biome check --write ./src"
  }
}
```

### ステップ5: 段階的移行プロセス

#### Phase 1: 並行運用 (1-2日)
- ESLintとBiomeの並行実行
- 設定の調整とルール確認
- 既存コードでの動作検証

```bash
# 現在のESLintでのチェック
yarn lint

# Biomeでのチェック
yarn lint:biome

# 結果比較と設定調整
```

#### Phase 2: Biomeルール調整 (1日)
- プロジェクト固有のルール設定
- チーム合意による設定の最終化
- CI/CD設定の準備

#### Phase 3: 完全移行 (Phase2.5で実施)
- `.eslintrc.json` の無効化
- `package.json` スクリプトの置き換え
- CI/CD設定の更新

## Next.js + TypeScript + React対応

### TypeScript設定
BiomeはTypeScript設定を自動検出しますが、以下を確認:

```json
{
  "typescript": {
    "preferences": {
      "quoteStyle": "single"
    }
  }
}
```

### React/JSX設定
```json
{
  "javascript": {
    "globals": ["React"],
    "formatter": {
      "jsxQuoteStyle": "double"
    }
  }
}
```

### Next.js特有の設定
```json
{
  "linter": {
    "rules": {
      "nursery": {
        "noUndeclaredDependencies": "off"
      }
    }
  }
}
```

## 検証項目 (Verification Items)

### 機能検証
- [ ] `yarn lint:biome` でlintingが正常に実行される
- [ ] `yarn format:biome` でformattingが正常に実行される
- [ ] `yarn check:biome` で統合チェックが正常に実行される
- [ ] 既存のTypeScriptファイルがエラーなく処理される
- [ ] Reactコンポーネントが正しくチェックされる

### パフォーマンス検証
- [ ] ESLintと比較してlint時間が短縮される
- [ ] format時間が改善される
- [ ] ファイル数が多い場合のパフォーマンス確認

### 設定検証
- [ ] プロジェクトのコーディング規約と一致している
- [ ] チーム開発での一貫性が保たれる
- [ ] 既存コードの大幅な変更が発生しない

## トラブルシューティング (Troubleshooting)

### よくある問題

1. **Import順序の違い**
   ```bash
   # Biomeのimport組織化を無効化する場合
   biome check --write --organize-imports-enabled=false ./src
   ```

2. **フォーマット競合**
   ```bash
   # 段階的に適用する
   biome format --write ./src/components
   ```

3. **TypeScriptエラー**
   ```json
   {
     "linter": {
       "rules": {
         "suspicious": {
           "noExplicitAny": "warn"
         }
       }
     }
   }
   ```

### ロールバック手順
```bash
# 問題発生時の迅速な復旧
cp .eslintrc.json.backup .eslintrc.json

# package.jsonの元のスクリプトに戻す
# "lint": "next lint"
```

## 完了の定義 (Definition of Done)

- [ ] `@biomejs/biome` パッケージがインストールされている
- [ ] `biome.json` 設定ファイルが作成され、プロジェクトに適用されている
- [ ] `yarn lint:biome`、`yarn format:biome` コマンドが動作する
- [ ] 既存のTypeScript/Reactコードが正常にチェックされる
- [ ] ESLintとの並行運用が可能な状態になっている
- [ ] パフォーマンスの改善が確認されている
- [ ] ロールバック手順が確認されている

## 次のステップ

Phase2.1完了後は [Phase2.2: Vitest環境構築](./02_Vitest環境構築.md) に進みます。