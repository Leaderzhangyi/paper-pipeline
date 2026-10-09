// 论文流水线 · 阶段 2 辅助 —— 批量精读工作流
// ─────────────────────────────────────────────────────────────
// 用法:
//   1. 把本文件复制到 agent 的工作流草稿目录(workflow-drafts,免确认编辑),
//      或复制到项目目录。
//   2. 修改下方 PROJECT_DIR 为你的论文项目目录。
//   3. 把 CARD_SKILL 改成本机 paper-pipeline 仓库中该文件的绝对路径。
//   4. 首次使用先把 MAX_PDF 改为 2 试跑,确认卡片质量后再放开。
//   5. 用 CreateWorkflow(path=该文件路径) 运行;提交时会先做类型检查,
//      报诊断就改文件重提。
// 产出:每篇论文一张精读卡(01-literature/cards/)+ 证据表自动登记。

// ── 配置(每次运行前确认)──
// PROJECT_DIR 改成你的论文项目目录;CARD_SKILL 指向本仓库 skills/ 里的精读卡
// skill——填你本机仓库克隆位置的绝对路径。
const PROJECT_DIR = "C:/Users/ZinkCas/paper-projects/<topic-slug>";
const PAPERS_DIR = `${PROJECT_DIR}/01-literature/papers`;
const CARDS_DIR = `${PROJECT_DIR}/01-literature/cards`;
const CARD_SKILL = "<paper-pipeline 仓库路径>/skills/nature-paper-card/SKILL.md";
const MAX_PDF = 20;

interface PaperRef {
  /** 论文 PDF 的绝对路径 */
  pdfPath: string;
  /** 文件名,不含扩展名,用作精读卡文件名 */
  stem: string;
}

interface CardOutcome {
  /** 写出的精读卡绝对路径;失败为空字符串 */
  cardPath: string;
  /** 一句话说明这张卡的内容或失败原因 */
  summary: string;
  /** done=完整 16 节;partial=部分完成;failed=失败 */
  state: "done" | "partial" | "failed";
}

interface MergeOutcome {
  /** 是否更新了证据表文件 */
  updated: boolean;
  /** 本次新增的证据条数 */
  addedRows: number;
  /** 一句话说明 */
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
  /** 两三句话回答用户要什么 */
  conclusion: string;
  findings: Finding[];
  /** 本次运行检查了什么、怎么查的 */
  verified: string[];
  /** 没覆盖什么、为什么 */
  notCovered: string[];
}

artifact.board("cards", {
  title: "精读进度",
  key: "paper",
  status: "state",
  columns: ["完成", "部分完成", "失败"],
  cardTitle: "paper",
  detail: [{ field: "summary", label: "进度" }],
});

phase("读取论文清单");
const lister = agent("文献管理员", {
  system:
    "你负责清点论文目录里的文件。只列目录、不做精读、不写内容。" +
    "目录读不到就返回空数组并如实说明,不要猜测。",
});
const allPapers = await lister.ask<PaperRef[]>(
  `列出目录 ${PAPERS_DIR} 下所有 PDF 文件(不递归子目录)。` +
    `每个文件返回 { pdfPath: 绝对路径, stem: 不含扩展名的文件名 }。` +
    `目录不存在或没有 PDF 时返回空数组。不要读取文件内容。`,
);
const papers = allPapers.slice(0, MAX_PDF);
log(`待精读论文 ${papers.length} 篇(单次上限 ${MAX_PDF})`);

if (papers.length === 0) {
  return {
    conclusion: `${PAPERS_DIR} 下没有待精读的 PDF,本次无事可做。`,
    findings: [],
    verified: [],
    notCovered: ["精读与证据登记均未执行。"],
  };
}

phase("并行精读论文并产出精读卡");
const outcomes = await Promise.all(
  papers.map(async (p) => {
    try {
      const writer = agent(`精读-${p.stem}`, {
        system:
          "你是严谨的文献精读员,按精读卡模板产出结构化笔记。" +
          "论文里读不到的信息标注「卡片未覆盖」,绝不编造;" +
          "无法完成时如实返回失败,不要硬凑。",
      });
      const outcome = await writer.ask<CardOutcome>(
        `精读这篇论文并产出深度精读卡:\n` +
          `1. 先读精读卡规范:${CARD_SKILL},严格按其 01-16 节结构产出。\n` +
          `2. 用 pdf 技能提取 ${p.pdfPath} 的内容;提取失败就返回 state=failed。\n` +
          `3. 卡片写到 ${CARDS_DIR}/${p.stem}.md(目录不存在则创建)。\n` +
          `4. 返回 { cardPath, summary, state }。`,
      );
      const state =
        outcome.state === "done" ? "完成" : outcome.state === "partial" ? "部分完成" : "失败";
      report({ paper: p.stem, state, summary: outcome.summary }, "cards");
      return outcome;
    } catch {
      report({ paper: p.stem, state: "失败", summary: "子任务异常,该篇未产出精读卡" }, "cards");
      return { cardPath: "", summary: `精读失败:${p.stem}`, state: "failed" as const };
    }
  }),
);

phase("把精读产出登记进证据表");
const registrar = agent("证据登记员", {
  system:
    "你把精读卡中的关键事实整理进项目证据表。只登记卡片里有明确出处的信息," +
    "保持证据表原有列结构,与现有条目重复的跳过。",
});
const merge = await registrar.ask<MergeOutcome>(
  `精读卡都在 ${CARDS_DIR}/ 下。请:\n` +
    `1. 读 ${PROJECT_DIR}/00-canonical/evidence_table.md,保持其表格结构。\n` +
    `2. 逐张读精读卡,把与项目选题相关的关键事实(数据集、指标、SOTA 数字、方法要点)` +
    `追加为新行,来源列写「卡片文件名+节号」。\n` +
    `3. 返回 { updated, addedRows, note }。`,
);

const doneCount = outcomes.filter((o) => o.state === "done").length;
const problems = outcomes.filter((o) => o.state !== "done");
await artifact.markdown(
  "summary",
  [
    "# 批量精读汇总",
    "",
    `共处理 ${papers.length} 篇:完整精读卡 ${doneCount} 张、未完成 ${problems.length} 篇;` +
      `证据表新增 ${merge.addedRows} 条。`,
    "",
    ...outcomes.map((o) => `- ${o.state === "done" ? "✅" : "⚠️"} ${o.summary}`),
  ].join("\n"),
  {
    title: "批量精读汇总",
    description: `${papers.length} 篇论文的精读结果与证据表登记情况。`,
    primary: true,
  },
);

const reportResult: WorkflowReport = {
  conclusion:
    `${papers.length} 篇论文处理完毕:${doneCount} 张完整精读卡、${problems.length} 篇未完成;` +
    `证据表新增 ${merge.addedRows} 条(${merge.note})。`,
  findings: problems.map((o) => ({
    where: o.cardPath || CARDS_DIR,
    what: o.summary,
    evidence: "该篇由独立子代理处理,自行返回未完成状态",
    status: "unconfirmed" as const,
    severity: "medium" as const,
  })),
  verified: [`每篇论文由一个独立子代理精读并返回落盘路径(完整 ${doneCount} 篇)`],
  notCovered: [
    "精读卡内容未做二次独立复核(初稿级产出),建议人工抽查后再进入 idea 阶段。",
    ...(problems.length > 0 ? [`${problems.length} 篇未完成,需人工查看原因后重跑。`] : []),
  ],
};
return reportResult;
