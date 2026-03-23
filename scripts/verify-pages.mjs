import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const repoRoot = process.cwd();
const baseUrl = (process.argv[2] || "http://127.0.0.1:4173").replace(/\/$/, "");
const SESSION_STORAGE_KEY = "auth-session";
const FIXED_PASSWORD = "glintrise-123";
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
await context.addInitScript(() => {
  window.__GLINT_LAST_SHARE__ = null;
  window.__GLINT_LAST_CLIPBOARD__ = null;

  Object.defineProperty(window.navigator, "share", {
    configurable: true,
    value: async (payload) => {
      window.__GLINT_LAST_SHARE__ = payload;
    },
  });

  Object.defineProperty(window.navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: async (value) => {
        window.__GLINT_LAST_CLIPBOARD__ = value;
      },
    },
  });
});
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

const attachPageDiagnostics = (targetPage) => {
  targetPage.on("console", (message) => {
    if (message.type() === "error") {
      pushError("console", message.text());
    }
  });

  targetPage.on("pageerror", (error) => {
    pushError("pageerror", error.stack || error.message);
  });

  targetPage.on("requestfailed", (request) => {
    const failure = request.failure();
    if (request.resourceType() === "image" && failure?.errorText === "net::ERR_ABORTED") {
      return;
    }
    pushError("requestfailed", `${request.url()} ${failure?.errorText || ""}`.trim());
  });
};

attachPageDiagnostics(page);

const waitForPageApp = async (targetPage) => {
  await targetPage.waitForLoadState("domcontentloaded");
  await targetPage.waitForFunction(() => Boolean(document.body && document.body.innerText.trim().length > 0), null, {
    timeout: 15000,
  });
  await sleep(350);
};

const waitForApp = async () => waitForPageApp(page);
const currentHashForPage = (targetPage) => new URL(targetPage.url()).hash;
const currentHash = () => currentHashForPage(page);
const hashForRoute = (route) => `#${route.startsWith("/") ? route : `/${route}`}`;
const shareHashForRoute = (route) => `${baseUrl}/${hashForRoute(route)}`;
const createPersistedSession = (role) => ({
  token: `mock-session-token:${role}`,
  user: {
    id: `user-${role}`,
    role,
  },
});

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

const clearPersistedAuthSession = async () => {
  await page.evaluate((storageKey) => {
    window.localStorage.removeItem(storageKey);
  }, SESSION_STORAGE_KEY);
};

const seedPersistedAuthSession = async (role) => {
  const session = createPersistedSession(role);
  await page.evaluate(
    ({ storageKey, value }) => {
      window.localStorage.setItem(storageKey, JSON.stringify(value));
    },
    { storageKey: SESSION_STORAGE_KEY, value: session },
  );
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

const verifyTopNavSearchExperience = async () => {
  activeRoute = "/products";
  await setHashRoute("/products");

  const duplicateSearchButton = page.getByRole("button", { name: /^搜索$/ });
  if ((await duplicateSearchButton.count()) > 0) {
    pushError("top-nav-search", "expected desktop navigation to remove the duplicate search button");
  }

  const searchForm = page.getByTestId("top-nav-search-form");
  const searchInput = page.getByTestId("top-nav-search-input");
  const searchSubmit = page.getByTestId("top-nav-search-submit");

  if ((await searchForm.count()) === 0 || (await searchInput.count()) === 0 || (await searchSubmit.count()) === 0) {
    pushError("top-nav-search", "expected top navigation to expose search form, input, and submit controls");
    return;
  }

  const beforeBox = await searchForm.boundingBox();
  if (!beforeBox) {
    pushError("top-nav-search", "expected top search form to have a measurable collapsed box");
    return;
  }

  await searchForm.click();
  await page.waitForTimeout(350);

  const afterBox = await searchForm.boundingBox();
  if (!afterBox) {
    pushError("top-nav-search", "expected top search form to have a measurable expanded box");
    return;
  }

  const beforeRight = beforeBox.x + beforeBox.width;
  const afterRight = afterBox.x + afterBox.width;
  if (afterBox.width <= beforeBox.width + 80) {
    pushError("top-nav-search", "expected top search form to expand noticeably after click");
  }

  if (Math.abs(afterRight - beforeRight) > 4) {
    pushError("top-nav-search", `expected right edge to stay anchored during expansion, got delta ${Math.abs(afterRight - beforeRight)}`);
  }

  if (afterBox.x >= beforeBox.x - 40) {
    pushError("top-nav-search", "expected top search form to expand leftward");
  }

  await searchInput.fill("Hub");
  await searchInput.press("Enter");
  await waitForApp();

  const firstHash = currentHash();
  if (!firstHash.includes("/search?keyword=Hub") || !firstHash.includes("category=all") || !firstHash.includes("tag=all")) {
    pushError("top-nav-search", `expected Enter to navigate to product search route, got ${firstHash}`);
  }

  const firstValue = await searchInput.inputValue();
  if (firstValue !== "Hub") {
    pushError("top-nav-search", `expected search page top input to preload Hub, got ${firstValue}`);
  }

  activeRoute = "/home";
  await setHashRoute("/home");

  const iconForm = page.getByTestId("top-nav-search-form");
  const iconInput = page.getByTestId("top-nav-search-input");
  const iconSubmit = page.getByTestId("top-nav-search-submit");

  await iconSubmit.click();
  await page.waitForTimeout(350);
  await iconInput.fill("Core");
  await iconSubmit.click();
  await waitForApp();

  const secondHash = currentHash();
  if (!secondHash.includes("/search?keyword=Core") || !secondHash.includes("category=all") || !secondHash.includes("tag=all")) {
    pushError("top-nav-search", `expected search icon to navigate to product search route, got ${secondHash}`);
  }

  const secondValue = await iconForm.getByTestId("top-nav-search-input").inputValue();
  if (secondValue !== "Core") {
    pushError("top-nav-search", `expected search page top input to preload Core, got ${secondValue}`);
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

const verifyCaseTimelineExperience = async () => {
  activeRoute = "/case-timeline";
  await setHashRoute("/case-timeline");

  const bodyText = await page.evaluate(() => document.body.innerText.replace(/\s+/g, " ").trim());

  if (!bodyText.includes("2024.Q4")) {
    pushError("case-timeline", "expected case timeline page to render grouped timeline labels");
  }

  const timelineCard = page.getByRole("button", { name: /Quantum Security Protocol/ });
  if ((await timelineCard.count()) === 0) {
    pushError("case-timeline", "expected case timeline page to expose clickable case cards");
    return;
  }

  await timelineCard.first().click();
  await waitForApp();

  if (!currentHash().includes("/case/quantum-security-protocol")) {
    pushError("case-timeline", `expected timeline card to navigate to case detail, got ${currentHash()}`);
  }
};

const getShareButton = () => {
  const textButton = page.locator("button").filter({ hasText: /分享/ }).first();
  const ariaButton = page.locator('button[aria-label*="分享"]').first();
  return {
    textButton,
    ariaButton,
  };
};

const clickShareButton = async () => {
  const { textButton, ariaButton } = getShareButton();
  if ((await textButton.count()) > 0) {
    await textButton.click();
    return true;
  }

  if ((await ariaButton.count()) > 0) {
    await ariaButton.click();
    return true;
  }

  return false;
};

const readShareCapture = async () =>
  page.evaluate(() => ({
    share: window.__GLINT_LAST_SHARE__,
    clipboard: window.__GLINT_LAST_CLIPBOARD__,
  }));

const resetShareCapture = async () => {
  await page.evaluate(() => {
    window.__GLINT_LAST_SHARE__ = null;
    window.__GLINT_LAST_CLIPBOARD__ = null;
  });
};

const verifyShareLandingPages = async () => {
  activeRoute = "/share/product/lumina-arc";
  await setHashRoute("/share/product/lumina-arc");

  const productShareBody = await page.evaluate(() => document.body.innerText.replace(/\s+/g, " ").trim());
  if (!productShareBody.includes("LUMINA ARC")) {
    pushError("share-product", "expected product share page to render product content");
  }

  const productDetailCta = page.getByRole("button", { name: /进入官网详情/ });
  if ((await productDetailCta.count()) === 0) {
    pushError("share-product", "expected product share page to expose a detail CTA");
  } else {
    await productDetailCta.first().click();
    await waitForApp();
    if (!currentHash().includes("/product/lumina-arc")) {
      pushError("share-product", `expected share CTA to navigate to product detail, got ${currentHash()}`);
    }
  }

  activeRoute = "/share/case/quantum-security-protocol";
  await setHashRoute("/share/case/quantum-security-protocol");

  const caseShareBody = await page.evaluate(() => document.body.innerText.replace(/\s+/g, " ").trim());
  if (!caseShareBody.includes("Quantum Security Protocol")) {
    pushError("share-case", "expected case share page to render case content");
  }

  const caseDetailCta = page.getByRole("button", { name: /进入官网详情/ });
  if ((await caseDetailCta.count()) === 0) {
    pushError("share-case", "expected case share page to expose a detail CTA");
  } else {
    await caseDetailCta.first().click();
    await waitForApp();
    if (!currentHash().includes("/case/quantum-security-protocol")) {
      pushError("share-case", `expected share CTA to navigate to case detail, got ${currentHash()}`);
    }
  }
};

const verifyDetailShareTargets = async () => {
  activeRoute = "/product/lumina-arc";
  await setHashRoute("/product/lumina-arc");
  await resetShareCapture();

  if (!(await clickShareButton())) {
    pushError("share-detail", "expected product detail page to expose a share button");
  } else {
    await page.waitForTimeout(100);
    const productShareCapture = await readShareCapture();
    const expectedProductUrl = shareHashForRoute("/share/product/lumina-arc");
    if (productShareCapture.share?.url !== expectedProductUrl && productShareCapture.clipboard !== expectedProductUrl) {
      pushError("share-detail", `expected product detail share target ${expectedProductUrl}`);
    }
  }

  activeRoute = "/case/quantum-security-protocol";
  await setHashRoute("/case/quantum-security-protocol");
  await resetShareCapture();

  if (!(await clickShareButton())) {
    pushError("share-detail", "expected case detail page to expose a share button");
  } else {
    await page.waitForTimeout(100);
    const caseShareCapture = await readShareCapture();
    const expectedCaseUrl = shareHashForRoute("/share/case/quantum-security-protocol");
    if (caseShareCapture.share?.url !== expectedCaseUrl && caseShareCapture.clipboard !== expectedCaseUrl) {
      pushError("share-detail", `expected case detail share target ${expectedCaseUrl}`);
    }
  }
};

const verifyWorkspaceAuthFlows = async () => {
  const runIsolatedAuthScenario = async ({ route, persistedRole, verify }) => {
    const authContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });

    if (persistedRole) {
      const session = createPersistedSession(persistedRole);
      await authContext.addInitScript(
        ({ storageKey, value }) => {
          window.localStorage.setItem(storageKey, JSON.stringify(value));
        },
        { storageKey: SESSION_STORAGE_KEY, value: session },
      );
    }

    const authPage = await authContext.newPage();
    attachPageDiagnostics(authPage);

    try {
      await authPage.goto(`${baseUrl}/${hashForRoute(route)}`, { waitUntil: "domcontentloaded" });
      await waitForPageApp(authPage);
      await verify(authPage);
    } finally {
      await authContext.close().catch(() => {});
    }
  };

  activeRoute = "/workspace/dashboard";
  await runIsolatedAuthScenario({
    route: "/workspace/dashboard",
    verify: async (authPage) => {
      const hash = currentHashForPage(authPage);
      if (hash !== hashForRoute("/login")) {
        pushError(
          "auth-workspace",
          `missing workspace/auth flow assertion: unauthenticated /workspace/dashboard should redirect to /login, got ${hash}`,
        );
      }
    },
  });

  const submitLogin = async (identifier, expectedRoute) => {
    activeRoute = `/login:${identifier}`;

    await runIsolatedAuthScenario({
      route: "/login",
      verify: async (authPage) => {
        const loginForm = authPage.locator("form").filter({ has: authPage.locator('input[type="password"]') }).first();
        const identifierInput = loginForm.locator("input").nth(0);
        const passwordInput = loginForm.locator('input[type="password"]').first();
        const submitButton = loginForm.locator('button[type="submit"]').first();
        let hasLoginControls = true;

        try {
          await submitButton.waitFor({ state: "visible", timeout: 5000 });
        } catch {
          hasLoginControls = false;
        }

        if (
          !hasLoginControls ||
          (await loginForm.count()) === 0 ||
          (await identifierInput.count()) === 0 ||
          (await passwordInput.count()) === 0 ||
          (await submitButton.count()) === 0
        ) {
          pushError(
            "auth-workspace",
            `missing workspace/auth flow assertion: login form controls for ${identifier} are not implemented`,
          );
          return;
        }

        await identifierInput.fill(identifier);
        await passwordInput.fill(FIXED_PASSWORD);
        await submitButton.click();
        await waitForPageApp(authPage);

        const hash = currentHashForPage(authPage);
        if (hash !== hashForRoute(expectedRoute)) {
          pushError(
            "auth-workspace",
            `missing workspace/auth flow assertion: ${identifier} login should land on ${hashForRoute(expectedRoute)}, got ${hash}`,
          );
        }
      },
    });
  };

  await submitLogin("employee", "/workspace/dashboard");
  await submitLogin("director", "/workspace/dashboard");
  await submitLogin("developer", "/workspace/content");

  activeRoute = "/workspace/content";
  await runIsolatedAuthScenario({
    route: "/workspace/content",
    persistedRole: "employee",
    verify: async (authPage) => {
      const hash = currentHashForPage(authPage);
      if (hash !== hashForRoute("/workspace/forbidden")) {
        pushError(
          "auth-workspace",
          `missing workspace/auth flow assertion: forbidden employee access should land on /workspace/forbidden, got ${hash}`,
        );
      }
    },
  });
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
    "/case-timeline",
    "/case-map",
    "/share/product/lumina-arc",
    "/share/case/quantum-security-protocol",
    ...caseIds.map((id) => `/case/${id}`),
    "/products",
    "/products/hot",
    ...productIds.map((id) => `/product/${id}`),
  ];

  const visited = [];
  for (const route of routes) {
    visited.push({ route, ok: await verifyRoute(route) });
  }

  const refreshRoutes = ["/home", "/cases", "/case-timeline", "/share/product/lumina-arc", "/products"];
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
  await setHashRoute("/case-timeline");
  await setHashRoute("/products");

  await page.goBack();
  await waitForApp();
  if (!currentHash().includes("case-timeline")) {
    pushError("history", `expected back navigation to /case-timeline, got ${currentHash()}`);
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
  await verifyTopNavSearchExperience();
  await verifyCaseTimelineExperience();
  await verifyShareLandingPages();
  await verifyDetailShareTargets();
  await verifyProductsOverviewFilterSection();
  await verifyWorkspaceAuthFlows();

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
