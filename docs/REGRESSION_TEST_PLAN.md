# 全面回归测试方案

## 1. 目标
验证当前已完成的官网前台、业务后台、角色权限、前后台联动、轮播与动效是否满足现阶段 PRD 要求，并为后续日志与监控模块提供稳定基线。

## 2. 执行环境
- 代码分支：`codex/mock-auth-shell`
- 执行日期：`2026-03-25`
- 浏览器基线：本机 Edge/Chrome Headless
- 运行地址：`http://127.0.0.1:4184`

## 3. 执行方式
- 单元测试：Vitest
- 浏览器回归：Playwright 脚本 `scripts/verify-pages.mjs`
- 构建验证：Vite Build
- 结果判定：
  - 成功：标记测试用例成功，功能/模块成功
  - 失败：记录失败原因、影响范围、修复动作、复测结果

## 4. 功能清单与测试用例

### F01 公开站前后台联动
- `TC-SYNC-001` 后台产品修改后，前台 `#/products`、`#/search`、`#/product/:id`、`#/share/product/:id` 同步展示最新内容
- `TC-SYNC-002` 后台站点配置保存后，入口页、首页、顶部导航、页脚同步展示最新文案
- `TC-SYNC-003` 后台轮播配置为在线后，首页主视觉应展示后台轮播标题、图片与跳转目标

### F02 首页轮播与页面动效
- `TC-HERO-001` 首页主视觉默认展示第一条在线轮播
- `TC-HERO-002` 首页主视觉在自动播放周期内应切换到下一条在线轮播
- `TC-HERO-003` 公开站页面切换必须存在统一的进入动效容器，页面切换时不应是硬切

### F03 登录与角色权限
- `TC-AUTH-001` 员工登录成功后进入 `#/workspace/dashboard`
- `TC-AUTH-002` 开发维护角色访问业务后台路由时跳转 `#/workspace/forbidden`
- `TC-AUTH-003` 已登录用户重访 `#/login` 时自动回到其默认工作台

### F04 产品与项目后台
- `TC-BIZ-001` 产品后台支持新建、编辑、导入，保存结果可在列表和详情中回查
- `TC-BIZ-002` 项目后台支持列表、详情、新建、编辑闭环
- `TC-BIZ-003` 产品与项目路由权限符合员工/总监可用、开发维护不可用的限制

### F05 轮播管理
- `TC-BANNER-001` 轮播后台支持列表加载、在线/离线状态切换
- `TC-BANNER-002` 轮播后台支持新建、编辑、图片顺序维护与封面设置
- `TC-BANNER-003` 公开站读取在线轮播时必须保持后台顺序与图片顺序

### F06 供应商与导出中心
- `TC-SUP-001` 员工查看他人私有供应商时必须脱敏
- `TC-SUP-002` 员工只能创建公开版导出，总监可创建带价导出
- `TC-SUP-003` 导出历史支持重复下载，且结果与角色权限一致

### F07 询报价流程
- `TC-QUOTE-001` Step1 导入需求后应生成预览并可应用为询价单
- `TC-QUOTE-002` Step2-4 应完成产品匹配、供应商推荐、报价预览计算
- `TC-QUOTE-003` Step5 应生成标准报价单，并可跳转导出中心完成预填联动

### F08 站点配置
- `TC-SITE-001` 员工和总监可访问站点配置，开发维护不可访问
- `TC-SITE-002` 保存站点配置后公开站文案同步更新
- `TC-SITE-003` 导航与页脚配置保存时应完成去重与持久化

### F09 权限与用户
- `TC-USER-001` 员工可提交自己的权限申请
- `TC-USER-002` 总监可创建用户、编辑用户并审批权限申请
- `TC-USER-003` 被停用账号不能恢复会话

## 5. 执行命令
```bash
npm run test:unit -- src/services/publicSiteContent.test.js src/services/mock/mockWorkspaceBannersService.test.js src/services/mock/mockWorkspaceSuppliersService.test.js src/services/mock/mockWorkspaceExportsService.test.js src/services/mock/mockWorkspaceQuotesService.test.js src/services/mock/mockWorkspaceUsersService.test.js src/services/mock/mockWorkspaceSiteSettingsService.test.js src/utils/workspaceQuoteFlow.test.js src/utils/workspaceQuoteImport.test.js src/utils/workspaceSupplierForm.test.js src/utils/workspaceSupplierImport.test.js src/utils/workspaceProductForm.test.js src/utils/workspaceProjectForm.test.js src/utils/workspaceBannerForm.test.js src/utils/workspaceUserForm.test.js src/utils/authRoutes.test.js src/components/workspace/admin/adminNavConfig.test.js src/services/mockAuthService.test.js
npm run build
npm run verify:routes -- http://127.0.0.1:4184
```
