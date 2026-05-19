import { scanText } from "./index";

interface TestCase {
  label: string;
  input: string;
  jurisdiction?: string;
  expectSignals: string[];
  expectObligationsMin: number;
}

const CASES: TestCase[] = [
  {
    label: "COPPA — clear child data collection (EN)",
    input:
      "Our app collects personal data from children under 13 including name, email and location.",
    jurisdiction: "US",
    expectSignals: ["explicit_age_minor_under13"],
    expectObligationsMin: 1,
  },
  {
    label: "GDPR — minor mention (EN)",
    input:
      "We process biometric data of users, some of whom are minors under 16 years old.",
    jurisdiction: "EU",
    expectSignals: ["explicit_age_minor"],
    expectObligationsMin: 1,
  },
  {
    label: "GDPR — parental consent (FR)",
    input:
      "Nous collectons des données personnelles d'enfants de moins de 15 ans et demandons le consentement parental.",
    jurisdiction: "EU",
    expectSignals: ["parental_role"],
    expectObligationsMin: 1,
  },
  {
    label: "No signals — neutral text",
    input: "The quarterly financial report shows a 12% increase in revenue.",
    expectSignals: [],
    expectObligationsMin: 0,
  },
  {
    label: "Unknown jurisdiction — fallback",
    input: "Children's data is collected for educational purposes.",
    jurisdiction: "ZZ",
    expectSignals: ["educational_context"],
    expectObligationsMin: 0,
  },
];

type PassResult = { status: "PASS"; label: string; durationMs: number };
type FailResult = { status: "FAIL"; label: string; durationMs: number; reason: string };
type SkipResult = { status: "SKIP"; label: string; durationMs: number; reason: string };
type TestResult = PassResult | FailResult | SkipResult;

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function runCase(tc: TestCase): TestResult {
  const start = performance.now();
  try {
    const result = scanText(tc.input, { jurisdiction: tc.jurisdiction });

    assert(typeof result.input_hash === "string" && result.input_hash.length === 64,
      `input_hash must be 64-char hex, got: "${result.input_hash}"`);

    assert(Array.isArray(result.signals),
      "result.signals must be an array");

    assert(Array.isArray(result.obligations),
      "result.obligations must be an array");

    const detectedTypes = result.signals.map((s: { type: string }) => s.type);

    for (const expected of tc.expectSignals) {
      assert(
        detectedTypes.includes(expected),
        `Expected signal "${expected}" not found. Got: [${detectedTypes.join(", ")}]`
      );
    }

    assert(
      result.obligations.length >= tc.expectObligationsMin,
      `Expected >= ${tc.expectObligationsMin} obligations, got ${result.obligations.length}`
    );

    return { status: "PASS", label: tc.label, durationMs: performance.now() - start };
  } catch (err) {
    return {
      status: "FAIL",
      label: tc.label,
      durationMs: performance.now() - start,
      reason: err instanceof Error ? err.message : String(err),
    };
  }
}

function main(): void {
  console.log("\n=== TRIGGER-ENGINE SMOKE TEST ===\n");

  const results: TestResult[] = CASES.map(runCase);

  let passed = 0;
  let failed = 0;

  for (const r of results) {
    const ms = r.durationMs.toFixed(1);
    if (r.status === "PASS") {
      console.log(`  ✓ PASS  [${ms}ms]  ${r.label}`);
      passed++;
    } else if (r.status === "FAIL") {
      console.log(`  ✗ FAIL  [${ms}ms]  ${r.label}`);
      console.log(`           → ${r.reason}`);
      failed++;
    } else {
      console.log(`  ○ SKIP  [${ms}ms]  ${r.label}`);
      console.log(`           → ${r.reason}`);
    }
  }

  console.log(`\n  Results: ${passed} passed, ${failed} failed / ${results.length} total\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

main();
