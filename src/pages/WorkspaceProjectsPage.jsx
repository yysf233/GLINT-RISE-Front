import React from "react";
import { useDeferredValue } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Select, Space, Tag, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { AdminFilterBar } from "../components/workspace/admin/AdminFilterBar";
import { AdminPageHeader } from "../components/workspace/admin/AdminPageHeader";
import { AdminResultState } from "../components/workspace/admin/AdminResultState";
import { AdminStatsRow } from "../components/workspace/admin/AdminStatsRow";
import { AdminTableCard } from "../components/workspace/admin/AdminTableCard";
import { WorkspaceShell } from "../components/workspace/WorkspaceShell";
import workspaceProjectsApi from "../services/workspace/workspaceProjectsApi";

const { Text } = Typography;

const STATUS_OPTIONS = [
  { value: "all", label: "全部状态" },
  { value: "active", label: "已发布" },
  { value: "draft", label: "草稿" },
  { value: "archived", label: "已归档" },
];

const statusTextMap = {
  active: "已发布",
  draft: "草稿",
  archived: "已归档",
};

const statusColorMap = {
  active: "green",
  draft: "orange",
  archived: "default",
};

const industryTextMap = {
  Retail: "零售",
  Security: "安防",
};

const categoryTextMap = {
  "Case Study": "案例项目",
  "Brand Campaign": "品牌活动",
  "Space Experience": "空间体验",
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

function buildSummary(items) {
  return items.reduce(
    (summary, item) => {
      summary.total += 1;
      if (item.status === "active") summary.activeCount += 1;
      if (item.status === "draft") summary.draftCount += 1;
      if (item.status === "archived") summary.archivedCount += 1;
      return summary;
    },
    {
      total: 0,
      activeCount: 0,
      draftCount: 0,
      archivedCount: 0,
    },
  );
}

function matchesKeyword(project, keyword) {
  const haystack = [
    project.id,
    project.title,
    project.owner,
    project.industry,
    project.year,
    project.publicCaseId,
    project.summary,
    project.short,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(keyword);
}

export function WorkspaceProjectsPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = React.useState("");
  const deferredKeyword = useDeferredValue(keyword.trim().toLowerCase());
  const [status, setStatus] = React.useState("all");
  const [refreshToken, setRefreshToken] = React.useState(0);
  const [state, setState] = React.useState({
    status: "loading",
    items: [],
    error: "",
  });

  React.useEffect(() => {
    let isActive = true;
    setState((current) => ({
      ...current,
      status: current.items.length > 0 ? "refreshing" : "loading",
      error: "",
    }));

    workspaceProjectsApi
      .listWorkspaceProjects()
      .then((result) => {
        if (!isActive) return;
        if (result?.error) {
          setState({
            status: "error",
            items: [],
            error: result.error.message || "无法加载项目列表。",
          });
          return;
        }

        setState({
          status: "ready",
          items: result?.items ?? [],
          error: "",
        });
      })
      .catch(() => {
        if (!isActive) return;
        setState({
          status: "error",
          items: [],
          error: "无法加载项目列表。",
        });
      });

    return () => {
      isActive = false;
    };
  }, [refreshToken]);

  const filteredItems = React.useMemo(() => {
    return state.items.filter((item) => {
      if (status !== "all" && item.status !== status) {
        return false;
      }

      if (deferredKeyword && !matchesKeyword(item, deferredKeyword)) {
        return false;
      }

      return true;
    });
  }, [deferredKeyword, state.items, status]);

  const summary = React.useMemo(() => buildSummary(filteredItems), [filteredItems]);

  const columns = [
    {
      title: "项目",
      dataIndex: "title",
      key: "title",
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <Text strong>{record.title}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.id}
          </Text>
          <Text type="secondary">{record.summary || record.short || "暂无摘要"}</Text>
        </Space>
      ),
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
    },
    {
      title: "行业",
      dataIndex: "industry",
      key: "industry",
      render: (value) => industryTextMap[value] || value || "--",
    },
    {
      title: "年份",
      dataIndex: "year",
      key: "year",
    },
    {
      title: "公开案例映射",
      dataIndex: "publicCaseId",
      key: "publicCaseId",
      render: (value) => value || "未关联",
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
            data-testid={`workspace-projects-view-${record.id}`}
            onClick={() => navigate(`/workspace/projects/${record.id}`)}
          >
            查看
          </Button>
          <Button
            type="link"
            data-testid={`workspace-projects-edit-${record.id}`}
            onClick={() => navigate(`/workspace/projects/${record.id}/edit`)}
          >
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <WorkspaceShell>
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        <AdminPageHeader
          eyebrow="项目管理"
          title="项目管理"
          description="统一管理案例项目的状态、公开映射、时间轴和关联产品。"
          extra={
            <Space wrap>
              <Button icon={<ReloadOutlined />} onClick={() => setRefreshToken((value) => value + 1)}>
                刷新列表
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/workspace/projects/new")}>
                新建项目
              </Button>
            </Space>
          }
        />

        <AdminStatsRow
          items={[
            {
              key: "total",
              label: "项目总数",
              value: summary.total,
              description: "当前筛选条件下的项目记录总量。",
            },
            {
              key: "active",
              label: "已发布",
              value: summary.activeCount,
              description: "已对外发布的项目。",
            },
            {
              key: "draft",
              label: "草稿",
              value: summary.draftCount,
              description: "仍在内部整理中的项目。",
            },
            {
              key: "archived",
              label: "已归档",
              value: summary.archivedCount,
              description: "保留历史记录的项目。",
            },
          ]}
        />

        <AdminFilterBar
          title="筛选条件"
          description="支持关键词搜索和状态筛选。"
        >
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索项目名称、负责人、公开案例 ID"
            allowClear
            data-testid="workspace-projects-search"
          />
          <Select
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
            style={{ minWidth: 160 }}
            data-testid="workspace-projects-status"
          />
        </AdminFilterBar>

        {state.status === "error" ? (
          <AdminResultState status="error" title="无法加载项目列表" subTitle={state.error} />
        ) : (
          <AdminTableCard
            title="项目列表"
            description={`${filteredItems.length} 条项目记录`}
            tableProps={{
              rowKey: "id",
              columns,
              dataSource: filteredItems.map((item) => ({
                ...item,
                categoryLabel: categoryTextMap[item.category] || item.category,
              })),
              pagination: false,
              loading: state.status === "loading" || state.status === "refreshing",
            }}
          />
        )}
      </Space>
    </WorkspaceShell>
  );
}

export default WorkspaceProjectsPage;
