---
name: paper-pipeline
description: >-
  端到端学术论文流水线路由器,覆盖选题→文献→idea→方法→实验→消融→撰写→投稿→汇报转化
  九个阶段。当用户要"开新论文项目 / 新建论文项目 / 论文流水线 / 继续论文项目 / 论文项目进度 /
  进入文献阶段 / 进入写作阶段 / 投稿前预审 / 论文做PPT / 专利转化"等,或在一个论文项目目录里
  要求推进下一步时使用。用户说"一键产出论文 / 自动产出论文 / 自动模式 / 给我一个主题直接出
  LaTeX 论文"时,进入自动模式(见下方"自动模式"节):预授权阶段 1-7 连续推进,产出编译
  通过的 LaTeX 工程,停在阶段 7 门等人工验收。读取项目目录中的 pipeline-state.md 判断当前阶段,按
  references/stage-playbook.md 调度子 skill——全部子 skill 已整合在本工作区,
  装载方式见 references/skill-inventory.md(nature-* 系列、researchwrite、
  scibox-diagram、mathmodel-figure-templates、anti-defensive-writing 等)。
  强制阶段门(人工确认)与工件落盘,状态跨会话可恢复。
  本 skill 是路由器:管顺序、工件和门,不替代子 skill 执行具体任务。
---

# paper-pipeline — 论文流水线路由器

九阶段状态机。状态在磁盘上,不在对话里:每个论文项目一个目录,`pipeline-state.md` 是唯一状态源。
对话会丢、会换会话,文件不会——这是整条流水线能跨会话续跑的原因。

## 项目位置

默认 `~/paper-projects/<topic-slug>/`,用户指定目录时以用户为准。
开新项目时,把本 skill 目录下 `templates/project/` 整个复制为项目目录,然后填 state。

## 核心循环(每次触发都从头走一遍)

1. **定位项目**:用户给了目录就用;说"开新论文项目"就脚手架一个新目录并进入阶段 1;
   机器上有多个项目目录时,列出并让用户选。
2. **读状态**:读项目里的 `pipeline-state.md`,拿到 `current_stage` 与各门状态。
   文件缺失或损坏时,按项目目录里实际存在的工件重建 state,并让用户确认。
3. **查手册**:按当前阶段读 `references/stage-playbook.md` 对应小节。只读当前阶段的小节,
   不要整篇加载。
4. **调度执行**:按手册调用子 skill 干活。子 skill 的装载按 `references/skill-inventory.md`
   顶部的装载协议:优先 Skill 工具按注册名加载,未安装则按清单路径读其 SKILL.md 严格遵循,
   重活派子 agent 执行。子 skill 负责具体任务,本 skill 负责顺序、工件与门。
5. **落盘**:阶段产出写进项目目录对应位置。每阶段的产出清单和格式在手册里,照着写。
6. **停在门**:达到退出标准后,在 `pipeline-state.md` 把当前门置为 `waiting`,
   把手册里的"门问题"抛给用户。用户明确确认后才置 `passed` 并推进 `current_stage`。
   绝不自动放行,也绝不替用户回答门问题。

## 阶段速查表

| # | 阶段 | 主力子 skill | 关键产出 | 门(需人工确认) |
|---|------|--------------|----------|------------------|
| 1 | 选题 | researchwrite(compose + QA 拷问)· nature-academic-search | topic.md:问题、动机、边界 | 这个题值不值得做 |
| 2 | 文献 | nature-academic-search · nature-downloader · nature-reader · nature-paper-card · nature-literature-pipeline(监控) | cards/*.md + evidence_table 初版 | 文献覆盖够不够 |
| 3 | idea | nature-paper-card(15-16 节)· researchwrite(QA 拷问 + argument_map) | ideas.md 排序 + 选定项 | 新颖性与可行性 |
| 4 | 方法 | 本体实现(先接口与测试)· code-review-skill · scibox-diagram · researchwrite QA(设计拷问) | design.md + 方法框架图 | 方法设计本身 |
| 5 | 实验 | 本体实现 · nature-experiment-log · nature-statistics · nature-figure | experiment_log.md + 主结果 | 主结果是否支撑 claim |
| 6 | 消融 | 本体实现 · nature-statistics · mathmodel-figure-templates · spreadsheets:xlsx | ablation_plan.md + 对比表 | 消融是否完备 |
| 7 | 撰写 | researchwrite · nature-writing · nature-citation · nature-ref-verifier · nature-statistics · nature-data · nature-polishing · anti-defensive-writing · nature-figure/scibox-diagram | manuscript 各节草稿 | 全文自审通过 |
| 8 | 投稿 | nature-reviewer · nature-writing · nature-response · anti-defensive-writing(回复信立场) | 投稿包 + 逐条回复信 | 投稿/返修决定;可专利点排查 |
| 9 | 汇报转化 | nature-paper2ppt · nature-image2ppt · nature-paper-to-patent | dissemination.md 台账 + PPT/专利包 | 哪些转化做;专利时序 |

已安装为 ZCode skill 的(code-review-skill、spreadsheets:xlsx)直接用 Skill 工具调;
其余全部在本工作区内,按 `references/skill-inventory.md` 的路径装载。
"本体实现"指直接用 ZCode 自身编码能力(先写核心接口与测试),不依赖外部 implement/tdd skill。

## 铁律

- 状态只写 `pipeline-state.md`。不要在对话里口头维护状态,也不要把状态复制到别的文件。
- 证据先于文字:阶段 7 起草任何段落前,先确认 `00-canonical/evidence_table.md` 和
  `argument_map.md` 存在、最新、被正文引用。这是 researchwrite 的契约,也是审稿人最先查的东西。
- 实验类阶段(5、6)只做编排、记录、统计审查和图表;不编造、不外推实验数字。
  缺结果就如实标记"待补实验"。
- 门 = 停下来等人。用户说"通过 / 确认 / 进入下一阶段"才算过门。
- 每次会话结束前,state 必须反映真实进度,包括半途阶段的部分产出清单。

## 自动模式(auto)

触发词:"一键产出论文 / 自动产出论文 / 自动模式 / 输入主题直接出 LaTeX 论文"。

自动模式**不是绕过门,是用户在启动时一次性预授权阶段 1-6 的门**;
阶段 7 终点门仍为人工验收。流程:

1. state 写 `mode: auto`(模板默认 `gated`);用户给了主题就脚手架新项目,没给就先问。
2. 阶段 1-4 连续推进,产出照常落盘,过门不再逐个等确认(state 里门记 `passed(auto)`)。
3. 阶段 2 用真实检索但精简:核心文献 ~10 篇,search-log 与 evidence_table 照记。
4. 阶段 5-6 只产出实验设计、消融矩阵、harness 骨架(接口+测试)与**占位结果表**;
   全部数字用 `\todobox{待补实验}`(模板 latex/ 已定义),绝不生成示例数字。
5. 阶段 7 从 `templates/project/06-manuscript/latex/` 骨架产出完整 LaTeX 工程,
   跑 `scripts/build-manuscript.sh` 直到编译通过(零 error、零 undefined 引用)。
6. 终点:停在 7-撰写 门(waiting),填好 `06-manuscript/AUTO-MODE-REPORT.md`
   (真实内容 / 占位内容 / 待人工动作三分清单),把 PDF 与报告一起交给用户。

阶段 8、9 永不自动:投稿与转化必须人工。用户中途喊停或逐门确认时,把 `mode` 改回
`gated` 后按标准流程走。

## 自动化层

- **每日文献监控**:默认不配置。用户要求持续跟踪时,用 CronCreate 建每天 09:00 的任务:
  扫描 `~/paper-projects/` 下 `monitor.enabled` 为 true 的项目,按各项目 `monitor.keywords`
  调 nature-literature-pipeline 检索新论文,追加到 `01-literature/monitor.md`
  (出现直接竞争或可能改变选题判断的工作时,写入该文件"重大提醒"节)。
  项目投稿后把 state 里 `monitor.enabled` 置 false 即停。
- **批量精读**(阶段 2):`scripts/literature-batch.dw.ts` —— 复制到
  `.zcode/workflow-drafts/` 改 PROJECT_DIR 后用 CreateWorkflow 以 path 运行;
  首次用 MAX_PDF=2 试跑。精读卡并行产出,证据表由专职 agent 统一登记。
  脚本里 CARD_SKILL 已指向本工作区的 nature-paper-card;工作区整体移动后需同步改。
- **多审稿人模拟**(阶段 8):`scripts/multi-reviewer.dw.ts` —— 三位不同视角的
  审稿人在隔离上下文中并行评审,汇总视图只给作者,不回流给审稿人。
  REVIEWER_SKILL 同样已指向本工作区的 nature-reviewer。
- 其他并行需求(批量拷问 idea、并行修订等)用 dynamic-workflows 现场编排,
  结果一律落盘到项目目录。
