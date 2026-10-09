# 子 skill 清单与装载协议

paper-pipeline 调度的全部子 skill **随本仓库分发**(`skills/` 目录),克隆即用。
唯一例外:`spreadsheets:xlsx` 是外部插件 skill,未随仓库分发,缺失时按文末替代方案处理。
本清单是唯一映射源:注册名 → SKILL.md 路径(相对本 skill 目录)→ 用途 → 所属阶段。

## 装载协议

1. 先试 Skill 工具按注册名加载(该 skill 已注册为 agent skill 时直接命中)。
2. 未命中 → 按下表路径读 `skills/` 内的 SKILL.md,严格遵循其自身的路由协议执行;
   重活或需要隔离上下文的活,派子 agent 并把 SKILL.md 绝对路径作为规范传入
   (做法参照 `scripts/literature-batch.dw.ts`)。
3. 子 skill 引用它自己目录里的 references/、scripts/ 时,相对其 SKILL.md 所在目录解析。
4. 子 skill 缺依赖(如 MCP 检索源、Node/Python 版本)时如实降级并告知用户,不假装跑过。

## 映射表

> ⚠ 两个 skill 的目录名 ≠ 注册名:`researchwrite` 在 `skills/nature-proposal-writer/` 目录下,
> `mathmodel-figure-templates` 在 `skills/scibox-figure/` 目录下。

| 注册名 | SKILL.md 路径 | 用途 | 阶段 |
|---|---|---|---|
| researchwrite | skills/nature-proposal-writer/SKILL.md | 开题/研究计划 compose·revise·hybrid;QA 模式四层质量门(professor 动态专家拷问)。"证据先于文字"契约的出处 | 1·3·4·7 |
| nature-academic-search | skills/nature-academic-search/SKILL.md | 多源文献检索、引文核对、检索式管理 | 1·2 |
| nature-downloader | skills/nature-downloader/SKILL.md | 合法全文获取(OA / 出版商 API / 机构订阅 / CNKI) | 2 |
| nature-reader | skills/nature-reader/SKILL.md | 中英对照全文通读笔记 | 2 |
| nature-paper-card | skills/nature-paper-card/SKILL.md | 16 节深度精读卡 | 2·3 |
| nature-literature-pipeline | skills/nature-literature-pipeline/SKILL.md | 每日文献发现流水线(监控自动化任务用) | 2 |
| scibox-diagram | skills/scibox-diagram/SKILL.md | draw.io 可编辑示意图:技术路线图、研究框架、架构/流程图 | 4·7 |
| nature-experiment-log | skills/nature-experiment-log/SKILL.md | 标准化实验日志(可选飞书/Obsidian 集成) | 5 |
| nature-statistics | skills/nature-statistics/SKILL.md | 统计报告审查:重复数、不确定性、检验、图注统计 | 5·6·7 |
| nature-figure | skills/nature-figure/SKILL.md(figures4papers 案例库未随仓库分发,见 .gitignore) | 期刊格式数据图(Python/R) | 5·6·7 |
| mathmodel-figure-templates | skills/scibox-figure/SKILL.md | 现成科研绘图模板(SHAP 蜂群、云雨、ROC、泰勒图等) | 6 |
| nature-writing | skills/nature-writing/SKILL.md | 章节起草、论证重构、首次投稿材料 | 7·8 |
| nature-citation | skills/nature-citation/SKILL.md | 正文配 Nature/CNS 系支撑引用 | 7 |
| nature-ref-verifier | skills/nature-ref-verifier/SKILL.md | 参考文献逐条多源交叉验证 | 7 |
| nature-data | skills/nature-data/SKILL.md | 数据可用性声明、仓库计划、FAIR 元数据 | 7 |
| nature-polishing | skills/nature-polishing/SKILL.md | 语言润色、翻译、精简、LaTeX 排版修复 | 7 |
| anti-defensive-writing | skills/anti-defensive-writing/SKILL.md | 发布会原则:反防御性写作,围绕最值得发表的叙事组织论证(英文版 anti-defensive-writing-en 同目录旁) | 7·8·9 |
| nature-reviewer | skills/nature-reviewer/SKILL.md | 模拟同行评审(Major/Minor Concerns、blocking flag) | 8 |
| nature-response | skills/nature-response/SKILL.md | 审稿意见逐条回复、返修信、标红修订包 | 8 |
| nature-paper2ppt | skills/nature-paper2ppt/SKILL.md | 论文 → 学术 PPT(组会/答辩/会议,带 speaker notes) | 9 |
| nature-image2ppt | skills/nature-image2ppt/SKILL.md | 图片/截图/扫描 PDF → 可编辑 PPT | 9 |
| nature-paper-to-patent | skills/nature-paper-to-patent/SKILL.md | 论文 → 中文发明专利交底与申请包 | 9 |
| nature-shared | skills/nature-shared/SKILL.md | nature 系内部共享依赖包,不单独调用 | — |
| code-review-skill | skills/code-review-skill/SKILL.md | 多语言代码审查 | 4 |
| spreadsheets:xlsx | 未随仓库分发(外部插件 skill) | 数值表制作;缺失时见下方替代 | 6 |

## 缺失项的替代(重要)

原设计引用过、现已不需要或不随仓库分发的 skill,一律按下表替代,不要按原名找不到就卡住:

| 原引用 | 替代方案 |
|---|---|
| grill-me / batch-grill-me | researchwrite 的 QA 模式(proposal 挡位;professor 按失败模式派可行性/创新性专家拷问)。批量拷问多个候选时,用动态工作流并行隔离跑 |
| implement / tdd | agent 本体能力直接实现,tdd 风格:先写核心接口与测试再实现;审查用 skills/code-review-skill |
| obsidian-vault | 默认跳过。用户有 Obsidian 库时自行同步归档;nature-experiment-log 自带可选 Obsidian/飞书集成 |
| spreadsheets:xlsx | 用 CSV/Markdown 表,或 Python(openpyxl / pandas)产出数值表后落盘 |

## 相邻产品线(不进九阶段流水线)

- thesis-standardizer(本科毕设论文 docx 标准化:系统设计类毕业论文、Visio 图、三线表、篇幅门)
  不随本仓库分发。与期刊论文流水线是两条线:毕设项目直接调用它,不走 paper-pipeline。
