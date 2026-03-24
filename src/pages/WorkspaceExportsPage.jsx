import React from "react";
import {
  Alert,
  App,
  Button,
  Card,
  Checkbox,
  Input,
  Select,
  Space,
  Tag,
  Typography,
} from "antd";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import { AdminFilterBar } from "../components/workspace/admin/AdminFilterBar";
import { AdminPageHeader } from "../components/workspace/admin/AdminPageHeader";
import { AdminResultState } from "../components/workspace/admin/AdminResultState";
import { AdminStatsRow } from "../components/workspace/admin/AdminStatsRow";
import { AdminTableCard } from "../components/workspace/admin/AdminTableCard";
import { WorkspaceShell } from "../components/workspace/WorkspaceShell";
import { useAuth } from "../context/useAuth";
import workspaceProductsApi from "../services/workspaceProductsApi";
import workspaceSuppliersApi from "../services/workspace/workspaceSuppliersApi";
import workspaceExportsApi from "../services/workspace/workspaceExportsApi";
import { downloadTextFile } from "../utils/downloadTextFile";
import { showAppMessage } from "../utils/safeAppMessage";
import {
  buildWorkspaceExportPayload,
  buildWorkspaceExportPreview,
  createWorkspaceExportFormDefaults,
} from "../utils/workspaceExportForm";

const { Paragraph, Text } = Typography;
const { TextArea } = Input;

const VERSION_OPTIONS = [
  { value: "public", label: "对外版（不含报价）" },
  { value: "priced", label: "带报价版" },
];

const FORMAT_OPTIONS = [
  { value: "pdf", label: "PDF" },
  { value: "pptx", label: "PPTX" },
  { value: "xlsx", label: "XLSX" },
  { value: "csv", label: "CSV" },
];

const MIME_TYPES = {
  pdf: "application/pdf",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv: "text/csv;charset=utf-8",
};

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
    hour12: false,
  }).format(date);
}

function buildHistorySummary(items = []) {
  return items.reduce(
    (summary, item) => {
      summary.total += 1;
      if (item.version === "priced") summary.priced += 1;
      if (item.containsSensitiveData) summary.sensitive += 1;
      return summary;
    },
    {
      total: 0,
      priced: 0,
      sensitive: 0,
    },
  );
}

function getMimeType(format) {
  return MIME_TYPES[String(format ?? "").toLowerCase()] || "text/plain;charset=utf-8";
}

function getVersionTag(version) {
  return version === "priced"
    ? <Tag color="red">带报价版</Tag>
    : <Tag color="blue">对外版</Tag>;
}

function getFormatTag(format) {
  return <Tag color="default">{String(format ?? "").toUpperCase()}</Tag>;
}

export function WorkspaceExportsPage() {
  const app = App.useApp();
  const { user } = useAuth();
  const [formState, setFormState] = React.useState(() => createWorkspaceExportFormDefaults());
  const [resourceState, setResourceState] = React.useState({
    status: "loading",
    products: [],
    suppliers: [],
    history: [],
    error: "",
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [refreshToken, setRefreshToken] = React.useState(0);

  React.useEffect(() => {
    let active = true;
    setResourceState((current) => ({
      ...current,
      status:
        current.products.length > 0 || current.suppliers.length > 0 || current.history.length > 0
          ? "refreshing"
          : "loading",
      error: "",
    }));

    Promise.all([
      workspaceProductsApi.listWorkspaceProducts({}),
      workspaceSuppliersApi.listWorkspaceSuppliers({}, user || {}),
      workspaceExportsApi.listWorkspaceExports(user || {}),
    ])
      .then(([productsResult, suppliersResult, exportsResult]) => {
        if (!active) return;

        const errorResult = [productsResult, suppliersResult, exportsResult].find((result) => result?.error);
        if (errorResult?.error) {
          setResourceState({
            status: "error",
            products: [],
            suppliers: [],
            history: [],
            error: errorResult.error.message || "导出中心数据加载失败。",
          });
          return;
        }

        setResourceState({
          status: "ready",
          products: productsResult?.items ?? [],
          suppliers: suppliersResult?.items ?? [],
          history: exportsResult?.items ?? [],
          error: "",
        });
      })
      .catch(() => {
        if (!active) return;
        setResourceState({
          status: "error",
          products: [],
          suppliers: [],
          history: [],
          error: "导出中心数据加载失败。",
        });
      });

    return () => {
      active = false;
    };
  }, [refreshToken, user]);

  const preview = buildWorkspaceExportPreview(formState, user || {});
  const historySummary = buildHistorySummary(resourceState.history);
  const productOptions = resourceState.products.map((item) => ({
    value: item.id,
    label: `${item.name} (${item.id})`,
  }));
  const supplierOptions = resourceState.suppliers.map((item) => ({
    value: item.id,
    label: `${item.name} (${item.id})`,
  }));

  const updateField = (key, value) => {
    setFormState((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const reloadAll = () => {
    setRefreshToken((value) => value + 1);
  };

  const handleDownload = async (record) => {
    const result = await workspaceExportsApi.downloadWorkspaceExport(record.id, user || {});
    if (result?.error) {
      showAppMessage(app, "error", result.error.message || "导出文件下载失败。");
      return;
    }

    downloadTextFile(result.filename, result.content, getMimeType(record.format));
    showAppMessage(app, "success", "导出文件已重新下载。");
  };

  const handleCreateExport = async () => {
    if (!preview.canSubmit || submitting) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildWorkspaceExportPayload(formState);
      const result = await workspaceExportsApi.createWorkspaceExport(payload, user || {});
      if (result?.error) {
        showAppMessage(app, "error", result.error.message || "导出创建失败。");
        return;
      }

      downloadTextFile(
        result.download.filename,
        result.download.content,
        getMimeType(result.exportJob.format),
      );
      showAppMessage(app, "success", "导出任务已生成并开始下载。");
      setFormState((current) => ({
        ...createWorkspaceExportFormDefaults(),
        format: current.format,
      }));
      reloadAll();
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: "导出任务",
      dataIndex: "title",
      key: "title",
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <Space wrap>
            <Text strong>{record.title}</Text>
            {getVersionTag(record.version)}
            {getFormatTag(record.format)}
            {record.containsSensitiveData ? <Tag color="gold">敏感资料</Tag> : null}
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.id}
          </Text>
          <Text type="secondary">
            {record.productCount} 个产品，{record.supplierCount} 个供应商
          </Text>
          {record.notes ? <Text type="secondary">{record.notes}</Text> : null}
        </Space>
      ),
    },
    {
      title: "导出人",
      dataIndex: "owner",
      key: "owner",
      render: (value) => value || "--",
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value) => formatDate(value),
    },
    {
      title: "文件名",
      dataIndex: "filename",
      key: "filename",
      render: (value) => value || "--",
    },
    {
      title: "操作",
      key: "actions",
      render: (_, record) => (
        <Button
          type="link"
          icon={<DownloadOutlined />}
          onClick={() => handleDownload(record)}
          data-testid={`workspace-exports-download-${record.id}`}
        >
          重新下载
        </Button>
      ),
    },
  ];

  if (resourceState.status === "error") {
    return (
      <WorkspaceShell>
        <AdminResultState
          status="error"
          title="导出中心加载失败"
          subTitle={resourceState.error}
          actionLabel="重新加载"
          onAction={reloadAll}
        />
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell>
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        <AdminPageHeader
          eyebrow="导出中心"
          title="导出中心"
          description="统一生成对外版和带报价版资料，沉淀下载历史，并复用当前产品与供应商 mock 数据。员工仅可导出不含报价版资料，总监可导出完整带报价版。"
          extra={(
            <Button icon={<ReloadOutlined />} onClick={reloadAll}>
              刷新数据
            </Button>
          )}
        />

        <AdminStatsRow
          items={[
            {
              key: "history",
              label: "历史导出数",
              value: historySummary.total,
              description: "当前账号可见的导出任务历史。",
            },
            {
              key: "priced",
              label: "带报价版导出",
              value: historySummary.priced,
              description: "用于报价与采购复核的导出任务数。",
            },
            {
              key: "sensitive",
              label: "敏感导出数",
              value: historySummary.sensitive,
              description: "包含内部成本或完整联系人信息的导出任务数。",
            },
            {
              key: "products",
              label: "可选产品",
              value: resourceState.products.length,
              description: "从产品管理模块实时读取当前产品。",
            },
            {
              key: "suppliers",
              label: "可选供应商",
              value: resourceState.suppliers.length,
              description: "从供应商管理模块实时读取并继承脱敏规则。",
            },
          ]}
        />

        <AdminFilterBar
          title="创建导出"
          description="选择导出版本、文件格式、产品与供应商。带报价版必须完成风险确认。"
        >
          <div style={{ minWidth: 280, flex: "1 1 320px" }}>
            <Text strong>任务名称</Text>
            <Input
              value={formState.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="例如：春季招商包"
              data-testid="workspace-exports-title"
            />
          </div>
          <div style={{ minWidth: 220, flex: "0 1 220px" }}>
            <Text strong>导出版本</Text>
            <Select
              value={formState.version}
              options={VERSION_OPTIONS}
              onChange={(value) => updateField("version", value)}
              style={{ width: "100%" }}
              data-testid="workspace-exports-version"
            />
          </div>
          <div style={{ minWidth: 180, flex: "0 1 180px" }}>
            <Text strong>文件格式</Text>
            <Select
              value={formState.format}
              options={FORMAT_OPTIONS}
              onChange={(value) => updateField("format", value)}
              style={{ width: "100%" }}
              data-testid="workspace-exports-format"
            />
          </div>
          <div style={{ minWidth: 320, flex: "1 1 420px" }}>
            <Text strong>关联产品</Text>
            <Select
              mode="multiple"
              allowClear
              value={formState.productIds}
              options={productOptions}
              onChange={(value) => updateField("productIds", value)}
              placeholder="选择本次导出的产品"
              style={{ width: "100%" }}
              data-testid="workspace-exports-products"
            />
          </div>
          <div style={{ minWidth: 320, flex: "1 1 420px" }}>
            <Text strong>关联供应商</Text>
            <Select
              mode="multiple"
              allowClear
              value={formState.supplierIds}
              options={supplierOptions}
              onChange={(value) => updateField("supplierIds", value)}
              placeholder="选择本次导出的供应商"
              style={{ width: "100%" }}
              data-testid="workspace-exports-suppliers"
            />
          </div>
          <div style={{ minWidth: 280, flex: "1 1 100%" }}>
            <Text strong>导出备注</Text>
            <TextArea
              value={formState.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              rows={3}
              placeholder="说明本次导出的业务用途、客户阶段或内部备注"
              data-testid="workspace-exports-notes"
            />
          </div>
          <div style={{ minWidth: 220, display: "flex", flexDirection: "column", gap: 8 }}>
            <Checkbox
              checked={formState.includeContacts}
              onChange={(event) => updateField("includeContacts", event.target.checked)}
              data-testid="workspace-exports-include-contacts"
            >
              包含联系人信息
            </Checkbox>
            <Checkbox
              checked={formState.riskAcknowledged}
              onChange={(event) => updateField("riskAcknowledged", event.target.checked)}
              disabled={formState.version !== "priced"}
              data-testid="workspace-exports-risk"
            >
              我已确认带报价版仅限内部审批链路使用
            </Checkbox>
          </div>
          <div style={{ display: "flex", alignItems: "end" }}>
            <Button
              type="primary"
              onClick={handleCreateExport}
              disabled={!preview.canSubmit}
              loading={submitting}
              data-testid="workspace-exports-submit"
            >
              生成并下载
            </Button>
          </div>
        </AdminFilterBar>

        <Card bordered={false}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Space wrap>
              <Text strong>导出预览</Text>
              {preview.containsSensitiveData ? <Tag color="gold">包含敏感信息</Tag> : <Tag color="green">安全对外版</Tag>}
              <Tag color="default">产品 {preview.productCount}</Tag>
              <Tag color="default">供应商 {preview.supplierCount}</Tag>
            </Space>
            <Paragraph style={{ margin: 0, color: "#64748b" }}>
              对外版不会携带产品内部成本。供应商联系人是否输出取决于当前角色与“包含联系人信息”开关；私有供应商仍会按模块脱敏规则处理。
            </Paragraph>
            {preview.warnings.length > 0 ? (
              <Alert
                type="warning"
                showIcon
                message="提交前需处理以下事项"
                description={(
                  <ul style={{ margin: 0, paddingInlineStart: 18 }}>
                    {preview.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                )}
              />
            ) : (
              <Alert
                type="success"
                showIcon
                message="当前配置可直接提交"
                description="生成成功后将自动下载文件，并在下方历史记录中保留可重下的导出快照。"
              />
            )}
          </Space>
        </Card>

        <AdminTableCard
          title="导出历史"
          description="保留当前账号可见的导出任务历史，支持重复下载，用于验收与业务留痕。"
          tableProps={{
            rowKey: "id",
            columns,
            dataSource: resourceState.history,
            loading: resourceState.status === "loading" || resourceState.status === "refreshing",
            pagination: false,
            locale: {
              emptyText: "暂无导出记录",
            },
          }}
        />
      </Space>
    </WorkspaceShell>
  );
}

export default WorkspaceExportsPage;
