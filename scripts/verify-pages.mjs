import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const repoRoot = process.cwd();
const baseUrl = (process.argv[2] || "http://127.0.0.1:4173").replace(/\/$/, "");
const browserCandidates = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

const executablePath = browserCandidates.find((candidate) => fs.existsSync(candidate));
if (!executablePath) {
  throw new Error("No supported browser executable was found for headless verification.");
}

const sourcePaths = [
  path.join(repoRoot, "src", "data", "siteContent.js"),
  path.join(repoRoot, "src", "App.jsx"),
];

const readIfExists = (filePath) => (fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "");
const sourceText = sourcePaths.map(readIfExists).join("\n");

const extractIds = (text) => {
  const ids = new Set();
  for (const match of text.matchAll(/id:\s*["']([^"']+)["']/g)) {
    ids.add(match[1]);
  }
  return [...ids];
};

const parsedIds = extractIds(sourceText);

const allowlistedEnglishPhrases = [
  "GLINT RISE",
  "LUMINA ARC",
  "Smart Hub",
  "Interface Neo",
  "Acoustic Void-01",
  "Chronos Shift",
  "Forma Seat-Z",
  "Nexus Keys v2",
  "Optical Core X",
  "Umbra Shade-09",
  "Enterprise Data Synergy",
  "Quantum Security Protocol",
  "AI",
  "CN",
  "V2.0",
  "2024.Q1",
];

const disallowedUiPhrases = [
  "Search",
  "Login",
  "Console",
  "Home",
  "Products",
  "Cases",
  "Featured",
  "Curated",
  "Archive",
  "Project Archive",
  "Private Archive Access",
  "Systems Nominal",
  "Back to Collection",
  "Explore Details",
  "Hot Products Hub",
  "CLICK TO VIEW MORE",
  "Live Statistics",
  "Graph Notes",
  "Node",
  "Featured Selection",
  "Curated Portfolio",
  "Enterprise Search",
  "Privacy Policy",
  "Terms of Service",
  "Compliance",
  "Accessibility",
  "Login Placeholder",
  "Collaboration",
  "Materiality",
  "Interface",
  "Origin",
  "Connectivity",
  "Series",
  "Capability",
  "Scenario",
  "Edition",
  "Category",
  "Drop",
  "Material",
  "Brand",
  "Client",
  "Agency",
  "Products Overview",
  "Cases Overview",
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const browser = await chromium.launch({ executablePath, headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

const errors = [];
const seenErrors = new Set();
let activeRoute = "bootstrap";

const pushError = (type, detail) => {
  const message = `[${activeRoute}] ${type}: ${detail}`;
  if (seenErrors.has(message)) return;
  seenErrors.add(message);
  errors.push(message);
};

page.on("console", (message) => {
  if (message.type() === "error") {
    pushError("console", message.text());
  }
});

page.on("pageerror", (error) => {
  pushError("pageerror", error.stack || error.message);
});

page.on("requestfailed", (request) => {
  const failure = request.failure();
  if (request.resourceType() === "image" && failure?.errorText === "net::ERR_ABORTED") {
    return;
  }
  pushError("requestfailed", `${request.url()} ${failure?.errorText || ""}`.trim());
});

const waitForApp = async () => {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForFunction(() => Boolean(document.body && document.body.innerText.trim().length > 0), null, {
    timeout: 15000,
  });
  await sleep(350);
};

const currentHash = () => new URL(page.url()).hash;
const hashForRoute = (route) => `#${route.startsWith("/") ? route : `/${route}`}`;

const gotoHashRoute = async (route) => {
  activeRoute = route;
  await page.goto(`${baseUrl}/${hashForRoute(route)}`, { waitUntil: "domcontentloaded" });
  await waitForApp();
};

const setHashRoute = async (route) => {
  activeRoute = route;
  const expectedHash = hashForRoute(route);
  await page.evaluate((hash) => {
    window.location.hash = hash;
  }, expectedHash);
  await sleep(150);
  if (currentHash() !== expectedHash) {
    pushError("route", `hash mismatch for ${route}, got ${currentHash()}`);
  }
  await waitForApp();
};

const collectVisibleText = async () =>
  page.evaluate(() => {
    const values = [];
    const push = (value) => {
      if (!value) return;
      const text = String(value).replace(/\s+/g, " ").trim();
      if (text) values.push(text);
    };

    push(document.body?.innerText);
    push(document.title);

    document.querySelectorAll("input, select, textarea, button, a, img").forEach((el) => {
      push(el.getAttribute("aria-label"));
      push(el.getAttribute("title"));
      push(el.getAttribute("placeholder"));
      push(el.getAttribute("alt"));
      push(el.textContent);
    });

    return values.join(" | ");
  });

const assertNoUnexpectedEnglish = async () => {
  const text = await collectVisibleText();
  const normalized = allowlistedEnglishPhrases.reduce((acc, phrase) => acc.replaceAll(phrase, " "), text.replace(/\s+/g, " "));
  const violations = disallowedUiPhrases.filter((phrase) => normalized.includes(phrase));

  if (violations.length > 0) {
    pushError("english-text", violations.join(", "));
  }
};

const getRouteIds = async () => {
  const hookIds = await page.evaluate(() => {
    const hook = window.__GLINT_TEST__;
    if (!hook?.caseIds?.length || !hook?.productIds?.length) {
      return null;
    }
    return {
      caseIds: hook.caseIds,
      productIds: hook.productIds,
    };
  });

  if (hookIds) {
    return hookIds;
  }

  const productIds = parsedIds.filter((id) => id === "lumina-arc" || id.startsWith("product-") || id.startsWith("hot-"));
  return {
    caseIds: parsedIds.filter((id) => !productIds.includes(id) && id !== "entry" && id !== "hub"),
    productIds,
  };
};

const checkCommonPageState = async (route) => {
  const bodyText = await page.evaluate(() => document.body.innerText.replace(/\s+/g, " ").trim());
  if (bodyText.length < 20) {
    pushError("render", "page body text is unexpectedly empty");
  }

  if (route === "/search") {
    const searchInput = page.locator("input").first();
    if ((await searchInput.count()) === 0) {
      pushError("search-page", "search input not found");
    }
  }
};

const verifyProductSearchExperience = async () => {
  activeRoute = "/search";
  await setHashRoute("/search?keyword=Hub&category=all&tag=all");

  const bodyText = await page.evaluate(() => document.body.innerText.replace(/\s+/g, " ").trim());

  if (!bodyText.includes("Smart Hub")) {
    pushError("search-products", "expected product search results to include Smart Hub");
  }

  if (!bodyText.includes("个产品结果")) {
    pushError("search-products", "expected search page to describe product results");
  }

  const productCard = page.getByRole("button", { name: /Smart Hub/ });
  if ((await productCard.count()) === 0) {
    pushError("search-products", "expected product search result card to be clickable");
  }
};

const verifyProductsOverviewFilterSection = async () => {
  activeRoute = "/products";
  await setHashRoute("/products");

  const filterSection = page.getByLabel("产品筛选结果区");
  if ((await filterSection.count()) === 0) {
    pushError("products-filters", "expected products page to include a lower filter results section");
    return;
  }

  const searchInput = filterSection.getByLabel("输入搜索关键词");
  if ((await searchInput.count()) === 0) {
    pushError("products-filters", "expected products filter section to include a search input");
    return;
  }

  await searchInput.fill("Hub");
  await page.waitForTimeout(150);

  const filteredText = await filterSection.innerText();
  if (!filteredText.includes("Smart Hub")) {
    pushError("products-filters", "expected products filter search to include Smart Hub");
  }

  if (filteredText.includes("Chronos Shift")) {
    pushError("products-filters", "expected products filter search to narrow the visible results");
  }

  await searchInput.fill("");
  await page.waitForTimeout(150);

  const tagButton = filterSection.getByRole("button", { name: "限量版", exact: true });
  if ((await tagButton.count()) === 0) {
    pushError("products-filters", "expected products filter section to expose tag badges");
    return;
  }

  await tagButton.click();
  await page.waitForTimeout(150);

  const tagFilteredText = await filterSection.innerText();
  if (!tagFilteredText.includes("Acoustic Void-01")) {
    pushError("products-filters", "expected tag filter to include Acoustic Void-01");
  }

  if (tagFilteredText.includes("Smart Hub")) {
    pushError("products-filters", "expected tag filter to narrow results away from Smart Hub");
  }
};

const verifyRoute = async (route) => {
  activeRoute = route;
  const errorsBefore = errors.length;

  if (route === "/") {
    await gotoHashRoute(route);
  } else {
    await setHashRoute(route);
  }

  const hash = currentHash();
  const expectedFragment = route === "/" ? "/" : route.replace(/^\//, "");
  if (!hash.includes(expectedFragment)) {
    pushError("route", `hash mismatch for ${route}, got ${hash}`);
  }

  await checkCommonPageState(route);
  await assertNoUnexpectedEnglish();

  if (route === "/search") {
    const searchInput = page.locator("input").first();
    if ((await searchInput.count()) > 0) {
      await searchInput.fill("GLINT");
      await page.waitForTimeout(100);
    }
  }

  if (route.startsWith("/product/")) {
    const thumbs = page.locator('img[alt="thumb"]');
    const thumbCount = await thumbs.count();
    if (thumbCount > 1) {
      await thumbs.nth(1).click();
      await page.waitForTimeout(250);
    }
  }

  return errors.length === errorsBefore;
};

try {
  await gotoHashRoute("/");

  const routeIds = await getRouteIds();
  const caseIds = routeIds.caseIds.length > 0 ? routeIds.caseIds : parsedIds.filter((id) => id.includes("aerospace") || id.includes("synergy") || id.includes("protocol") || id.includes("crossover"));
  const productIds = routeIds.productIds.length > 0 ? routeIds.productIds : parsedIds.filter((id) => id === "lumina-arc" || id.startsWith("product-") || id.startsWith("hot-"));

  const routes = [
    "/",
    "/login",
    "/home",
    "/search",
    "/cases",
    "/case-map",
    ...caseIds.map((id) => `/case/${id}`),
    "/products",
    "/products/hot",
    ...productIds.map((id) => `/product/${id}`),
  ];

  const visited = [];
  for (const route of routes) {
    visited.push({ route, ok: await verifyRoute(route) });
  }

  const refreshRoutes = ["/home", "/cases", "/products"];
  for (const route of refreshRoutes) {
    await setHashRoute(route);
    const before = currentHash();
    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForApp();
    if (currentHash() !== before) {
      pushError("refresh", `hash changed after reload for ${route}: ${currentHash()} (was ${before})`);
    }
  }

  await setHashRoute("/home");
  await setHashRoute("/cases");
  await setHashRoute("/products");

  await page.goBack();
  await waitForApp();
  if (!currentHash().includes("cases")) {
    pushError("history", `expected back navigation to /cases, got ${currentHash()}`);
  }

  await page.goForward();
  await waitForApp();
  if (!currentHash().includes("products")) {
    pushError("history", `expected forward navigation to /products, got ${currentHash()}`);
  }

  await setHashRoute("/search?keyword=GLINT&category=all");
  const searchBeforeReload = currentHash();
  await page.reload({ waitUntil: "domcontentloaded" });
  await waitForApp();
  if (currentHash() !== searchBeforeReload) {
    pushError("search-query", `search hash did not persist after reload: ${currentHash()} (was ${searchBeforeReload})`);
  }

  const searchInputValue = await page.locator("input").first().inputValue();
  if (!searchInputValue.includes("GLINT")) {
    pushError("search-query", `search input did not retain the keyword after reload: ${searchInputValue}`);
  }

  await verifyProductSearchExperience();
  await verifyProductsOverviewFilterSection();

  await browser.close();

  if (errors.length > 0) {
    console.error("Route verification failed.");
    for (const error of errors) {
      console.error(error);
    }
    throw new Error("Route verification failed.");
  }

  console.log(`Verified ${routes.length} routes with no console, runtime, request, history, search, or english-text failures.`);
  for (const item of visited) {
    console.log(`OK ${item.route}`);
  }
} finally {
  if (browser.isConnected()) {
    await browser.close().catch(() => {});
  }
}
