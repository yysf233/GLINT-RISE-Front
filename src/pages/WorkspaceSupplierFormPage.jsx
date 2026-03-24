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
  Switch,
} from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { AdminFormSection } from "../components/workspace/admin/AdminFormSection";
import { AdminPageHeader } from "../components/workspace/admin/AdminPageHeader";
import { AdminResultState } from "../components/workspace/admin/AdminResultState";
import { WorkspaceShell } from "../components/workspace/WorkspaceShell";
import { useAuth } from "../context/useAuth";
import workspaceProductsApi from "../services/workspaceProductsApi";
import workspaceSuppliersApi from "../services/workspace/workspaceSuppliersApi";
import { showAppMessage } from "../utils/safeAppMessage";
import {
  buildWorkspaceSupplierPayload,
  createWorkspaceSupplierFormDefaults,
  mapWorkspaceSupplierToForm,
} from "../utils/workspaceSupplierForm";
import { canEditSupplier } from "../utils/workspaceSupplierVisibility";

const RATING_OPTIONS = [
  { value: "A", label: "A级" },
  { value: "B", label: "B级" },
  { value: "C", label: "C级" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "合作中" },
  { value: "draft", label: "待评估" },
  { value: "archived", label: "已归档" },
];

function buildProductOptions(items = []) {
  return items.map((item) => ({
    value: item.id,
    label: `${item.name} (${item.id})`,
  }));
}

export function WorkspaceSupplierFormPage() {
  const navigate = useNavigate();
  const { supplierId } = useParams();
  const { user } = useAuth();
  const app = App.useApp();
  const [form] = Form.useForm();
  const isEditMode = Boolean(supplierId);
  const isDirector = user?.role === "director";
  const [productOptions, setProductOptions] = React.useState([]);
  const [pageState, setPageState] = React.useState({
    status: isEditMode ? "loading" : "ready",
    error: "",
  });
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    let isActive = true;

    const loadPage = async () => {
      const productsResult = await workspaceProductsApi.listWorkspaceProducts({});
      if (isActive && !productsResult?.error) {
        setProductOptions(buildProductOptions(productsResult.items ?? []));
      }

      if (!isEditMode) {
        if (!isActive) return;
        form.setFieldsValue(createWorkspaceSupplierFormDefaults(user || {}));
        setPageState({ status: "ready", error: "" });
        return;
      }

      const supplierResult = await workspaceSuppliersApi.getWorkspaceSupplier(supplierId, user || {});
      if (!isActive) return;

      if (supplierResult?.error || !supplierResult?.supplier) {
        setPageState({
          status: "error",
          error: supplierResult?.error?.message || "无法加载该供应商。",
        });
        return;
      }

      if (!canEditSupplier(supplierResult.supplier, user || {})) {
        setPageState({
          status: "error",
          error: "当前账号无权编辑该私有供应商。",
        });
        return;
      }

      form.setFieldsValue(mapWorkspaceSupplierToForm(supplierResult.supplier, user || {}));
      setPageState({ status: "ready", error: "" });
    };

    loadPage().catch(() => {
      if (!isActive) return;
      setPageState({
        status: "error",
        error: "无法加载该供应商。",
      });
    });

    return () => {
      isActive = false;
    };
  }, [form, isEditMode, supplierId, user]);

  const handleSubmit = async (values) => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const payload = buildWorkspaceSupplierPayload(values);
      const result = isEditMode
        ? await workspaceSuppliersApi.updateWorkspaceSupplier(supplierId, payload, user || {})
        : await workspaceSuppliersApi.createWorkspaceSupplier(payload, user || {});

      if (result?.error || !result?.supplier) {
        showAppMessage(app, "error", result?.error?.message || "供应商保存失败。");
        return;
      }

      showAppMessage(app, "success", isEditMode ? "供应商已更新。" : "供应商已创建。");
      navigate(`/workspace/suppliers/${result.supplier.id}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (pageState.status === "error") {
    return (
      <WorkspaceShell>
        <AdminResultState
          status="error"
          title="供应商编辑不可用"
          subTitle={pageState.error}
          actionLabel="返回列表"
          onAction={() => navigate("/workspace/suppliers")}
        />
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell>
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        <AdminPageHeader
          eyebrow={isEditMode ? "编辑供应商" : "新建供应商"}
          title={isEditMode ? "编辑供应商" : "新建供应商"}
          description="维护供应商评级、可见性、联系人和关联产品。员工保存私有供应商时 owner 会固定为当前账号。"
          extra={
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/workspace/suppliers")}>
              返回列表
            </Button>
          }
        />

        <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark="optional">
          <AdminFormSection title="基础信息" useForm={false}>
            <Row gutter={[24, 16]}>
              <Col xs={24} lg={12}>
                <Form.Item
                  name="name"
                  label="供应商名称"
                  rules={[{ required: true, message: "名称为必填项" }]}
                >
                  <Input data-testid="workspace-supplier-form-name" placeholder="例如：Mika Lighting" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={6}>
                <Form.Item name="rating" label="评级" rules={[{ required: true, message: "请选择评级" }]}>
                  <Select options={RATING_OPTIONS} />
                </Form.Item>
              </Col>
              <Col xs={24} lg={6}>
                <Form.Item name="status" label="状态" rules={[{ required: true, message: "请选择状态" }]}>
                  <Select options={STATUS_OPTIONS} />
                </Form.Item>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item name="isPrivate" label="是否私有" valuePropName="checked">
                  <Switch checkedChildren="私有" unCheckedChildren="公开" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item name="owner" label="负责人">
                  <Input data-testid="workspace-supplier-form-owner" disabled={!isDirector} placeholder="默认取当前登录账号" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item name="companyArea" label="厂房面积">
                  <Input placeholder="例如：3200" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item
                  name="leadTimeBand"
                  label="交期区间"
                  rules={[{ required: true, message: "交期区间为必填项" }]}
                >
                  <Input placeholder="例如：10-15天" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item
                  name="priceBand"
                  label="价格带"
                  rules={[{ required: true, message: "价格带为必填项" }]}
                >
                  <Input placeholder="例如：中高" />
                </Form.Item>
              </Col>
            </Row>
          </AdminFormSection>

          <AdminFormSection title="联系人与能力" useForm={false}>
            <Row gutter={[24, 16]}>
              <Col xs={24} lg={8}>
                <Form.Item
                  name="contactName"
                  label="联系人"
                  rules={[{ required: true, message: "联系人为必填项" }]}
                >
                  <Input placeholder="例如：Mika" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item
                  name="contactPhone"
                  label="联系电话"
                  rules={[{ required: true, message: "联系电话为必填项" }]}
                >
                  <Input data-testid="workspace-supplier-form-phone" placeholder="例如：13800000001" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item name="contactEmail" label="联系邮箱">
                  <Input placeholder="例如：mika@supplier.test" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item name="fitScore" label="适配度">
                  <Input placeholder="例如：89" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item name="patentCount" label="专利数">
                  <Input placeholder="例如：10" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item name="capacitySummary" label="产能说明">
                  <Input placeholder="简述工厂能力" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="cooperationHistory" label="合作历史">
                  <Input placeholder="例如：Retail lighting rollout" />
                </Form.Item>
              </Col>
            </Row>
          </AdminFormSection>

          <AdminFormSection title="关联与摘要" useForm={false}>
            <Row gutter={[24, 16]}>
              <Col xs={24}>
                <Form.Item name="relatedProductIds" label="关联产品">
                  <Select
                    mode="multiple"
                    options={productOptions}
                    placeholder="选择关联产品"
                    allowClear
                  />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="tagsText" label="标签">
                  <Input placeholder="例如：lighting, retail, flagship" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="summary" label="摘要">
                  <Input.TextArea rows={4} placeholder="补充供应商业务背景、合作说明和限制条件" />
                </Form.Item>
              </Col>
            </Row>
          </AdminFormSection>

          <AdminFormSection useForm={false}>
            <Space wrap>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/workspace/suppliers")}>
                返回列表
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={isSaving}
                data-testid="workspace-supplier-form-submit"
              >
                {isSaving ? "保存中..." : "保存供应商"}
              </Button>
            </Space>
          </AdminFormSection>
        </Form>
      </Space>
    </WorkspaceShell>
  );
}

export default WorkspaceSupplierFormPage;
