# workspace-content

## ADDED Requirements

### Requirement: 内容管理台
系统必须为开发维护角色提供统一的内容管理台，用于管理公开站内容。

#### Scenario: 打开内容管理台
- Given 当前登录角色为开发维护
- When 打开 `#/workspace/content`
- Then 页面应显示文案配置、轮播队列和产品公共标签治理区

### Requirement: 前后台内容同步
系统必须让内容管理台的改动直接驱动前台展示。

#### Scenario: 保存文案后前台同步
- Given 开发维护修改品牌名和首页导语
- When 保存内容
- Then 前台首页应显示最新品牌名和导语

#### Scenario: 调整轮播与标签后前台同步
- Given 开发维护调整轮播顺位并修改产品公共展示标签
- When 保存改动
- Then 前台首页轮播顺位和产品详情页标签应同步更新
