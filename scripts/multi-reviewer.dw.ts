// 论文流水线 · 阶段 8 辅助 —— 多审稿人模拟工作流
// ─────────────────────────────────────────────────────────────
// 用法:
//   1. 复制到 .zcode/workflow-drafts/multi-reviewer.ts(drafts 内编辑免确认)。
//   2. 修改 PROJECT_DIR 与 MANUSCRIPT(稿件实际路径),ROUND 填当前轮次。
//   3. CreateWorkflow(path=该文件路径) 运行。
// 产出:三位相互隔离的审稿人各出一份报告(07-submission/reviews/),
// 加一份只给作者看的汇总视图。审稿人之间互不可见。

// ── 配置 ──
// PROJECT_DIR 与 MANUSCRIPT 改成实际值;REVIEWER_SKILL 已指向本工作区 nature-skills
// 里的审稿 skill——工作区整体移动后,把 REVIEWER_SKILL 一起改掉。
const PROJECT_DIR = "C:/Users/ZinkCas/paper-projects/<topic-slug>";
const MANUSCRIPT = `${PROJECT_DIR}/06-manuscript/draft/main.md`; // ← 按实际稿件路径修改
const REVIEWS_DIR = `${PROJECT_DIR}/07-submission/reviews`;
const REVIEWER_SKILL = "C:/Users/ZinkCas/Desktop/论文工作流/nature-skills/skills/nature-reviewer/SKILL.md";
const ROUND = 1;

interface ReviewSummary {
  /** 审稿人名 */
  reviewer: string;
  /** Major Concerns 条数 */
  majorCount: number;
  /** 是否给出 blocking flag */
  blocking: boolean;
  /** 最重要的一条意见,一句话 */
  topConcern: string;
  /** 审稿报告的绝对路径 */
  reviewPath: string;
  /** done=完成评审;failed=失败 */
  state: "done" | "failed";
}

interface SynthesisOutcome {
  /** 汇总文件绝对路径 */
  synthesisPath: string;
  /** 任一审稿人给出 blocking flag 则为 true */
  overallBlocking: boolean;
  /** 一句话总结 */
  note: string;
}

interface Finding {
  /** 相关文件路径 */
  where: string;
  /** 一句话:发现了什么 */
  what: string;
  /** 依据 */
  evidence: string;
  /** verified=已独立确认;unconfirmed=未复核 */
  status: "verified" | "unconfirmed";
  /** low / medium / high */
  severity: "low" | "medium" | "high";
}

interface WorkflowReport {
  conclusion: string;
  findings: Finding[];
  verified: string[];
  notCovered: string[];
}

const LENSES = [
  {
    name: "方法论审查员",
    lens: "聚焦方法正确性、实验设计与 claim 的匹配度、潜在的技术漏洞",
  },
  {
    name: "统计审查员",
    lens: "聚焦统计报告规范、样本量与重复、显著性、可复现性",
  },
  {
    name: "领域专家",
    lens: "聚焦新颖性、与领域最新工作的对比、贡献的影响力与边界",
  },
];

phase("三位独立审稿人并行评审");
const reviews = await Promise.all(
  LENSES.map(async (l) => {
    try {
      const reviewer = agent(l.name, {
        system:
          `你是模拟同行评审中的${l.name}:${l.lens}。你只评审、不修改稿件。` +
          "每条意见都要给出稿件中的依据;判断不了的地方明说,不为了凑数而提意见;" +
          "遇到无法完成的情况如实返回失败。",
      });
      const summary = await reviewer.ask<ReviewSummary>(
        `对论文做第 ${ROUND} 轮模拟评审:\n` +
          `1. 先读审稿规范:${REVIEWER_SKILL},按其报告结构(Major Concerns / Minor Comments / blocking flags)。\n` +
          `2. 读稿件 ${MANUSCRIPT};需要核对证据时读 ${PROJECT_DIR}/00-canonical/evidence_table.md。\n` +
          `3. 不要读取 ${REVIEWS_DIR} 下的任何已有文件——你是独立审稿人,不能被他人意见影响。\n` +
          `4. 完整报告写到 ${REVIEWS_DIR}/round${ROUND}-${l.name}.md(目录不存在则创建)。\n` +
          `5. 返回 { reviewer: "${l.name}", majorCount, blocking, topConcern, reviewPath, state: "done" }。`,
      );
      report({ reviewer: l.name, topConcern: summary.topConcern, blocking: summary.blocking });
      return summary;
    } catch {
      return {
        reviewer: l.name,
        majorCount: 0,
        blocking: false,
        topConcern: "评审子任务异常,未产出报告",
        reviewPath: "",
        state: "failed" as const,
      };
    }
  }),
);

phase("汇总三份意见为作者视图");
const synthesizer = agent("汇总编辑", {
  system:
    "你把多位独立审稿人的报告汇总成给作者看的工作清单。忠实转述每条意见,不弱化也不夸大;" +
    "汇总仅供作者,不会回流给任何审稿人。",
});
const synthesis = await synthesizer.ask<SynthesisOutcome>(
  `第 ${ROUND} 轮的三份审稿报告在 ${REVIEWS_DIR}/round${ROUND}-*.md。请:\n` +
    `1. 逐条列出所有 Major Concerns(标注出自哪位审稿人),按「必须处理 / 可有理有据地反驳」分类。\n` +
    `2. 单独标出所有 blocking flag。\n` +
    `3. 汇总写到 ${REVIEWS_DIR}/round${ROUND}-synthesis.md。\n` +
    `4. 返回 { synthesisPath, overallBlocking, note }。`,
);

await artifact.markdown(
  "review",
  [
    `# 第 ${ROUND} 轮模拟审稿汇总`,
    "",
    synthesis.note,
    "",
    ...reviews.map(
      (r) =>
        `- ${r.reviewer}:${r.topConcern}(Major ${r.majorCount} 条${r.blocking ? ",含 blocking flag" : ""})`,
    ),
    "",
    `完整报告见 ${REVIEWS_DIR}/round${ROUND}-*.md 与 round${ROUND}-synthesis.md。`,
  ].join("\n"),
  {
    title: `第 ${ROUND} 轮模拟审稿汇总`,
    description: `三位独立审稿人的意见概览${synthesis.overallBlocking ? "——存在 blocking flag,需先解决" : ""}。`,
    primary: true,
  },
);

const okReviews = reviews.filter((r) => r.state === "done");
const reportResult: WorkflowReport = {
  conclusion:
    `第 ${ROUND} 轮模拟审稿完成:${okReviews.length}/3 位审稿人产出报告,` +
    `${synthesis.overallBlocking ? "存在 blocking flag" : "无 blocking flag"}。${synthesis.note}`,
  findings: okReviews.map((r) => ({
    where: r.reviewPath,
    what: `${r.reviewer}:${r.topConcern}`,
    evidence: "独立审稿人依据稿件与证据表给出的意见",
    status: "unconfirmed" as const,
    severity: r.blocking ? ("high" as const) : ("medium" as const),
  })),
  verified: ["三位审稿人运行在相互隔离的独立上下文中,互不可见他人意见"],
  notCovered: [
    "模拟审稿基于单模型多视角,不能替代真实同行评审的多样性。",
    "意见未做独立复核,属审稿初稿,取舍由作者判断。",
    ...(reviews.some((r) => r.state === "failed") ? ["有审稿人未完成,该视角缺失,建议重跑补齐。"] : []),
  ],
};
return reportResult;
