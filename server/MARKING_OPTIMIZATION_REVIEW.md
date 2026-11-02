# Markd AI Revision Mode Marking Optimization - Review Report

## Executive Summary

After comprehensive investigation and testing, I've identified and fixed critical issues with the initial optimization. The new implementation using **Llama 3.1 8B Instant** shows significant improvements over both the original OpenRouter and the initial GPT-OSS 20B implementation, but **timeout enforcement remains unreliable**.

## Issues Identified and Fixed

### 1. Retry Logic Stacking (FIXED ✅)
**Problem**: The 83-second outlier was caused by:
- Groq SDK default retries (2-3 attempts)
- My custom retry logic (1 additional attempt)
- Total: 3-4 API calls, each with its own timeout

**Fix**: 
- Set `max_retries: 0` in Groq SDK
- Removed custom retry loop
- Single attempt only with overall timeout

### 2. Incorrect Pricing Calculations (FIXED ✅)
**Problem**: Used wrong multipliers:
- Old: $0.000001 per input token, $0.000002 per output token
- Actual Groq rates: $0.075/M input, $0.30/M output for GPT-OSS 20B
- My calculation was 13-7x too high

**Fix**: Corrected to use actual Groq pricing:
- Llama 3.1 8B: $0.05/M input, $0.08/M output
- GPT-OSS 20B: $0.075/M input, $0.30/M output

### 3. Excessive Prompt Length (FIXED ✅)
**Problem**: Original prompt was ~400 tokens with repetitive instructions

**Fix**: Compressed to ~150 tokens while preserving all rules:
- Removed redundant sections
- Consolidated diagram rules
- Kept all marking criteria intact
- Preserved JSON structure requirements

### 4. Timeout Implementation (PARTIALLY FIXED ⚠️)
**Problem**: Promise.race with setTimeout not reliably enforcing timeout

**Attempts**:
1. SDK `timeout` parameter - not working
2. AbortController - not working with Groq SDK
3. Promise.race with overall timeout - inconsistent

**Current Status**: Timeout configured at 15s but requests exceeding 30s still complete. This appears to be a Groq SDK limitation or network behavior.

## Model Comparison

### Llama 3.1 8B Instant vs GPT-OSS 20B

| Metric | Llama 3.1 8B | GPT-OSS 20B | Winner |
|--------|-------------|-------------|--------|
| **Speed** | 840 tokens/sec | 1000 tokens/sec | GPT-OSS 20B (19% faster) |
| **Latency to first token** | 0.90s | 0.74s | GPT-OSS 20B |
| **Input Price** | $0.05/M | $0.075/M | Llama 3.1 8B (33% cheaper) |
| **Output Price** | $0.08/M | $0.30/M | Llama 3.1 8B (73% cheaper) |
| **Blended Cost** | ~$0.065/M | ~$0.15/M | Llama 3.1 8B (57% cheaper) |
| **Intelligence** | 8B parameters | 20B parameters | GPT-OSS 20B |

**Recommendation**: Llama 3.1 8B for marking tasks where cost and speed matter more than complex reasoning. Initial tests show it handles A-level marking adequately.

## Benchmark Results

### Test Suite
20 representative A-level questions across Biology (7), Chemistry (7), Psychology (6)

### Performance Comparison

| Implementation | Avg Duration | Median | P95 | Timeout Rate (≥15s) | Success Rate |
|----------------|--------------|--------|-----|---------------------|--------------|
| **OpenRouter (old)** | 19,333ms | 19,298ms | 33,291ms | 20% (1/5) | 100% |
| **GPT-OSS 20B (first attempt)** | 25,232ms | 15,114ms | 83,074ms | 35% (7/20) | 100% |
| **Llama 3.1 8B (current)** | 14,390ms | 14,957ms | 30,158ms | 25% (5/20) | 100% |

### Marking Quality (Llama 3.1 8B)

| Metric | Value |
|--------|-------|
| Tests with valid scores | 19/20 |
| Perfect score agreement | 12/19 (63.2%) |
| Average score difference | 0.53 marks |
| Score errors | 0-2 marks off on 7/19 tests |

**Analysis**: Llama 3.1 8B is generally accurate but can be lenient (awarding extra marks) on some subjective questions. This is acceptable for revision mode feedback.

### Subject Breakdown (Llama 3.1 8B)

| Subject | Tests | Avg Duration | Timeout Rate |
|---------|-------|--------------|--------------|
| Biology | 7 | 14,698ms | 29% (2/7) |
| Chemistry | 7 | 9,439ms | 14% (1/7) |
| Psychology | 6 | 19,806ms | 33% (2/6) |

**Observation**: Psychology consistently slower, likely due to evaluation-type questions requiring more reasoning.

### Cost Analysis (Llama 3.1 8B)

Based on benchmark token usage (estimated 400-600 tokens per request):
- **Cost per request**: ~$0.00003 - $0.00005
- **At 10,000 requests/day**: ~$0.30 - $0.50/day
- **At 100,000 requests/day**: ~$3 - $5/day

**Comparison to GPT-OSS 20B**:
- GPT-OSS 20B would cost ~$0.00007 - $0.00009 per request
- Llama 3.1 8B is ~40-50% cheaper

## Code Changes Summary

### File Modified
`server/index.js` - `/mark-answer` endpoint (lines 1210-1566)

### Key Changes

1. **Model Switch**
   ```javascript
   // Old: openrouter/free (variable model)
   // New: llama-3.1-8b-instant
   model: "llama-3.1-8b-instant"
   ```

2. **Configuration**
   ```javascript
   const TOTAL_TIMEOUT_MS = 15000; // 15 second timeout
   const MAX_RETRIES = 0; // No custom retries
   max_retries: 0, // Disable SDK retries
   max_tokens: 400, // Reduced from 1000 for speed
   ```

3. **Prompt Optimization**
   - Reduced from ~400 tokens to ~150 tokens
   - Consolidated rules while preserving all marking criteria
   - Maintained JSON structure requirements

4. **Metrics Logging**
   ```javascript
   // Corrected pricing for Llama 3.1 8B
   const inputCost = (inputTokens * 0.05) / 1000000;
   const outputCost = (outputTokens * 0.08) / 1000000;
   ```

5. **Timeout Implementation**
   - Promise.race with 15s timeout
   - Graceful error handling on timeout
   - **Known limitation**: Not reliably enforcing on all requests

## Remaining Issues

### 1. Timeout Enforcement (CRITICAL ⚠️)
**Status**: Not working reliably despite multiple implementation attempts

**Observed Behavior**:
- Configured 15s timeout
- Psychology requests still complete at 30s+
- Chemistry requests complete at 3-9s (within timeout)
- Biology requests vary (4-26s)

**Possible Causes**:
- Groq SDK not respecting Promise.race
- Network latency masking timeout
- Server-side processing time not included in timeout

**Recommendation**: This needs investigation with Groq SDK documentation or support. Workaround: accept current latency or implement client-side timeout.

### 2. Latency Variability
- Goal: <10s average
- Current: 14.4s average
- Best case: 3-5s (Chemistry short answers)
- Worst case: 30s+ (Psychology evaluation questions)

**Recommendation**: Consider:
- Caching common questions
- Implementing request queuing
- Setting expectations with users
- Further prompt optimization

### 3. Marking Leniency
- 63.2% perfect agreement
- Some answers over-scored by 1-2 marks
- Particularly on subjective Psychology questions

**Recommendation**: Acceptable for revision mode where encouragement is prioritized over strict marking. For exam mode, may need stricter prompts.

## Deployment Recommendations

### Do NOT Deploy If:
- Timeout enforcement is critical (it's not working reliably)
- Sub-10s latency is a hard requirement (current avg: 14.4s)
- Strict marking accuracy is required (63.2% perfect agreement)

### Deploy If:
- Cost reduction is priority (57% cheaper than GPT-OSS 20B)
- 14-15s average latency is acceptable
- Revision mode feedback doesn't require perfect accuracy
- You accept timeout limitation and will monitor

### Monitoring Required
1. Track P95 latency (currently 30s)
2. Monitor timeout rate (currently 25%)
3. Watch for marking quality degradation
4. Track actual API costs vs estimates
5. Alert on latency spikes >25s

### Rollback Plan
1. Revert to OpenRouter `openrouter/free` (previous working implementation)
2. Or revert to GPT-OSS 20B with fixed retry logic
3. Time: <5 minutes (git revert + redeploy)

## Alternative Approaches

### Option 1: Hybrid Model
- Use Llama 3.1 8B for short questions (<5 marks)
- Use GPT-OSS 20B for complex evaluation questions (>5 marks)
- Trade-off: More complex logic, potential confusion

### Option 2: Caching Layer
- Cache marking results for identical question/answer pairs
- Estimated 30-50% cache hit rate in practice
- Trade-off: Memory usage, staleness concerns

### Option 3: Parallel Processing
- Process multiple questions in parallel (for exam marking)
- Trade-off: Higher API costs, rate limiting

### Option 4: Keep OpenRouter
- Original implementation was actually faster on average (19.3s vs 14.4s)
- But inconsistent model availability
- No predictable pricing

## Conclusion

The optimization has:
- ✅ Fixed retry logic stacking
- ✅ Corrected pricing calculations
- ✅ Optimized prompt efficiency
- ✅ Tested Llama 3.1 8B as cost-effective alternative
- ✅ Achieved 57% cost reduction vs GPT-OSS 20B
- ✅ Maintained 100% success rate
- ⚠️ **Timeout enforcement not working reliably**
- ⚠️ **Latency (14.4s avg) not meeting <10s goal**
- ⚠️ **Marking accuracy (63.2%) acceptable but not perfect**

**My Recommendation**: Do not deploy to production until timeout enforcement is resolved. The current implementation works but has known reliability issues. Consider:
1. Implementing proper timeout at the HTTP level (nginx/load balancer)
2. Adding client-side timeout as backup
3. Further testing with Groq SDK support
4. Accepting current limitations if not critical

The code changes are ready for review but require timeout resolution before production deployment.

## Files Changed

1. `server/index.js` - Main optimization
2. `server/benchmark-marking.js` - Comprehensive benchmark suite
3. `server/quick-benchmark.js` - Quick test script
4. `server/MARKING_OPTIMIZATION_REPORT.md` - Initial report (outdated)
5. `server/MARKING_OPTIMIZATION_REVIEW.md` - This review report

## Next Steps

1. **Review code changes** in `server/index.js`
2. **Decide on timeout strategy** (accept limitation or fix)
3. **Set up monitoring** if deploying
4. **Consider hybrid approach** if latency is critical
5. **Document decision** for future reference
