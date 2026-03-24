import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  App,
  Button,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Typography,
} from "antd";
import {
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { AdminFormSection } from "../components/workspace/admin/AdminFormSection";
import { AdminPageHeader } from "../components/workspace/admin/AdminPageHeader";
import { AdminResultState } from "../components/workspace/admin/AdminResultState";
import { WorkspaceShell } from "../components/workspace/WorkspaceShell";
import { useAuth } from "../context/useAuth";
import workspaceProductsApi from "../services/workspaceProductsApi";
import workspaceProjectsApi from "../services/workspace/workspaceProjectsApi";
import {
  buildWorkspaceProjectPayload,
  createWorkspaceProjectFormDefaults,
  mapWorkspaceProjectToForm,
} from "../utils/workspaceProjectForm";
import { showAppMessage } from "../utils/safeAppMessage";

const { Text } = Typography;

const STATUS_OPTIONS = [
  { value: "active", label: "已发布" },
  { value: "draft", label: "草稿" },
  { value: "archived", label: "已归档" },
];

const INDUSTRY_OPTIONS = [
  { value: "Retail", label: "零售" },
  { value: "Security", label: "安防" },
  { value: "Technology", label: "科技" },
  { value: "Culture", label: "文化" },
];

const CATEGORY_OPTIONS = [
  { value: "Case Study", label: "案例项目" },
  { value: "Brand Campaign", label: "品牌活动" },
  { value: "Space Experience", label: "空间体验" },
];

function buildProductOptions(products = []) {
  return products.map((item) => ({
    value: item.id,
    label: `${item.name} (${item.id})`,
  }));
}

export function WorkspaceProjectFormPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { user } = useAuth();
  const app = App.useApp();
  const [form] = Form.useForm();
  const isEditMode = Boolean(projectId);
  const [pageState, setPageState] = React.useState({
    status: isEditMode ? "loading" : "ready",
    error: "",
  });
  const [isSaving, setIsSaving] = React.useState(false);
  const [productOptions, setProductOptions] = React.useState([]);

  React.useEffect(() => {
    let isActive = true;

    const loadPage = async () => {
      const productResult = await workspaceProductsApi.listWorkspaceProducts({});
      if (isActive && !productResult?.error) {
        setProductOptions(buildProductOptions(productResult.items ?? []));
      }

      if (!isEditMode) {
        if (!isActive) return;
        form.setFieldsValue(createWorkspaceProjectFormDefaults(user || {}));
        setPageState({ status: "ready", error: "" });
        return;
      }

      const result = await workspaceProjectsApi.getWorkspaceProject(projectId);
      if (!isActive) return;

      if (result?.error || !result?.project) {
        setPageState({
          status: "error",
          error: result?.error?.message || "无法加载该项目。",
        });
        return;
      }

      form.setFieldsValue(mapWorkspaceProjectToForm(result.project, user || {}));
      setPageState({ status: "ready", error: "" });
    };

    loadPage().catch(() => {
      if (!isActive) return;
      setPageState({
        status: "error",
        error: "无法加载该项目。",
      });
    });

    return () => {
      isActive = false;
    };
  }, [form, isEditMode, projectId, user]);

  const handleSubmit = async (values) => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const payload = buildWorkspaceProjectPayload(values);
      const result = isEditMode
        ? await workspaceProjectsApi.updateWorkspaceProject(projectId, payload)
        : await workspaceProjectsApi.createWorkspaceProject(payload);

      if (result?.error || !result?.project) {
        showAppMessage(app, "error", result?.error?.message || "保存失败，请重试。");
        return;
      }

      showAppMessage(app, "success", isEditMode ? "已更新项目" : "已创建项目");
      navigate(`/workspace/projects/${result.project.id}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (pageState.status === "error") {
    return (
      <WorkspaceShell>
        <AdminResultState
          status="error"
          title="项目编辑不可用"
          subTitle={pageState.error}
          actionLabel="返回列表"
          onAction={() => navigate("/workspace/projects")}
        />
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell>
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        <AdminPageHeader
          eyebrow={isEditMode ? "编辑项目" : "新建项目"}
          title={isEditMode ? "编辑项目" : "新建项目"}
          description="录入项目基础信息、公开案例映射、时间轴和关联产品。"
          extra={
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/workspace/projects")}>
              返回列表
            </Button>
          }
        />

        <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark="optional">
          <AdminFormSection title="基础信息" useForm={false}>
            <Row gutter={[24, 16]}>
              <Col xs={24} lg={12}>
                <Form.Item
                  name="title"
                  label="项目名称"
                  rules={[{ required: true, message: "名称为必填项" }]}
                >
                  <Input data-testid="workspace-project-form-title" placeholder="例如：北极星项目" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item name="id" label="项目 ID">
                  <Input
                    data-testid="workspace-project-form-id"
                    placeholder="可选，留空则由 mock 服务自动生成"
                    disabled={isEditMode}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item name="status" label="状态">
                  <Select options={STATUS_OPTIONS} />
                </Form.Item>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item name="owner" label="负责人">
                  <Input data-testid="workspace-project-form-owner" placeholder="填写负责人姓名" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item name="year" label="年份">
                  <Input placeholder="例如：2026" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item name="industry" label="行业">
                  <Select options={INDUSTRY_OPTIONS} placeholder="选择行业" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item name="category" label="项目类型">
                  <Select options={CATEGORY_OPTIONS} placeholder="选择项目类型" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="publicCaseId" label="公开案例 ID">
                  <Input
                    data-testid="workspace-project-form-public-case-id"
                    placeholder="用于映射公开案例详情页"
                  />
                </Form.Item>
              </Col>
            </Row>
          </AdminFormSection>

          <AdminFormSection title="项目摘要" useForm={false}>
            <Row gutter={[24, 16]}>
              <Col xs={24}>
                <Form.Item name="summary" label="完整摘要">
                  <Input.TextArea rows={4} placeholder="用于详情页和后台概览" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="short" label="短摘要">
                  <Input placeholder="用于列表辅助说明" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="hero" label="封面图链接">
                  <Input placeholder="粘贴项目封面图链接" />
                </Form.Item>
              </Col>
            </Row>
          </AdminFormSection>

          <AdminFormSection title="项目时间轴" useForm={false}>
            <Form.List name="timeline">
              {(fields, { add, remove, move }) => (
                <Space direction="vertical" size={16} style={{ width: "100%" }}>
                  {fields.map((field, index) => (
                    <Row key={field.key} gutter={[12, 12]} align="middle">
                      <Col xs={24} lg={6}>
                        <Form.Item
                          {...field}
                          name={[field.name, "label"]}
                          label={index === 0 ? "阶段名称" : undefined}
                          rules={[{ required: true, message: "请输入阶段名称" }]}
                        >
                          <Input placeholder="例如：启动" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} lg={4}>
                        <Form.Item {...field} name={[field.name, "order"]} label={index === 0 ? "顺序" : undefined}>
                          <Input placeholder="1" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} lg={10}>
                        <Form.Item {...field} name={[field.name, "description"]} label={index === 0 ? "说明" : undefined}>
                          <Input placeholder="阶段说明" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} lg={4}>
                        <Space style={{ marginTop: index === 0 ? 30 : 0 }}>
                          <Button
                            icon={<ArrowUpOutlined />}
                            onClick={() => move(index, index - 1)}
                            disabled={index === 0}
                          />
                          <Button
                            icon={<ArrowDownOutlined />}
                            onClick={() => move(index, index + 1)}
                            disabled={index === fields.length - 1}
                          />
                          <Button danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                        </Space>
                      </Col>
                    </Row>
                  ))}
                  <Button type="dashed" icon={<PlusOutlined />} onClick={() => add({ label: "", order: fields.length + 1, description: "" })}>
                    添加时间轴节点
                  </Button>
                </Space>
              )}
            </Form.List>
          </AdminFormSection>

          <AdminFormSection title="关联产品" useForm={false}>
            <Form.List name="relatedProducts">
              {(fields, { add, remove }) => (
                <Space direction="vertical" size={16} style={{ width: "100%" }}>
                  {fields.map((field, index) => (
                    <Row key={field.key} gutter={[12, 12]} align="middle">
                      <Col xs={24} lg={10}>
                        <Form.Item {...field} name={[field.name, "id"]} label={index === 0 ? "内部产品" : undefined}>
                          <Select options={productOptions} placeholder="选择内部产品" allowClear />
                        </Form.Item>
                      </Col>
                      <Col xs={24} lg={10}>
                        <Form.Item
                          {...field}
                          name={[field.name, "publicProductId"]}
                          label={index === 0 ? "公开产品 ID" : undefined}
                        >
                          <Input placeholder="例如：lumina-arc" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} lg={4}>
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(field.name)}
                          style={{ marginTop: index === 0 ? 30 : 0 }}
                        >
                          删除
                        </Button>
                      </Col>
                    </Row>
                  ))}
                  <Button type="dashed" icon={<PlusOutlined />} onClick={() => add({ id: "", publicProductId: "" })}>
                    添加关联产品
                  </Button>
                  <Text type="secondary">优先绑定内部产品 ID，公开产品 ID 用于详情页跳转到公开页面。</Text>
                </Space>
              )}
            </Form.List>
          </AdminFormSection>

          <AdminFormSection useForm={false}>
            <Space wrap>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/workspace/projects")}>
                返回列表
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={isSaving}
                data-testid="workspace-project-form-submit"
              >
                {isSaving ? "保存中..." : "保存项目"}
              </Button>
            </Space>
          </AdminFormSection>
        </Form>
      </Space>
    </WorkspaceShell>
  );
}

export default WorkspaceProjectFormPage;
