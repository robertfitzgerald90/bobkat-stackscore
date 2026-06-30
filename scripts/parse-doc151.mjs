import fs from "node:fs";
import path from "node:path";

const DOCS_DIR = path.join(process.cwd(), "docs");

const PILLAR_FILES = [
  {
    file: "DOC-151A - Identity & Access.md",
    pillarCode: "identity_access",
    pillarName: "Identity & Access",
    recPrefix: "IA",
  },
  {
    file: "DOC-151B - Endpoint Management.md",
    pillarCode: "endpoint_management",
    pillarName: "Endpoint Management",
    recPrefix: "EP",
  },
  {
    file: "DOC-151C - Network & Connectivity.md",
    pillarCode: "network_connectivity",
    pillarName: "Network & Connectivity",
    recPrefix: "NW",
  },
  {
    file: "DOC-151D - Data Protection & Recovery.md",
    pillarCode: "data_protection_recovery",
    pillarName: "Data Protection & Recovery",
    recPrefix: "DP",
  },
  {
    file: "DOC-151E - Productivity & Collaboration.md",
    pillarCode: "productivity_collaboration",
    pillarName: "Productivity & Collaboration",
    recPrefix: "PC",
  },
  {
    file: "DOC-151F - Security Operations.md",
    pillarCode: "security_operations",
    pillarName: "Security Operations",
    recPrefix: "SO",
  },
  {
    file: "DOC-151G - Documentation & Knowledge.md",
    pillarCode: "documentation_knowledge",
    pillarName: "Documentation & Knowledge",
    recPrefix: "DK",
  },
  {
    file: "DOC-151H - Technology Strategy.md",
    pillarCode: "technology_strategy",
    pillarName: "Technology Strategy",
    recPrefix: "TS",
  },
];

function extractBusinessQuestion(content) {
  const match = content.match(/## Business Question\s*\n>\s*(.+)/);
  return match ? match[1].trim() : "";
}

function parseQuestions(content, pillar) {
  const businessQuestion = extractBusinessQuestion(content);
  const blocks = content.split(/^### /m).slice(1);
  const questions = [];

  for (const block of blocks) {
    const idMatch = block.match(/^([A-Z]{2}-\d{3})/);
    if (!idMatch) continue;
    const id = idMatch[1];

    const questionMatch = block.match(
      /\*\*Assessment Question\*\*\s*\n([\s\S]*?)\n\n\*\*Why It Matters\*\*/,
    );
    const whyMatch = block.match(/\*\*Why It Matters\*\*\s*\n([\s\S]*?)\n\n\*\*Business Risk\*\*/);
    const weightMatch = block.match(/\*\*Suggested Weight\*\*\s*\n(\d+)/);

    if (!questionMatch || !weightMatch) {
      throw new Error(`Failed to parse question ${id} in ${pillar.file}`);
    }

    const num = id.split("-")[1];
    const recId = `REC-${pillar.recPrefix}-${num}`;

    questions.push({
      id,
      pillarCode: pillar.pillarCode,
      pillarName: pillar.pillarName,
      businessQuestion,
      questionText: questionMatch[1].trim(),
      whyItMatters: whyMatch ? whyMatch[1].trim() : "",
      weight: Number(weightMatch[1]),
      displayOrder: Number(num),
      capability: id,
      recommendationId: recId,
      triggerAnswers: ["No", "Partially"],
    });
  }

  return questions;
}

const pillars = [];
const allQuestions = [];
const templates = [];

for (const pillar of PILLAR_FILES) {
  const content = fs.readFileSync(path.join(DOCS_DIR, pillar.file), "utf8");
  const businessQuestion = extractBusinessQuestion(content);
  const questions = parseQuestions(content, pillar);

  pillars.push({
    code: pillar.pillarCode,
    name: pillar.pillarName,
    businessQuestion,
    displayOrder: pillars.length + 1,
    questionCount: questions.length,
  });

  allQuestions.push(...questions);

  for (const q of questions) {
    templates.push({
      id: q.recommendationId,
      questionId: q.id,
      pillarCode: pillar.pillarCode,
      pillarName: pillar.pillarName,
      title: `Improve ${pillar.pillarName}: ${q.questionText.replace(/\?$/, "")}`,
      description: `Address gaps identified during assessment of "${q.questionText}" within the ${pillar.pillarName} Technology Pillar.`,
      businessImpact: q.whyItMatters || `Strengthens ${pillar.pillarName} maturity and reduces business risk.`,
      suggestedService: "Technology Improvement Services",
      priority: q.weight >= 5 ? "critical" : q.weight >= 4 ? "high" : q.weight >= 3 ? "medium" : "low",
      estimatedImpactPoints: Math.min(15, Math.max(3, q.weight * 2)),
      triggerAnswers: ["No", "Partially"],
      alsoTriggerOnPartial: true,
      consolidationGroupId: null,
      isStub: true,
    });
  }
}

if (allQuestions.length !== 80) {
  throw new Error(`Expected 80 questions, got ${allQuestions.length}`);
}

const questionLibrary = {
  $schema: "stackscore/v2-question-library/1.0",
  version: "2.0.0",
  source: "DOC-151A-H",
  pillars,
  questions: allQuestions,
};

const recommendationCatalog = {
  $schema: "stackscore/recommendation-catalog/v2",
  version: "2.0.0",
  description:
    "V2 recommendation library keyed to DOC-151 question IDs. Stub entries generated from assessment questions; refine per DOC-153.",
  templates,
  consolidationGroups: [],
};

const dataDir = path.join(process.cwd(), "data");
fs.writeFileSync(
  path.join(dataDir, "v2-question-library.json"),
  JSON.stringify(questionLibrary, null, 2),
);
fs.writeFileSync(
  path.join(dataDir, "RecommendationCatalogV2.json"),
  JSON.stringify(recommendationCatalog, null, 2),
);

console.log(`Wrote ${allQuestions.length} questions and ${templates.length} recommendation stubs.`);
