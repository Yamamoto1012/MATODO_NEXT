#!/usr/bin/env bash
# PreToolUse hook: gh pr (create|edit) のタイトル / 本文を検証
#
# 規約:
#   - タイトルは `#<ISSUE番号> <ISSUE タイトル>` 形式 (Conventional Commits 形式禁止)
#   - 本文は `.github/pull_request_template.md` 章立て準拠
#     必須見出し: ## 概要 / ## 関連Issue / ## 変更内容 / ## チェックリスト
#     `close[s]? #<番号>` を含む (大文字 `Closes` ではなく `close` で揃える)
#
# 違反時: exit 2 + stderr で block (Claude Code に block を通知し AI に理由を伝える)
# 詳細: .claude/rules/pull-request.md / issue-commit-guidelines.md "PR 規約"
#
# Portability:
#   - bash 3.2+ で動作 (mapfile / grep -P 不使用)
#   - BSD/GNU の grep -E / -F / -q / sed の差異を踏まない書き方
#   - eval 不使用 (任意コード実行回避)

set -uo pipefail

INPUT=$(cat)
CMD=$(printf '%s' "$INPUT" | jq -r '.tool_input.command // ""')

# gh pr create / gh pr edit のみ対象。gh pr view/list/diff/comment 等はスキップ
if ! grep -qE '\bgh[[:space:]]+pr[[:space:]]+(create|edit)\b' <<<"$CMD"; then
  exit 0
fi

# --web (GUI 入力経路) はタイトル/本文を CLI で渡さないので対象外
if grep -qE '(--web([[:space:]]|=|$)|[[:space:]]-w([[:space:]]|$))' <<<"$CMD"; then
  exit 0
fi

# 引数抽出: --long=VAL / --long VAL / -X VAL の各形式 + 引用符あり/なし
extract_arg() {
  local long="$1" short="${2:-}" cmd="$CMD" re

  # --long="VALUE"
  re="--${long}=\"([^\"]*)\""
  if [[ "$cmd" =~ $re ]]; then printf '%s' "${BASH_REMATCH[1]}"; return 0; fi
  # --long='VALUE'
  re="--${long}='([^']*)'"
  if [[ "$cmd" =~ $re ]]; then printf '%s' "${BASH_REMATCH[1]}"; return 0; fi
  # --long=VALUE (引用なし)
  re="--${long}=([^[:space:]]+)"
  if [[ "$cmd" =~ $re ]]; then printf '%s' "${BASH_REMATCH[1]}"; return 0; fi
  # --long "VALUE"
  re="--${long}[[:space:]]+\"([^\"]*)\""
  if [[ "$cmd" =~ $re ]]; then printf '%s' "${BASH_REMATCH[1]}"; return 0; fi
  # --long 'VALUE'
  re="--${long}[[:space:]]+'([^']*)'"
  if [[ "$cmd" =~ $re ]]; then printf '%s' "${BASH_REMATCH[1]}"; return 0; fi
  # --long VALUE (引用なし)
  re="--${long}[[:space:]]+([^[:space:]]+)"
  if [[ "$cmd" =~ $re ]]; then printf '%s' "${BASH_REMATCH[1]}"; return 0; fi

  if [[ -n "$short" ]]; then
    re="-${short}[[:space:]]+\"([^\"]*)\""
    if [[ "$cmd" =~ $re ]]; then printf '%s' "${BASH_REMATCH[1]}"; return 0; fi
    re="-${short}[[:space:]]+'([^']*)'"
    if [[ "$cmd" =~ $re ]]; then printf '%s' "${BASH_REMATCH[1]}"; return 0; fi
    re="-${short}[[:space:]]+([^[:space:]]+)"
    if [[ "$cmd" =~ $re ]]; then printf '%s' "${BASH_REMATCH[1]}"; return 0; fi
  fi

  return 1
}

TITLE=$(extract_arg "title" "t" 2>/dev/null || true)
BODY_FILE=$(extract_arg "body-file" "F" 2>/dev/null || true)
BODY_INLINE=$(extract_arg "body" "b" 2>/dev/null || true)

# 本文取得: --body-file 優先、なければ --body
BODY=""
if [[ -n "$BODY_FILE" ]]; then
  resolved="$BODY_FILE"
  if [[ "$resolved" != /* && -n "${CLAUDE_PROJECT_DIR:-}" ]]; then
    resolved="$CLAUDE_PROJECT_DIR/$resolved"
  fi
  if [[ -f "$resolved" ]]; then
    BODY=$(cat "$resolved")
  fi
elif [[ -n "$BODY_INLINE" ]]; then
  BODY="$BODY_INLINE"
fi

ERRORS=()

# タイトル検証 (タイトルが渡されている場合のみ)
if [[ -n "$TITLE" ]]; then
  if ! grep -qE '^#[0-9]+ ' <<<"$TITLE"; then
    ERRORS+=("PR タイトル形式違反: \"$TITLE\" → \`#<ISSUE番号> <ISSUE タイトル>\` 形式で書いてください (例: #115 PR タイトル / テンプレ規約を明文化し...). Conventional Commits 形式 (\`feat:\` 等) は使わない。")
  fi
fi

# 本文検証 (本文が取得できた場合のみ)
if [[ -n "$BODY" ]]; then
  for heading in "## 概要" "## 関連Issue" "## 変更内容" "## チェックリスト"; do
    if ! grep -qF -- "$heading" <<<"$BODY"; then
      ERRORS+=("PR 本文に必須見出し \"$heading\" が含まれていません")
    fi
  done
  if ! grep -qE 'close[s]?[[:space:]]+#[0-9]+' <<<"$BODY"; then
    ERRORS+=("PR 本文に \`close #<ISSUE番号>\` が含まれていません (大文字 \`Closes\` ではなく \`close\` で揃える)")
  fi
fi

if (( ${#ERRORS[@]} == 0 )); then
  exit 0
fi

{
  printf '⛔ PreToolUse block: PR タイトル / 本文テンプレ規約違反\n'
  for err in "${ERRORS[@]}"; do
    printf '  - %s\n' "$err"
  done
  printf '\n規約参照:\n'
  printf '  - .claude/rules/pull-request.md\n'
  printf '  - issue-commit-guidelines.md "PR 規約"\n'
  printf '修正してから再実行してください (--no-verify 等での回避は禁止)\n'
} >&2

exit 2
