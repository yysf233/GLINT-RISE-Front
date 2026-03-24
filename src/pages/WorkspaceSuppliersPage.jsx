import React from "react";
import { useDeferredValue } from "react";
import { useNavigate } from "react-router-dom";
import { App, Button, Input, Select, Space, Tag, Typography } from "antd";
import {
  DownloadOutlined,
  PlusOutlined,
  ReloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { AdminFilterBar } from "../components/workspace/admin/AdminFilterBar";
import { AdminPageHeader } from "../components/workspace/admin/AdminPageHeader";
import { AdminResultState } from "../components/workspace/admin/AdminResultState";
import { AdminStatsRow } from "../components/workspace/admin/AdminStatsRow";
import { AdminTableCard } from "../components/workspace/admin/AdminTableCard";
import { WorkspaceShell } from "../components/workspace/WorkspaceShell";
import { useAuth } from "../context/useAuth";
import workspaceSuppliersApi from "../services/workspace/workspaceSuppliersApi";
import { downloadTextFile } from "../utils/downloadTextFile";
import { showAppMessage } from "../utils/safeAppMessage";
import { canEditSupplier } from "../utils/workspaceSupplierVisibility";

const { Text } = Typography;

const STATUS_OPTIONS = [
  { value: "all", label: "全部状态" },
  { value: "active", label: "合作中" },
  { value: "draft", label: "待评估" },
  { value: "archived", label: "已归档" },
];

const RATING_OPTIONS = [
  { value: "all", label: "全部评级" },
  { value: "A", label: "A级" },
  { value: "B", label: "B级" },
  { value: "C", label: "C级" },
];

const VISIBILITY_OPTIONS = [
  { value: "all", label: "全部可见性" },
  { value: "public", label: "公开供应商" },
  { value: "private", label: "私有供应商" },
];

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

function formatDate(value) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatArea(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? `${amount} 平米` : "--";
}

function buildSummary(items = []) {
  return items.reduce(
    (summary, item) => {
      summary.total += 1;
      if (item.status === "active") summary.activeCount += 1;
      if (item.isPrivate) summary.privateCount += 1;
      if (item.rating === "A") summary.aCount += 1;
      return summary;
    },
    {
      total: 0,
      activeCount: 0,
      privateCount: 0,
      aCount: 0,
    },
  );
}

export function WorkspaceSuppliersPage() {
  const navigate = useNavigate();
  const app = App.useApp();
  const { user } = useAuth();
  const [keyword, setKeyword] = React.useState("");
  const deferredKeyword = useDeferredValue(keyword.trim());
  const [status, setStatus] = React.useState("all");
  const [rating, setRating] = React.useState("all");
  const [visibility, setVisibility] = React.useState("all");
  const [refreshToken, setRefreshToken] = React.useState(0);
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [listState, setListState] = React.useState({
    status: "loading",
    items: [],
    total: 0,
    error: "",
  });

  React.useEffect(() => {
    let isActive = true;
    setListState((current) => ({
      ...current,
      status: current.items.length > 0 ? "refreshing" : "loading",
      error: "",
    }));

    workspaceSuppliersApi
      .listWorkspaceSuppliers(
        {
          keyword: deferredKeyword,
          status,
          rating,
          visibility,
        },
        user || {},
      )
      .then((result) => {
        if (!isActive) return;
        if (result?.error) {
          setListState({
            status: "error",
            items: [],
            total: 0,
            error: result.error.message || "无法加载供应商列表。",
          });
          return;
        }

        setListState({
          status: "ready",
          items: result?.items ?? [],
          total: result?.total ?? 0,
          error: "",
        });
      })
      .catch(() => {
        if (!isActive) return;
        setListState({
          status: "error",
          items: [],
          total: 0,
          error: "无法加载供应商列表。",
        });
      });

    return () => {
      isActive = false;
    };
  }, [deferredKeyword, rating, refreshToken, status, user, visibility]);

  React.useEffect(() => {
    setSelectedIds((current) => current.filter((id) => listState.items.some((item) => item.id === id)));
  }, [listState.items]);

  const summary = React.useMemo(() => buildSummary(listState.items), [listState.items]);

  const handleExport = async (ids = selectedIds) => {
    const result = await workspaceSuppliersApi.exportWorkspaceSuppliers(
      {
        ids,
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
    showAppMessage(app, "success", `已导出 ${result.total ?? 0} 条供应商记录。`);
  };

  const columns = [
    {
      title: "供应商",
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <Space wrap>
            <Text strong>{record.name}</Text>
            <Tag color={record.isPrivate ? "gold" : "blue"}>{record.isPrivate ? "私有" : "公开"}</Tag>
            {record.isMasked ? <Tag color="red">已脱敏</Tag> : null}
            <Tag color={record.rating === "A" ? "green" : record.rating === "B" ? "orange" : "default"}>
              {record.rating} 级
            </Tag>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.id}
          </Text>
          <Text type="secondary">{record.summary || record.cooperationHistory || "暂无摘要"}</Text>
          <Space size={6} wrap>
            {(record.tags ?? []).map((tag) => (
              <Tag key={`${record.id}-${tag}`}>{tag}</Tag>
            ))}
          </Space>
        </Space>
      ),
    },
    {
      title: "合作历史",
      dataIndex: "cooperationHistory",
      key: "cooperationHistory",
      render: (value) => value || "--",
    },
    {
      title: "厂房面积",
      dataIndex: "companyArea",
      key: "companyArea",
      render: (value) => formatArea(value),
    },
    {
      title: "交期区间",
      dataIndex: "leadTimeBand",
      key: "leadTimeBand",
      render: (value) => value || "--",
    },
    {
      title: "价格带",
      dataIndex: "priceBand",
      key: "priceBand",
      render: (value) => value || "--",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (value) => <Tag color={statusColorMap[value] || "default"}>{statusTextMap[value] || value}</Tag>,
    },
    {
      title: "负责人",
      dataIndex: "owner",
      key: "owner",
      render: (value) => value || "--",
    },
    {
      title: "更新时间",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (value) => formatDate(value),
    },
    {
      title: "操作",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            data-testid={`workspace-suppliers-view-${record.id}`}
            onClick={() => navigate(`/workspace/suppliers/${record.id}`)}
          >
            查看
          </Button>
          <Button
            type="link"
            data-testid={`workspace-suppliers-edit-${record.id}`}
            disabled={!canEditSupplier(record, user || {})}
            onClick={() => navigate(`/workspace/suppliers/${record.id}/edit`)}
          >
            编辑
          </Button>
          <Button type="link" onClick={() => handleExport([record.id])}>
            导出
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <WorkspaceShell>
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        <AdminPageHeader
          eyebrow="供应商管理"
          title="供应商管理"
          description="统一管理供应商评级、合作记录、联系人和私有可见性。员工查看他人私有供应商时仅暴露脱敏结果。"
          extra={
            <Space wrap>
              <Button icon={<ReloadOutlined />} onClick={() => setRefreshToken((value) => value + 1)}>
                刷新列表
              </Button>
              <Button icon={<DownloadOutlined />} disabled={selectedIds.length === 0} onClick={() => handleExport()}>
                导出所选
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/workspace/suppliers/new")}>
                新建供应商
              </Button>
              <Button icon={<UploadOutlined />} onClick={() => navigate("/workspace/suppliers/import")}>
                批量导入
              </Button>
            </Space>
          }
        />

        <AdminStatsRow
          items={[
            {
              key: "total",
              label: "供应商总数",
              value: summary.total,
              description: "当前筛选结果中的供应商记录数量。",
            },
            {
              key: "active",
              label: "合作中",
              value: summary.activeCount,
              description: "当前处于合作中状态的供应商。",
            },
            {
              key: "private",
              label: "私有供应商",
              value: summary.privateCount,
              description: "需要按 owner 做脱敏控制的供应商。",
            },
            {
              key: "aCount",
              label: "A级供应商",
              value: summary.aCount,
              description: "适配度和稳定性较高的优先合作供应商。",
            },
          ]}
        />

        <AdminFilterBar
          title="筛选条件"
          description="支持关键词、评级、状态和可见性筛选。"
        >
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索供应商名称、负责人、合作历史或标签"
            allowClear
            data-testid="workspace-suppliers-search"
          />
          <Select value={status} onChange={setStatus} options={STATUS_OPTIONS} style={{ minWidth: 160 }} />
          <Select value={rating} onChange={setRating} options={RATING_OPTIONS} style={{ minWidth: 160 }} />
          <Select value={visibility} onChange={setVisibility} options={VISIBILITY_OPTIONS} style={{ minWidth: 180 }} />
        </AdminFilterBar>

        {listState.status === "error" ? (
          <AdminResultState status="error" title="无法加载供应商列表" subTitle={listState.error} />
        ) : (
          <AdminTableCard
            title="供应商列表"
            description={`${listState.total} 条供应商记录`}
            tableProps={{
              rowKey: "id",
              columns,
              dataSource: listState.items,
              pagination: false,
              loading: listState.status === "loading" || listState.status === "refreshing",
              rowSelection: {
                selectedRowKeys: selectedIds,
                onChange: (keys) => setSelectedIds(keys),
              },
            }}
          />
        )}
      </Space>
    </WorkspaceShell>
  );
}

export default WorkspaceSuppliersPage;
