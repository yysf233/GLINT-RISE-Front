import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const repoRoot = process.cwd();
const baseUrl = (process.argv[2] || "http://127.0.0.1:4173").replace(/\/$/, "");
const SESSION_STORAGE_KEY = "auth-session";
const WORKSPACE_PRODUCTS_STORAGE_KEY = "glint-rise.workspace-products.v1";
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

const clearPersistedWorkspaceProducts = async () => {
  await page.evaluate((storageKey) => {
    window.localStorage.removeItem(storageKey);
  }, WORKSPACE_PRODUCTS_STORAGE_KEY);
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
  const runIsolatedAuthScenario = async ({ route, persistedRole, persistedSessionValue, verify }) => {
    const authContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });

    if (persistedRole || persistedSessionValue !== undefined) {
      const value = persistedSessionValue ?? createPersistedSession(persistedRole);
      await authContext.addInitScript(
        ({ storageKey, value }) => {
          const normalizedValue = typeof value === "string" ? value : JSON.stringify(value);
          window.localStorage.setItem(storageKey, normalizedValue);
        },
        { storageKey: SESSION_STORAGE_KEY, value },
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

  const readBodyText = async (targetPage) =>
    targetPage.evaluate(() => document.body.innerText.replace(/\s+/g, " ").trim());

  const expectBodyText = async (targetPage, fragment, label) => {
    const bodyText = await readBodyText(targetPage);
    if (!bodyText.includes(fragment)) {
      pushError("workspace-shell", `${label} missing visible copy: ${fragment}`);
    }
  };

  const expectButton = async (targetPage, name, label) => {
    const button = targetPage.getByRole("button", { name });
    if ((await button.count()) === 0) {
      pushError("workspace-shell", `${label} missing control: ${name}`);
    }
  };

  const expectWorkspaceShellControls = async (targetPage, label) => {
    await expectButton(targetPage, "Back to Public Site", label);
    await expectButton(targetPage, "Log Out", label);
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

  const submitLoginFromProtectedRoute = async (route, identifier, expectedRoute) => {
    activeRoute = `${route}:${identifier}`;

    await runIsolatedAuthScenario({
      route,
      verify: async (authPage) => {
        const loginForm = authPage.locator("form").filter({ has: authPage.locator('input[type="password"]') }).first();
        const identifierInput = loginForm.locator("input").nth(0);
        const passwordInput = loginForm.locator('input[type="password"]').first();
        const submitButton = loginForm.locator('button[type="submit"]').first();
        const redirectedHash = currentHashForPage(authPage);

        if (redirectedHash !== hashForRoute("/login")) {
          pushError(
            "auth-workspace",
            `expected protected route ${route} to redirect to /login before submit, got ${redirectedHash}`,
          );
          return;
        }

        await submitButton.waitFor({ state: "visible", timeout: 5000 });
        await identifierInput.fill(identifier);
        await passwordInput.fill(FIXED_PASSWORD);
        await submitButton.click();
        await waitForPageApp(authPage);

        const finalHash = currentHashForPage(authPage);
        if (finalHash !== hashForRoute(expectedRoute)) {
          pushError(
            "auth-workspace",
            `expected ${identifier} login from ${route} to land on ${hashForRoute(expectedRoute)}, got ${finalHash}`,
          );
        }
      },
    });
  };

  await submitLogin("employee", "/workspace/dashboard");
  await submitLogin("director", "/workspace/dashboard");
  await submitLogin("developer", "/workspace/content");
  await submitLoginFromProtectedRoute("/workspace/forbidden", "employee", "/workspace/forbidden");
  await submitLoginFromProtectedRoute("/workspace/content", "employee", "/workspace/dashboard");

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

  activeRoute = "/workspace/dashboard:employee-shell";
  await runIsolatedAuthScenario({
    route: "/workspace/dashboard",
    persistedRole: "employee",
    verify: async (authPage) => {
      await expectBodyText(authPage, "Employee Workspace", "employee dashboard");
      await expectBodyText(authPage, "Future Modules", "employee dashboard");
      await expectWorkspaceShellControls(authPage, "employee dashboard");
    },
  });

  activeRoute = "/workspace/dashboard:director-shell";
  await runIsolatedAuthScenario({
    route: "/workspace/dashboard",
    persistedRole: "director",
    verify: async (authPage) => {
      await expectBodyText(authPage, "Director Workspace", "director dashboard");
      await expectBodyText(authPage, "Decision View", "director dashboard");
      await expectWorkspaceShellControls(authPage, "director dashboard");
    },
  });

  activeRoute = "/workspace/content:developer-shell";
  await runIsolatedAuthScenario({
    route: "/workspace/content",
    persistedRole: "developer",
    verify: async (authPage) => {
      await expectBodyText(authPage, "Developer Workspace", "developer content page");
      await expectBodyText(authPage, "Content Maintenance", "developer content page");
      await expectWorkspaceShellControls(authPage, "developer content page");
    },
  });

  activeRoute = "/workspace/forbidden:actions";
  await runIsolatedAuthScenario({
    route: "/workspace/forbidden",
    persistedRole: "employee",
    verify: async (authPage) => {
      await expectBodyText(authPage, "No Access", "forbidden page");
      await expectButton(authPage, "Return to My Workspace", "forbidden page");
      await expectButton(authPage, "Switch Account", "forbidden page");
      await expectWorkspaceShellControls(authPage, "forbidden page");
    },
  });

  const allowedProductRoutes = [
    "/workspace/products",
    "/workspace/products/new",
    "/workspace/products/import",
    "/workspace/products/wp-lumina-arc",
    "/workspace/products/wp-lumina-arc/edit",
  ];

  for (const route of allowedProductRoutes) {
    activeRoute = `${route}:employee-allow`;
    await runIsolatedAuthScenario({
      route,
      persistedRole: "employee",
      verify: async (authPage) => {
        if (currentHashForPage(authPage) !== hashForRoute(route)) {
          pushError("auth-workspace", `expected employee to access ${route}, got ${currentHashForPage(authPage)}`);
        }
      },
    });

    activeRoute = `${route}:director-allow`;
    await runIsolatedAuthScenario({
      route,
      persistedRole: "director",
      verify: async (authPage) => {
        if (currentHashForPage(authPage) !== hashForRoute(route)) {
          pushError("auth-workspace", `expected director to access ${route}, got ${currentHashForPage(authPage)}`);
        }
      },
    });
  }

  const deniedProductRoutes = [
    "/workspace/products",
    "/workspace/products/new",
    "/workspace/products/import",
    "/workspace/products/wp-lumina-arc",
    "/workspace/products/wp-lumina-arc/edit",
  ];

  for (const route of deniedProductRoutes) {
    activeRoute = `${route}:developer-deny`;
    await runIsolatedAuthScenario({
      route,
      persistedRole: "developer",
      verify: async (authPage) => {
        if (currentHashForPage(authPage) !== hashForRoute("/workspace/forbidden")) {
          pushError("auth-workspace", `expected developer to be denied for ${route}, got ${currentHashForPage(authPage)}`);
        }
      },
    });
  }

  activeRoute = "/workspace/dashboard";
  await runIsolatedAuthScenario({
    route: "/workspace/dashboard",
    persistedSessionValue: "",
    verify: async (authPage) => {
      const hash = currentHashForPage(authPage);
      const storedValue = await authPage.evaluate((storageKey) => window.localStorage.getItem(storageKey), SESSION_STORAGE_KEY);

      if (hash !== hashForRoute("/login")) {
        pushError(
          "auth-workspace",
          `missing workspace/auth flow assertion: corrupted empty-string session should redirect workspace access to /login, got ${hash}`,
        );
      }

      if (storedValue !== null) {
        pushError(
          "auth-workspace",
          `missing workspace/auth flow assertion: corrupted empty-string session should be cleared from storage, got ${JSON.stringify(storedValue)}`,
        );
      }
    },
  });
};

const verifyWorkspaceProductsModule = async () => {
  const moduleContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await moduleContext.addInitScript(
    ({ sessionKey, sessionValue, productsKey }) => {
      window.localStorage.setItem(sessionKey, JSON.stringify(sessionValue));
      window.localStorage.removeItem(productsKey);
    },
    {
      sessionKey: SESSION_STORAGE_KEY,
      sessionValue: createPersistedSession("employee"),
      productsKey: WORKSPACE_PRODUCTS_STORAGE_KEY,
    },
  );

  const modulePage = await moduleContext.newPage();
  attachPageDiagnostics(modulePage);

  const moduleHash = () => currentHashForPage(modulePage);
  const readModuleBody = async () => modulePage.evaluate(() => document.body.innerText.replace(/\s+/g, " ").trim());

  try {
    activeRoute = "/workspace/products:module";
    await modulePage.goto(`${baseUrl}/${hashForRoute("/workspace/products")}`, { waitUntil: "domcontentloaded" });
    await waitForPageApp(modulePage);

    const searchInput = modulePage.getByTestId("workspace-products-search");
    const bulkTagInput = modulePage.getByTestId("workspace-products-bulk-tags");
    const applyTagsButton = modulePage.getByTestId("workspace-products-apply-tags");

    if ((await searchInput.count()) === 0 || (await bulkTagInput.count()) === 0 || (await applyTagsButton.count()) === 0) {
      pushError("workspace-products", "expected list page search and bulk tag controls to exist");
      return;
    }

    await searchInput.fill("Smart Hub");
    await modulePage.waitForTimeout(250);
    const filteredBody = await readModuleBody();
    if (!filteredBody.includes("Smart Hub") || filteredBody.includes("Lumina Arc")) {
      pushError("workspace-products", "expected keyword filter to narrow the product table");
    }

    await searchInput.fill("");
    await modulePage.waitForTimeout(250);
    await modulePage.getByTestId("workspace-products-select-wp-smart-hub").check();
    await bulkTagInput.fill("priority-sync");
    await applyTagsButton.click();
    await modulePage.waitForTimeout(250);
    await searchInput.fill("priority-sync");
    await modulePage.waitForTimeout(250);
    const bulkTagBody = await readModuleBody();
    if (!bulkTagBody.includes("Smart Hub") || !bulkTagBody.includes("priority-sync")) {
      pushError("workspace-products", "expected bulk tag action to persist and become searchable");
    }

    activeRoute = "/workspace/products/wp-smart-hub";
    await modulePage.goto(`${baseUrl}/${hashForRoute("/workspace/products/wp-smart-hub")}`, { waitUntil: "domcontentloaded" });
    await waitForPageApp(modulePage);
    const detailBody = await readModuleBody();
    if (!detailBody.includes("Internal cost") || !detailBody.includes("Progress Summary")) {
      pushError("workspace-products", "expected detail page to render backend-only fields");
    }

    activeRoute = "/workspace/products/wp-smart-hub/edit";
    await modulePage.goto(`${baseUrl}/${hashForRoute("/workspace/products/wp-smart-hub/edit")}`, { waitUntil: "domcontentloaded" });
    await waitForPageApp(modulePage);
    const editSubmit = modulePage.getByTestId("workspace-product-form-submit");
    await modulePage.getByTestId("workspace-product-form-name").fill("");
    await editSubmit.click();
    await waitForPageApp(modulePage);
    if (moduleHash() !== hashForRoute("/workspace/products/wp-smart-hub/edit")) {
      pushError("workspace-products", `expected invalid edit submit to stay on edit route, got ${moduleHash()}`);
    }
    if (!(await readModuleBody()).includes("Name is required.")) {
      pushError("workspace-products", "expected invalid edit submit to show form validation");
    }

    await modulePage.getByTestId("workspace-product-form-name").fill("Smart Hub Prime");
    await editSubmit.click();
    await waitForPageApp(modulePage);
    if (moduleHash() !== hashForRoute("/workspace/products/wp-smart-hub")) {
      pushError("workspace-products", `expected valid edit submit to return to detail route, got ${moduleHash()}`);
    }
    if (!(await readModuleBody()).includes("Smart Hub Prime")) {
      pushError("workspace-products", "expected edited product name to render on detail page");
    }

    activeRoute = "/workspace/products/new";
    await modulePage.goto(`${baseUrl}/${hashForRoute("/workspace/products/new")}`, { waitUntil: "domcontentloaded" });
    await waitForPageApp(modulePage);
    const createSubmit = modulePage.getByTestId("workspace-product-form-submit");
    await createSubmit.click();
    await waitForPageApp(modulePage);
    if (!(await readModuleBody()).includes("Name is required.")) {
      pushError("workspace-products", "expected invalid create submit to show validation");
    }

    await modulePage.getByTestId("workspace-product-form-name").fill("Atlas Beam");
    await modulePage.getByTestId("workspace-product-form-id").fill("atlas-beam");
    await modulePage.getByTestId("workspace-product-form-owner").fill("Tara");
    await modulePage.getByTestId("workspace-product-form-owner-team").fill("Operations");
    await modulePage.getByTestId("workspace-product-form-retail-price").fill("3200");
    await modulePage.getByTestId("workspace-product-form-internal-cost").fill("2100");
    await modulePage.getByTestId("workspace-product-form-summary").fill("Atlas Beam test record for verification.");
    await modulePage.getByTestId("workspace-product-form-progress-summary").fill("Verification path for create flow.");
    await modulePage.getByTestId("workspace-product-form-supplier-summary").fill("Mock supplier aligned.");
    await modulePage.getByTestId("workspace-product-form-hero").fill("/atlas-beam.jpg");
    await modulePage.getByTestId("workspace-product-form-tags").fill("atlas, beam");
    await createSubmit.click();
    await waitForPageApp(modulePage);
    if (moduleHash() !== hashForRoute("/workspace/products/atlas-beam")) {
      pushError("workspace-products", `expected create submit to land on new detail route, got ${moduleHash()}`);
    }
    if (!(await readModuleBody()).includes("Atlas Beam")) {
      pushError("workspace-products", "expected created product to render on detail page");
    }

    activeRoute = "/workspace/products/import";
    await modulePage.goto(`${baseUrl}/${hashForRoute("/workspace/products/import")}`, { waitUntil: "domcontentloaded" });
    await waitForPageApp(modulePage);
    await modulePage.getByTestId("workspace-product-import-preview").click();
    await modulePage.waitForTimeout(250);
    const previewBody = await readModuleBody();
    if (!previewBody.includes("Aurora Stage Grid") || !previewBody.includes("Signal Relay Mini")) {
      pushError("workspace-products", "expected import preview to render sample rows");
    }

    await modulePage.getByTestId("workspace-product-import-submit").click();
    await waitForPageApp(modulePage);
    if (moduleHash() !== hashForRoute("/workspace/products")) {
      pushError("workspace-products", `expected import submit to return to products list, got ${moduleHash()}`);
    }

    await modulePage.getByTestId("workspace-products-search").fill("Aurora Stage Grid");
    await modulePage.waitForTimeout(250);
    if (!(await readModuleBody()).includes("Aurora Stage Grid")) {
      pushError("workspace-products", "expected imported record to appear in the products list");
    }
  } finally {
    await moduleContext.close().catch(() => {});
  }
};

const verifyLoginPageFlow = async () => {
  const runLoginScenario = async ({ route = "/login", persistedRole, verify }) => {
    const authContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });

    if (persistedRole) {
      await authContext.addInitScript(
        ({ storageKey, value }) => {
          window.localStorage.setItem(storageKey, JSON.stringify(value));
        },
        { storageKey: SESSION_STORAGE_KEY, value: createPersistedSession(persistedRole) },
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

  const getLoginForm = (authPage) => authPage.locator("form").filter({ has: authPage.locator('input[type="password"]') }).first();
  const getIdentifierInput = (loginForm) => loginForm.locator("input").nth(0);
  const getPasswordInput = (loginForm) => loginForm.locator('input[type="password"]').first();
  const getSubmitButton = (loginForm) => loginForm.locator('button[type="submit"]').first();

  activeRoute = "/login:validation";
  await runLoginScenario({
    verify: async (authPage) => {
      const loginForm = getLoginForm(authPage);
      const submitButton = getSubmitButton(loginForm);
      await submitButton.click();
      await waitForPageApp(authPage);

      const bodyText = await authPage.evaluate(() => document.body.innerText.replace(/\s+/g, " ").trim());
      if (!bodyText.includes("请输入账号")) {
        pushError("login-flow", "expected empty submit to show identifier validation");
      }
      if (!bodyText.includes("请输入密码")) {
        pushError("login-flow", "expected empty submit to show password validation");
      }
    },
  });

  activeRoute = "/login:quick-fill";
  await runLoginScenario({
    verify: async (authPage) => {
      const loginForm = getLoginForm(authPage);
      const identifierInput = getIdentifierInput(loginForm);
      const passwordInput = getPasswordInput(loginForm);
      const quickFillCases = [
        { label: /内部员工/, identifier: "employee" },
        { label: /部门总监/, identifier: "director" },
        { label: /开发维护/, identifier: "developer" },
      ];

      for (const quickFillCase of quickFillCases) {
        const quickFillButton = authPage.getByRole("button", { name: quickFillCase.label });
        if ((await quickFillButton.count()) === 0) {
          pushError("login-flow", `expected login page to expose quick-fill card ${quickFillCase.identifier}`);
          return;
        }

        await quickFillButton.click();
        await authPage.waitForTimeout(150);

        const hash = currentHashForPage(authPage);

        if ((await identifierInput.inputValue()) !== quickFillCase.identifier) {
          pushError("login-flow", `expected ${quickFillCase.identifier} quick-fill to populate identifier`);
        }

        if ((await passwordInput.inputValue()) !== FIXED_PASSWORD) {
          pushError("login-flow", `expected ${quickFillCase.identifier} quick-fill to populate password`);
        }

        if (hash !== hashForRoute("/login")) {
          pushError("login-flow", `expected quick-fill to stay on /login before submit, got ${hash}`);
        }
      }
    },
  });

  activeRoute = "/login:trimmed-submit";
  await runLoginScenario({
    verify: async (authPage) => {
      const loginForm = getLoginForm(authPage);
      const identifierInput = getIdentifierInput(loginForm);
      const passwordInput = getPasswordInput(loginForm);
      const submitButton = getSubmitButton(loginForm);

      await identifierInput.fill(" employee ");
      await passwordInput.fill(` ${FIXED_PASSWORD} `);
      await submitButton.click();
      await waitForPageApp(authPage);

      const hash = currentHashForPage(authPage);
      if (hash !== hashForRoute("/workspace/dashboard")) {
        pushError("login-flow", `expected trimmed employee credentials to land on dashboard, got ${hash}`);
      }
    },
  });

  activeRoute = "/login:wrong-password";
  await runLoginScenario({
    verify: async (authPage) => {
      const loginForm = getLoginForm(authPage);
      const identifierInput = getIdentifierInput(loginForm);
      const passwordInput = getPasswordInput(loginForm);
      const submitButton = getSubmitButton(loginForm);

      await identifierInput.fill("employee");
      await passwordInput.fill("bad-password");
      await submitButton.click();
      await waitForPageApp(authPage);

      const bodyText = await authPage.evaluate(() => document.body.innerText.replace(/\s+/g, " ").trim());
      if (!bodyText.includes("账号或密码错误")) {
        pushError("login-flow", "expected wrong password submit to show API error");
      }
      if (currentHashForPage(authPage) !== hashForRoute("/login")) {
        pushError("login-flow", `expected wrong password submit to stay on /login, got ${currentHashForPage(authPage)}`);
      }
    },
  });

  activeRoute = "/login:redirect-away";
  await runLoginScenario({
    persistedRole: "employee",
    verify: async (authPage) => {
      const hash = currentHashForPage(authPage);
      if (hash !== hashForRoute("/workspace/dashboard")) {
        pushError("login-flow", `expected authenticated employee revisiting /login to redirect to dashboard, got ${hash}`);
      }
    },
  });

  activeRoute = "/login:logout";
  await runLoginScenario({
    persistedRole: "employee",
    route: "/workspace/dashboard",
    verify: async (authPage) => {
      const logoutButton = authPage.getByRole("button", { name: "Log Out" });
      if ((await logoutButton.count()) === 0) {
        pushError("login-flow", "expected workspace shell to expose logout button");
        return;
      }

      await logoutButton.click();
      await waitForPageApp(authPage);

      const hash = currentHashForPage(authPage);
      const storedValue = await authPage.evaluate((storageKey) => window.localStorage.getItem(storageKey), SESSION_STORAGE_KEY);
      if (hash !== hashForRoute("/login")) {
        pushError("login-flow", `expected logout to return to /login, got ${hash}`);
      }
      if (storedValue !== null) {
        pushError("login-flow", `expected logout to clear persisted auth session, got ${JSON.stringify(storedValue)}`);
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
  await verifyWorkspaceProductsModule();
  await verifyLoginPageFlow();

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
