import React from "react";
import { App, Button, Form, Input, Space } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { WorkspaceShell } from "../components/workspace/WorkspaceShell";
import { AdminFormSection } from "../components/workspace/admin/AdminFormSection";
import { AdminPageHeader } from "../components/workspace/admin/AdminPageHeader";
import { AdminResultState } from "../components/workspace/admin/AdminResultState";
import { AdminStatsRow } from "../components/workspace/admin/AdminStatsRow";
import { useAuth } from "../context/useAuth";
import workspaceSiteSettingsApi from "../services/workspace/workspaceSiteSettingsApi";
import { showAppMessage } from "../utils/safeAppMessage";

const NAV_PATH_OPTIONS = [
  "/home",
  "/products",
  "/cases",
  "/case-timeline",
  "/search",
];

function createNavItem(path = "", label = "") {
  return {
    path,
    label,
  };
}

function createFooterLink(label = "") {
  return {
    value: label,
  };
}

function mapSettingsToForm(settings) {
  return {
    brand: {
      name: settings.brand?.name ?? "",
      cnName: settings.brand?.cnName ?? "",
      entryEyebrow: settings.brand?.entryEyebrow ?? "",
    },
    navigation: {
      searchPlaceholder: settings.navigation?.searchPlaceholder ?? "",
      items: (settings.navigation?.items ?? []).map((item) => createNavItem(item.path, item.label)),
    },
    footer: {
      description: settings.footer?.description ?? "",
      links: (settings.footer?.links ?? []).map((item) => createFooterLink(item)),
    },
    homeHero: {
      eyebrow: settings.homeHero?.eyebrow ?? "",
      description: settings.homeHero?.description ?? "",
    },
  };
}

function buildPayload(values) {
  return {
    brand: {
      name: String(values?.brand?.name ?? "").trim(),
      cnName: String(values?.brand?.cnName ?? "").trim(),
      entryEyebrow: String(values?.brand?.entryEyebrow ?? "").trim(),
    },
    navigation: {
      searchPlaceholder: String(values?.navigation?.searchPlaceholder ?? "").trim(),
      items: (values?.navigation?.items ?? [])
        .map((item) => ({
          path: String(item?.path ?? "").trim(),
          label: String(item?.label ?? "").trim(),
        }))
        .filter((item) => item.path && item.label),
    },
    footer: {
      description: String(values?.footer?.description ?? "").trim(),
      links: (values?.footer?.links ?? [])
        .map((item) => String(item?.value ?? "").trim())
        .filter(Boolean),
    },
    homeHero: {
      eyebrow: String(values?.homeHero?.eyebrow ?? "").trim(),
      description: String(values?.homeHero?.description ?? "").trim(),
    },
  };
}

export function WorkspaceSiteSettingsPage() {
  const app = App.useApp();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [pageState, setPageState] = React.useState({
    status: "loading",
    settings: null,
    error: "",
  });
  const [saving, setSaving] = React.useState(false);
  const [refreshToken, setRefreshToken] = React.useState(0);

  React.useEffect(() => {
    let active = true;

    setPageState((current) => ({
      ...current,
      status: current.settings ? "refreshing" : "loading",
      error: "",
    }));

    workspaceSiteSettingsApi
      .getWorkspaceSiteSettings(user || {})
      .then((result) => {
        if (!active) return;
        if (result?.error || !result?.settings) {
          setPageState({
            status: "error",
            settings: null,
            error: result?.error?.message || "站点配置加载失败。",
          });
          return;
        }

        form.setFieldsValue(mapSettingsToForm(result.settings));
        setPageState({
          status: "ready",
          settings: result.settings,
          error: "",
        });
      })
      .catch(() => {
        if (!active) return;
        setPageState({
          status: "error",
          settings: null,
          error: "站点配置加载失败。",
        });
      });

    return () => {
      active = false;
    };
  }, [form, refreshToken, user]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const result = await workspaceSiteSettingsApi.updateWorkspaceSiteSettings(buildPayload(values), user || {});
      if (result?.error || !result?.settings) {
        throw new Error(result?.error?.message || "站点配置保存失败。");
      }

      form.setFieldsValue(mapSettingsToForm(result.settings));
      setPageState({
        status: "ready",
        settings: result.settings,
        error: "",
      });
      showAppMessage(app, "success", "站点配置已保存。");
    } catch (error) {
      if (error?.errorFields) {
        return;
      }
      showAppMessage(app, "error", error.message || "站点配置保存失败。");
    } finally {
      setSaving(false);
    }
  };

  const stats = pageState.settings
    ? [
        {
          key: "nav",
          label: "导航项",
          value: pageState.settings.navigation.items.length,
          description: "当前对外导航的有效项目数量。",
        },
        {
          key: "footer",
          label: "页脚链接",
          value: pageState.settings.footer.links.length,
          description: "当前页脚公开链接数量。",
        },
        {
          key: "brand",
          label: "品牌主标",
          value: pageState.settings.brand.name,
          description: "公开站当前使用的英文品牌名。",
        },
      ]
    : [];

  return (
    <WorkspaceShell>
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        <AdminPageHeader
          eyebrow="系统管理"
          title="站点配置"
          description="统一维护公开站的品牌名、导航、页脚和首页主视觉文案，保存后前台立即读取最新配置。"
          extra={
            <Space wrap>
              <Button icon={<ReloadOutlined />} onClick={() => setRefreshToken((value) => value + 1)}>
                刷新配置
              </Button>
              <Button type="primary" loading={saving} onClick={handleSave} data-testid="workspace-site-settings-save">
                保存配置
              </Button>
            </Space>
          }
        />

        {pageState.status === "error" ? (
          <AdminResultState status="error" title="站点配置加载失败" subTitle={pageState.error} />
        ) : (
          <>
            <AdminStatsRow items={stats} />

            <Form form={form} layout="vertical">
              <Space direction="vertical" size={24} style={{ width: "100%" }}>
                <AdminFormSection title="品牌信息" description="维护顶部品牌名和入口页抬头。" useForm={false}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                    <Form.Item label="英文品牌名" name={["brand", "name"]} rules={[{ required: true, message: "请输入英文品牌名" }]}>
                      <Input data-testid="workspace-site-settings-brand-name" />
                    </Form.Item>
                    <Form.Item label="中文品牌名" name={["brand", "cnName"]} rules={[{ required: true, message: "请输入中文品牌名" }]}>
                      <Input data-testid="workspace-site-settings-brand-cn" />
                    </Form.Item>
                    <Form.Item label="入口页眉文案" name={["brand", "entryEyebrow"]} rules={[{ required: true, message: "请输入入口页眉文案" }]}>
                      <Input data-testid="workspace-site-settings-entry-eyebrow" />
                    </Form.Item>
                  </div>
                </AdminFormSection>

                <AdminFormSection title="首页主视觉" description="维护首页 Hero 的导语和简介。" useForm={false}>
                  <Form.Item label="首页导语" name={["homeHero", "eyebrow"]} rules={[{ required: true, message: "请输入首页导语" }]}>
                    <Input data-testid="workspace-site-settings-home-eyebrow" />
                  </Form.Item>
                  <Form.Item label="首页简介" name={["homeHero", "description"]} rules={[{ required: true, message: "请输入首页简介" }]}>
                    <Input.TextArea rows={4} data-testid="workspace-site-settings-home-description" />
                  </Form.Item>
                </AdminFormSection>

                <AdminFormSection title="顶部导航" description="维护公开站导航名称和搜索框占位文案。" useForm={false}>
                  <Form.Item label="搜索框占位文案" name={["navigation", "searchPlaceholder"]} rules={[{ required: true, message: "请输入搜索占位文案" }]}>
                    <Input data-testid="workspace-site-settings-search-placeholder" />
                  </Form.Item>

                  <Form.List name={["navigation", "items"]}>
                    {(fields, { add, remove }) => (
                      <Space direction="vertical" size={12} style={{ width: "100%" }}>
                        {fields.map((field, index) => (
                          <div
                            key={field.key}
                            style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, alignItems: "start" }}
                          >
                            <Form.Item
                              {...field}
                              label={index === 0 ? "路由" : ""}
                              name={[field.name, "path"]}
                              rules={[{ required: true, message: "请选择路由" }]}
                            >
                              <Input list="site-settings-nav-paths" data-testid={`workspace-site-settings-nav-path-${index}`} />
                            </Form.Item>
                            <Form.Item
                              {...field}
                              label={index === 0 ? "导航名称" : ""}
                              name={[field.name, "label"]}
                              rules={[{ required: true, message: "请输入导航名称" }]}
                            >
                              <Input data-testid={`workspace-site-settings-nav-label-${index}`} />
                            </Form.Item>
                            <Button danger style={{ marginTop: index === 0 ? 30 : 0 }} onClick={() => remove(field.name)}>
                              删除
                            </Button>
                          </div>
                        ))}
                        <datalist id="site-settings-nav-paths">
                          {NAV_PATH_OPTIONS.map((item) => (
                            <option key={item} value={item} />
                          ))}
                        </datalist>
                        <Button
                          icon={<PlusOutlined />}
                          onClick={() => add(createNavItem("", ""))}
                          data-testid="workspace-site-settings-add-nav"
                        >
                          新增导航项
                        </Button>
                      </Space>
                    )}
                  </Form.List>
                </AdminFormSection>

                <AdminFormSection title="页脚配置" description="维护页脚说明和公开链接。" useForm={false}>
                  <Form.Item label="页脚说明" name={["footer", "description"]} rules={[{ required: true, message: "请输入页脚说明" }]}>
                    <Input.TextArea rows={4} data-testid="workspace-site-settings-footer-description" />
                  </Form.Item>

                  <Form.List name={["footer", "links"]}>
                    {(fields, { add, remove }) => (
                      <Space direction="vertical" size={12} style={{ width: "100%" }}>
                        {fields.map((field, index) => (
                          <div key={field.key} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12 }}>
                            <Form.Item
                              {...field}
                              label={index === 0 ? "页脚链接" : ""}
                              name={[field.name, "value"]}
                              rules={[{ required: true, message: "请输入页脚链接名称" }]}
                            >
                              <Input data-testid={`workspace-site-settings-footer-link-${index}`} />
                            </Form.Item>
                            <Button danger style={{ marginTop: index === 0 ? 30 : 0 }} onClick={() => remove(field.name)}>
                              删除
                            </Button>
                          </div>
                        ))}
                        <Button
                          icon={<PlusOutlined />}
                          onClick={() => add(createFooterLink(""))}
                          data-testid="workspace-site-settings-add-footer-link"
                        >
                          新增页脚链接
                        </Button>
                      </Space>
                    )}
                  </Form.List>
                </AdminFormSection>
              </Space>
            </Form>
          </>
        )}
      </Space>
    </WorkspaceShell>
  );
}

export default WorkspaceSiteSettingsPage;
