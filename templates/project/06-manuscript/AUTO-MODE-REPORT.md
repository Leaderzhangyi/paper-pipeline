# 自动模式报告

> 本项目以 auto 模式跑完阶段 1-7。本报告列明哪些内容是真实可验证的、
> 哪些是占位待补的、移交人工后要做什么。**过阶段 7 门之前先读完本文件。**

## 运行信息

- 主题输入:<用户输入的一句话主题>
- 生成日期:<YYYY-MM-DD HH:MM>
- 文献策略:真实检索(检索式见 `01-literature/search-log.md`)
- 实验策略:占位标注(全部数字 `\todobox{待补实验}`)

## 真实内容(可验证)

| 内容 | 位置 | 验证方式 |
|---|---|---|
| 检索到的文献条目 | `latex/references.bib` | 逐条核对 DOI/出处;ref-verifier 复核 |
| 文献版图综述 | `06-manuscript/latex/sections/02-related-work.tex` | 对照精读卡与 evidence_table |
| 方法设计 | `03-method/design.md` + `latex/sections/03-method.tex` | 设计拷问(researchwrite QA) |
| 实验设计/消融矩阵 | `04-experiments/` `05-ablation/` | 人工评审设计合理性 |

## 占位内容(未经实验验证,不可投稿)

| 内容 | 位置 | 回填条件 |
|---|---|---|
| 主结果数字 | `latex/sections/04-experiments.tex` 表 main | 跑完实验,expenditure_log 留痕 |
| 消融数字 | 同上表 ablation | 消融矩阵跑完 |
| 结果解读段落 | 同上 | 数字到位后按证据改写 |
| 摘要/结论中的数字结论 | `sections/00-abstract.tex` `06-conclusion.tex` | 主结果过门后回填 |

## 待人工动作

- [ ] 核对全部引用真实性与页码(ref-verifier 全量跑一遍)
- [ ] 按 `03-method/design.md` 实现/补全 harness 并跑实验
- [ ] 回填全部 `\todobox{待补实验}` 数字并删除标注
- [ ] 图:框架图与结果图终版(scibox-diagram / nature-figure)
- [ ] 语言润色(nature-polishing)+ 立场检查(anti-defensive-writing)
- [ ] 过阶段 7 门(全文自审:哪里心虚?)
