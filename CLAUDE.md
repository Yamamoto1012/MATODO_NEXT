# LastMatorix — Claude Code Project Rules

緊急度 × 重要度 (アイゼンハワー・マトリクス) に基づくタスク管理アプリ。Next.js 15 (App Router) + React 19 + Firebase + MUI v5 + Tailwind v3 + Vitest 構成。

このファイルは Claude Code セッション起動時に自動ロードされる。プロジェクト規約は以下のトピック別ファイルに分割しており、`@` 記法で本セッションプロンプトに注入される。**.cursor/rules ではなく本 CLAUDE.md と `.claude/rules/*.md` を正典とする** (差分理由は `README.md` を参照)。

@.claude/rules/style.md
@.claude/rules/architecture.md
@.claude/rules/testing.md
@.claude/rules/dependencies.md
@.claude/rules/tools.md
@.claude/rules/pull-request.md

## 主要ドキュメント

- `issue-commit-guidelines.md` — ISSUE 設計 / コミット粒度の正典
- `仕様書テンプレート.md` — 仕様書のひな形
- `仕様書-Claude-Code活用基盤整備.md` — Claude Code 活用基盤整備の仕様 (本 CLAUDE.md / hooks / permissions / skills のロードマップ)
- `README.md` — リポジトリ全体の概要、`.cursor/rules` と `.claude/rules` の対応関係

## ディレクトリ概要

```
front/                Next.js (App Router) アプリ
backend/              Flask スクレイピングアプリ
.claude/              Claude Code 設定 (rules / settings / skills)
.cursor/              Cursor 設定 (rules)
docker-compose.yml
```

## 作業の前に

- ISSUE 起点で着手する場合は `/start-issue <番号>` skill を使う (詳細は `.claude/skills/start-issue/SKILL.md`)。
- コミット粒度・タイトル命名・ブランチ規則は `issue-commit-guidelines.md` に従う。
- 規約に違反する変更を提案された場合、本ファイル + `@.claude/rules/*.md` を優先する。
