import React from "react";
import { App, Alert, Button, Form, Input, List, Space, Tag, Typography } from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { AdminFormSection } from "../components/workspace/admin/AdminFormSection";
import { AdminPageHeader } from "../components/workspace/admin/AdminPageHeader";
import { AdminResultState } from "../components/workspace/admin/AdminResultState";
import { AdminStatsRow } from "../components/workspace/admin/AdminStatsRow";
import { WorkspaceShell } from "../components/workspace/WorkspaceShell";
import { useAuth } from "../context/useAuth";
import workspaceContentApi from "../services/workspace/workspaceContentApi";
import { showAppMessage } from "../utils/safeAppMessage";

const { Paragraph, Text, Title } = Typography;

function formatDate(value) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function mapSettingsToForm(settings) {
  return {
    brand: {
      name: settings?.brand?.name ?? "",
      cnName: settings?.brand?.cnName ?? "",
    },
    homeHero: {
      eyebrow: settings?.homeHero?.eyebrow ?? "",
      description: settings?.homeHero?.description ?? "",
    },
    navigation: {
      searchPlaceholder: settings?.navigation?.searchPlaceholder ?? "",
    },
    footer: {
      description: settings?.footer?.description ?? "",
    },
  };
}

function buildSettingsPayload(values) {
  return {
    brand: {
      name: String(values?.brand?.name ?? "").trim(),
      cnName: String(values?.brand?.cnName ?? "").trim(),
    },
    homeHero: {
      eyebrow: String(values?.homeHero?.eyebrow ?? "").trim(),
      description: String(values?.homeHero?.description ?? "").trim(),
    },
    navigation: {
      searchPlaceholder: String(values?.navigation?.searchPlaceholder ?? "").trim(),
    },
    footer: {
      description: String(values?.footer?.description ?? "").trim(),
    },
  };
}

function createTagDrafts(items = []) {
  return Object.fromEntries(
    items.map((item) => [item.id, String(item.displayTag ?? item.tag ?? "").trim()]),
  );
}

export function WorkspaceContentPage() {
  const app = App.useApp();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [pageState, setPageState] = React.useState({
    status: "loading",
    settings: null,
    banners: [],
    products: [],
    summary: null,
    error: "",
  });
  const [refreshToken, setRefreshToken] = React.useState(0);
  const [savingSettings, setSavingSettings] = React.useState(false);
  const [busyBannerId, setBusyBannerId] = React.useState("");
  const [busyTagId, setBusyTagId] = React.useState("");
  const [tagDrafts, setTagDrafts] = React.useState({});

  const loadConsole = React.useCallback(() => {
    setPageState((current) => ({
      ...current,
      status: current.summary ? "refreshing" : "loading",
      error: "",
    }));

    workspaceContentApi
      .getWorkspaceContentConsole(user || {})
      .then((result) => {
        if (result?.error) {
          setPageState({
            status: "error",
            settings: null,
            banners: [],
            products: [],
            summary: null,
            error: result.error.message || "内容管理台加载失败。",
          });
          return;
        }

        form.setFieldsValue(mapSettingsToForm(result.settings));
        setTagDrafts(createTagDrafts(result.products));
        setPageState({
          status: "ready",
          settings: result.settings,
          banners: result.banners,
          products: result.products,
          summary: result.summary,
          error: "",
        });
      })
      .catch(() => {
        setPageState({
          status: "error",
          settings: null,
          banners: [],
          products: [],
          summary: null,
          error: "内容管理台加载失败。",
        });
      });
  }, [form, user]);

  React.useEffect(() => {
    loadConsole();
  }, [loadConsole, refreshToken]);

  const handleRefresh = () => {
    setRefreshToken((value) => value + 1);
  };

  const handleSaveSettings = async () => {
    try {
      const values = await form.validateFields();
      setSavingSettings(true);
      const result = await workspaceContentApi.updateWorkspaceContentSettings(buildSettingsPayload(values), user || {});
      if (result?.error) {
        throw new Error(result.error.message || "公开站文案保存失败。");
      }

      showAppMessage(app, "success", "公开站文案已保存。");
      handleRefresh();
    } catch (error) {
      if (error?.errorFields) {
        return;
      }
      showAppMessage(app, "error", error.message || "公开站文案保存失败。");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleMoveBanner = async (index, direction) => {
    const toIndex = direction === "up" ? index - 1 : index + 1;
    const current = pageState.banners[index];
    if (!current) {
      return;
    }

    setBusyBannerId(current.id);
    const result = await workspaceContentApi.reorderWorkspaceContentBanners(index, toIndex, user || {});
    if (result?.error) {
      showAppMessage(app, "error", result.error.message || "轮播排序失败。");
      setBusyBannerId("");
      return;
    }

    showAppMessage(app, "success", "轮播顺序已更新。");
    setBusyBannerId("");
    handleRefresh();
  };

  const handleToggleBanner = async (banner) => {
    if (!banner) return;

    setBusyBannerId(banner.id);
    const nextStatus = banner.status === "online" ? "offline" : "online";
    const result = await workspaceContentApi.setWorkspaceContentBannerStatus(banner.id, nextStatus, user || {});
    if (result?.error) {
      showAppMessage(app, "error", result.error.message || "轮播状态更新失败。");
      setBusyBannerId("");
      return;
    }

    showAppMessage(app, "success", nextStatus === "online" ? "轮播已上线。" : "轮播已下线。");
    setBusyBannerId("");
    handleRefresh();
  };

  const handleSaveTag = async (productId) => {
    setBusyTagId(productId);
    const result = await workspaceContentApi.updateWorkspaceContentProductDisplayTag(productId, tagDrafts[productId], user || {});
    if (result?.error) {
      showAppMessage(app, "error", result.error.message || "公共标签保存失败。");
      setBusyTagId("");
      return;
    }

    showAppMessage(app, "success", "公共标签已保存。");
    setBusyTagId("");
    handleRefresh();
  };

  if (pageState.status === "error") {
    return (
      <WorkspaceShell>
        <AdminResultState status="error" title="内容管理台加载失败" subTitle={pageState.error} />
      </WorkspaceShell>
    );
  }

  const stats = pageState.summary
    ? [
        {
          key: "banners",
          label: "在线轮播",
          value: pageState.summary.onlineBannerCount,
          description: "当前会同步到公开站首页主视觉的在线轮播数量。",
        },
        {
          key: "products",
          label: "已发布产品",
          value: pageState.summary.publishedProductCount,
          description: "当前可驱动公开站概览、搜索和详情页的产品数量。",
        },
        {
          key: "tags",
          label: "公共标签",
          value: pageState.summary.publicTagCount,
          description: "由产品公共展示标签拆分得到的前台筛选标签数量。",
        },
        {
          key: "brand",
          label: "当前品牌",
          value: pageState.summary.brandName || "--",
          description: "公开站头部和首页正在使用的品牌主标识。",
        },
      ]
    : [];

  return (
    <WorkspaceShell>
      <div data-testid="workspace-content-page">
        <Space direction="vertical" size={24} style={{ width: "100%" }}>
          <AdminPageHeader
            eyebrow="系统管理"
            title="内容管理"
            description="开发维护角色在这里统一维护公开站文案、首页轮播和产品公共标签。所有改动保存后都会直接驱动前台展示，不触碰采购和报价敏感数据。"
            extra={
              <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                刷新内容台
              </Button>
            }
          />

          <Alert
            showIcon
            type="info"
            message="开发维护权限边界"
            description="本模块只处理公开站内容，不开放供应商、报价、导出等业务敏感数据。你可以维护文案、轮播和公共标签，但不会获得采购域数据可见性。"
          />

          <AdminStatsRow items={stats} />

          <AdminFormSection
            title="公开站文案配置"
            description="维护品牌名、首页主视觉和搜索占位文案。保存后首页、入口页、导航和页脚会立即读取最新配置。"
            useForm={false}
            extra={
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={savingSettings}
                onClick={handleSaveSettings}
                data-testid="workspace-content-settings-save"
              >
                保存文案
              </Button>
            }
          >
            <Form form={form} layout="vertical">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                <Form.Item label="品牌英文名" name={["brand", "name"]} rules={[{ required: true, message: "请输入品牌英文名" }]}>
                  <Input data-testid="workspace-content-settings-brand-name" />
                </Form.Item>
                <Form.Item label="品牌中文名" name={["brand", "cnName"]} rules={[{ required: true, message: "请输入品牌中文名" }]}>
                  <Input data-testid="workspace-content-settings-brand-cn" />
                </Form.Item>
                <Form.Item label="首页主视觉导语" name={["homeHero", "eyebrow"]} rules={[{ required: true, message: "请输入首页导语" }]}>
                  <Input data-testid="workspace-content-settings-home-eyebrow" />
                </Form.Item>
                <Form.Item label="搜索占位文案" name={["navigation", "searchPlaceholder"]} rules={[{ required: true, message: "请输入搜索占位文案" }]}>
                  <Input data-testid="workspace-content-settings-search-placeholder" />
                </Form.Item>
              </div>
              <Form.Item label="首页主视觉说明" name={["homeHero", "description"]} rules={[{ required: true, message: "请输入首页说明" }]}>
                <Input.TextArea rows={3} data-testid="workspace-content-settings-home-description" />
              </Form.Item>
              <Form.Item label="页脚说明" name={["footer", "description"]} rules={[{ required: true, message: "请输入页脚说明" }]}>
                <Input.TextArea rows={3} data-testid="workspace-content-settings-footer-description" />
              </Form.Item>
            </Form>
          </AdminFormSection>

          <AdminFormSection
            title="首页轮播队列"
            description="在开发维护域快速调整首页轮播的上下线和顺序。这里的改动会直接反映到公开站首页自动轮播。"
            useForm={false}
          >
            <List
              dataSource={pageState.banners}
              renderItem={(item, index) => (
                <List.Item
                  key={item.id}
                  actions={[
                    <Button
                      key="up"
                      icon={<ArrowUpOutlined />}
                      disabled={index === 0 || busyBannerId === item.id}
                      onClick={() => handleMoveBanner(index, "up")}
                      data-testid={`workspace-content-banner-move-up-${item.id}`}
                    >
                      上移
                    </Button>,
                    <Button
                      key="down"
                      icon={<ArrowDownOutlined />}
                      disabled={index === pageState.banners.length - 1 || busyBannerId === item.id}
                      onClick={() => handleMoveBanner(index, "down")}
                      data-testid={`workspace-content-banner-move-down-${item.id}`}
                    >
                      下移
                    </Button>,
                    <Button
                      key="toggle"
                      type={item.status === "online" ? "default" : "primary"}
                      loading={busyBannerId === item.id}
                      onClick={() => handleToggleBanner(item)}
                      data-testid={`workspace-content-banner-toggle-${item.id}`}
                    >
                      {item.status === "online" ? "下线" : "上线"}
                    </Button>,
                  ]}
                >
                  <Space direction="vertical" size={4} style={{ width: "100%" }}>
                    <Space wrap>
                      <Title level={5} style={{ margin: 0 }} data-testid={`workspace-content-banner-title-${item.id}`}>
                        {item.title}
                      </Title>
                      <Tag color={item.status === "online" ? "green" : "default"}>{item.status === "online" ? "在线" : "离线"}</Tag>
                      <Tag color="blue">顺位 {index + 1}</Tag>
                    </Space>
                    <Text type="secondary">跳转路由：{item.target}</Text>
                    <Text type="secondary">最近更新：{formatDate(item.updatedAt)}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </AdminFormSection>

          <AdminFormSection
            title="产品公共标签治理"
            description="这里维护的是公开站展示标签，会直接影响产品卡片、详情页和搜索页标签筛选。每个产品可单独保存，不会改动采购域字段。"
            useForm={false}
          >
            <List
              dataSource={pageState.products}
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  actions={[
                    <Button
                      key="save"
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      loading={busyTagId === item.id}
                      onClick={() => handleSaveTag(item.id)}
                      data-testid={`workspace-content-tag-save-${item.id}`}
                    >
                      保存标签
                    </Button>,
                  ]}
                >
                  <Space direction="vertical" size={8} style={{ width: "100%" }}>
                    <Space wrap>
                      <Title level={5} style={{ margin: 0 }}>{item.name}</Title>
                      <Tag color="blue">{item.category}</Tag>
                      <Tag>{item.status}</Tag>
                    </Space>
                    <Text type="secondary">前台产品路由：`#/product/{item.publicProductId}`</Text>
                    <Input
                      value={tagDrafts[item.id] ?? ""}
                      onChange={(event) =>
                        setTagDrafts((current) => ({
                          ...current,
                          [item.id]: event.target.value,
                        }))
                      }
                      placeholder="例如：可持续科技 / 旗舰系列"
                      data-testid={`workspace-content-tag-input-${item.id}`}
                    />
                    <Paragraph style={{ margin: 0, color: "#64748b" }}>
                      当前展示标签：{item.displayTag || "未配置"}
                    </Paragraph>
                  </Space>
                </List.Item>
              )}
            />
          </AdminFormSection>
        </Space>
      </div>
    </WorkspaceShell>
  );
}

export default WorkspaceContentPage;
