#!/usr/bin/env bash
# build-manuscript.sh —— 阶段 7 编译验证
# 用法: build-manuscript.sh <latex-dir>   (即项目的 06-manuscript/latex)
# 退出码: 0 = 编译通过且零 error/零 undefined 引用; 1 = 失败
# 铁律对应:阶段 7 退出标准之一——LaTeX 工程必须真实编译通过。
set -u

DIR="${1:-.}"
MAIN="main.tex"

if [ ! -f "$DIR/$MAIN" ]; then
  echo "ERROR: $DIR/$MAIN not found" >&2
  exit 1
fi
cd "$DIR" || exit 1

# ---- 1. 编译(latexmk 优先——读 .latexmkrc 定引擎;回退 xelatex 链) ----
if command -v latexmk >/dev/null 2>&1; then
  latexmk -interaction=nonstopmode -halt-on-error "$MAIN" >/dev/null 2>&1
  rc=$?
else
  xelatex -interaction=nonstopmode "$MAIN" >/dev/null 2>&1
  bibtex "${MAIN%.tex}" >/dev/null 2>&1
  xelatex -interaction=nonstopmode "$MAIN" >/dev/null 2>&1
  xelatex -interaction=nonstopmode "$MAIN" >/dev/null 2>&1
  rc=$?
fi

LOG="${MAIN%.tex}.log"
if [ $rc -ne 0 ] || [ ! -f "${MAIN%.tex}.pdf" ]; then
  echo "FAIL: compile failed (rc=$rc). Last errors:"
  grep -n "^!" "$LOG" | head -10
  exit 1
fi

# ---- 2. 检查三类致命信号(参照 nature-polishing latex-layout.md 的诊断工作流) ----
errors=$(grep -c "^!" "$LOG" || true)
undef_refs=$(grep -ci "undefined" "$LOG" || true)
overfull=$(grep -c "Overfull" "$LOG" || true)

echo "=== build-manuscript 结果 ==="
echo "PDF: $(ls -la "${MAIN%.tex}.pdf" | awk '{print $5}') bytes"
echo "errors: $errors | undefined(引用/标签): $undef_refs | overfull boxes: $overfull"

if [ "$undef_refs" -gt 0 ]; then
  echo "FAIL: undefined references/citations remain:"
  grep -i "undefined" "$LOG" | head -10
  exit 1
fi
if [ "$errors" -gt 0 ]; then
  echo "FAIL: errors in log:"
  grep -n "^!" "$LOG" | head -10
  exit 1
fi

# ---- 3. best-effort:首页渲染 PNG 供人工检查 ----
if command -v python >/dev/null 2>&1; then
  python - <<'PYEOF' 2>/dev/null || true
try:
    import fitz
    doc = fitz.open("main.pdf")
    doc[0].get_pixmap(dpi=90).save("main-page1.png")
    print("preview: main-page1.png written")
except Exception:
    pass
PYEOF
fi

echo "PASS"
