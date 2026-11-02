// Comprehensive benchmark script for marking endpoints
// Records latency, token usage, cost, and marking quality without logging student answers

import dotenv from "dotenv";
dotenv.config();

const BASE_URL = "http://localhost:5000";

// Comprehensive test cases across Biology, Chemistry, Psychology
const testCases = [
  // Biology - Full marks
  {
    id: "bio_full_1",
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
  // Biology - Partial marks
  {
    id: "bio_partial_1",
    subject: "Biology",
    question: "Explain how enzymes catalyse reactions.",
    marks: 4,
    answer: "Enzymes lower the activation energy of reactions. They bind to substrates at the active site.",
    markScheme: [
      "1 mark - lower activation energy",
      "1 mark - form enzyme-substrate complex",
      "1 mark - reduce energy needed for reaction",
      "1 mark - specific to substrate (active site)"
    ],
    requiresDiagram: false,
    expectedScore: 2
  },
  // Biology - Incorrect
  {
    id: "bio_incorrect_1",
    subject: "Biology",
    question: "What is osmosis?",
    marks: 4,
    answer: "Osmosis is when water moves from high concentration to low concentration.",
    markScheme: [
      "1 mark - movement of water",
      "1 mark - across partially permeable membrane",
      "1 mark - from high water potential to low water potential",
      "1 mark - down water potential gradient"
    ],
    requiresDiagram: false,
    expectedScore: 1
  },
  // Biology - Another full marks
  {
    id: "bio_full_2",
    subject: "Biology",
    question: "Describe the process of photosynthesis.",
    marks: 6,
    answer: "Photosynthesis occurs in chloroplasts where light energy is absorbed by chlorophyll. This energy is used to split water molecules in photolysis, producing oxygen. The energy is then used to convert carbon dioxide into glucose through the Calvin cycle.",
    markScheme: [
      "1 mark - occurs in chloroplasts",
      "1 mark - light energy absorbed by chlorophyll",
      "1 mark - photolysis of water",
      "1 mark - oxygen produced",
      "1 mark - carbon dioxide converted to glucose",
      "1 mark - Calvin cycle"
    ],
    requiresDiagram: false,
    expectedScore: 6
  },
  // Biology - Short answer
  {
    id: "bio_short_1",
    subject: "Biology",
    question: "Define diffusion.",
    marks: 2,
    answer: "Movement of particles from high to low concentration.",
    markScheme: [
      "1 mark - movement of particles",
      "1 mark - down concentration gradient"
    ],
    requiresDiagram: false,
    expectedScore: 2
  },
  // Chemistry - Full marks
  {
    id: "chem_full_1",
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
  // Chemistry - Partial marks
  {
    id: "chem_partial_1",
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
  // Chemistry - Full marks
  {
    id: "chem_full_2",
    subject: "Chemistry",
    question: "Explain what is meant by the term 'oxidation' in redox reactions.",
    marks: 3,
    answer: "Oxidation is the loss of electrons. It can also be defined as an increase in oxidation state or the gain of oxygen.",
    markScheme: [
      "1 mark - loss of electrons",
      "1 mark - increase in oxidation state",
      "1 mark - gain of oxygen"
    ],
    requiresDiagram: false,
    expectedScore: 3
  },
  // Chemistry - Partial marks
  {
    id: "chem_partial_2",
    subject: "Chemistry",
    question: "Describe the structure of benzene.",
    marks: 4,
    answer: "Benzene is a ring of 6 carbon atoms with alternating double bonds.",
    markScheme: [
      "1 mark - cyclic structure",
      "1 mark - 6 carbon atoms",
      "1 mark - delocalised pi electrons",
      "1 mark - planar structure"
    ],
    requiresDiagram: false,
    expectedScore: 2
  },
  // Chemistry - Incorrect
  {
    id: "chem_incorrect_1",
    subject: "Chemistry",
    question: "What is a strong acid?",
    marks: 2,
    answer: "A strong acid is an acid that is very concentrated.",
    markScheme: [
      "1 mark - fully dissociates in solution",
      "1 mark - high concentration of H+ ions"
    ],
    requiresDiagram: false,
    expectedScore: 0
  },
  // Chemistry - Calculation
  {
    id: "chem_calc_1",
    subject: "Chemistry",
    question: "Calculate the number of moles in 5.6g of Fe (Ar = 56).",
    marks: 2,
    answer: "Moles = mass / molar mass = 5.6 / 56 = 0.1 moles",
    markScheme: [
      "1 mark - correct formula (moles = mass/Mr)",
      "1 mark - correct calculation (0.1)"
    ],
    requiresDiagram: false,
    expectedScore: 2
  },
  // Psychology - Full marks
  {
    id: "psych_full_1",
    subject: "Psychology",
    question: "Outline the multi-store model of memory.",
    marks: 6,
    answer: "The multi-store model includes sensory memory, short-term memory, and long-term memory. Information flows from sensory to short-term through attention, and to long-term through rehearsal. Each store has different capacities and durations.",
    markScheme: [
      "1 mark - three stores (sensory, STM, LTM)",
      "1 mark - sensory to STM via attention",
      "1 mark - STM to LTM via rehearsal",
      "1 mark - different capacities",
      "1 mark - different durations",
      "1 mark - serial processing"
    ],
    requiresDiagram: false,
    expectedScore: 6
  },
  // Psychology - Partial marks
  {
    id: "psych_partial_1",
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
  // Psychology - Full marks
  {
    id: "psych_full_2",
    subject: "Psychology",
    question: "Describe the fight or flight response.",
    marks: 4,
    answer: "The fight or flight response is activated by the sympathetic nervous system. The hypothalamus triggers the adrenal medulla to release adrenaline and noradrenaline. This increases heart rate, blood pressure, and prepares the body for action.",
    markScheme: [
      "1 mark - sympathetic nervous system",
      "1 mark - hypothalamus activation",
      "1 mark - adrenal medulla releases adrenaline",
      "1 mark - physiological changes (heart rate, etc.)"
    ],
    requiresDiagram: false,
    expectedScore: 4
  },
  // Psychology - Partial marks
  {
    id: "psych_partial_2",
    subject: "Psychology",
    question: "Explain one limitation of the cognitive approach.",
    marks: 4,
    answer: "The cognitive approach is too reductionist as it ignores emotions and social factors.",
    markScheme: [
      "1 mark - identifies limitation",
      "1 mark - reductionist",
      "1 mark - ignores emotions",
      "1 mark - ignores social factors"
    ],
    requiresDiagram: false,
    expectedScore: 2
  },
  // Psychology - Incorrect
  {
    id: "psych_incorrect_1",
    subject: "Psychology",
    question: "What is meant by 'social learning theory'?",
    marks: 3,
    answer: "Social learning theory is when people learn by doing things themselves.",
    markScheme: [
      "1 mark - learning through observation",
      "1 mark - imitation of models",
      "1 mark - vicarious reinforcement"
    ],
    requiresDiagram: false,
    expectedScore: 0
  },
  // Biology - Diagram question (should skip marking)
  {
    id: "bio_diagram_1",
    subject: "Biology",
    question: "Draw and label the structure of a mitochondrion.",
    marks: 4,
    answer: "[Student submitted a diagram]",
    markScheme: [
      "1 mark - outer membrane",
      "1 mark - inner membrane",
      "1 mark - cristae",
      "1 mark - matrix"
    ],
    requiresDiagram: true,
    expectedScore: null
  },
  // Chemistry - Longer answer
  {
    id: "chem_long_1",
    subject: "Chemistry",
    question: "Explain the factors affecting the rate of a chemical reaction.",
    marks: 6,
    answer: "The rate of reaction is affected by concentration, temperature, surface area, and catalysts. Higher concentration increases collision frequency. Higher temperature increases kinetic energy and collision frequency. Larger surface area increases contact area. Catalysts provide an alternative pathway with lower activation energy.",
    markScheme: [
      "1 mark - concentration",
      "1 mark - temperature",
      "1 mark - surface area",
      "1 mark - catalysts",
      "1 mark - collision theory explanation",
      "1 mark - activation energy"
    ],
    requiresDiagram: false,
    expectedScore: 6
  },
  // Psychology - Evaluation
  {
    id: "psych_eval_1",
    subject: "Psychology",
    question: "Discuss one ethical issue in psychological research.",
    marks: 6,
    answer: "One ethical issue is informed consent. Participants should know what they're agreeing to before taking part. However, sometimes giving full information can bias results, creating a dilemma for researchers. The BPS code of ethics requires researchers to balance scientific benefit with participant welfare.",
    markScheme: [
      "1 mark - identifies ethical issue",
      "1 mark - explains the issue",
      "1 mark - gives example",
      "1 mark - discusses dilemma (e.g., bias)",
      "1 mark - mentions BPS code",
      "1 mark - conclusion on balance"
    ],
    requiresDiagram: false,
    expectedScore: 5
  },
  // Biology - No answer
  {
    id: "bio_no_answer_1",
    subject: "Biology",
    question: "Explain the process of mitosis.",
    marks: 5,
    answer: "",
    markScheme: [
      "1 mark - DNA replication",
      "1 mark - chromosome separation",
      "1 mark - formation of two identical daughter cells",
      "1 mark - produces genetically identical cells",
      "1 mark - occurs in somatic cells"
    ],
    requiresDiagram: false,
    expectedScore: 0
  }
];

async function benchmarkMarkAnswer(testCase) {
  const startTime = Date.now();

  try {
    const response = await fetch(`${BASE_URL}/mark-answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testCase)
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    // Calculate marking agreement (how close the score is to expected)
    const scoreDiff = data.score !== null && testCase.expectedScore !== null
      ? Math.abs(data.score - testCase.expectedScore)
      : null;

    return {
      id: testCase.id,
      subject: testCase.subject,
      success: response.ok,
      duration,
      status: response.status,
      score: data.score,
      expectedScore: testCase.expectedScore,
      scoreDiff,
      scoreAgreement: scoreDiff !== null ? scoreDiff === 0 : null,
      // Note: We don't log the actual student answers or model responses
      hasStrengths: !!data.strengths,
      hasImprovements: !!data.improvements,
      hasModelAnswer: !!data.modelAnswer,
      automaticMarkingFailed: data.automaticMarkingFailed,
      error: data.error
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      id: testCase.id,
      subject: testCase.subject,
      success: false,
      duration,
      error: error.message
    };
  }
}

async function runBenchmarks() {
  console.log("Starting comprehensive marking benchmarks...\n");

  const results = [];

  for (const testCase of testCases) {
    console.log(`Testing ${testCase.id} (${testCase.subject})...`);
    const result = await benchmarkMarkAnswer(testCase);
    results.push(result);
    console.log(`  Duration: ${result.duration}ms`);
    console.log(`  Success: ${result.success}`);
    console.log(`  Score: ${result.score} (expected: ${testCase.expectedScore})`);
    console.log(`  Status: ${result.status || 'N/A'}`);
    if (result.error) console.log(`  Error: ${result.error}`);
    console.log();
  }

  console.log("=== BENCHMARK SUMMARY ===");
  console.log(JSON.stringify(results, null, 2));

  // Calculate comprehensive statistics
  const successfulResults = results.filter(r => r.success);
  const successfulScores = successfulResults.filter(r => r.score !== null);

  if (successfulResults.length > 0) {
    const durations = successfulResults.map(r => r.duration).sort((a, b) => a - b);
    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const medianDuration = durations[Math.floor(durations.length / 2)];
    const p95Duration = durations[Math.floor(durations.length * 0.95)];
    const minDuration = durations[0];
    const maxDuration = durations[durations.length - 1];

    // Timeout rate (requests >= 20s)
    const timeoutCount = successfulResults.filter(r => r.duration >= 20000).length;
    const timeoutRate = (timeoutCount / successfulResults.length * 100).toFixed(1);

    // Marking agreement
    const agreementResults = successfulScores.filter(r => r.scoreAgreement !== null);
    const perfectAgreement = agreementResults.filter(r => r.scoreAgreement === true).length;
    const agreementRate = agreementResults.length > 0
      ? (perfectAgreement / agreementResults.length * 100).toFixed(1)
      : 'N/A';

    // Score differences
    const scoreDiffs = agreementResults
      .filter(r => r.scoreDiff !== null)
      .map(r => r.scoreDiff);
    const avgScoreDiff = scoreDiffs.length > 0
      ? (scoreDiffs.reduce((sum, d) => sum + d, 0) / scoreDiffs.length).toFixed(2)
      : 'N/A';

    console.log("\n=== COMPREHENSIVE STATISTICS ===");
    console.log(`Total tests: ${results.length}`);
    console.log(`Successful: ${successfulResults.length} (${(successfulResults.length / results.length * 100).toFixed(1)}%)`);
    console.log(`Failed: ${results.length - successfulResults.length} (${((results.length - successfulResults.length) / results.length * 100).toFixed(1)}%)`);
    console.log();
    console.log("=== LATENCY (ms) ===");
    console.log(`Average: ${avgDuration.toFixed(0)}ms`);
    console.log(`Median: ${medianDuration}ms`);
    console.log(`P95: ${p95Duration}ms`);
    console.log(`Min: ${minDuration}ms`);
    console.log(`Max: ${maxDuration}ms`);
    console.log(`Timeout rate (>=20s): ${timeoutRate}%`);
    console.log();
    console.log("=== MARKING QUALITY ===");
    console.log(`Tests with valid scores: ${successfulScores.length}`);
    console.log(`Perfect agreement: ${perfectAgreement}/${agreementResults.length} (${agreementRate}%)`);
    console.log(`Average score difference: ${avgScoreDiff} marks`);
    console.log();
    console.log("=== BY SUBJECT ===");
    const subjects = ['Biology', 'Chemistry', 'Psychology'];
    subjects.forEach(subject => {
      const subjectResults = successfulResults.filter(r => r.subject === subject);
      if (subjectResults.length > 0) {
        const subjectAvg = subjectResults.reduce((sum, r) => sum + r.duration, 0) / subjectResults.length;
        console.log(`${subject}: ${subjectResults.length} tests, avg ${subjectAvg.toFixed(0)}ms`);
      }
    });
  }
}

runBenchmarks().catch(console.error);
