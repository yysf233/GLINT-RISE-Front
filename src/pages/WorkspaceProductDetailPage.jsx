import React from "react";
import { Button, Card, Image, Space, Tag, Typography } from "antd";
import { ArrowLeftOutlined, EditOutlined, LinkOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { AdminDetailSection } from "../components/workspace/admin/AdminDetailSection";
import { AdminPageHeader } from "../components/workspace/admin/AdminPageHeader";
import { AdminResultState } from "../components/workspace/admin/AdminResultState";
import { WorkspaceShell } from "../components/workspace/WorkspaceShell";
import workspaceProductsApi from "../services/workspaceProductsApi";

const { Paragraph, Text, Title } = Typography;

const statusLabelMap = {
  active: "已上架",
  draft: "草稿",
  archived: "已下架",
};

const statusColorMap = {
  active: "green",
  draft: "orange",
  archived: "default",
};

function formatCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return "--";
  }

  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateTime(value) {
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

export function WorkspaceProductDetailPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [state, setState] = React.useState({
    status: "loading",
    product: null,
    error: "",
  });

  React.useEffect(() => {
    let isActive = true;
    setState({ status: "loading", product: null, error: "" });

    workspaceProductsApi
      .getWorkspaceProduct(productId)
      .then((result) => {
        if (!isActive) return;
        if (result?.error) {
          setState({
            status: "error",
            product: null,
            error: result.error.message || "无法加载该产品。",
          });
          return;
        }
        setState({
          status: "ready",
          product: result?.product ?? null,
          error: "",
        });
      })
      .catch(() => {
        if (!isActive) return;
        setState({
          status: "error",
          product: null,
          error: "无法加载该产品。",
        });
      });

    return () => {
      isActive = false;
    };
  }, [productId]);

  const product = state.product;

  return (
    <WorkspaceShell>
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        <AdminPageHeader
          eyebrow="产品详情"
          title={product?.name || "产品详情"}
          description="查看产品内部状态、成本、进度与公开映射信息。"
          extra={
            <Space wrap>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/workspace/products")}>
                返回列表
              </Button>
              {product?.publicProductId ? (
                <Button icon={<LinkOutlined />} onClick={() => navigate(`/product/${product.publicProductId}`)}>
                  公开预览
                </Button>
              ) : null}
              {product ? (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  data-testid="workspace-product-detail-edit"
                  onClick={() => navigate(`/workspace/products/${product.id}/edit`)}
                >
                  编辑产品
                </Button>
              ) : null}
            </Space>
          }
        />

        {state.status === "loading" ? (
          <AdminResultState status="info" title="正在加载产品信息" subTitle="请稍候…" />
        ) : null}

        {state.status === "error" ? (
          <AdminResultState status="error" title="加载失败" subTitle={state.error} actionLabel="返回列表" onAction={() => navigate("/workspace/products")} />
        ) : null}

        {product ? (
          <>
            <Card bordered={false}>
              <Space align="start" size={24} style={{ width: "100%", justifyContent: "space-between" }}>
                <Space direction="vertical" size={12} style={{ flex: 1 }}>
                  <Title level={4} style={{ margin: 0 }}>
                    {product.name}
                  </Title>
                  <Text type="secondary">{product.id}</Text>
                  <Paragraph style={{ marginBottom: 0 }}>{product.summary || "暂无摘要。"}</Paragraph>
                  <Space wrap>
                    <Tag color={statusColorMap[product.status] || "default"}>
                      {statusLabelMap[product.status] || product.status}
                    </Tag>
                    {(product.tags ?? []).map((tag) => (
                      <Tag key={`${product.id}-${tag}`}>{tag}</Tag>
                    ))}
                  </Space>
                </Space>
                <Image
                  src={product.hero}
                  alt={product.name}
                  width={260}
                  height={180}
                  style={{ objectFit: "cover", borderRadius: 12 }}
                  preview={false}
                />
              </Space>
            </Card>

            <AdminDetailSection
              title="基础信息"
              items={[
                { key: "category", label: "品类", children: product.categoryLabel || product.category || "--" },
                { key: "owner", label: "负责人", children: product.owner || "--" },
                { key: "updated", label: "更新时间", children: formatDateTime(product.updatedAt) },
                { key: "sync", label: "同步状态", children: product.needsUpdate ? "待同步" : "已同步" },
                { key: "public", label: "公开产品 ID", children: product.publicProductId || "未绑定" },
              ]}
            />

            <AdminDetailSection
              title="成本与进度"
              items={[
                { key: "retail", label: "零售价", children: formatCurrency(product.retailPrice) },
                { key: "internal", label: "内部成本", children: formatCurrency(product.internalCost) },
                { key: "progress", label: "进度摘要", children: product.progressSummary || "暂无进度摘要。" },
                { key: "supplier", label: "供应商摘要", children: product.supplierSummary || "暂无供应商摘要。" },
              ]}
              column={2}
            />
          </>
        ) : null}
      </Space>
    </WorkspaceShell>
  );
}

export default WorkspaceProductDetailPage;
