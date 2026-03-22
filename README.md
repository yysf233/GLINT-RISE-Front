# 光速上升前端

这是一个基于 `Vite + React` 的单页应用项目，当前已按 `HashRouter` 思路组织为 SPA 结构。页面入口、案例、产品、搜索、详情页都通过 hash 路由切换，便于直接访问、刷新和前进后退，不依赖服务端回退配置。

## 启动

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run preview
```

## 项目约定

- 路由采用 `HashRouter`，所有页面以 `#/...` 形式访问。
- 页面文案统一使用中文，只有品牌名 `GLINT RISE`、产品型号名、案例专有名和数据 `id` 允许保留英文。
- 视觉设计值统一从 `src/theme/tokens.js` 读取，后续新增页面必须先引用 tokens，再写结构和样式。
- 共享组件、页面内容、主题 tokens 已拆分到独立目录，避免继续在单个文件中堆叠页面逻辑。

## 目录说明

- `src/App.jsx`：应用入口和路由总装配。
- `src/data/siteContent.js`：品牌、案例、产品、筛选项等内容数据。
- `src/theme/tokens.js`：颜色、圆角、阴影、间距、字号、动效的唯一来源。
- `src/components/`：布局组件与通用组件。
- `docs/design-style-guide.md`：设计风格说明与约束。

## 验收标准

- `npm run build` 必须通过。
- 无头浏览器需要覆盖全部 hash 路由，且页面不能出现控制台报错或运行时异常。
- 新页面必须优先复用 tokens 和共享组件，不能直接散写颜色、圆角和阴影。
