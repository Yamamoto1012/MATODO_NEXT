#!/usr/bin/env bash
# Manual test runner for ../pr-template-check.sh
#
# 使い方:
#   bash .claude/hooks/test/test-pr-template-check.sh
#
# 9 ケース (block 4 / pass 5) で hook の動作を検証する。
# hook を変更したらこのスクリプトを実行して全 PASS を確認すること。

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOK="${SCRIPT_DIR}/../pr-template-check.sh"

if [[ ! -x "$HOOK" ]]; then
  printf 'FATAL: hook not executable: %s\n' "$HOOK" >&2
  exit 1
fi

run() {
  local name="$1" cmd="$2" expect_exit="$3"
  local json out rc
  json=$(jq -nc --arg c "$cmd" '{tool_input:{command:$c}}')
  out=$(printf '%s' "$json" | bash "$HOOK" 2>&1)
  rc=$?
  if [[ "$rc" == "$expect_exit" ]]; then
    printf '[PASS] %-50s exit=%s\n' "$name" "$rc"
    return 0
  else
    printf '[FAIL] %-50s exit=%s expected=%s\n' "$name" "$rc" "$expect_exit"
    printf '       cmd:    %s\n' "$cmd"
    printf '       output: %s\n' "$out"
    return 1
  fi
}

failed=0

# Block 期待ケース --------------------------------------------------------

# C1: タイトル違反 (Conventional Commits 形式)
run "C1: title is Conventional Commits (block)" \
  'gh pr create --title "feat: foo" --body "## 概要
## 関連Issue
close #115
## 変更内容
## チェックリスト"' \
  2 || failed=$((failed+1))

# C2: 必須見出し欠落 (gh pr edit)
run "C2: missing required headings (block)" \
  'gh pr edit 115 --body "本文だけで見出しなし"' \
  2 || failed=$((failed+1))

# C4: 'Closes' (大文字) は弾く ('close' 強制)
body4='## 概要
foo
## 関連Issue
Closes #115
## 変更内容
bar
## チェックリスト
- [x] OK'
run "C4: 'Closes' uppercase rejected (block)" \
  "gh pr create --title \"#115 ok title\" --body \"$body4\"" \
  2 || failed=$((failed+1))

# C9: --title=VALUE (イコール記法) でも検証する
run "C9: --title=VALUE form, invalid (block)" \
  'gh pr create --title=feat:foo --body "## 概要
## 関連Issue
close #115
## 変更内容
## チェックリスト"' \
  2 || failed=$((failed+1))

# Pass 期待ケース --------------------------------------------------------

# C3: 規約準拠
body3='## 概要
foo
## 関連Issue
close #115
## 変更内容
- bar
## チェックリスト
- [x] OK'
run "C3: fully compliant (pass)" \
  "gh pr create --title \"#115 ok title\" --body \"$body3\"" \
  0 || failed=$((failed+1))

# C5: 対象外コマンド (gh pr view) は素通り
run "C5: gh pr view (out of scope, pass)" \
  'gh pr view 115' \
  0 || failed=$((failed+1))

# C6: --web (GUI 入力) は素通り
run "C6: --web flag (pass)" \
  'gh pr create --web' \
  0 || failed=$((failed+1))

# C7: title/body 不指定 (例: ラベル追加だけ) は素通り
run "C7: gh pr edit --add-label only (pass)" \
  'gh pr edit 115 --add-label foo' \
  0 || failed=$((failed+1))

# C8: --body-file 経由でも本文を取得して検証
TMPBODY=$(mktemp)
cat >"$TMPBODY" <<'EOF'
## 概要
foo
## 関連Issue
close #115
## 変更内容
bar
## チェックリスト
- [x] OK
EOF
run "C8: --body-file with valid body (pass)" \
  "gh pr create --title \"#115 ok\" --body-file $TMPBODY" \
  0 || failed=$((failed+1))
rm -f "$TMPBODY"

echo
if (( failed == 0 )); then
  echo "All tests passed."
  exit 0
else
  printf '%d test(s) failed.\n' "$failed"
  exit 1
fi
