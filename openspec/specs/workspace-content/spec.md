# workspace-content

## Purpose
后台“内容管理”模块面向开发维护角色，统一维护公开站文案、首页轮播队列和产品公共展示标签。

## Requirements

### Requirement: 开发维护内容台
系统必须提供 `#/workspace/content` 内容管理台，并仅允许开发维护侧访问。

#### Scenario: 开发维护访问内容台
- Given 当前登录角色具备 `contentMaintenance` 能力
- When 访问 `#/workspace/content`
- Then 页面应展示公开站文案配置、首页轮播队列和产品公共标签治理区

#### Scenario: 非开发维护访问内容台
- Given 当前登录角色不具备 `contentMaintenance` 能力
- When 调用内容管理服务
- Then 系统应返回 `WORKSPACE_CONTENT_FORBIDDEN`

### Requirement: 文案同步前台
系统必须允许开发维护更新公开站基础文案，并同步到前台页面。

#### Scenario: 更新公开站品牌与首页导语
- Given 当前登录角色为开发维护
- When 保存新的品牌名、首页导语和搜索占位文案
- Then 首页、入口页、导航与页脚应读取更新后的内容

### Requirement: 首页轮播治理
系统必须允许开发维护调整首页轮播的在线状态和顺序。

#### Scenario: 调整轮播上下线和顺位
- Given 当前登录角色为开发维护
- When 将某个轮播上线并调整到更靠前的位置
- Then 公开站首页轮播读取顺序应同步变化

### Requirement: 产品公共标签治理
系统必须允许开发维护更新产品公共展示标签，并同步到前台产品页和搜索标签筛选。

#### Scenario: 修改产品公共展示标签
- Given 当前登录角色为开发维护
- When 保存某个已发布产品的新展示标签
- Then 产品详情页、产品概览和搜索标签选项应读取新的标签内容
