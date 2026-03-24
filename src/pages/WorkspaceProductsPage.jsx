import React from "react";
import { PlusOutlined, ReloadOutlined, TagsOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Input, Select, Space, Tag, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { AdminFilterBar } from "../components/workspace/admin/AdminFilterBar";
import { AdminPageHeader } from "../components/workspace/admin/AdminPageHeader";
import { AdminResultState } from "../components/workspace/admin/AdminResultState";
import { AdminStatsRow } from "../components/workspace/admin/AdminStatsRow";
import { AdminTableCard } from "../components/workspace/admin/AdminTableCard";
import { WorkspaceShell } from "../components/workspace/WorkspaceShell";
import { useNotice } from "../context/useNotice";
import workspaceProductsApi from "../services/workspaceProductsApi";

const { Text } = Typography;

const CATEGORY_OPTIONS = [
  { value: "all", label: "全部品类" },
  { value: "flagship", label: "旗舰产品" },
  { value: "device", label: "智能设备" },
  { value: "space", label: "空间体验" },
  { value: "hot", label: "热门精选" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "全部状态" },
  { value: "active", label: "已上架" },
  { value: "draft", label: "草稿" },
  { value: "archived", label: "已下架" },
];

const UPDATE_OPTIONS = [
  { value: "all", label: "全部同步状态" },
  { value: "yes", label: "待同步" },
  { value: "no", label: "已同步" },
];

const SORT_OPTIONS = [
  { value: "updated-desc", label: "更新时间：最新" },
  { value: "updated-asc", label: "更新时间：最早" },
  { value: "name-asc", label: "名称：A-Z" },
  { value: "name-desc", label: "名称：Z-A" },
  { value: "price-desc", label: "零售价：高到低" },
  { value: "price-asc", label: "零售价：低到高" },
];

const EMPTY_SUMMARY = {
  total: 0,
  activeCount: 0,
  draftCount: 0,
  archivedCount: 0,
  needsUpdateCount: 0,
};

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

function formatDate(value) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function WorkspaceProductsPage() {
  const navigate = useNavigate();
  const { showNotice } = useNotice();
  const [keyword, setKeyword] = React.useState("");
  const deferredKeyword = React.useDeferredValue(keyword);
  const [category, setCategory] = React.useState("all");
  const [status, setStatus] = React.useState("all");
  const [needsUpdate, setNeedsUpdate] = React.useState("all");
  const [sort, setSort] = React.useState("updated-desc");
  const [refreshToken, setRefreshToken] = React.useState(0);
  const [listState, setListState] = React.useState({
    status: "loading",
    items: [],
    total: 0,
    summary: EMPTY_SUMMARY,
    error: "",
  });
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [bulkTagsInput, setBulkTagsInput] = React.useState("");
  const [isApplyingTags, setIsApplyingTags] = React.useState(false);

  React.useEffect(() => {
    let isActive = true;

    setListState((current) => ({
      ...current,
      status: current.items.length > 0 ? "refreshing" : "loading",
      error: "",
    }));

    workspaceProductsApi
      .listWorkspaceProducts({
        keyword: deferredKeyword,
        category,
        status,
        needsUpdate,
        sort,
      })
      .then((result) => {
        if (!isActive) return;
        if (result?.error) {
          setListState({
            status: "error",
            items: [],
            total: 0,
            summary: EMPTY_SUMMARY,
            error: result.error.message || "无法加载产品列表。",
          });
          return;
        }

        setListState({
          status: "ready",
          items: result?.items ?? [],
          total: result?.total ?? 0,
          summary: { ...EMPTY_SUMMARY, ...(result?.summary ?? {}) },
          error: "",
        });
      })
      .catch(() => {
        if (!isActive) return;
        setListState({
          status: "error",
          items: [],
          total: 0,
          summary: EMPTY_SUMMARY,
          error: "无法加载产品列表。",
        });
      });

    return () => {
      isActive = false;
    };
  }, [category, deferredKeyword, needsUpdate, refreshToken, sort, status]);

  React.useEffect(() => {
    setSelectedIds((current) => current.filter((id) => listState.items.some((item) => item.id === id)));
  }, [listState.items]);

  const handleApplyBulkTags = async () => {
    if (selectedIds.length === 0 || isApplyingTags) {
      return;
    }

    const tags = bulkTagsInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (tags.length === 0) {
      showNotice("请先输入至少一个标签。");
      return;
    }

    setIsApplyingTags(true);
    try {
      const result = await workspaceProductsApi.bulkAddWorkspaceProductTags({
        ids: selectedIds,
        tags,
      });

      if (result?.error) {
        showNotice(result.error.message || "批量打标失败。");
        return;
      }

      showNotice(`已为 ${selectedIds.length} 条记录更新标签。`);
      setBulkTagsInput("");
      setSelectedIds([]);
      setRefreshToken((value) => value + 1);
    } finally {
      setIsApplyingTags(false);
    }
  };

  const columns = [
    {
      title: "产品",
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <Text strong>{record.name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.id}
          </Text>
          <Text type="secondary">{record.summary}</Text>
          <Space size={6} wrap>
            {(record.tags ?? []).map((tag) => (
              <Tag key={`${record.id}-${tag}`}>{tag}</Tag>
            ))}
          </Space>
        </Space>
      ),
    },
    {
      title: "品类",
      dataIndex: "category",
      key: "category",
      render: (value, record) => record.categoryLabel || value,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (value) => <Tag color={statusColorMap[value] || "default"}>{statusLabelMap[value] || value}</Tag>,
    },
    {
      title: "负责人",
      dataIndex: "owner",
      key: "owner",
    },
    {
      title: "零售价",
      dataIndex: "retailPrice",
      key: "retailPrice",
      render: (value) => formatCurrency(value),
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
            data-testid={`workspace-products-view-${record.id}`}
            onClick={() => navigate(`/workspace/products/${record.id}`)}
          >
            查看
          </Button>
          <Button
            type="link"
            data-testid={`workspace-products-edit-${record.id}`}
            onClick={() => navigate(`/workspace/products/${record.id}/edit`)}
          >
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys: selectedIds,
    onChange: (keys) => setSelectedIds(keys),
    getCheckboxProps: (record) => ({
      "data-testid": `workspace-products-select-${record.id}`,
    }),
  };

  return (
    <WorkspaceShell>
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        <AdminPageHeader
          eyebrow="产品管理"
          title="产品后台列表"
          description="统一管理产品的状态、价格、标签与对外发布信息。所有动作都会落在本地 mock 服务并可回溯。"
          extra={
            <Space wrap>
              <Button icon={<ReloadOutlined />} onClick={() => setRefreshToken((value) => value + 1)}>
                刷新列表
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/workspace/products/new")}>
                新建产品
              </Button>
              <Button icon={<UploadOutlined />} onClick={() => navigate("/workspace/products/import")}>
                批量导入
              </Button>
            </Space>
          }
        />

        <AdminStatsRow
          items={[
            {
              key: "total",
              label: "产品总数",
              value: listState.summary.total,
              description: "当前可检索的产品记录总量。",
            },
            {
              key: "active",
              label: "已上架",
              value: listState.summary.activeCount,
              description: "可在公开站点展示的产品。",
            },
            {
              key: "draft",
              label: "草稿",
              value: listState.summary.draftCount,
              description: "尚未上架的草稿产品。",
            },
            {
              key: "needs-update",
              label: "待同步",
              value: listState.summary.needsUpdateCount,
              description: "需要同步到公开站的记录。",
            },
          ]}
        />

        <AdminFilterBar
          title="筛选与批量操作"
          description="支持关键词检索、状态筛选与批量打标。"
          extra={
            <Space>
              <Input
                data-testid="workspace-products-bulk-tags"
                value={bulkTagsInput}
                onChange={(event) => setBulkTagsInput(event.target.value)}
                placeholder="批量标签（逗号分隔）"
              />
              <Button
                type="primary"
                icon={<TagsOutlined />}
                data-testid="workspace-products-apply-tags"
                onClick={handleApplyBulkTags}
                loading={isApplyingTags}
                disabled={selectedIds.length === 0}
              >
                批量打标
              </Button>
            </Space>
          }
        >
          <Input
            data-testid="workspace-products-search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索产品名称、负责人或标签"
            allowClear
          />
          <Select
            data-testid="workspace-products-category"
            value={category}
            onChange={setCategory}
            options={CATEGORY_OPTIONS}
            style={{ minWidth: 160 }}
          />
          <Select
            data-testid="workspace-products-status"
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
            style={{ minWidth: 140 }}
          />
          <Select
            data-testid="workspace-products-needs-update"
            value={needsUpdate}
            onChange={setNeedsUpdate}
            options={UPDATE_OPTIONS}
            style={{ minWidth: 160 }}
          />
          <Select
            data-testid="workspace-products-sort"
            value={sort}
            onChange={setSort}
            options={SORT_OPTIONS}
            style={{ minWidth: 180 }}
          />
        </AdminFilterBar>

        {listState.status === "error" ? (
          <AdminResultState status="error" title="无法加载产品列表" subTitle={listState.error} />
        ) : (
          <AdminTableCard
            title="产品列表"
            description={`${listState.total} 条记录已同步。`}
            tableProps={{
              rowKey: "id",
              columns,
              dataSource: listState.items,
              pagination: false,
              loading: listState.status === "loading" || listState.status === "refreshing",
              rowSelection,
            }}
          />
        )}
      </Space>
    </WorkspaceShell>
  );
}

export default WorkspaceProductsPage;
