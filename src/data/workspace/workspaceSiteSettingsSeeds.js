const workspaceSiteSettingsSeeds = {
  id: "site-settings",
  brand: {
    name: "GLINT RISE",
    cnName: "光速上升",
    entryEyebrow: "灵感档案馆",
  },
  navigation: {
    items: [
      { path: "/home", label: "首页" },
      { path: "/products", label: "产品" },
      { path: "/cases", label: "案例总览" },
      { path: "/case-timeline", label: "项目时间轴" },
      { path: "/search", label: "搜索" },
    ],
    searchPlaceholder: "搜索产品名称",
  },
  footer: {
    description: "光速上升是一套用于品牌案例与产品策展展示的前端体验系统，强调结构感、材质感与信息节奏。",
    links: ["隐私政策", "服务条款", "合规说明", "无障碍说明"],
  },
  homeHero: {
    eyebrow: "策展型品牌前端",
    description: "保留品牌优先、搜索在前、案例与热门产品并行展示的首页结构，同时让后台已发布产品可以直接驱动首页推荐与搜索入口。",
  },
  updatedAt: "2026-03-24T00:00:00.000Z",
};

export default workspaceSiteSettingsSeeds;
