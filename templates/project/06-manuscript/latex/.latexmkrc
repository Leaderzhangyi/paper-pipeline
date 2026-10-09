# latexmk 配置 —— build-manuscript.sh 读取
# 默认 5 = xelatex(ctexart 中文混排必需;\todobox 占位标记含中文)
# 换纯英文 venue 模板 + pdflatex 时改回 1
$pdf_mode = 5;
$bibtex_use = 2;
$interaction = 'nonstopmode';
