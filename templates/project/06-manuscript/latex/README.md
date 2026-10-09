# LaTeX 工程(阶段 7 产出)

## 结构

```
latex/
├── main.tex            # 主文件:导言区、标题、\input 各节
├── sections/           # 各节正文,文件头注释 = outline.md 分节契约
│   ├── 00-abstract.tex
│   ├── 01-introduction.tex
│   ├── 02-related-work.tex
│   ├── 03-method.tex
│   ├── 04-experiments.tex   # 含消融子节
│   ├── 05-discussion.tex
│   └── 06-conclusion.tex
├── figures/            # 终版图 PDF(从 04-experiments/figures、03-method/figures 拷入)
├── references.bib      # 文献库(nature-citation 配文、ref-verifier 核对)
└── .latexmkrc          # latexmk 配置
```

## 编译验证

```bash
<paper-pipeline skill 目录>/scripts/build-manuscript.sh <本目录>
```

要求:零 error、零 undefined citation/reference,才算过阶段 7 退出标准。
手动编译:`latexmk main.tex`(引擎由 .latexmkrc 决定,默认 xelatex/ctexart,
中英混排都没问题)。

## 占位约定(铁律)

未经实验验证的数字一律用 `\todobox{待补实验}`,编译出的 PDF 中显式可见
(橙色 ★[待补实验])。回填真实数字时同步删掉标注。
注意占位提示语是中文——这就是默认引擎为 xelatex + ctexart 的原因。

## venue 适配

本骨架是 venue 无关的通用版。定了目标期刊/会议后:
1. 下载官方模板(Nature 系 / NeurIPS·ACL 等 CS 会议),替换导言区与 main 结构;
2. `sections/` 各节内容按新模板的节名迁移(内容与分节契约不受影响);
3. 图表规范(尺寸、字号、格式)按官方 guideline 重出终版图;
4. 重跑 build-manuscript.sh 验证。
