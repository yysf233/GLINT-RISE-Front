export const brand = {
  name: "GLINT RISE",
  cnName: "光速上升",
  entryEyebrow: "工业演示内容中枢",
};

export const navItems = [
  { path: "/home", label: "首页" },
  { path: "/products", label: "产品" },
  { path: "/cases", label: "案例总览" },
  { path: "/case-timeline", label: "项目时间轴" },
  { path: "/search", label: "搜索" },
];

export const footerLinks = ["隐私政策", "服务条款", "合规说明", "无障碍声明"];

export const industryOptions = ["全部行业", "智能制造", "企业服务", "新消费品牌", "空间展陈", "零售连锁"];
export const searchCategoryOptions = ["全部分类", "品牌联名", "技术研究", "空间系统", "企业案例"];
export const subTagOptions = ["全部标签", "全案策划", "品牌升级", "视觉系统", "技术发布", "包装", "活动", "私域流量"];
export const productSearchCategoryOptions = ["全部产品", "旗舰方案", "企业中枢", "空间系统", "热门精选"];
export const productSearchCategoryMap = {
  "lumina-arc": "旗舰方案",
  "product-a": "企业中枢",
  "product-b": "空间系统",
  "hot-01": "热门精选",
  "hot-02": "热门精选",
  "hot-03": "热门精选",
  "hot-04": "热门精选",
  "hot-05": "热门精选",
  "hot-06": "热门精选",
};

const DEFAULT_PRODUCT_NAV = [
  { id: "product-overview", label: "产品概览" },
  { id: "product-specs", label: "商品参数" },
  { id: "product-supply", label: "供应形态" },
  { id: "product-packaging", label: "包装形式" },
  { id: "product-support", label: "企业支持" },
];

const DEFAULT_PRODUCT_CAPABILITIES = [
  { icon: "cpu", label: "算力调度", value: "跨场景稳定分配" },
  { icon: "shield", label: "安全隔离", value: "核心链路分层保护" },
  { icon: "scan", label: "热域监测", value: "实时校准温控策略" },
  { icon: "tooling", label: "模组维护", value: "面向企业长期迭代" },
  { icon: "package", label: "封装一致性", value: "适配量产交付规范" },
  { icon: "logistics", label: "部署运输", value: "支持整批次发货" },
];

const DEFAULT_PRODUCT_DETAIL = {
  headerTabs: ["产品", "解决方案", "技术支持", "企业采购"],
  eyebrow: "企业级工业核心",
  nav: DEFAULT_PRODUCT_NAV,
  primaryActionLabel: "立即配置",
  secondaryActionLabel: "下载资料",
  capabilityItems: DEFAULT_PRODUCT_CAPABILITIES,
  specTableBadge: "技术细节",
  tooling: {
    title: "模具信息",
    summary: "适配高一致性量产工艺与企业级交付节奏。",
    cards: [
      { label: "模具费用", value: "¥45,000.00" },
      { label: "标准交期", value: "21 天" },
    ],
  },
  stock: {
    title: "现货形式",
    moq: "10 套",
    leadTime: "3-5 个工作日",
    tiers: [
      { range: "10 - 49 套", value: "¥18,900 / 套" },
      { range: "50 - 199 套", value: "¥16,500 / 套" },
      { range: "200+ 套", value: "¥14,200 / 套" },
    ],
  },
  custom: {
    title: "定制形式",
    range: "激光雕刻、时钟校准、封装组件",
    minimum: "500 套",
    leadTime: "45-60 天",
    basePrice: "¥12,400 / 套起",
  },
  packaging: {
    title: "包装形式",
    summary: "采用企业级托盘与防静电缓冲层，支持整机封签、恒温运输和项目交付资料联装。",
    bullets: ["防静电保护", "密封流转", "恒温控制"],
  },
  documents: [
    { icon: "document", title: "产品手册.pdf", caption: "部署与维护说明" },
    { icon: "shield", title: "合规证书.pdf", caption: "材料与安全说明" },
    { icon: "boxes", title: "封装模型.step", caption: "装配结构参考" },
  ],
  supportLinks: ["部署门户", "接口对接指南", "固件更新说明"],
  sales: {
    title: "企业采购",
    summary: "支持批量采购、项目排产与物流协同，适合企业级长期部署计划。",
    email: "solutions@glint-rise.com",
  },
};

function createIndustrialArtwork({ title, subtitle, accent, tone, label = "GLINT RISE", variant = "hero" }) {
  const width = variant === "thumb" ? 560 : 1200;
  const height = variant === "thumb" ? 760 : 900;
  const titleSize = variant === "thumb" ? 56 : 90;
  const subtitleSize = variant === "thumb" ? 28 : 34;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${tone}" />
          <stop offset="100%" stop-color="#090a0d" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="18%" r="72%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.34" />
          <stop offset="100%" stop-color="${accent}" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)" />
      <rect x="30" y="30" width="${width - 60}" height="${height - 60}" rx="36" fill="none" stroke="${accent}" stroke-opacity="0.14" />
      <circle cx="${width * 0.78}" cy="${height * 0.2}" r="${Math.min(width, height) * 0.22}" fill="url(#glow)" />
      <circle cx="${width * 0.2}" cy="${height * 0.74}" r="${Math.min(width, height) * 0.2}" fill="${accent}" fill-opacity="0.09" />
      <g opacity="0.18" fill="none" stroke="${accent}">
        <path d="M120 110h180M120 146h116M120 182h220M120 218h150" stroke-width="2" />
        <path d="M${width - 320} ${height - 160}h160M${width - 320} ${height - 126}h104M${width - 320} ${height - 92}h196" stroke-width="2" />
      </g>
      <text x="64" y="104" fill="${accent}" fill-opacity="0.72" font-size="32" font-family="Arial, 'Microsoft YaHei', sans-serif" letter-spacing="6">${label}</text>
      <text x="64" y="${height * 0.55}" fill="#ffffff" font-size="${titleSize}" font-weight="700" font-family="Arial, 'Microsoft YaHei', sans-serif">${title}</text>
      <text x="64" y="${height * 0.55 + subtitleSize + 18}" fill="#d9ddeb" font-size="${subtitleSize}" font-family="Arial, 'Microsoft YaHei', sans-serif">${subtitle}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function createVisualSet(title, subtitle, accent, tone) {
  return {
    hero: createIndustrialArtwork({ title, subtitle, accent, tone, variant: "hero" }),
    thumbs: [
      createIndustrialArtwork({ title, subtitle: `${subtitle} · A`, accent, tone, variant: "thumb" }),
      createIndustrialArtwork({ title, subtitle: `${subtitle} · B`, accent: `${accent}`, tone: "#101114", variant: "thumb" }),
      createIndustrialArtwork({ title, subtitle: `${subtitle} · C`, accent: `${accent}`, tone: "#121317", variant: "thumb" }),
      createIndustrialArtwork({ title, subtitle: `${subtitle} · D`, accent: `${accent}`, tone: "#0f1114", variant: "thumb" }),
    ],
  };
}

function buildProductDetail(overrides = {}) {
  return {
    ...DEFAULT_PRODUCT_DETAIL,
    ...overrides,
    nav: overrides.nav ?? DEFAULT_PRODUCT_DETAIL.nav,
    capabilityItems: overrides.capabilityItems ?? DEFAULT_PRODUCT_DETAIL.capabilityItems,
    specTableRows:
      overrides.specTableRows ??
      [
        { label: "产品编号", value: overrides.sku ?? "—" },
        { label: "品牌", value: overrides.brand ?? brand.name },
        { label: "价格区间", value: overrides.priceRange ?? "—" },
        { label: "峰值频率", value: overrides.capacity ?? "—" },
        { label: "热设计功耗", value: overrides.tdp ?? "—" },
        { label: "核心 / 线程", value: overrides.coreCount ?? "—" },
      ],
    tooling: overrides.tooling ?? DEFAULT_PRODUCT_DETAIL.tooling,
    stock: overrides.stock ?? DEFAULT_PRODUCT_DETAIL.stock,
    custom: overrides.custom ?? DEFAULT_PRODUCT_DETAIL.custom,
    packaging: overrides.packaging ?? DEFAULT_PRODUCT_DETAIL.packaging,
    documents: overrides.documents ?? DEFAULT_PRODUCT_DETAIL.documents,
    supportLinks: overrides.supportLinks ?? DEFAULT_PRODUCT_DETAIL.supportLinks,
    sales: overrides.sales ?? DEFAULT_PRODUCT_DETAIL.sales,
  };
}

function buildCaseDetail(overrides = {}) {
  return {
    heroTitle: overrides.heroTitle ?? overrides.title ?? "",
    heroSubtitle: overrides.heroSubtitle ?? "面向企业级品牌与空间项目的统一案例模板。",
    nav:
      overrides.nav ??
      [
        { id: "case-overview", label: "项目概览" },
        { id: "case-scope", label: "服务范围" },
        { id: "case-stage", label: "执行节点" },
        { id: "case-deliverables", label: "交付成果" },
        { id: "case-results", label: "结果数据" },
      ],
    overview: overrides.overview ?? [
      { label: "项目类型", value: "联合案例" },
      { label: "交付方式", value: "策略 / 视觉 / 空间 / 数字化" },
      { label: "周期", value: "10-14 周" },
    ],
    scope: overrides.scope ?? [
      "品牌诊断",
      "空间叙事",
      "视觉系统",
      "内容资产",
    ],
    stages:
      overrides.stages ??
      [
        { label: "调研与诊断", value: "2 周" },
        { label: "方案与打样", value: "4 周" },
        { label: "联调与发布", value: "3 周" },
      ],
    deliverables:
      overrides.deliverables ??
      [
        { title: "主视觉系统", caption: "统一用于首页与案例页" },
        { title: "空间物料", caption: "适配展陈与路演" },
        { title: "传播资产", caption: "适配公开分享与销售支持" },
      ],
    results:
      overrides.results ??
      [
        { label: "到达率", value: "+42%" },
        { label: "线索转化", value: "+18%" },
        { label: "传播一致性", value: "显著提升" },
      ],
    support:
      overrides.support ?? {
        title: "后续支持",
        summary: "支持二次迭代、方案复盘与销售材料联动更新。",
        email: "cases@glint-rise.com",
      },
  };
}

const luminaArcMedia = createVisualSet("光弧主机", "旗舰展陈中枢", "#c6cdfd", "#111317");
const smartHubMedia = createVisualSet("智能中枢", "企业协同控制", "#8fd3ff", "#101216");
const interfaceNeoMedia = createVisualSet("沉浸界面", "空间交互系统", "#e9c5ff", "#121218");
const acousticVoidMedia = createVisualSet("静域声舱", "声学体验模块", "#b7f3d1", "#0f1214");
const chronosShiftMedia = createVisualSet("时序控制器", "精密协同单元", "#ffd0a7", "#111318");
const formaSeatMedia = createVisualSet("结构座椅 Z", "展陈支撑组件", "#f2d6ff", "#131318");
const nexusKeysMedia = createVisualSet("触感键盘 V2", "效率输入终端", "#a9c1ff", "#101216");
const opticalCoreMedia = createVisualSet("光学核心 X", "成像采集模块", "#ffd6c9", "#111217");
const umbraShadeMedia = createVisualSet("遮光组件 09", "全天候防护", "#c8d0ff", "#111218");

const bosidengAerospaceMedia = createVisualSet("波司登 × 航天", "极境防护联名", "#c6cdfd", "#111317");
const enterpriseDataSynergyMedia = createVisualSet("企业数据协同", "实时中枢演示", "#8fd3ff", "#101216");
const quantumSecurityProtocolMedia = createVisualSet("量子安全协议", "安全体系发布", "#e9c5ff", "#121218");
const teaBrandCrossoverMedia = createVisualSet("喜茶 × 艺术家", "新中式商业平衡", "#b7f3d1", "#0f1214");

export const cases = [
  {
    id: "bosideng-aerospace",
    title: "波司登 × 航天：极境防护联名展陈",
    eyebrow: "联名案例",
    category: "联名案例",
    industry: "智能制造",
    subTags: ["联名", "空间系统", "视觉系统"],
    year: "2024",
    timelineLabel: "2024.Q4",
    timelineOrder: 202404,
    summary: "以航天极境为视觉母题，将保暖科技、品牌故事与展陈空间统一到同一条传播叙事链。",
    short: "围绕航天语义完成高识别度的跨界联名展陈。",
    ...bosidengAerospaceMedia,
    detail: buildCaseDetail({
      title: "波司登 × 航天：极境防护联名展陈",
      heroSubtitle: "围绕航天极境与保暖科技展开的一体化联名案例。",
      overview: [
        { label: "项目类型", value: "联名案例" },
        { label: "落地场景", value: "品牌馆 / 路演 / 发布会" },
        { label: "核心目标", value: "建立高识别度的联名叙事" },
      ],
      scope: ["品牌策略", "空间视觉", "传播资产", "导览内容"],
      stages: [
        { label: "策略定调", value: "2 周" },
        { label: "视觉打样", value: "4 周" },
        { label: "空间联调", value: "3 周" },
      ],
      deliverables: [
        { title: "联名主视觉", caption: "用于公开发布与全渠道传播" },
        { title: "空间导视", caption: "用于展陈与巡展落地" },
        { title: "传播素材", caption: "用于销售与媒体支持" },
      ],
      results: [
        { label: "品牌辨识度", value: "显著提升" },
        { label: "传播周期", value: "连续 8 周" },
        { label: "客户反馈", value: "高频正向" },
      ],
    }),
  },
  {
    id: "enterprise-data-synergy",
    title: "企业数据协同中枢",
    eyebrow: "技术研究",
    category: "技术案例",
    industry: "企业服务",
    subTags: ["全案策划", "私域流量"],
    year: "2024",
    timelineLabel: "2024.Q3",
    timelineOrder: 202403,
    summary: "通过统一数据中台、知识检索和业务仪表板，重构多区域协作的内容分发路径。",
    short: "面向全球业务协同的中台型案例。",
    ...enterpriseDataSynergyMedia,
    detail: buildCaseDetail({
      title: "企业数据协同中枢",
      heroSubtitle: "以数据中台驱动的业务协同与内容分发案例。",
      overview: [
        { label: "项目类型", value: "技术案例" },
        { label: "落地场景", value: "总部中台 / 区域协同" },
        { label: "核心目标", value: "统一业务与内容口径" },
      ],
      scope: ["数据治理", "知识检索", "运营看板", "销售支持"],
      stages: [
        { label: "梳理口径", value: "2 周" },
        { label: "搭建中台", value: "4 周" },
        { label: "联调上线", value: "3 周" },
      ],
      deliverables: [
        { title: "中台首页", caption: "统一承载业务指令与内容分发" },
        { title: "运营看板", caption: "追踪线索与内容效果" },
        { title: "知识库", caption: "支撑销售与客服协作" },
      ],
      results: [
        { label: "检索效率", value: "+36%" },
        { label: "协同效率", value: "+24%" },
        { label: "内容复用", value: "大幅提升" },
      ],
    }),
  },
  {
    id: "quantum-security-protocol",
    title: "量子安防网络",
    eyebrow: "安全案例",
    category: "研究案例",
    industry: "智能制造",
    subTags: ["品牌升级", "视觉系统"],
    year: "2024",
    timelineLabel: "2024.Q2",
    timelineOrder: 202402,
    summary: "从品牌识别到结构化演示，构建兼具可信度与秩序感的安全产品发布模板。",
    short: "围绕量子安防体系建立统一的视觉与叙事框架。",
    ...quantumSecurityProtocolMedia,
    detail: buildCaseDetail({
      title: "量子安防网络",
      heroSubtitle: "面向安全产品发布的统一案例结构。",
      overview: [
        { label: "项目类型", value: "安全案例" },
        { label: "落地场景", value: "产品发布 / 方案汇报" },
        { label: "核心目标", value: "建立可信的量子安防表达" },
      ],
      scope: ["品牌识别", "信息架构", "发布动线", "技术叙事"],
      stages: [
        { label: "信息梳理", value: "2 周" },
        { label: "视觉设计", value: "3 周" },
        { label: "上线发布", value: "2 周" },
      ],
      deliverables: [
        { title: "发布主视觉", caption: "适配官网与演示屏" },
        { title: "技术说明板", caption: "用于展陈与销售支持" },
        { title: "安防故事线", caption: "用于路演与媒体沟通" },
      ],
      results: [
        { label: "信任感", value: "明显增强" },
        { label: "停留时长", value: "+21%" },
        { label: "转化表现", value: "稳步提升" },
      ],
    }),
  },
  {
    id: "tea-brand-crossover",
    title: "喜茶 × 艺术家：新中式商业平衡",
    eyebrow: "联名案例",
    category: "联名案例",
    industry: "新消费品牌",
    subTags: ["联名", "包装", "视觉系统"],
    year: "2024.Q1",
    timelineLabel: "2024.Q1",
    timelineOrder: 202401,
    summary: "围绕联名包装、品牌语义和零售触点，形成一套兼具审美与商业转化的观察样本。",
    short: "从包装到门店触点的一体化联名样本。",
    ...teaBrandCrossoverMedia,
    detail: buildCaseDetail({
      title: "喜茶 × 艺术家：新中式商业平衡",
      heroSubtitle: "围绕包装与零售触点构建的一体化联名案例。",
      overview: [
        { label: "项目类型", value: "联名案例" },
        { label: "落地场景", value: "包装 / 门店 / 活动" },
        { label: "核心目标", value: "提升产品溢价与传播效率" },
      ],
      scope: ["联名策略", "包装设计", "零售物料", "社交传播"],
      stages: [
        { label: "洞察研究", value: "1 周" },
        { label: "包装打样", value: "3 周" },
        { label: "门店铺设", value: "2 周" },
      ],
      deliverables: [
        { title: "联名包装", caption: "兼顾售卖与传播" },
        { title: "门店物料", caption: "提升首屏识别度" },
        { title: "活动资产", caption: "支撑社交平台扩散" },
      ],
      results: [
        { label: "社交声量", value: "+33%" },
        { label: "复购意愿", value: "提升明显" },
        { label: "联名一致性", value: "稳定" },
      ],
    }),
  },
];

export const caseMapNodes = [
  { id: "hub", label: "案例中枢", x: 50, y: 46, featured: false },
  { id: "entry", label: "品牌入口", x: 22, y: 27, featured: false },
  { id: "bosideng-aerospace", label: "波司登 × 航天", x: 53, y: 66, featured: true },
  { id: "enterprise-data-synergy", label: "企业数据协同", x: 78, y: 28, featured: false },
  { id: "quantum-security-protocol", label: "量子安防网络", x: 81, y: 54, featured: false },
  { id: "tea-brand-crossover", label: "喜茶联名", x: 20, y: 66, featured: false },
];

export const caseMapLines = [
  ["entry", "hub"],
  ["hub", "bosideng-aerospace"],
  ["hub", "enterprise-data-synergy"],
  ["hub", "quantum-security-protocol"],
  ["hub", "tea-brand-crossover"],
];

export const products = [
  {
    id: "lumina-arc",
    name: "星穹七号处理器",
    shortName: "星穹七号处理器",
    tag: "旗舰处理器 / 企业核心",
    price: "¥2,499",
    version: "企业旗舰版",
    desc: "面向关键基础设施与工业演示系统的旗舰处理器模组，强调稳定算力、热效率与统一部署能力。",
    hero: luminaArcMedia.hero,
    thumbs: luminaArcMedia.thumbs,
    meta: [
      ["材质体系", "阳极氧化铝 + 低反射玻璃"],
      ["封装规格", "企业级核心封装"],
      ["适配场景", "数据中枢 / 展示控制 / 边缘部署"],
      ["连接方式", "标准化接口与云端控制"],
    ],
    publicMeta: [
      ["材质体系", "阳极氧化铝 + 低反射玻璃"],
      ["封装规格", "企业级核心封装"],
      ["适配场景", "数据中枢 / 展示控制 / 边缘部署"],
      ["连接方式", "标准化接口与云端控制"],
    ],
    detail: buildProductDetail({
      title: "星穹七号处理器",
      subtitle: "面向关键基础设施与工业中枢的旗舰处理器模组。",
      sku: "GR-S7-9900X",
      brand: "GLINT RISE",
      priceRange: "¥12,400 - ¥18,900",
      capacity: "5.4 GHz 稳态调度",
      tdp: "170W",
      coreCount: "16 / 32",
      size: "45mm × 45mm × 4.2mm",
      material: "单晶硅复合基板",
      tooling: {
        title: "模具信息",
        summary: "适配高一致性量产工艺与企业级交付节奏。",
        cards: [
          { label: "模具费用", value: "¥45,000.00" },
          { label: "标准交期", value: "21 天" },
        ],
      },
      stock: {
        title: "现采形式",
        moq: "10 套",
        leadTime: "3-5 个工作日",
        tiers: [
          { range: "10 - 49 套", value: "¥18,900 / 套" },
          { range: "50 - 199 套", value: "¥16,500 / 套" },
          { range: "200+ 套", value: "¥14,200 / 套" },
        ],
      },
      custom: {
        title: "定制形式",
        range: "激光雕刻、时钟校准、封装组件",
        minimum: "500 套",
        leadTime: "45-60 天",
        basePrice: "¥12,400 / 套起",
      },
    }),
  },
  {
    id: "product-a",
    name: "智能中枢",
    shortName: "智能中枢",
    tag: "企业中枢 / V2.0 系列",
    price: "¥1,580",
    version: "2024 典藏系列",
    desc: "核心中枢采用高性能神经元处理架构，适合企业级空间设备联动与快速响应。",
    hero: smartHubMedia.hero,
    thumbs: smartHubMedia.thumbs,
    meta: [
      ["系列", "2024 典藏系列"],
      ["能力", "神经处理架构"],
      ["适用场景", "企业空间中枢"],
    ],
    publicMeta: [
      ["系列", "2024 典藏系列"],
      ["能力", "神经处理架构"],
      ["适用场景", "企业空间中枢"],
    ],
    detail: buildProductDetail({
      title: "智能中枢",
      subtitle: "企业协同控制与多设备联动终端。",
      sku: "GR-HUB-7200",
      brand: "GLINT RISE",
      priceRange: "¥1,580 - ¥2,280",
      capacity: "4.8 GHz 稳态调度",
      tdp: "120W",
      coreCount: "12 / 24",
      size: "38mm × 38mm × 3.8mm",
      material: "磨砂铝合金 + 透光面板",
    }),
  },
  {
    id: "product-b",
    name: "沉浸界面",
    shortName: "沉浸界面",
    tag: "空间系统 / 沉浸交互",
    price: "¥3,260",
    version: "展陈版",
    desc: "沉浸式交互系统打破虚拟与现实边界，用更完整的叙事方式重构感官体验。",
    hero: interfaceNeoMedia.hero,
    thumbs: interfaceNeoMedia.thumbs,
    meta: [
      ["系列", "展陈系列"],
      ["能力", "沉浸式交互"],
      ["适用场景", "空间界面体验"],
    ],
    publicMeta: [
      ["系列", "展陈系列"],
      ["能力", "沉浸式交互"],
      ["适用场景", "空间界面体验"],
    ],
    detail: buildProductDetail({
      title: "沉浸界面",
      subtitle: "空间交互与导览展示的统一终端。",
      sku: "GR-UI-4410",
      brand: "GLINT RISE",
      priceRange: "¥3,260 - ¥4,880",
      capacity: "触感响应 8ms",
      tdp: "95W",
      coreCount: "8 / 16",
      size: "72mm × 72mm × 5.2mm",
      material: "哑光聚碳酸酯 + 防眩层",
    }),
  },
  {
    id: "hot-01",
    name: "静域声舱",
    shortName: "静域声舱",
    tag: "声学系统 / 限量款",
    price: "¥4,299",
    version: "新上市",
    desc: "分布式算力节点支持高负载 AI 处理与数据流优化，适合展陈与试音双重场景。",
    hero: acousticVoidMedia.hero,
    thumbs: acousticVoidMedia.thumbs,
    meta: [
      ["版本", "新上市"],
      ["类别", "声学系统"],
      ["专题", "热门精选"],
    ],
    publicMeta: [
      ["版本", "新上市"],
      ["类别", "声学系统"],
      ["专题", "热门精选"],
    ],
    detail: buildProductDetail({
      title: "静域声舱",
      subtitle: "面向展陈与试音的声学控制单元。",
      sku: "GR-AUD-010",
      brand: "GLINT RISE",
      priceRange: "¥4,299 - ¥5,600",
      capacity: "声场校准 99dB",
      tdp: "88W",
      coreCount: "6 / 12",
      size: "900mm × 900mm × 1200mm",
      material: "吸音纤维板 + 金属骨架",
    }),
  },
  {
    id: "hot-02",
    name: "时序控制器",
    shortName: "时序控制器",
    tag: "精密计时 / 工业艺术",
    price: "¥8,800",
    version: "限时策展",
    desc: "云端工作站与精密计时装置结合，面向创意工作室和展陈场景提供无感协同体验。",
    hero: chronosShiftMedia.hero,
    thumbs: chronosShiftMedia.thumbs,
    meta: [
      ["版本", "限时策展"],
      ["类别", "计时系统"],
      ["专题", "热门精选"],
    ],
    publicMeta: [
      ["版本", "限时策展"],
      ["类别", "计时系统"],
      ["专题", "热门精选"],
    ],
    detail: buildProductDetail({
      title: "时序控制器",
      subtitle: "适配工业节拍与展陈节奏的精密模块。",
      sku: "GR-CLK-240",
      brand: "GLINT RISE",
      priceRange: "¥8,800 - ¥12,200",
      capacity: "高精度同步",
      tdp: "65W",
      coreCount: "4 / 8",
      size: "120mm × 88mm × 44mm",
      material: "拉丝铝合金 + 黑晶面板",
    }),
  },
  {
    id: "hot-03",
    name: "结构座椅 Z",
    shortName: "结构座椅 Z",
    tag: "空间系统 / 结构原型",
    price: "¥12,400",
    version: "精选样机",
    desc: "通过极简结构和高强度材料实现舒适与稳定的平衡，适合展厅与会议空间双场景使用。",
    hero: formaSeatMedia.hero,
    thumbs: formaSeatMedia.thumbs,
    meta: [
      ["版本", "精选样机"],
      ["类别", "空间系统"],
      ["专题", "热门精选"],
    ],
    publicMeta: [
      ["版本", "精选样机"],
      ["类别", "空间系统"],
      ["专题", "热门精选"],
    ],
    detail: buildProductDetail({
      title: "结构座椅 Z",
      subtitle: "用于展厅与会议空间的结构化陈列单元。",
      sku: "GR-FRM-320",
      brand: "GLINT RISE",
      priceRange: "¥12,400 - ¥18,900",
      capacity: "承重 180kg",
      tdp: "—",
      coreCount: "—",
      size: "720mm × 680mm × 820mm",
      material: "高密度复合木 + 防污织物",
    }),
  },
  {
    id: "hot-04",
    name: "触感键盘 V2",
    shortName: "触感键盘 V2",
    tag: "效率工具 / 触感工艺",
    price: "¥2,199",
    version: "热门款",
    desc: "企业级输入设备强调触感反馈和低延迟交互，适合高频创作与内容编排场景。",
    hero: nexusKeysMedia.hero,
    thumbs: nexusKeysMedia.thumbs,
    meta: [
      ["版本", "热门款"],
      ["类别", "效率工具"],
      ["专题", "热门精选"],
    ],
    publicMeta: [
      ["版本", "热门款"],
      ["类别", "效率工具"],
      ["专题", "热门精选"],
    ],
    detail: buildProductDetail({
      title: "触感键盘 V2",
      subtitle: "为创作与编排场景优化的输入终端。",
      sku: "GR-KEY-220",
      brand: "GLINT RISE",
      priceRange: "¥2,199 - ¥3,280",
      capacity: "8K 扫描率",
      tdp: "20W",
      coreCount: "—",
      size: "460mm × 145mm × 32mm",
      material: "阳极氧化铝 + PBT 键帽",
    }),
  },
  {
    id: "hot-05",
    name: "光学核心 X",
    shortName: "光学核心 X",
    tag: "成像采集 / 经典复刻",
    price: "¥15,600",
    version: "策展款",
    desc: "高性能边缘计算模块面向大规模物联部署，强调稳定的数据采集与成像能力。",
    hero: opticalCoreMedia.hero,
    thumbs: opticalCoreMedia.thumbs,
    meta: [
      ["版本", "策展款"],
      ["类别", "成像系统"],
      ["专题", "热门精选"],
    ],
    publicMeta: [
      ["版本", "策展款"],
      ["类别", "成像系统"],
      ["专题", "热门精选"],
    ],
    detail: buildProductDetail({
      title: "光学核心 X",
      subtitle: "面向采集与成像的高性能模块。",
      sku: "GR-OPT-960",
      brand: "GLINT RISE",
      priceRange: "¥15,600 - ¥19,800",
      capacity: "120fps 采集",
      tdp: "140W",
      coreCount: "14 / 28",
      size: "110mm × 110mm × 28mm",
      material: "精密铝合金 + 低反射镜片",
    }),
  },
  {
    id: "hot-06",
    name: "遮光组件 09",
    shortName: "遮光组件 09",
    tag: "穿戴配件 / 防护系列",
    price: "¥1,850",
    version: "热销单品",
    desc: "自适应光学传感套件精确捕捉环境变化，以更稳定的材质控制实现全天候佩戴体验。",
    hero: umbraShadeMedia.hero,
    thumbs: umbraShadeMedia.thumbs,
    meta: [
      ["版本", "热销单品"],
      ["类别", "穿戴配件"],
      ["专题", "热门精选"],
    ],
    publicMeta: [
      ["版本", "热销单品"],
      ["类别", "穿戴配件"],
      ["专题", "热门精选"],
    ],
    detail: buildProductDetail({
      title: "遮光组件 09",
      subtitle: "全天候光学防护与穿戴适配模块。",
      sku: "GR-SHD-009",
      brand: "GLINT RISE",
      priceRange: "¥1,850 - ¥2,460",
      capacity: "全天候适配",
      tdp: "18W",
      coreCount: "—",
      size: "155mm × 145mm × 58mm",
      material: "轻量合金 + 防眩镜片",
    }),
  },
];

export const productSearchTagOptions = [
  "全部标签",
  ...new Set(
    products.flatMap((item) =>
      String(item.tag ?? "")
        .split("/")
        .map((part) => part.trim())
        .filter(Boolean),
    ),
  ),
];
