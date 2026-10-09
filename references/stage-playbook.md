# 阶段操作手册

每阶段五件事:入口 → 调度 → 产出 → 退出标准 → 门。

## 子 skill 装载协议

调度任何子 skill 前先读这一节,不要因为"看起来没安装"就跳过或假装跑过:

1. 先试 Skill 工具按注册名加载(已注册为 agent skill 时直接命中)。
2. 未命中 → 查 `references/skill-inventory.md` 拿到 SKILL.md 路径(相对本 skill 目录解析)。
   注意两个目录名陷阱:`researchwrite` 在 `nature-proposal-writer/` 目录下,
   `mathmodel-figure-templates` 在 `scibox-figure/` 目录下。
3. 轻任务:自己读该 SKILL.md 并严格遵循其路由协议执行。
   重活或需隔离上下文的活:派子 agent,把 SKILL.md 绝对路径作为规范传入
   (做法参照 `scripts/literature-batch.dw.ts`)。
4. 子 skill 引用它自己目录里的 references/、scripts/ 时,相对其 SKILL.md 所在目录解析。
5. 子 skill 缺依赖(如 MCP 检索源、Node/Python 版本)时如实降级并告知用户,
   不要假装跑过。原设计引用过但本工作区不存在的 skill(grill-me、implement、tdd、
   obsidian-vault),替代方案见 skill-inventory.md 的"缺失项的替代",不要按原名找。

**断点续跑**:会话在阶段中途断掉是常态。恢复时读 `progress.<阶段>.todo`(该阶段未完成项清单),
从断点继续,不重做已落盘的产出;每完成一项就更新 todo,别攒到最后才写。

---

## 阶段 1 · 选题

**入口**:新建项目目录(复制 `templates/project/`),填 `pipeline-state.md` 的 project 字段,
并从选题提炼 2-4 个英文检索词填进 `monitor.keywords`。建议在项目目录 `git init`
(征得用户同意后执行),让 canon 与证据表的每次变更可回溯。

**调度**:
- `researchwrite`(compose 模式):把模糊方向变成有证据边界的研究问题,产出开题材料骨架
- `nature-academic-search`:查该方向近 2-3 年高影响力工作与综述,判断热度与拥挤度
- 拷问:`researchwrite` QA 模式(proposal 挡位;professor 派可行性/创新性专家)
  对候选题目批判性拷问——新颖性、可行性、数据可得性、审稿风险

**产出**:`01-topic.md`(项目根目录)——研究问题一句话版 + 动机 + 与已有工作的差异 +
范围边界(明确不做什么)+ 目标期刊档位。

**退出标准**:topic.md 完整;能回答"审稿人问'这和 X 有什么区别'时的第一句回应"。

**门问题**:这个题值得未来 6-12 个月吗?边界划对了吗?

---

## 阶段 2 · 文献

**入口**:topic.md 已过门。

**调度**:
- `nature-academic-search`:多源检索,建立检索式并记录(来源、关键词、时间窗、命中数)
- `nature-downloader`:合法获取全文 PDF,存 `01-literature/papers/`
- `nature-reader`:需要中英对照通读的重点论文 → `01-literature/notes/`
- `nature-paper-card`:奠基性/直接竞争论文逐篇出 16 节精读卡 → `01-literature/cards/`
- 用户要求持续跟踪时:CronCreate 每日任务调 `nature-literature-pipeline`
  (默认未配置;配置话术见 SKILL.md 自动化层)
- Obsidian 归档:默认跳过;用户有 Obsidian 库时自行同步,或后续加装对应 skill
- MCP 检索源(PubMed/CrossRef 等)不可用时,降级为 WebSearch/WebFetch 检索
  arXiv 与期刊站,并在 search-log.md 标注降级,不假装走了原检索
- 每日监控任务会把新论文追加到 `01-literature/monitor.md`,定期人工过一遍,
  值得精读的取回 PDF 放进 `papers/`
- 待精读 ≥5 篇时,用本 skill 的 `scripts/literature-batch.dw.ts` 并行产出精读卡
  (复制到 agent 的工作流草稿目录,改 PROJECT_DIR 与 CARD_SKILL 后用 CreateWorkflow
  以 path 运行;首次先把 MAX_PDF 设为 2 试跑,确认卡片质量再放开)

**产出**:
- `01-literature/search-log.md`:检索式与命中记录(可复现)
- `01-literature/cards/*.md`:每篇精读卡
- `00-canonical/evidence_table.md` 初版:把文献里的关键事实(数据集、指标、SOTA 数字)逐条登记,
  格式:`| claim | 证据 | 来源(论文+位置) | 状态 |`

**退出标准**:奠基工作有精读卡;直接竞品(≤3 年)全覆盖;evidence_table ≥ 20 条;
能说出该方向"已解决 / 有争议 / 没人做"的三分版图。

**门问题**:还有漏掉的关键论文吗?版图认同吗?

---

## 阶段 3 · idea

**入口**:文献过门。

**调度**:
- 汇总各精读卡第 15-16 节(知识关联 + 可检验 idea)→ 候选池
- 拷问:`researchwrite` QA 模式(proposal 挡位)逐个过——新颖性、与竞品的差异、
  工作量、风险;候选较多时用 dynamic-workflows 并行隔离拷问
  (参照 literature-batch.dw.ts 的"每篇一个隔离子 agent"模式)
- `researchwrite`:为入围 idea 2-3 个建 argument_map 骨架

**产出**:`02-ideas/ideas.md`——候选池表格(`| idea | 来源 | 新颖性 | 可行性 | 风险 | 评分 |`),
标注选定项与理由;`00-canonical/argument_map.md`(选定 idea 的论证骨架)。

**退出标准**:≥3 个候选且都过了拷问;选定项有明确"最小可发表单元"(最坏情况下论文还能成立的样子)。

**门问题**:为什么是它?最坏情况兜得住吗?

---

## 阶段 4 · 方法

**入口**:idea 过门。

**调度**:
- 原型实现:直接用本体编码能力,tdd 风格——先写核心接口与测试,再实现到测试通过
- `code-review-skill`(已安装):原型审查
- `scibox-diagram`:方法总览图 / 模型架构图(draw.io 可编辑),存 `03-method/figures/`
- 设计拷问:`researchwrite` QA 模式审设计取舍

**产出**:`03-method/design.md`——方法形式化描述(公式、模块、输入输出)、
与竞品的机制级差异表、伪代码、仓库/代码位置、框架图。

**退出标准**:原型代码能在玩具数据上端到端跑通;design.md 里每个设计选择都有一句"为什么不用 X"。

**门问题**:方法的每个组件都是必要的吗?有没有更简单的等价做法?

---

## 阶段 5 · 实验验证

**入口**:方法过门。先问清楚实验跑在哪(本机 / 远程集群):
集群场景下 harness 的产出是作业脚本与日志同步方案,不是本地直跑。

**调度**:
- 实验harness:本体编码能力实现(数据加载、训练/推理、指标、种子控制、结果落盘 JSON/CSV)
- `nature-experiment-log`:每次实验记录到 `04-experiments/experiment_log.md`(配置、种子、结果、结论)
- `nature-statistics`:统计报告审查(重复数、显著性、置信区间)
- `nature-figure`:主结果图(matplotlib/R,期刊格式),存 `04-experiments/figures/`

**产出**:experiment_log.md 全程留痕;主结果表(`04-experiments/main_results.md`);
主结果图;evidence_table 更新(自己的结果也登记,标注"本文")。

**退出标准**:主 claim 的每个数字可从 log 追溯到原始配置;与 SOTA 的对比在同一协议下;
负结果也记录。

**门问题**:主结果支撑核心 claim 吗?哪个结论最脆?

---

## 阶段 6 · 消融

**入口**:主结果过门。

**调度**:
- 消融harness:本体编码能力实现(逐组件去除 / 替换,统一协议)
- `nature-statistics`:消融差异的显著性
- `nature-figure` 或 `mathmodel-figure-templates`(目录名 scibox-figure):对比图(条形/表格)
- `spreadsheets:xlsx`:完整消融数值表

**产出**:`05-ablation/ablation_plan.md`(消融矩阵:组件 × 去除/替换 × 指标)+ 结果表 + 图。

**退出标准**:每个设计组件都有对应消融行;每行说明"去掉它掉多少,为什么";
审稿人可能问的"为什么不消融 X"有预答。

**门问题**:消融矩阵完备吗?

---

## 阶段 7 · 撰写

**入口**:消融过门。先做三件前置:evidence_table 终版、argument_map 终版、图表全集。

**调度**(顺序重要;先按目标 venue 的官方模板定格式——Nature 系与 CS 会议
在 LaTeX 模板、图表规范、篇幅上差异很大):
- `researchwrite`:按 argument_map 分节起草(证据先于文字,每节有 purpose / allowed claims 契约)
- `nature-writing`:章节起草与论证重构的主力(researchwrite 管契约与骨架,nature-writing 管成文)
- `anti-defensive-writing`:新闻发布会原则过一遍叙事——识别最值得发表的价值,
  围绕它组织论证;不平均展示、不写实验流水账、不替审稿人攻击自己
- `nature-citation`:正文段落配 Nature/CNS 系引用
- `nature-ref-verifier`:参考文献逐条多源交叉验证(作者/年份/卷期/页码/DOI)
- `nature-statistics`:Statistical analysis 小节
- `nature-data`:数据可用性声明与仓库计划
- `nature-polishing`:语言润色 + LaTeX 排版修复(管语言与格式;叙事与立场归 anti-defensive-writing)
- 图:`nature-figure` / `scibox-diagram` 按期刊规范出终版

**产出**:`06-manuscript/latex/` LaTeX 工程(新项目脚手架自带,结构见其 README:
main.tex + sections/ 分节 + references.bib + figures/)+ 图表 + 补充材料。
sections/ 每个文件头的注释就是 outline.md 分节契约的落点,起草前先填契约再动笔。
未经实验验证的数字一律 `\todobox{待补实验}`(main.tex 已定义,PDF 中显式可见)。

**退出标准**:每个 claim 在 evidence_table 有对应行;每个数字可追溯;
ref-verifier 零未解冲突;字数/图表数符合目标期刊;
`scripts/build-manuscript.sh <06-manuscript/latex>` 编译通过
(零 error、零 undefined citation/reference);auto 模式另加:AUTO-MODE-REPORT.md 已填。

**门问题**:自己读一遍,哪里心虚?

---

## 阶段 8 · 投稿与返修

**入口**:撰写过门。

**调度**:
- 投稿前:`nature-reviewer` 模拟 2-3 个相互隔离的审稿人,出 Major/Minor Concerns;
  按意见修补后重审一轮。需要 3 位不同视角审稿人并行时,用本 skill 的
  `scripts/multi-reviewer.dw.ts`(复制到 agent 的工作流草稿目录,改配置后运行,
  审稿人相互隔离,汇总视图只给作者)
- `nature-writing`:投稿包(cover letter、title page、highlights、作者贡献、
  数据可用性、推荐审稿人)
- 返修期:`nature-response` 起草逐条回复信(审稿人相互隔离),修订稿标红;
  回复信立场过 `anti-defensive-writing`——有礼有节,但不自我攻击、不主动示弱
- 可专利点排查(门内动作):过一遍方法与结果,判定有无可专利点,记入
  `07-submission/submission.md` 的排查节。有 → 阶段 9 走专利路由,且交底提交必须
  早于论文首次公开(投稿/预印本都算),所以排查必须在投稿前完成

**产出**:`07-submission/` 下投稿包;返修期追加 response letters 与修订记录。

**退出标准**:模拟审稿无 blocking flag;投稿包齐全;返修回复逐条有证据指向;
可专利点排查有明确结论(无,或有+已列入 dissemination 计划)。

**门问题**:投稿时机与期刊档位;返修取舍(哪些意见接受、哪些有礼有节反驳);可专利点排查结论。

---

## 阶段 9 · 汇报转化

**入口**:投稿过门(接收后进入;若投稿后长期 under review,用户也可提前要组会 PPT,
此时做学术汇报路由,专利路由仍等阶段 8 排查结论)。

**调度**——三个子路由相互独立、按需触发,没做的保持 N/A,不凑齐:
- 学术汇报:`nature-paper2ppt` — 先判定 paper_type(methods/discovery/resource/
  clinical/materials/review)并报知用户;组会/答辩/会议 PPT + speaker notes;
  产出后过其自带审计(audit 高危必须清零)
- 旧图还原:`nature-image2ppt` — 有旧扫描件/截图/图片型 PPT 需要可编辑版本时才触发
- 专利转化:`nature-paper-to-patent` — 仅当阶段 8 排查出可专利点且用户要求时;
  交底书做权利要求特征溯源检查(每个特征 → 源 ID,无 unsupported)
- 汇报叙事:`anti-defensive-writing` 的发布会原则同样适用于 PPT——
  讲最值得讲的故事,不流水账

**产出**:`08-dissemination/dissemination.md`(三路由台账:做没做、产物路径、
汇报场次、专利提交状态与日期)+ PPT/专利包。

**退出标准**:触发的路由都有产物且过各自质检(PPT audit 高危清零;专利特征溯源通过);
未触发的路由在台账记 N/A 与原因。

**门问题**:哪些转化做、哪些不做?专利时序还来得及吗?

**专利时序警告**:论文投稿/挂预印本即构成公开。可专利点必须在投稿前排查(阶段 8 门);
接收后才新发现的可专利点,先核对"公开在先"是否已破坏新颖性,再决定是否继续交底。

---

## 附:阶段回退

门未过或审稿意见推翻前段结论时,允许回退:把 `current_stage` 改回对应阶段,
在 state 的 log 里记一行回退原因与受影响工件清单。回退不是失败,是流水线在自我纠正。

## 附:自动模式(auto)各阶段差异

触发与总则在 SKILL.md"自动模式"节:预授权 1-6 门,终点是阶段 7 人工验收门。
state 的 `mode: auto` 生效期间,各阶段按下表执行,与 gated 的差异只有"门"和"数字":

| 阶段 | gated(默认) | auto |
|---|---|---|
| 1-4 选题/文献/idea/方法 | 每门人工确认 | 产出照常落盘,门记 `passed(auto)`,连续推进 |
| 2 文献 | 全量检索+精读卡 | 真实检索精简版:核心 ~10 篇,search-log/evidence_table 照记 |
| 4 方法 | 原型须在玩具数据跑通 | 降级为 harness 骨架(接口+测试),design.md 照常产出 |
| 5-6 实验/消融 | 真实实验留痕 | 只产出设计+消融矩阵+占位结果表,数字一律 `\todobox{待补实验}` |
| 7 撰写 | 人工起草全流程 | 直接填 templates 的 latex/ 骨架,编译通过后停门 |
| 8-9 投稿/转化 | 人工 | **不自动**,保持 pending |

终点动作(阶段 7 门,auto 特有):

1. `build-manuscript.sh` 输出 PASS;
2. 填 `06-manuscript/AUTO-MODE-REPORT.md` 三分清单(真实/占位/待人工);
3. state 里 7-撰写 置 `waiting`,门问题照常抛给用户,并在 AUTO-MODE-REPORT
   待办里列明"回填实验数字、全量 ref-verifier 复核"两项必做。
