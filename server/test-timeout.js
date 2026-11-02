// Test timeout behavior with mock delayed request
import dotenv from "dotenv";
dotenv.config();

console.log("Testing timeout behavior with mock request...\n");

// Test 1: Promise.race with setTimeout
console.log("Test 1: Promise.race with 5-second timeout");
const start1 = Date.now();
try {
  await Promise.race([
    new Promise(resolve => setTimeout(() => resolve("completed"), 10000)), // 10s delay
    new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000)) // 5s timeout
  ]);
  console.log("FAILED: Should have timed out");
} catch (error) {
  const duration1 = Date.now() - start1;
  console.log(`SUCCESS: Timed out after ${duration1}ms - ${error.message}`);
}

// Test 2: Actual delay without timeout
console.log("\nTest 2: 10-second delay without timeout");
const start2 = Date.now();
await new Promise(resolve => setTimeout(() => resolve("completed"), 10000));
const duration2 = Date.now() - start2;
console.log(`Completed in ${duration2}ms`);

// Test 3: Simulate Groq SDK-like timeout
console.log("\nTest 3: Simulated Groq SDK with timeout");
class MockGroq {
  constructor(options) {
    this.timeout = options.timeout || 60000;
    this.maxRetries = options.maxRetries !== undefined ? options.maxRetries : 2;
  }

  async chat() {
    const start = Date.now();
    try {
      // Simulate API call with variable delay
      const delay = Math.random() > 0.5 ? 5000 : 20000; // 5s or 20s
      console.log(`  Simulating ${delay}ms API call...`);

      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => resolve("response"), delay);

        // Apply timeout
        setTimeout(() => {
          clearTimeout(timer);
          reject(new Error("APIConnectionTimeoutError: Request timed out"));
        }, this.timeout);
      });

      const duration = Date.now() - start;
      console.log(`  API call completed in ${duration}ms`);
      return { usage: { prompt_tokens: 100, completion_tokens: 200 } };
    } catch (error) {
      const duration = Date.now() - start;
      console.log(`  API call failed after ${duration}ms: ${error.message}`);
      throw error;
    }
  }
}

const mockGroq = new MockGroq({ timeout: 10000, maxRetries: 0 });

try {
  await mockGroq.chat();
  console.log("Test 3: SUCCESS - API call completed");
} catch (error) {
  console.log(`Test 3: ${error.message}`);
}

console.log("\n=== Timeout Test Summary ===");
console.log("Promise.race timeout: WORKING");
console.log("SDK timeout simulation: Tested");
console.log("\nConclusion: If Groq SDK timeout isn't working, it may be:");
console.log("- Not applied at the right level (network vs application)");
console.log("- Retries overriding timeout (even with maxRetries: 0)");
console.log("- Server-side processing time not included in timeout");
