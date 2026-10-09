# 流水线状态(唯一状态源)

> 本文件由 paper-pipeline 维护。current_stage 指向当前正在执行的阶段;
> gates 记录每道门的状态。回退时改 stage 并在 log 记原因。

project: "<论文题目(一句话)>"
venue: "<目标期刊/会议,待定>"
created: "<YYYY-MM-DD>"
current_stage: 1
# 模式:gated=每阶段人工过门(默认) / auto=用户已预授权阶段 1-6 的门,
# 连续推进到阶段 7 门等人工验收(详见 SKILL.md"自动模式"节)。auto 下门记 passed(auto)。
mode: gated

# 门状态: pending(未到) / waiting(等人工确认) / passed(已通过)
gates:
  1-选题: pending
  2-文献: pending
  3-idea: pending
  4-方法: pending
  5-实验: pending
  6-消融: pending
  7-撰写: pending
  8-投稿: pending
  9-汇报转化: pending

# 各阶段完成度(0-100)与遗留事项;中断续跑时,todo 列出该阶段未完成项
progress:
  1-选题: { pct: 0, todo: "" }
  2-文献: { pct: 0, todo: "" }
  3-idea: { pct: 0, todo: "" }
  4-方法: { pct: 0, todo: "" }
  5-实验: { pct: 0, todo: "" }
  6-消融: { pct: 0, todo: "" }
  7-撰写: { pct: 0, todo: "" }
  8-投稿: { pct: 0, todo: "" }
  9-汇报转化: { pct: 0, todo: "" }

# 每日文献监控(工作区自动化任务读取;投稿后把 enabled 置 false 即停)
monitor:
  enabled: true
  keywords: ["<keyword-1>", "<keyword-2>"]

log:
  - "<YYYY-MM-DD HH:MM> 项目创建,进入阶段 1(选题)"
