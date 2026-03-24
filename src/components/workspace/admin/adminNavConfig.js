const ALL_GROUPS = [
  {
    label: "工作台",
    items: [{ to: "/workspace/dashboard", label: "仪表盘", roles: ["employee", "director", "developer"] }],
  },
  {
    label: "商品与项目",
    items: [
      { to: "/workspace/products", label: "产品管理", roles: ["employee", "director"] },
      { to: "/workspace/projects", label: "项目管理", roles: ["employee", "director"] },
      { to: "/workspace/content/banners", label: "轮播与推荐", roles: ["employee", "director"] },
    ],
  },
  {
    label: "采购与导出",
    items: [
      { to: "/workspace/suppliers", label: "供应商管理", roles: ["employee", "director"] },
      { to: "/workspace/quotes", label: "询报价流程", roles: ["employee", "director"] },
      { to: "/workspace/exports", label: "导出中心", roles: ["employee", "director"] },
    ],
  },
  {
    label: "系统管理",
    items: [
      { to: "/workspace/content", label: "内容管理", roles: ["developer"] },
      { to: "/workspace/settings/content", label: "站点配置", roles: ["employee", "director"] },
      { to: "/workspace/settings/users", label: "权限与用户", roles: ["employee", "director"] },
      { to: "/workspace/settings/logs", label: "日志与监控", roles: ["employee", "director"] },
    ],
  },
];

export function getAdminNavGroups(role) {
  return ALL_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(role)),
  })).filter((group) => group.items.length > 0);
}

export default getAdminNavGroups;
