// Compare Llama 3.1 8B vs GPT-OSS 20B on same questions
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = "http://localhost:5000";

const testQuestions = [
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
    question: "Explain the mechanism of nucleophilic substitution in halogenoalkanes.",
    marks: 6,
    answer: "The nucleophile attacks the carbon atom bonded to the halogen. This happens in a single step where the bond to the halogen breaks as the new bond forms. The halogen leaves as a halide ion.",
    markScheme: [
      "1 mark - nucleophile attack",
      "1 mark - carbon-halogen bond breaks",
      "1 mark - simultaneous bond formation/breaking",
      "1 mark - single step mechanism",
      "1 mark - halide ion product",
      "1 mark - inversion of configuration (if applicable)"
    ],
    requiresDiagram: false,
    expectedScore: 5
  },
  {
    id: "psych_1",
    subject: "Psychology",
    question: "Evaluate the working memory model.",
    marks: 8,
    answer: "The working memory model has research support from brain scans showing different areas active for different tasks. However, it is complex and difficult to test experimentally. Some argue it doesn't explain all aspects of memory.",
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
  },
  {
    id: "bio_2",
    subject: "Biology",
    question: "What is osmosis?",
    marks: 4,
    answer: "Osmosis is the movement of water molecules from a region of higher water potential to a region of lower water potential across a partially permeable membrane.",
    markScheme: [
      "1 mark - movement of water",
      "1 mark - across partially permeable membrane",
      "1 mark - from high water potential to low water potential",
      "1 mark - down water potential gradient"
    ],
    requiresDiagram: false,
    expectedScore: 4
  },
  {
    id: "chem_2",
    subject: "Chemistry",
    question: "Define enthalpy change.",
    marks: 3,
    answer: "Enthalpy change is the heat energy change that occurs at constant pressure per mole of reaction.",
    markScheme: [
      "1 mark - heat energy change",
      "1 mark - at constant pressure",
      "1 mark - per mole of reaction"
    ],
    requiresDiagram: false,
    expectedScore: 3
  }
];

async function testModel(testCase, modelName) {
  const start = Date.now();
  try {
    const response = await fetch(`${BASE_URL}/mark-answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testCase)
    });
    const duration = Date.now() - start;
    const data = await response.json();

    const result = {
      id: testCase.id,
      model: modelName,
      success: response.ok,
      duration,
      score: data.score,
      expectedScore: testCase.expectedScore,
      scoreDiff: data.score !== null && testCase.expectedScore !== null
        ? Math.abs(data.score - testCase.expectedScore)
        : null,
      error: data.error,
      automaticMarkingFailed: data.automaticMarkingFailed
    };

    if (!response.ok || data.score === null) {
      console.log(`  ERROR: ${data.error || 'Unknown error'}, automaticMarkingFailed: ${data.automaticMarkingFailed}`);
    }

    return result;
  } catch (error) {
    const duration = Date.now() - start;
    return {
      id: testCase.id,
      model: modelName,
      success: false,
      duration,
      error: error.message
    };
  }
}

async function runComparison() {
  console.log("=== Model Comparison: Llama 3.1 8B vs GPT-OSS 20B ===\n");

  const results = [];

  // Test with current model (will be whatever is configured in server)
  const currentModel = "current";
  console.log(`Testing with current server model...\n`);

  for (const test of testQuestions) {
    console.log(`Testing ${test.id}...`);
    const result = await testModel(test, currentModel);
    results.push(result);
    console.log(`  Duration: ${result.duration}ms, Score: ${result.score}/${result.expectedScore}`);
    console.log();
  }

  // Calculate statistics
  const successfulResults = results.filter(r => r.success);
  const durations = successfulResults.map(r => r.duration).sort((a, b) => a - b);
  const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length;
  const median = durations[Math.floor(durations.length / 2)];

  const scoreResults = successfulResults.filter(r => r.score !== null);
  const nullScoreResults = successfulResults.filter(r => r.score === null);
  const perfectAgreement = scoreResults.filter(r => r.scoreDiff === 0).length;
  const agreementRate = scoreResults.length > 0 ? (perfectAgreement / scoreResults.length * 100).toFixed(1) : 'N/A';

  console.log("=== Current Model Results ===");
  console.log(`Average duration: ${avg.toFixed(0)}ms`);
  console.log(`Median duration: ${median}ms`);
  console.log(`Successful requests: ${successfulResults.length}/${results.length}`);
  console.log(`Valid scores: ${scoreResults.length}/${successfulResults.length}`);
  console.log(`Null scores: ${nullScoreResults.length}/${successfulResults.length}`);
  console.log(`Perfect score agreement: ${perfectAgreement}/${scoreResults.length} (${agreementRate}%)`);
  console.log();

  console.log("=== Detailed Results ===");
  results.forEach(r => {
    console.log(`${r.id}: ${r.duration}ms, Score: ${r.score}/${r.expectedScore}, Diff: ${r.scoreDiff}, Error: ${r.error || 'None'}`);
  });
}

runComparison().catch(console.error);
