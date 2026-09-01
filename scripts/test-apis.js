const DEFAULT_TIMEOUT_MS = 5_000;

const colors = {
  green: "\u001b[32m",
  red: "\u001b[31m",
  yellow: "\u001b[33m",
  cyan: "\u001b[36m",
  reset: "\u001b[0m",
};

const services = [
  {
    name: "Commerce",
    baseUrl: process.env.COMMERCE_API_URL || "http://127.0.0.1:4001",
    expectedName: "commerce",
    expectedDocsTitle: "Najib Commerce API",
  },
  {
    name: "Inventory",
    baseUrl: process.env.INVENTORY_API_URL || "http://127.0.0.1:4002",
    expectedName: "inventory",
    expectedDocsTitle: "Najib Inventory API",
  },
];

const timeoutMs = Number.parseInt(
  process.env.API_TEST_TIMEOUT_MS || String(DEFAULT_TIMEOUT_MS),
  10,
);

const tests = services.flatMap((service) => [
  {
    name: `${service.name}: service information`,
    url: `${service.baseUrl}/api/v1`,
    check: (response) =>
      response.status === 200 &&
      response.json?.name === service.expectedName &&
      response.json?.version === "v1",
  },
  {
    name: `${service.name}: liveness`,
    url: `${service.baseUrl}/api/v1/health/live`,
    check: (response) =>
      response.status === 200 &&
      response.json?.status === "ok" &&
      response.json?.service === service.expectedName,
  },
  {
    name: `${service.name}: MongoDB readiness`,
    url: `${service.baseUrl}/api/v1/health/ready`,
    check: (response) =>
      response.status === 200 &&
      response.json?.status === "ok" &&
      response.json?.checks?.mongodb === "up",
  },
  {
    name: `${service.name}: OpenAPI document`,
    url: `${service.baseUrl}/docs-json`,
    check: (response) =>
      response.status === 200 &&
      response.json?.openapi?.startsWith("3.") &&
      response.json?.info?.title === service.expectedDocsTitle,
  },
]);

const commerce = services.find((service) => service.expectedName === "commerce");
const catalogResources = [
  "categories",
  "subcategories",
  "collections",
  "colors",
  "size-groups",
  "sizes",
  "products",
  "variants",
  "images",
];

for (const resource of catalogResources) {
  tests.push({
    name: `Commerce: list ${resource}`,
    url: `${commerce.baseUrl}/api/v1/catalog/${resource}?limit=1`,
    check: (response) =>
      response.status === 200 &&
      Array.isArray(response.json?.items) &&
      response.json?.pagination?.limit === 1 &&
      Number.isInteger(response.json?.pagination?.total),
  });
}

function log(label, color, message) {
  process.stdout.write(`${color}[${label}]${colors.reset} ${message}\n`);
}

async function request(url) {
  const startedAt = Date.now();
  const response = await fetch(url, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  const text = await response.text();
  let json;

  try {
    json = text ? JSON.parse(text) : undefined;
  } catch {
    json = undefined;
  }

  return {
    status: response.status,
    durationMs: Date.now() - startedAt,
    json,
    preview: text.replace(/\s+/g, " ").slice(0, 180),
  };
}

async function run() {
  log("API TEST", colors.cyan, `Running ${tests.length} checks`);
  log("API TEST", colors.cyan, `Timeout: ${timeoutMs}ms per request`);

  let passed = 0;
  const failures = [];

  for (const apiTest of tests) {
    try {
      const response = await request(apiTest.url);
      if (apiTest.check(response)) {
        passed += 1;
        log(
          "PASS",
          colors.green,
          `${apiTest.name} (${response.status}, ${response.durationMs}ms)`,
        );
      } else {
        failures.push(apiTest.name);
        log(
          "FAIL",
          colors.red,
          `${apiTest.name} (${response.status}, ${response.durationMs}ms)`,
        );
        if (response.preview) {
          log("DETAIL", colors.yellow, response.preview);
        }
      }
    } catch (error) {
      failures.push(apiTest.name);
      const reason =
        error instanceof Error ? `${error.name}: ${error.message}` : String(error);
      log("FAIL", colors.red, `${apiTest.name} (${reason})`);
    }
  }

  process.stdout.write("\n");
  log(
    failures.length === 0 ? "SUCCESS" : "SUMMARY",
    failures.length === 0 ? colors.green : colors.red,
    `${passed}/${tests.length} checks passed`,
  );

  if (failures.length > 0) {
    failures.forEach((failure) => log("FAILED", colors.red, failure));
    process.exitCode = 1;
  }
}

void run();
