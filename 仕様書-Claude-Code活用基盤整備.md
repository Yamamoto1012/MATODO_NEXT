# 概要
Claude Code をフロントエンド大リファクタリングの主戦力として安全かつ効率的に活用するため、AI 活用基盤を 7 ブロックに分けて段階的に整備する。
参考: imaimai17468/imaimai-front-templete のオーケストレーション設計から、本プロジェクト規模で過剰にならない要素のみを取り込む。

## 企画書
N/A (社内施策ではないため省略)

## 要件
- Claude Code のセッション起動時に本プロジェクトのコーディング規約が自動適用される
- 破壊的なシェルコマンドが Claude Code から実行できない (物理ブロック)
- ファイル編集後とターン終了時に品質ゲートが自動実行され、失敗時は AI 自身に修正させられる
- リファクタリングの主目的である「未使用コード除去」「型重複解消」を支援する自動検出が走る
- AI が生成するコミットが論理単位で分割される
- AI が学習データより新しいライブラリ仕様 (Next.js / Tailwind 等) を参照できる

## やらないこと
- Codex / Cursor / その他 AI への同等スキル展開 (Claude Code に集中)
- Aegis MCP の導入 (規約ファイル数が少なく、@include で十分。imaimai 側の ADR-0001 でも「ルール 15 本超で検討」と明示)
- マルチエージェント並列実行 (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`) — 単独開発で不要
- chrome-devtools MCP / `stop-component-verify.sh` — 起動オーバーヘッドに対し効果が薄い
- `stop-agent-review.sh` (Codex CLI による diff 二重レビュー) — 別 CLI 依存で重い
- subagent 駆動の実装委譲ルール — 大リファクタ完了後に効果測定の上で再検討
- MUI のバージョンアップで v6 を中継すること (B-3) — v5 から **一気に v7 まで上げる**。中継すると同じ箇所を 2 回触るコストが上回る判断

## デザイン
N/A (UI 変更を伴わない開発基盤整備のため)

# 使用する単語

| 用語 | 説明 |
| --- | --- |
| Claude Code | Anthropic 公式の対話型コーディング CLI |
| MCP | Model Context Protocol。外部ツール接続規格 |
| hook | Claude Code がイベント (PreToolUse / PostToolUse / Stop / UserPromptSubmit) で起動するスクリプト |
| skill | `.claude/skills/<name>/SKILL.md` で定義され `/skill-name` で呼べるテンプレート |
| permissions | `.claude/settings.json` の `allow` / `ask` / `deny` 配列。Bash/Read/Write 等の許可制御 |
| `@include` | `CLAUDE.md` 内で `@path/to/file.md` と書くと、その内容がセッションプロンプトに自動注入される記法 |
| context7 | ライブラリドキュメントを取得する MCP サーバー (Upstash 提供) |
| knip | TypeScript / JavaScript の未使用 export / file / dependency を検出するツール |
| similarity-ts | 重複した型定義 / 関数を検出する Rust 製ツール |
| Lefthook | 既存導入済の git hook ランナー (Husky 並列で動作) |

# 全体フロー図

```mermaid
flowchart TB
  subgraph SessionStart[セッション起動時]
    A[Claude Code 起動] -->|@include| B[CLAUDE.md → .claude/rules/*.md 自動注入]
  end

  subgraph DuringTurn[ターン中]
    B --> C[ユーザープロンプト受信]
    C --> D{ツール呼び出し}
    D -->|Bash| E[PreToolUse: permissions チェック]
    E -->|deny| X1[実行拒否]
    E -->|ask| X2[ユーザー確認]
    E -->|allow| F[実行]
    D -->|Edit/Write/MultiEdit| G[ファイル編集]
    G -->|PostToolUse| H[lint + typecheck]
    H -->|fail| X3[decision:block → 修正ループ]
    H -->|pass| I[継続]
  end

  subgraph TurnEnd[ターン終了時]
    I --> J[Stop hook]
    J --> K[typecheck / lint / format]
    K -->|pass| L[knip / similarity-ts]
    K -->|fail| X4[block → 修正]
    L -->|pass| M[完了]
    L -->|fail| X5[block → 修正]
  end

  subgraph External[補助機能]
    C -->|/commit| N[commit skill: 1コミット=1意図]
    C -.参照.-> O[context7 MCP: 最新ライブラリ仕様]
  end
```

# ユーザ面
※ ここでの「ユーザ」 = 本プロジェクトで Claude Code を使う開発者。画面の代わりに「セッションでの体験」を仕様化する。

## 規約自動適用機能

### Claude セッション起動時の体験
**概要**
セッション起動時に `CLAUDE.md` が自動ロードされ、その中の `@.claude/rules/*.md` 記法により規約ファイル群がプロンプトに注入される。開発者は規約をプロンプトに毎回コピペする必要がない。

**構成要素**
- `CLAUDE.md` (リポジトリルート)
- `.claude/rules/style.md`
- `.claude/rules/architecture.md`
- `.claude/rules/testing.md`
- `.claude/rules/dependencies.md`
- `.claude/rules/tools.md`

**CLAUDE.md**
1 段落のオリエンテーション + `@.claude/rules/*.md` の include 行のみ。それ自体に規約本文は書かない (差分管理しやすさのため)。

**.claude/rules/style.md ほか**
既存 `.cursor/rules/*.mdc` 7 本の内容を Markdown に正規化して移植。Cursor 側からも参照可能な形に保つ (どちらを正典とするかは ISSUE で決定)。

## 破壊的操作の物理ブロック機能

### Claude が rm / git push --force / .env 読込を試みたとき
**概要**
`.claude/settings.json` の `permissions.deny` に該当するパターンを試みた瞬間、Claude Code が実行を拒否する。AI 暴走時の最終防衛線。

**構成要素**
- `.claude/settings.json` の `permissions.deny` / `ask` / `allow` 配列

**deny 対象 (例)**
- `Bash(rm -rf:*)`, `Bash(rm -fr:*)`, `Bash(rm -r:*)`
- `Bash(git push --force:*)`, `Bash(git push -f:*)`, `Bash(git reset --hard:*)`
- `Bash(git branch -D:*)`, `Bash(git checkout --:*)`, `Bash(git restore --:*)`
- `Bash(sudo:*)`, `Bash(chmod -R:*)`
- `Read(./.env)`, `Read(./.env.local)`, `Write(./.env*)`, `Edit(./.env*)`

**ask 対象 (例)**
- `Bash(git commit:*)`, `Bash(git push:*)`, `Bash(git merge:*)`, `Bash(git rebase:*)`, `Bash(git reset:*)`
- `Bash(gh pr create:*)`, `Bash(gh pr merge:*)`, `Bash(gh issue:*)`
- `Bash(yarn add:*)`, `Bash(npm install:*)`
- `Bash(rm:*)`, `Bash(mv:*)`, `Bash(cp:*)`

**allow 対象 (例)**
- `Bash(ls:*)`, `Bash(grep:*)`, `Bash(rg:*)`, `Bash(find:*)`, `Bash(tree:*)`
- `Bash(git status:*)`, `Bash(git log:*)`, `Bash(git diff:*)`, `Bash(git show:*)`
- `Bash(gh pr view:*)`, `Bash(gh issue view:*)`, `Bash(gh api:*)`
- `Bash(yarn run:*)`

## 編集後の即時品質チェック機能

### Edit / Write / MultiEdit 直後の体験
**概要**
`.ts` / `.tsx` / `.js` / `.jsx` ファイル編集直後に biome lint + tsc が自動実行される。失敗時は `decision:block` で次のツール呼び出しが阻止され、Claude が修正してからでないと進めない。

**構成要素**
- `.claude/settings.json` `hooks.PostToolUse` セクション
- インラインのワンライナー (シェルスクリプト)
- (拡張時) `.claude/hooks/post-edit-check.sh`

**振る舞い**
- 対象拡張子でない場合は no-op
- 対象だった場合: `yarn lint && yarn typecheck` (or biome / tsc) を実行し、終了コード非0なら `decision:block` JSON を返す

## ターン終了時の基本品質ゲート機能

### 会話 1 ターン終了時 (Stop イベント)
**概要**
変更がある場合のみ、typecheck → lint → format を順に実行。1 つでも失敗すれば Claude にエラー全文を渡し、修正を強制する。Stop hook なので「終わったつもりが壊れていた」を防ぐ。

**構成要素**
- `.claude/hooks/stop-quality-gate.sh`
- `.claude/settings.json` `hooks.Stop` セクション

**振る舞い**
- `git status --porcelain` が空なら exit 0
- typecheck / lint / format を順次実行、失敗したら `decision:block` JSON を返す

## ターン終了時の追加品質ゲート機能 (リファクタ用)

### 会話終了時 (Stop イベント、上記 hook の続き)
**概要**
基本ゲートが通った後に knip + similarity-ts を実行。未使用 export / 未使用ファイル / 重複した型・関数を検出し、見つかれば修正を強制する。リファクタ目的での導入。

**構成要素**
- `knip.json` (knip 設定)
- `similarity-ts` (cargo install または npx)
- `.claude/hooks/stop-quality-gate.sh` の Layer 2 セクション

**振る舞い**
- `Unused ` / `Duplicate ` 等の出力行を検出
- `// similarity-ignore: <reason>` コメントが直前にあれば除外 (テンプレ的に残したい場合の回避策)
- 該当ありなら `decision:block` で Claude に削除 or `@public <reason>` 付与を要求

## /commit skill 機能

### ユーザーが「コミットして」と入力したとき
**概要**
`/commit` skill (または通常応答内で参照) により、1 コミット = 1 意図 / Conventional Commits / heredoc によるメッセージ整形を強制する。`git add -A` 禁止、ハンク分割は `git add -p` を使う。

**構成要素**
- `.claude/skills/commit/SKILL.md`
- `issue-commit-guidelines.md` (既存、参照元)

## 最新ライブラリ参照機能 (context7 MCP)

### Next.js / Tailwind / その他ライブラリの API で迷ったとき
**概要**
Claude が `mcp__context7__*` ツールを呼び、最新のライブラリドキュメントを取得する。学習データのカットオフより新しい仕様を扱える。

**構成要素**
- `.mcp.json`
- `.claude/settings.json` `enabledMcpjsonServers` / `enableAllProjectMcpServers`

# 管理面
※ 設定ファイル管理面。誰がどのファイルを編集すべきかを規定する。

## 設定ファイル群

### `.claude/settings.json`
**概要**
permissions / hooks / MCP enable / plugins の一元管理。プロジェクト共有設定。
git 管理対象。secrets は含めない。

**構成要素**
- `env`
- `permissions` (allow / deny / ask)
- `hooks` (UserPromptSubmit / PreToolUse / PostToolUse / Stop)
- `enabledMcpjsonServers`
- `enabledPlugins` (将来用、初期は空)

### `.claude/settings.local.json` (既存)
**概要**
個人ローカル設定。git 管理外。既存の挙動は維持。

### `.mcp.json`
**概要**
MCP サーバーのコマンド定義。プロジェクト共有。
初期は `context7` のみ。

### `.claude/rules/*.md`
**概要**
トピック別の規約本文。CLAUDE.md から `@include` される。
編集はリファクタ完了まで凍結 (リファクタ完了後にレトロして加筆)。

### `.claude/hooks/*.sh`
**概要**
イベントトリガースクリプト。実行権限 (`chmod +x`) を付ける。
シェルは `bash` 想定 (macOS 標準で動く範囲)。

### `.claude/skills/<name>/SKILL.md`
**概要**
ユーザー or AI 自律呼び出し可能なスキル。frontmatter (`name` / `description` / `user_invocable`) 必須。

## データ構造
※ `.claude/settings.json` の主要キー

| **項目** | **データ必須** | **データ形式** | **データ条件** | **ユーザ表示** | **例** | **備考** |
| --- | --- | --- | --- | --- | --- | --- |
| `permissions.deny` | 任意 | string[] | tool 名 + 引数 pattern | 否 | `"Bash(rm -rf:*)"` | 一致時に実行拒否 |
| `permissions.ask` | 任意 | string[] | 同上 | 否 | `"Bash(git commit:*)"` | 一致時にユーザー確認 |
| `permissions.allow` | 任意 | string[] | 同上 | 否 | `"Bash(git status:*)"` | プロンプトなし実行 |
| `hooks.PreToolUse` | 任意 | object[] | matcher (regex) + hooks (command + timeout) | 否 | matcher: `"Bash"` | 該当ツール呼び出し前に実行 |
| `hooks.PostToolUse` | 任意 | 同上 | 同上 | 否 | matcher: `"Edit\|Write\|MultiEdit"` | ツール呼び出し後に実行 |
| `hooks.Stop` | 任意 | object[] | hooks (command + timeout) | 否 | quality gate スクリプト | ターン終了前に実行 |
| `hooks.UserPromptSubmit` | 任意 | 同上 | 同上 | 否 | reminder スクリプト | ユーザー入力直後に実行 |
| `enabledMcpjsonServers` | 任意 | string[] | `.mcp.json` で定義された name | 否 | `["context7"]` | 明示的 enable リスト |
| `env` | 任意 | object | string -> string | 否 | (空) | hook 用環境変数 |

# システム面

## Lefthook (既存) と Claude hooks の役割分担
- **Lefthook** = git 境界 (`pre-commit` / `pre-push`)。人間がコミット / プッシュした瞬間の網。
- **Claude hooks** = AI 境界 (`PostToolUse` / `Stop`)。AI が編集 / ターン終了した瞬間の網。
- 重複は許容 (二重チェック)。Lefthook を弱めて Claude hook に寄せることはしない (人間操作も保護対象のため)。

## context7 MCP のレート制限と障害時挙動
- 公開エンドポイント。レート制限・障害時は MCP 呼び出しが失敗するが、Claude は通常応答を続行できる (致命的でない)。
- 多用しすぎる場合は `enabledMcpjsonServers` から一時的に外す。

## hook の timeout
- `PostToolUse` (lint + typecheck): 60 秒
- `Stop` (quality gate base): 120 秒
- `Stop` (quality gate + knip + similarity): 180 秒
- 超過時は非 blocking (Claude Code の既定挙動) で続行。原因究明はログで実施。

## 大規模リポジトリでの knip / similarity-ts コスト
- 初回は既存コードに対して大量の警告が出る想定。リファクタ ISSUE 群と並行して解消する。
- 解消できない (テンプレ的に残したい) export には `/** @public <reason> */` JSDoc、型には `// similarity-ignore: <reason>` を付ける運用。

## .env ファイル保護
- `permissions.deny` で `Read` / `Write` / `Edit` 全てを拒否。Claude が誤読・誤書き込みできない。
- 既存 `.env*` の中身は git 管理外であることを再確認する (このタスクの前提)。

# ログ面

## リリース後の評価イメージ
- リファクタ進捗中の **Claude 起因事故件数** (= permissions.deny でブロックされたコマンド試行数 + Stop hook block 発生数)。減少傾向ならルール / hook 設計が AI 行動に内面化されてきた証。
- **編集後 lint/typecheck 失敗率の時間変化**。学習効果で減るのが理想。
- **1 セッションあたりのコミット数 / 平均差分行数**。コミット skill 導入で「分割 ≧ 3 / セッション」を目安に増えるはず。
- リファクタ完了時点での **knip 検出残数** = 0、**similarity-ts 検出残数** = 0 (例外は `@public` / `similarity-ignore` で根拠付き)。

## 追加ログ
- Claude Code はネイティブで JSONL transcript を残すため、追加実装は不要。
- 必要なら hook 内で `echo` を `~/.claude/logs/<date>.log` に追記する形で計測可能 (オプション、初期は実装しない)。

# 実施フェーズ (推奨実施順)

本仕様書 (親A: Claude Code 活用基盤整備) と、関連施策である **親B: 依存関係最新化** をまとめたロードマップ。リファクタ着手前にこの順序で進めると、後段のバージョンアップで Claude Code の hook が型エラーを即検知できる体制になる。

## Phase 1: AI 環境を先に固める (親A)

| 順 | ISSUE | 内容 | 依存 |
| --- | --- | --- | --- |
| 1 | A-#1 | 規約自動適用 (CLAUDE.md + .claude/rules) | — |
| 2 | A-#2 | permissions による破壊操作ブロック | — |
| 3 | A-#3 | PostToolUse: 編集ごとの lint / typecheck | A-#2 |
| 4 | A-#4 | Stop: 基本品質ゲート (typecheck / lint / format) | A-#3 |
| 5 | A-#5-1 | knip 導入と未使用 export 解消 | A-#4 |
| 6 | A-#5-2 | similarity-ts 導入と重複型解消 | A-#4 |
| 7 | A-#5-3 | Stop hook に knip / similarity 統合 | A-#5-1, A-#5-2 |
| 8 | A-#6 | /commit skill | — |
| 9 | A-#7 | context7 MCP | — |

**A-#1 / A-#2 / A-#6 / A-#7 は独立着手可** (並列マージOK)。

## Phase 2: 依存関係を最新化する (親B)

| 順 | ISSUE | 内容 | 理由 |
| --- | --- | --- | --- |
| 1 | B-#2 | TypeScript 5.3.2 → 最新マイナー | 型推論強化を先に。後続バージョンアップでの型エラー検出が早くなる |
| 2 | B-#1 | Next.js 15 系最新マイナー追従 | App Router 等の挙動安定化 |
| 3 | B-#7 | ESLint v8 → v9 (旧 #56 を Close して置き換え) | flat config 化 |
| 4 | B-#6 | Tailwind v3 → v4 (旧 #57 を Close して置き換え) | UI スタイル基盤を先に固める |
| 5 | B-#3 | MUI v5 → v7 (一気に上げる) | UI 影響最大、Phase 1 の品質ゲート上で実施したい |
| 6 | B-#4 | react-datepicker v4 → 最新 | 局所影響 |
| 7 | B-#5 | その他マイナー追従 (axios / @dnd-kit / vitest 等) | 機械的更新 |

**B-#3 (MUI v5→v7)** は中継せず一気に上げる方針。Theme API / Slot props / package 構成が大きく変わるが、同じ箇所を 2 回触るコストを避けるため。

## Phase 3: フロントエンド本体のリファクタリング (本仕様書のスコープ外)

Phase 1 と Phase 2 が揃ったら、本来やりたいフロントリファクタリング (Container/Presenter 分離、フォルダ構造刷新、未使用コード除去) に着手する。**Phase 1 の hooks と Phase 2 の最新依存** によって、リファクタ作業中の壊し込みを Claude Code 側が即座に検知できる。

# 関連施策: 依存関係最新化 (親B)

本仕様書 (親A) と並走する別軸の施策。AI 活用基盤整備とは目的が異なるが、リファクタ前提整備として一緒のロードマップに乗せる。

## サブ ISSUE 一覧 (新規起票)

- **B-#1** [Chore] Next.js を 15 系最新マイナーに追従する
- **B-#2** [Chore] TypeScript を 5.3.2 から最新マイナーに上げる
- **B-#3** [Chore] MUI を v5 から v7 に一気に上げる (Theme API / Slot props 全面対応)
- **B-#4** [Chore] react-datepicker を v4 から最新に上げる
- **B-#5** [Chore] その他マイナー依存 (axios / @dnd-kit / vitest 等) を一括追従する
- **B-#6** [Refactor] Tailwind を v3 から v4 に上げる (旧 #57 を Close して新規起票)
- **B-#7** [Refactor] ESLint を v8 から v9 に上げる (旧 #56 を Close して新規起票)

## 既存 OPEN ISSUE の扱い

| 既存 | 対応 | 理由 |
| --- | --- | --- |
| #57 [機能] Tailwindv3→v4 | **Close** (B-#6 で新規起票) | 命名規則・テンプレ準拠の本文を新ISSUEで揃えるため |
| #56 [機能] ESLint移行完了 | **Close** (B-#7 で新規起票) | 同上 |
| #55, #54, #51, #19, #18, #7 | 対象外 (本施策と無関係) | 別軸の機能追加 / 旧ISSUE。現状維持 |

# その他資料
- `issue-commit-guidelines.md` (リポジトリルート、ISSUE / コミット粒度の正典)
- `仕様書テンプレート.md` (リポジトリルート、本仕様書のひな形)
- `imaimai17468/imaimai-front-templete` GitHub (参考実装、ADR-0001 / 0003 / 0004 / 0006)
- 直前の調査スレッド (本セッション内、A-1 〜 A-6 の優先度評価)
