<p align="center">
  <img src="assets/logo.svg" width="160" alt="paper-pipeline logo"/>
</p>

<h1 align="center">paper-pipeline</h1>

<p align="center">
  端到端学术论文流水线 Claude Code Skill —— 从选题到汇报转化,九个阶段一条管线。
</p>

<p align="center">
  <a href="SKILL.md"><img alt="Agent Skill" src="https://img.shields.io/badge/Agent-Skill-7C3AED"></a>
  <a href="SKILL.md"><img alt="pipeline" src="https://img.shields.io/badge/pipeline-9%20stages-4F46E5"></a>
  <a href="templates/project/06-manuscript/latex/"><img alt="output" src="https://img.shields.io/badge/output-LaTeX-008080?logo=latex&logoColor=white"></a>
  <a href="README.md"><img alt="lang" src="https://img.shields.io/badge/lang-%E4%B8%AD%E6%96%87%20%2F%20EN-0EA5E9"></a>
  <a href="LICENSE"><img alt="license" src="https://img.shields.io/badge/license-MIT-green"></a>
</p>

---

## 这是什么

`paper-pipeline` 是一个 **agent skill**(可装入任何支持 skill 机制的编码 agent),把一篇论文的完整生命周期做成九阶段状态机:
选题 → 文献 → idea → 方法 → 实验 → 消融 → 撰写 → 投稿 → 汇报转化。

它只做三件事:**管顺序、管工件、管门**。具体干活的是各子 skill(文献检索、精读卡、统计审查、
同行评审模拟等),本 skill 是路由器——按阶段调度它们、把产出落盘、在每个阶段门停下等人工确认。

### 设计理念

| 理念 | 含义 |
|------|------|
| **状态在磁盘,不在对话** | 每个项目一个目录,`pipeline-state.md` 是唯一状态源。对话会丢、会换会话,文件不会——整条流水线因此可跨会话续跑 |
| **门 = 停下来等人** | 每阶段终点是人工门。用户明确说"通过 / 确认 / 进入下一阶段"才推进,绝不自动放行、绝不替用户回答门问题 |
| **证据先于文字** | 撰写阶段起草任何段落前,先确认证据表与论证图存在、最新、被正文引用 |
| **不编造实验数字** | 实验类阶段只做编排、记录、统计审查和图表;缺结果就如实标记 `\todobox{待补实验}` |

## 九阶段总览

```mermaid
flowchart LR
    T[1 选题] --> L[2 文献] --> I[3 idea] --> M[4 方法] --> E[5 实验] --> A[6 消融] --> W[7 撰写] --> S[8 投稿] --> D[9 汇报转化]
```

> 每个箭头上都有一道**人工门**;自动模式下阶段 1-6 的门在启动时预授权,阶段 7 终点门仍为人工验收。

| # | 阶段 | 主力子 skill | 关键产出 | 门(需人工确认) |
|---|------|--------------|----------|------------------|
| 1 | 选题 | researchwrite · nature-academic-search | `01-topic.md`:问题、动机、边界 | 这个题值不值得做 |
| 2 | 文献 | nature-academic-search · nature-downloader · nature-reader · nature-paper-card | 精读卡 + 证据表初版 | 文献覆盖够不够 |
| 3 | idea | nature-paper-card · researchwrite QA | `ideas.md` 排序 + 选定项 | 新颖性与可行性 |
| 4 | 方法 | 本体实现 · code-review-skill · scibox-diagram | `design.md` + 方法框架图 | 方法设计本身 |
| 5 | 实验 | 本体实现 · nature-experiment-log · nature-statistics · nature-figure | 实验日志 + 主结果 | 主结果是否支撑 claim |
| 6 | 消融 | 本体实现 · nature-statistics · mathmodel-figure-templates | `ablation_plan.md` + 对比表 | 消融是否完备 |
| 7 | 撰写 | researchwrite · nature-writing · nature-citation · nature-polishing 等 | LaTeX 手稿各节草稿 | 全文自审通过 |
| 8 | 投稿 | nature-reviewer · nature-response | 投稿包 + 逐条回复信 | 投稿/返修决定 |
| 9 | 汇报转化 | nature-paper2ppt · nature-paper-to-patent | PPT / 专利交底包 | 哪些转化做 |

## 快速开始

### 安装

```bash
git clone https://github.com/Leaderzhangyi/paper-pipeline.git

# 个人级(所有项目可用)
cp -r paper-pipeline ~/.claude/skills/paper-pipeline

# 或项目级(仅当前项目)
cp -r paper-pipeline <你的项目>/.claude/skills/paper-pipeline
```

Windows(PowerShell):

```powershell
git clone https://github.com/Leaderzhangyi/paper-pipeline.git
Copy-Item -Recurse paper-pipeline $HOME\.claude\skills\paper-pipeline
```

### 使用

在 Claude Code 里直接说:

- `开新论文项目` / `新建论文项目` —— 脚手架一个新项目目录,进入阶段 1
- `继续论文项目` / `论文项目进度` —— 读 `pipeline-state.md` 从断点续跑
- `进入文献阶段` / `进入写作阶段` —— 跳到指定阶段
- `投稿前预审` —— 阶段 8 的多审稿人模拟
- `论文做PPT` / `专利转化` —— 阶段 9 汇报转化

**自动模式**:`一键产出论文 / 自动产出论文 / 给我一个主题直接出 LaTeX 论文` ——
预授权阶段 1-6 的门连续推进,产出编译通过的完整 LaTeX 工程,停在阶段 7 门等人工验收
(真实内容 / 占位内容 / 待人工动作三分清单见 `AUTO-MODE-REPORT.md`)。阶段 8、9 永不自动。

## 项目结构

```
paper-pipeline/
├── SKILL.md                    # skill 入口:核心循环、阶段速查表、铁律、自动模式
├── references/
│   ├── stage-playbook.md       # 九阶段操作手册(入口/调度/产出/退出标准/门)
│   └── skill-inventory.md      # 子 skill 清单与装载协议
├── scripts/
│   ├── build-manuscript.sh     # 阶段 7 LaTeX 编译验证(零 error / 零 undefined 引用)
│   ├── literature-batch.dw.ts  # 批量精读工作流(精读卡并行产出)
│   └── multi-reviewer.dw.ts    # 多审稿人模拟工作流(三位视角隔离并行评审)
├── templates/project/          # 新项目脚手架(整个复制即为项目目录)
│   ├── pipeline-state.md       # 唯一状态源:current_stage / gates / progress
│   ├── 00-canonical/           # 研究正典:canon / 证据表 / 论证图
│   ├── 01-literature/          # 检索日志 / 精读卡 / 每日监控
│   ├── 01-topic.md ~ 05-ablation/
│   ├── 06-manuscript/          # 大纲 + LaTeX 工程骨架(latexmk 配置齐全)
│   ├── 07-submission/          # 投稿包
│   └── 08-dissemination/       # 汇报转化台账
├── skills/                     # 全部子 skill 随仓库分发(24 个,克隆即用)
│   ├── nature-*/               # 文献·写作·投稿·转化全系列(21 个,含 researchwrite 所在的
│   │                           #   nature-proposal-writer 与内部依赖 nature-shared)
│   ├── scibox-diagram/         # draw.io 可编辑示意图(路线图/框架图/架构图)
│   ├── scibox-figure/          # 科研绘图模板(SHAP 蜂群、云雨、ROC、泰勒图等)
│   ├── anti-defensive-writing/ # 反防御性写作(+ 英文版 -en)
│   └── code-review-skill/      # 多语言代码审查
├── docs/
│   └── pipeline-design.html / .json   # 流水线可视化设计图
└── assets/
    └── logo.svg                # 本仓库 logo
```

## 脚本

| 脚本 | 用法 | 说明 |
|------|------|------|
| `scripts/build-manuscript.sh` | `build-manuscript.sh <latex-dir>` | latexmk 优先(回退 xelatex 链);检查 error / undefined 引用,退出码 0 才算过 |
| `scripts/literature-batch.dw.ts` | 复制到 agent 的工作流草稿目录,改 `PROJECT_DIR` 与 `CARD_SKILL` 后运行 | 待精读 ≥5 篇时并行产出精读卡;首次 `MAX_PDF=2` 试跑 |
| `scripts/multi-reviewer.dw.ts` | 同上(改 `REVIEWER_SKILL`) | 三位不同视角审稿人隔离评审,汇总视图只给作者 |

## 子 skill

**全部被调度的子 skill 都随仓库分发**(`skills/` 目录,24 个),克隆即得完整的九阶段流水线能力,
无需另外收集工作区:

| 系列 | skill | 能力 | 阶段 |
|------|-------|------|------|
| 绘图 | `scibox-diagram` | draw.io 可编辑示意图:技术路线图、研究框架图、架构/流程图,支持高保真复刻参考图 | 4 · 7 |
| 绘图 | `scibox-figure`(注册名 `mathmodel-figure-templates`) | 现成 Python 绘图模板:SHAP 蜂群、配对云雨、ROC、泰勒图、相关矩阵等 | 6 |
| 绘图 | `nature-figure` | 期刊格式数据图(Python/R),多面板组合、投稿级导出 | 5 · 6 · 7 |
| 文献 | `nature-academic-search` / `-downloader` / `-reader` / `-paper-card` / `-literature-pipeline` | 多源检索、合法全文获取、通读笔记、16 节精读卡、每日监控 | 1 · 2 · 3 |
| 写作 | `researchwrite`(nature-proposal-writer)/ `nature-writing` / `-citation` / `-ref-verifier` / `-polishing` / `-data` | 开题与 QA 拷问、章节起草、支撑引用、文献核验、润色、数据声明 | 1 · 3 · 4 · 7 |
| 实验 | `nature-experiment-log` / `-statistics` | 实验日志、统计报告审查 | 5 · 6 · 7 |
| 投稿 | `nature-reviewer` / `-response` | 模拟同行评审、逐条回复信 | 8 |
| 转化 | `nature-paper2ppt` / `-image2ppt` / `-paper-to-patent` | 论文转 PPT、图片转 PPT、专利交底 | 9 |
| 其他 | `anti-defensive-writing`(+`-en`)、`code-review-skill`、`nature-shared`(内部依赖) | 反防御性写作、代码审查、共享依赖 | 4 · 7 · 8 · 9 |

两个有意的例外:

- `nature-figure` 的 `figures4papers` 案例库(第三方已发表论文图,28M)出于版权与体积考虑
  未随仓库分发(见 `.gitignore` 内说明);
- `spreadsheets:xlsx` 为外部插件 skill,未随仓库分发;缺失时用 CSV/Markdown 表或
  Python 产出数值表(见 [`references/skill-inventory.md`](references/skill-inventory.md))。

装载协议:已把 `skills/` 内各 skill 注册为 agent skill 的,直接按注册名调用;
未注册则按 inventory 清单路径读其 SKILL.md 严格遵循。子 skill 缺依赖(如 MCP 检索源)时
如实降级并告知,不假装跑过。

## 设计文档

- [`docs/pipeline-design.html`](docs/pipeline-design.html) —— 流水线九阶段与门的可视化设计图(含 `pipeline-design.json` 源数据)

## 许可证

[MIT](LICENSE) © 2026 Leaderzhangyi
