// Quick benchmark to test Llama 3.1 8B vs GPT-OSS 20B
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = "http://localhost:5000";

const quickTests = [
  {
    id: "bio_1",
    subject: "Biology",
    question: "Describe the structure of DNA.",
    marks: 5,
    answer: "DNA is a double helix structure made of nucleotides. Each nucleotide has a phosphate group, deoxyribose sugar, and a nitrogenous base. The bases pair via hydrogen bonds: A with T, and C with G. The two strands are antiparallel.",
    markScheme: [
      "1 mark - double helix structure",
      "1 mark - nucleotides (phosphate, sugar, base)",
      "1 mark - base pairing (A-T, C-G)",
      "1 mark - hydrogen bonds",
      "1 mark - antiparallel strands"
    ],
    requiresDiagram: false,
    expectedScore: 5
  },
  {
    id: "chem_1",
    subject: "Chemistry",
    question: "Define enthalpy change.",
    marks: 3,
    answer: "Enthalpy change is the heat change in a reaction.",
    markScheme: [
      "1 mark - heat energy change",
      "1 mark - at constant pressure",
      "1 mark - per mole of reaction"
    ],
    requiresDiagram: false,
    expectedScore: 1
  },
  {
    id: "psych_1",
    subject: "Psychology",
    question: "Evaluate the working memory model.",
    marks: 8,
    answer: "The working memory model has research support from brain scans showing different areas active for different tasks. However, it is complex and difficult to test experimentally.",
    markScheme: [
      "1 mark - research support (e.g., brain scans)",
      "1 mark - multiple components supported",
      "1 mark - explains concurrent processing",
      "1 mark - limitation: complexity",
      "1 mark - limitation: difficult to test",
      "1 mark - limitation: incomplete explanation",
      "1 mark - contradictory evidence",
      "1 mark - practical applications"
    ],
    requiresDiagram: false,
    expectedScore: 3
  }
];

async function testMarking(testCase) {
  const startTime = Date.now();
  try {
    const response = await fetch(`${BASE_URL}/mark-answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testCase)
    });
    const duration = Date.now() - startTime;
    const data = await response.json();
    return {
      id: testCase.id,
      success: response.ok,
      duration,
      score: data.score,
      expectedScore: testCase.expectedScore,
      scoreDiff: data.score !== null && testCase.expectedScore !== null
        ? Math.abs(data.score - testCase.expectedScore)
        : null
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      id: testCase.id,
      success: false,
      duration,
      error: error.message
    };
  }
}

async function runQuickBenchmark() {
  console.log("Quick benchmark with Llama 3.1 8B Instant...\n");

  const results = [];
  for (const test of quickTests) {
    console.log(`Testing ${test.id}...`);
    const result = await testMarking(test);
    results.push(result);
    console.log(`  Duration: ${result.duration}ms, Score: ${result.score}/${result.expectedScore}`);
    console.log();
  }

  const successful = results.filter(r => r.success);
  if (successful.length > 0) {
    const avgDuration = successful.reduce((sum, r) => sum + r.duration, 0) / successful.length;
    console.log(`Average duration: ${avgDuration.toFixed(0)}ms`);
    console.log(`Success rate: ${successful.length}/${results.length}`);
  }
}

runQuickBenchmark().catch(console.error);
