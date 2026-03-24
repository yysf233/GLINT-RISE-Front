import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { App, Button, Card, Col, Form, Input, Row, Space, Switch, Typography } from "antd";
import { ArrowLeftOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { AdminFormSection } from "../components/workspace/admin/AdminFormSection";
import { AdminPageHeader } from "../components/workspace/admin/AdminPageHeader";
import { AdminResultState } from "../components/workspace/admin/AdminResultState";
import { AdminSortableMediaList } from "../components/workspace/admin/AdminSortableMediaList";
import { WorkspaceShell } from "../components/workspace/WorkspaceShell";
import { useAuth } from "../context/useAuth";
import workspaceProductsApi from "../services/workspaceProductsApi";
import { showAppMessage } from "../utils/safeAppMessage";
import {
  buildWorkspaceProductPayload,
  createWorkspaceProductFormDefaults,
  mapWorkspaceProductToForm,
} from "../utils/workspaceProductForm";

const { Text, Title } = Typography;

const CATEGORY_OPTIONS = [
  { value: "flagship", label: "旗舰产品" },
  { value: "device", label: "智能设备" },
  { value: "space", label: "空间体验" },
  { value: "hot", label: "热门精选" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "已发布" },
  { value: "draft", label: "草稿" },
  { value: "archived", label: "已归档" },
];

function buildMediaState(items) {
  if (!Array.isArray(items)) return [];

  return items.map((item, index) => ({
    id: item.id || `media-${index + 1}`,
    url: item.url || item.thumbnail || "",
    title: item.title || item.name || "",
    isCover: Boolean(item.isCover),
  }));
}

function mediaToDisplay(items) {
  return items.map((item, index) => ({
    id: item.id,
    thumbnail: item.url,
    title: item.title || `图片 ${index + 1}`,
    description: item.url,
    isCover: item.isCover,
  }));
}

function moveItem(items, fromIndex, toIndex) {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function WorkspaceProductFormPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { user } = useAuth();
  const app = App.useApp();
  const [form] = Form.useForm();
  const isEditMode = Boolean(productId);
  const [pageState, setPageState] = React.useState({
    status: isEditMode ? "loading" : "ready",
    error: "",
  });
  const [media, setMedia] = React.useState([]);
  const [newMedia, setNewMedia] = React.useState({ url: "", title: "" });
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (!isEditMode) {
      form.setFieldsValue(createWorkspaceProductFormDefaults(user || {}));
      setMedia([]);
      setPageState({ status: "ready", error: "" });
      return;
    }

    let isActive = true;
    setPageState({ status: "loading", error: "" });

    workspaceProductsApi
      .getWorkspaceProduct(productId)
      .then((result) => {
        if (!isActive) return;

        if (result?.error || !result?.product) {
          setPageState({
            status: "error",
            error: result?.error?.message || "无法加载该产品。",
          });
          return;
        }

        form.setFieldsValue(mapWorkspaceProductToForm(result.product, user || {}));
        setMedia(buildMediaState(result.product.media));
        setPageState({ status: "ready", error: "" });
      })
      .catch(() => {
        if (!isActive) return;
        setPageState({
          status: "error",
          error: "无法加载该产品。",
        });
      });

    return () => {
      isActive = false;
    };
  }, [form, isEditMode, productId, user]);

  const handleSubmit = async (values) => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const payload = {
        ...buildWorkspaceProductPayload(values),
        media,
      };

      const result = isEditMode
        ? await workspaceProductsApi.updateWorkspaceProduct(productId, payload)
        : await workspaceProductsApi.createWorkspaceProduct(payload);

      if (result?.error || !result?.product) {
        showAppMessage(app, "error", result?.error?.message || "保存失败，请重试。");
        return;
      }

      showAppMessage(app, "success", isEditMode ? "已更新产品" : "已创建产品");
      navigate(`/workspace/products/${result.product.id}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMedia = () => {
    const url = newMedia.url.trim();
    if (!url) {
      showAppMessage(app, "warning", "请先填写素材链接");
      return;
    }

    setMedia((current) => [
      ...current,
      {
        id: `media-${Date.now()}`,
        url,
        title: newMedia.title.trim(),
        isCover: current.length === 0,
      },
    ]);
    setNewMedia({ url: "", title: "" });
  };

  const handleMoveUp = (_, index) => {
    if (index === 0) return;
    setMedia((current) => moveItem(current, index, index - 1));
  };

  const handleMoveDown = (_, index) => {
    if (index === media.length - 1) return;
    setMedia((current) => moveItem(current, index, index + 1));
  };

  const handleRemove = (_, index) => {
    setMedia((current) => current.filter((__, idx) => idx !== index));
  };

  if (pageState.status === "error") {
    return (
      <WorkspaceShell>
        <AdminResultState
          status="error"
          title="产品编辑不可用"
          subTitle={pageState.error}
          actionLabel="返回列表"
          onAction={() => navigate("/workspace/products")}
        />
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell>
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        <AdminPageHeader
          eyebrow={isEditMode ? "编辑产品" : "新建产品"}
          title={isEditMode ? "编辑产品" : "新建产品"}
          description="补齐后台管理字段与前台展示字段，保存后即可同步公开站产品内容。"
          extra={
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/workspace/products")}>
              返回列表
            </Button>
          }
        />

        <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark="optional">
          <AdminFormSection
            title="基础信息"
            description="确保内部 ID 与公开产品 ID 稳定唯一，后续可用于搜索、详情与分享路由。"
            useForm={false}
          >
            <Row gutter={[24, 16]}>
              <Col xs={24} lg={12}>
                <Form.Item
                  name="name"
                  label="产品名称"
                  rules={[{ required: true, message: "名称为必填项" }]}
                >
                  <Input data-testid="workspace-product-form-name" placeholder="例如：LUMINA ARC" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item name="shortName" label="前台短名称">
                  <Input data-testid="workspace-product-form-short-name" placeholder="例如：LUMINA ARC" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item
                  name="id"
                  label="内部产品 ID"
                  rules={[{ required: true, message: "产品 ID 为必填项" }]}
                >
                  <Input
                    data-testid="workspace-product-form-id"
                    placeholder="建议使用英文小写与短横线组合"
                    disabled={isEditMode}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item name="category" label="产品分类">
                  <Input data-testid="workspace-product-form-category" list="workspace-category-options" />
                </Form.Item>
                <datalist id="workspace-category-options">
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </datalist>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item name="status" label="发布状态">
                  <Input data-testid="workspace-product-form-status" list="workspace-status-options" />
                </Form.Item>
                <datalist id="workspace-status-options">
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </datalist>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item name="publicProductId" label="公开产品 ID">
                  <Input placeholder="公开站点映射 ID" />
                </Form.Item>
              </Col>
            </Row>
          </AdminFormSection>

          <AdminFormSection title="负责人与归属团队" useForm={false}>
            <Row gutter={[24, 16]}>
              <Col xs={24} lg={12}>
                <Form.Item name="owner" label="负责人">
                  <Input data-testid="workspace-product-form-owner" placeholder="填写负责人姓名" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item name="ownerTeam" label="归属团队">
                  <Input data-testid="workspace-product-form-owner-team" placeholder="例如：产品研发中心" />
                </Form.Item>
              </Col>
            </Row>
          </AdminFormSection>

          <AdminFormSection title="价格与成本" useForm={false}>
            <Row gutter={[24, 16]}>
              <Col xs={24} lg={12}>
                <Form.Item name="retailPrice" label="对外零售价">
                  <Input data-testid="workspace-product-form-retail-price" placeholder="例如：3200" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item name="internalCost" label="内部成本">
                  <Input data-testid="workspace-product-form-internal-cost" placeholder="仅内部可见" />
                </Form.Item>
              </Col>
            </Row>
          </AdminFormSection>

          <AdminFormSection title="前台展示信息" useForm={false}>
            <Row gutter={[24, 16]}>
              <Col xs={24}>
                <Form.Item name="summary" label="一句话摘要">
                  <Input data-testid="workspace-product-form-summary" placeholder="用于搜索结果、卡片描述与详情摘要" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item name="displayTag" label="前台展示标签">
                  <Input data-testid="workspace-product-form-display-tag" placeholder="例如：可持续科技 / 旗舰系列" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item name="publicMetaText" label="前台参数块">
                  <Input.TextArea
                    data-testid="workspace-product-form-public-meta"
                    rows={4}
                    placeholder={"每行一项，格式：标签: 值\n例如：材质: 阳极黑钛"}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item name="progressSummary" label="进度摘要">
                  <Input
                    data-testid="workspace-product-form-progress-summary"
                    placeholder="例如：已完成打样，等待客户确认"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item name="supplierSummary" label="供应商摘要">
                  <Input
                    data-testid="workspace-product-form-supplier-summary"
                    placeholder="例如：华东主供应链已锁定"
                  />
                </Form.Item>
              </Col>
            </Row>
          </AdminFormSection>

          <AdminFormSection title="素材与标签" useForm={false}>
            <Row gutter={[24, 16]}>
              <Col xs={24} lg={12}>
                <Form.Item name="hero" label="主视觉封面">
                  <Input data-testid="workspace-product-form-hero" placeholder="粘贴封面图链接" />
                </Form.Item>
                <Form.Item name="tagsText" label="后台标签">
                  <Input data-testid="workspace-product-form-tags" placeholder="使用逗号分隔，例如：atlas, beam" />
                </Form.Item>
                <Form.Item name="needsUpdate" label="同步状态" valuePropName="checked">
                  <Switch checkedChildren="待同步" unCheckedChildren="已同步" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Card size="small" bordered={false}>
                  <Title level={5} style={{ marginBottom: 12 }}>
                    素材图库
                  </Title>
                  <Space direction="vertical" size={12} style={{ width: "100%" }}>
                    <Input
                      placeholder="素材链接"
                      value={newMedia.url}
                      onChange={(event) => setNewMedia((current) => ({ ...current, url: event.target.value }))}
                    />
                    <Input
                      placeholder="素材标题（可选）"
                      value={newMedia.title}
                      onChange={(event) => setNewMedia((current) => ({ ...current, title: event.target.value }))}
                    />
                    <Button icon={<PlusOutlined />} onClick={handleAddMedia}>
                      添加素材
                    </Button>
                  </Space>
                </Card>
              </Col>
            </Row>
            <div style={{ marginTop: 16 }}>
              <AdminSortableMediaList
                items={mediaToDisplay(media)}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onRemove={handleRemove}
                emptyText="暂未上传素材"
              />
            </div>
          </AdminFormSection>

          <Card bordered={false}>
            <Space wrap>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/workspace/products")}>
                返回列表
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={isSaving}
                data-testid="workspace-product-form-submit"
              >
                {isSaving ? "保存中..." : "保存产品"}
              </Button>
            </Space>
            <div style={{ marginTop: 12 }}>
              <Text type="secondary">保存后将跳转到产品详情页。</Text>
            </div>
          </Card>
        </Form>
      </Space>
    </WorkspaceShell>
  );
}

export default WorkspaceProductFormPage;
