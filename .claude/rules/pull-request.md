---
title: Pull Request
description: AI 向け PR 作成・編集ルール (タイトル形式 / 本文テンプレ厳守 / Closes 記法)
---

# Pull Request

AI が `gh pr create` / `gh pr edit` を実行するときに守るルール。**正典は `issue-commit-guidelines.md` の「PR 規約」セクション** で、本ファイルはその AI 向け実装手順 + チェックリスト。

## 大原則

**コミットメッセージ規約 (Conventional Commits) と PR タイトル規約は別物**。`gh pr create` で渡すタイトルは Conventional Commits 形式ではなく、`#<ISSUE番号> <ISSUE タイトル>` 形式。

## PR タイトル形式

`#<ISSUE番号> <ISSUE タイトル>` で書く。

- ISSUE タイトル先頭の `[type]` プレフィックス (`[Feature]` / `[Refactor]` / `[chore]` 等) は **外す**
- ISSUE 番号は省略しない
- Conventional Commits (`<type>: <subject>`) は **使わない**

```text
# OK
#115 PR タイトル / テンプレ規約を明文化し、PreToolUse hook で AI に強制する
#111 biome FIXABLE warnings 13 件を auto-fix で解消

# NG
feat: PR テンプレ規約 hook を追加        ← Conventional Commits 形式
[Feature] PR タイトル ...                ← ISSUE 番号欠落 + [type] 残存
PR テンプレ規約を hook で強制            ← ISSUE 番号欠落
```

## PR 本文

`.github/pull_request_template.md` の章立てに従う。

**H1 は実 PR タイトル文字列で置き換える** — テンプレ先頭の `# プルリクエストのタイトル` はプレースホルダ。`gh pr create --title "<タイトル>"` に渡すタイトル文字列と同じ内容を本文 H1 (`# <タイトル>`) にも書く。

### 必須見出し (省略不可)

- `## 概要`
- `## 関連Issue` — 直下に `close #<ISSUE番号>` を 1 行で含める (`Closes` ではなく `close`)
- `## 変更内容`
- `## チェックリスト`

### 任意見出し (該当時のみ)

- `## スクリーンショット` (UI 変更時)
- `## テスト結果`
- `## 備考`

## `gh pr create` の実行手順 (順守)

1. **テンプレを Read**: `.github/pull_request_template.md` を Read し、現在の章立てを確認する
2. **タイトル組み立て**: `#<ISSUE番号> <ISSUE タイトル>` 形式 (`[type]` 除去)
3. **本文構築**: テンプレ章立てに沿って構築する。
    - **H1 (`# プルリクエストのタイトル` プレースホルダ) を組み立てた PR タイトル文字列で置き換える** (`# #<ISSUE番号> <ISSUE タイトル>`)
    - `## 関連Issue` の直下に `close #<番号>` を必ず入れる
4. **`--body-file` で渡す**: 本文は一時ファイル (例: `/tmp/pr-body-<番号>.md`) に書き出して `--body-file` で渡すと改行・引用が崩れにくい
5. **base ブランチ明示**: `--base main` を必ず付ける (`issue-commit-guidelines.md` のブランチ運用ルール参照)

```bash
# 例
gh pr create \
  --base main \
  --title "#115 PR タイトル / テンプレ規約を明文化し、PreToolUse hook で AI に強制する" \
  --body-file /tmp/pr-body-115.md
```

## hook による強制

`.claude/hooks/pr-template-check.sh` が PreToolUse hook で `gh pr create` / `gh pr edit` を検知し、以下のいずれかが満たされない場合 **exit 2 で block** する。

- タイトルが `#<数字>` で始まる (例: `#115 ...`)
- 本文に `## 概要` / `## 関連Issue` / `## 変更内容` / `## チェックリスト` の 4 見出しすべてが含まれる
- 本文に `close(s)? #<数字>` を含む

block されたら **stderr のメッセージに従って修正してから再実行する**。`--no-verify` 等での回避は禁止 (規約逃避禁止)。

## 禁止事項

- ❌ PR タイトルに Conventional Commits 形式 (`<type>: <subject>`) を使う
- ❌ ISSUE 番号を省略した PR タイトル
- ❌ `## 概要` / `## 関連Issue` / `## 変更内容` / `## チェックリスト` のいずれかを欠く本文
- ❌ 本文 H1 をテンプレのプレースホルダ (`# プルリクエストのタイトル`) のまま残す (PR タイトル文字列で置き換える)
- ❌ `close #<番号>` を省略 (マージ時の自動 close が効かない)
- ❌ `Closes #<番号>` (大文字) — テンプレに合わせて `close` で揃える
- ❌ hook block を `--no-verify` 等で回避

## 良い PR の例

タイトル:

```text
#115 PR タイトル / テンプレ規約を明文化し、PreToolUse hook で AI に強制する
```

本文 (テンプレ章立て準拠。H1 はタイトル文字列で置換済み):

```markdown
# #115 PR タイトル / テンプレ規約を明文化し、PreToolUse hook で AI に強制する

## 概要
PR タイトル / 本文テンプレの規約を明文化し、AI による `gh pr create` / `gh pr edit` を PreToolUse hook で検証して強制する。

## 関連Issue
close #115

## 変更内容
- [x] `issue-commit-guidelines.md` に PR 規約セクションを追加
- [x] `.claude/rules/pull-request.md` を新設し `CLAUDE.md` で include
- [x] PreToolUse hook (`.claude/hooks/pr-template-check.sh`) を追加

## テスト結果
- 規約違反タイトルで block 確認
- 必須見出し欠落で block 確認
- 規約準拠で pass 確認

## チェックリスト
- [x] コーディング規約に準拠している
- [x] 必要なテストを追加した (hook 動作検証)
- [x] すべてのテストが成功している
- [x] ドキュメントを更新した (本ファイル + issue-commit-guidelines.md)
```
