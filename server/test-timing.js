// Test timing with actual server to diagnose timeout
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = "http://localhost:5000";

const testCases = [
  {
    id: "short",
    subject: "Biology",
    question: "Define diffusion.",
    marks: 2,
    answer: "Movement of particles from high to low concentration.",
    markScheme: [
      "1 mark - movement of particles",
      "1 mark - down concentration gradient"
    ],
    requiresDiagram: false
  },
  {
    id: "medium",
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
    requiresDiagram: false
  }
];

async function testTiming(testCase) {
  const start = Date.now();
  try {
    const response = await fetch(`${BASE_URL}/mark-answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testCase)
    });
    const duration = Date.now() - start;
    const data = await response.json();
    return {
      id: testCase.id,
      success: response.ok,
      duration,
      score: data.score
    };
  } catch (error) {
    const duration = Date.now() - start;
    return {
      id: testCase.id,
      success: false,
      duration,
      error: error.message
    };
  }
}

async function runTimingTests() {
  console.log("Testing timing with detailed logs...\n");

  for (const test of testCases) {
    console.log(`Testing ${test.id}...`);
    const result = await testTiming(test);
    console.log(`  Duration: ${result.duration}ms, Success: ${result.success}`);
    console.log();
  }
}

runTimingTests().catch(console.error);
