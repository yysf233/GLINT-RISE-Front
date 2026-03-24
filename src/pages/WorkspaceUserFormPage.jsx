import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { App, Button, Col, Form, Input, Row, Select, Space, Switch } from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { AdminFormSection } from "../components/workspace/admin/AdminFormSection";
import { AdminPageHeader } from "../components/workspace/admin/AdminPageHeader";
import { AdminResultState } from "../components/workspace/admin/AdminResultState";
import { WorkspaceShell } from "../components/workspace/WorkspaceShell";
import { useAuth } from "../context/useAuth";
import workspaceUsersApi from "../services/workspace/workspaceUsersApi";
import { showAppMessage } from "../utils/safeAppMessage";
import {
  buildWorkspaceUserPayload,
  createWorkspaceUserFormDefaults,
  mapWorkspaceUserToForm,
} from "../utils/workspaceUserForm";

const ROLE_OPTIONS = [
  { value: "employee", label: "员工" },
  { value: "director", label: "总监" },
  { value: "developer", label: "开发维护" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "启用中" },
  { value: "disabled", label: "已停用" },
  { value: "pending", label: "待激活" },
];

const SCOPE_OPTIONS = [
  { value: "none", label: "不可见" },
  { value: "self", label: "仅本人" },
  { value: "team", label: "团队内" },
  { value: "all", label: "全部" },
];

const PERMISSION_FIELDS = [
  ["contentMaintenance", "内容维护"],
  ["siteSettings", "站点配置"],
  ["supplierSensitive", "供应商敏感信息"],
  ["pricedExport", "带价导出"],
  ["userAdmin", "用户管理"],
  ["logAccess", "日志查看"],
];

export function WorkspaceUserFormPage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user } = useAuth();
  const app = App.useApp();
  const [form] = Form.useForm();
  const isEditMode = Boolean(userId);
  const isDirector = user?.role === "director";
  const [pageState, setPageState] = React.useState({
    status: isEditMode ? "loading" : "ready",
    error: "",
  });
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    let active = true;

    if (!isDirector) {
      setPageState({
        status: "error",
        error: "只有总监可以维护用户账号和权限配置。",
      });
      return () => {
        active = false;
      };
    }

    if (!isEditMode) {
      form.setFieldsValue(createWorkspaceUserFormDefaults(user || {}));
      setPageState({
        status: "ready",
        error: "",
      });
      return () => {
        active = false;
      };
    }

    workspaceUsersApi
      .getWorkspaceUser(userId, user || {})
      .then((result) => {
        if (!active) return;
        if (result?.error || !result?.user) {
          setPageState({
            status: "error",
            error: result?.error?.message || "用户数据加载失败。",
          });
          return;
        }

        form.setFieldsValue(mapWorkspaceUserToForm(result.user));
        setPageState({
          status: "ready",
          error: "",
        });
      })
      .catch(() => {
        if (!active) return;
        setPageState({
          status: "error",
          error: "用户数据加载失败。",
        });
      });

    return () => {
      active = false;
    };
  }, [form, isDirector, isEditMode, user, userId]);

  const handleSubmit = async (values) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const payload = buildWorkspaceUserPayload(values);
      const result = isEditMode
        ? await workspaceUsersApi.updateWorkspaceUser(userId, payload, user || {})
        : await workspaceUsersApi.createWorkspaceUser(payload, user || {});

      if (result?.error || !result?.user) {
        showAppMessage(app, "error", result?.error?.message || "用户保存失败。");
        return;
      }

      showAppMessage(app, "success", isEditMode ? "用户已更新。" : "用户已创建。");
      navigate(`/workspace/settings/users/${result.user.id}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (pageState.status === "error") {
    return (
      <WorkspaceShell>
        <AdminResultState
          status="error"
          title="用户表单不可用"
          subTitle={pageState.error}
          actionLabel="返回列表"
          onAction={() => navigate("/workspace/settings/users")}
        />
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell>
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        <AdminPageHeader
          eyebrow="系统管理"
          title={isEditMode ? "编辑用户" : "新建用户"}
          description="维护后台账号基础信息、角色、可见范围和敏感权限。"
          extra={
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/workspace/settings/users")}>
              返回列表
            </Button>
          }
        />

        <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark="optional">
          <AdminFormSection title="基础信息" useForm={false}>
            <Row gutter={[24, 16]}>
              <Col xs={24} lg={8}>
                <Form.Item name="identifier" label="账号标识" rules={[{ required: true, message: "请输入账号标识" }]}>
                  <Input data-testid="workspace-user-form-identifier" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item name="name" label="姓名" rules={[{ required: true, message: "请输入姓名" }]}>
                  <Input data-testid="workspace-user-form-name" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item name="email" label="邮箱" rules={[{ required: true, message: "请输入邮箱" }]}>
                  <Input data-testid="workspace-user-form-email" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item name="department" label="部门">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item name="title" label="岗位">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item name="notes" label="备注">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </AdminFormSection>

          <AdminFormSection title="角色与状态" useForm={false}>
            <Row gutter={[24, 16]}>
              <Col xs={24} lg={12}>
                <Form.Item name="role" label="角色" rules={[{ required: true, message: "请选择角色" }]}>
                  <Select options={ROLE_OPTIONS} data-testid="workspace-user-form-role" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item name="status" label="状态" rules={[{ required: true, message: "请选择状态" }]}>
                  <Select options={STATUS_OPTIONS} data-testid="workspace-user-form-status" />
                </Form.Item>
              </Col>
            </Row>
          </AdminFormSection>

          <AdminFormSection title="权限能力" useForm={false}>
            <Row gutter={[24, 16]}>
              {PERMISSION_FIELDS.map(([key, label]) => (
                <Col xs={24} lg={8} key={key}>
                  <Form.Item name={["permissions", key]} label={label} valuePropName="checked">
                    <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                  </Form.Item>
                </Col>
              ))}
            </Row>
          </AdminFormSection>

          <AdminFormSection title="数据可见范围" useForm={false}>
            <Row gutter={[24, 16]}>
              <Col xs={24} lg={8}>
                <Form.Item name={["dataScope", "products"]} label="产品数据">
                  <Select options={SCOPE_OPTIONS} />
                </Form.Item>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item name={["dataScope", "suppliers"]} label="供应商数据">
                  <Select options={SCOPE_OPTIONS} />
                </Form.Item>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item name={["dataScope", "quotes"]} label="询报价数据">
                  <Select options={SCOPE_OPTIONS} />
                </Form.Item>
              </Col>
            </Row>
          </AdminFormSection>

          <AdminFormSection useForm={false}>
            <Space wrap>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/workspace/settings/users")}>
                返回列表
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={isSaving}
                data-testid="workspace-user-form-submit"
              >
                {isSaving ? "保存中..." : "保存用户"}
              </Button>
            </Space>
          </AdminFormSection>
        </Form>
      </Space>
    </WorkspaceShell>
  );
}

export default WorkspaceUserFormPage;
