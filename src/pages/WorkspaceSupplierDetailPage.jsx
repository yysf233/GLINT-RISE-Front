import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, App, Button, Card, List, Space, Tag, Typography } from "antd";
import { ArrowLeftOutlined, DownloadOutlined, EditOutlined } from "@ant-design/icons";
import { AdminDetailSection } from "../components/workspace/admin/AdminDetailSection";
import { AdminPageHeader } from "../components/workspace/admin/AdminPageHeader";
import { AdminResultState } from "../components/workspace/admin/AdminResultState";
import { WorkspaceShell } from "../components/workspace/WorkspaceShell";
import { useAuth } from "../context/useAuth";
import workspaceProductsApi from "../services/workspaceProductsApi";
import workspaceSuppliersApi from "../services/workspace/workspaceSuppliersApi";
import { downloadTextFile } from "../utils/downloadTextFile";
import { showAppMessage } from "../utils/safeAppMessage";
import { canEditSupplier } from "../utils/workspaceSupplierVisibility";

const { Paragraph, Text, Title } = Typography;

const statusTextMap = {
  active: "合作中",
  draft: "待评估",
  archived: "已归档",
};

const statusColorMap = {
  active: "green",
  draft: "orange",
  archived: "default",
};

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

function formatArea(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? `${amount} 平米` : "--";
}

export function WorkspaceSupplierDetailPage() {
  const navigate = useNavigate();
  const { supplierId } = useParams();
  const { user } = useAuth();
  const app = App.useApp();
  const [state, setState] = React.useState({
    status: "loading",
    supplier: null,
    productsById: {},
    error: "",
  });

  React.useEffect(() => {
    let isActive = true;
    setState({
      status: "loading",
      supplier: null,
      productsById: {},
      error: "",
    });

    Promise.all([
      workspaceSuppliersApi.getWorkspaceSupplier(supplierId, user || {}),
      workspaceProductsApi.listWorkspaceProducts({}),
    ])
      .then(([supplierResult, productsResult]) => {
        if (!isActive) return;
        if (supplierResult?.error || !supplierResult?.supplier) {
          setState({
            status: "error",
            supplier: null,
            productsById: {},
            error: supplierResult?.error?.message || "无法加载该供应商。",
          });
          return;
        }

        const productsById = Object.fromEntries((productsResult?.items ?? []).map((item) => [item.id, item]));
        setState({
          status: "ready",
          supplier: supplierResult.supplier,
          productsById,
          error: "",
        });
      })
      .catch(() => {
        if (!isActive) return;
        setState({
          status: "error",
          supplier: null,
          productsById: {},
          error: "无法加载该供应商。",
        });
      });

    return () => {
      isActive = false;
    };
  }, [supplierId, user]);

  const supplier = state.supplier;
  const editable = supplier ? canEditSupplier(supplier, user || {}) : false;

  const handleExport = async () => {
    const result = await workspaceSuppliersApi.exportWorkspaceSuppliers(
      {
        ids: [supplierId],
        format: "csv",
        includeSensitive: true,
      },
      user || {},
    );

    if (result?.error) {
      showAppMessage(app, "error", result.error.message || "供应商导出失败。");
      return;
    }

    downloadTextFile(result.filename, result.content, "text/csv;charset=utf-8");
    showAppMessage(app, "success", "供应商详情已导出。");
  };

  return (
    <WorkspaceShell>
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        <AdminPageHeader
          eyebrow="供应商详情"
          title={supplier?.name || "供应商详情"}
          description="查看供应商评级、联系人、合作记录和关联产品。私有供应商会按当前账号的权限自动脱敏。"
          extra={
            <Space wrap>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/workspace/suppliers")}>
                返回列表
              </Button>
              {supplier ? (
                <Button icon={<DownloadOutlined />} onClick={handleExport}>
                  导出详情
                </Button>
              ) : null}
              {supplier ? (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  data-testid="workspace-supplier-detail-edit"
                  disabled={!editable}
                  onClick={() => navigate(`/workspace/suppliers/${supplier.id}/edit`)}
                >
                  编辑供应商
                </Button>
              ) : null}
            </Space>
          }
        />

        {state.status === "loading" ? (
          <AdminResultState status="info" title="正在加载供应商信息" subTitle="请稍候" />
        ) : null}

        {state.status === "error" ? (
          <AdminResultState
            status="error"
            title="加载失败"
            subTitle={state.error}
            actionLabel="返回列表"
            onAction={() => navigate("/workspace/suppliers")}
          />
        ) : null}

        {supplier ? (
          <>
            {supplier.isMasked ? (
              <Alert
                type="warning"
                showIcon
                message="当前账号仅可查看脱敏信息"
                description="这是其他负责人维护的私有供应商。列表、详情和导出都会按相同规则屏蔽联系人字段。"
              />
            ) : null}

            <Card bordered={false}>
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <Space wrap>
                  <Title level={4} style={{ margin: 0 }}>
                    {supplier.name}
                  </Title>
                  <Tag color={supplier.isPrivate ? "gold" : "blue"}>{supplier.isPrivate ? "私有供应商" : "公开供应商"}</Tag>
                  <Tag color={statusColorMap[supplier.status] || "default"}>{statusTextMap[supplier.status] || supplier.status}</Tag>
                  <Tag color={supplier.rating === "A" ? "green" : supplier.rating === "B" ? "orange" : "default"}>
                    {supplier.rating} 级
                  </Tag>
                </Space>
                <Text type="secondary">{supplier.id}</Text>
                <Paragraph style={{ marginBottom: 0 }}>
                  {supplier.summary || supplier.cooperationHistory || "暂无供应商摘要"}
                </Paragraph>
                <Space size={6} wrap>
                  {(supplier.tags ?? []).map((tag) => (
                    <Tag key={`${supplier.id}-${tag}`}>{tag}</Tag>
                  ))}
                </Space>
              </Space>
            </Card>

            <AdminDetailSection
              title="基础信息"
              items={[
                { key: "owner", label: "负责人", children: supplier.owner || "--" },
                { key: "companyArea", label: "厂房面积", children: formatArea(supplier.companyArea) },
                { key: "leadTimeBand", label: "交期区间", children: supplier.leadTimeBand || "--" },
                { key: "priceBand", label: "价格带", children: supplier.priceBand || "--" },
                { key: "fitScore", label: "适配度", children: supplier.fitScore || "--" },
                { key: "updatedAt", label: "更新时间", children: formatDateTime(supplier.updatedAt) },
              ]}
            />

            <AdminDetailSection
              title="联系人与能力"
              items={[
                { key: "contactName", label: "联系人", children: supplier.contactName || "已脱敏" },
                { key: "contactPhone", label: "联系电话", children: supplier.contactPhone || "已脱敏" },
                { key: "contactEmail", label: "联系邮箱", children: supplier.contactEmail || "已脱敏" },
                { key: "patentCount", label: "专利数", children: supplier.patentCount || "--" },
                { key: "capacitySummary", label: "产能说明", children: supplier.capacitySummary || "--" },
                { key: "cooperationHistory", label: "合作历史", children: supplier.cooperationHistory || "--" },
              ]}
            />

            <Card bordered={false} title="合作记录">
              {supplier.cooperationRecords?.length ? (
                <List
                  dataSource={supplier.cooperationRecords}
                  renderItem={(record) => (
                    <List.Item>
                      <List.Item.Meta
                        title={record.title || "未命名合作记录"}
                        description={record.outcome || "暂无结果说明"}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Text type="secondary">暂无合作记录</Text>
              )}
            </Card>

            <Card bordered={false} title="关联产品">
              {supplier.relatedProductIds?.length ? (
                <List
                  dataSource={supplier.relatedProductIds}
                  renderItem={(productId) => {
                    const product = state.productsById[productId];
                    return (
                      <List.Item
                        actions={[
                          <Button key="open" type="link" onClick={() => navigate(`/workspace/products/${productId}`)}>
                            查看产品
                          </Button>,
                        ]}
                      >
                        <List.Item.Meta
                          title={product?.name || productId}
                          description={product ? product.summary : "未找到关联产品摘要"}
                        />
                      </List.Item>
                    );
                  }}
                />
              ) : (
                <Text type="secondary">暂无关联产品</Text>
              )}
            </Card>

            <Card bordered={false} title="操作日志">
              {supplier.logs?.length ? (
                <List
                  dataSource={supplier.logs.slice().reverse()}
                  renderItem={(log) => (
                    <List.Item>
                      <List.Item.Meta
                        title={`${log.action} / ${log.actor || "system"}`}
                        description={`${formatDateTime(log.timestamp)} / ${log.message || "无说明"}`}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Text type="secondary">暂无操作日志</Text>
              )}
            </Card>
          </>
        ) : null}
      </Space>
    </WorkspaceShell>
  );
}

export default WorkspaceSupplierDetailPage;
