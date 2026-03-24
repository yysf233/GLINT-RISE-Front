import React from "react";
import { useDeferredValue } from "react";
import { useNavigate } from "react-router-dom";
import { App, Button, Form, Input, Select, Space, Tag, Typography } from "antd";
import { CheckOutlined, CloseOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { AdminFilterBar } from "../components/workspace/admin/AdminFilterBar";
import { AdminFormSection } from "../components/workspace/admin/AdminFormSection";
import { AdminPageHeader } from "../components/workspace/admin/AdminPageHeader";
import { AdminResultState } from "../components/workspace/admin/AdminResultState";
import { AdminStatsRow } from "../components/workspace/admin/AdminStatsRow";
import { AdminTableCard } from "../components/workspace/admin/AdminTableCard";
import { WorkspaceShell } from "../components/workspace/WorkspaceShell";
import { useAuth } from "../context/useAuth";
import workspaceUsersApi from "../services/workspace/workspaceUsersApi";
import { showAppMessage } from "../utils/safeAppMessage";

const { Text } = Typography;

const ROLE_OPTIONS = [
  { value: "all", label: "全部角色" },
  { value: "employee", label: "员工" },
  { value: "director", label: "总监" },
  { value: "developer", label: "开发维护" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "全部状态" },
  { value: "active", label: "启用中" },
  { value: "disabled", label: "已停用" },
  { value: "pending", label: "待激活" },
];

const REQUEST_OPTIONS = [
  { value: "pricedExport", label: "带价导出权限" },
  { value: "supplierSensitive", label: "供应商敏感信息权限" },
  { value: "contentMaintenance", label: "内容维护权限" },
  { value: "logAccess", label: "日志查看权限" },
];

const statusColorMap = {
  active: "green",
  disabled: "default",
  pending: "orange",
};

const requestColorMap = {
  pending: "orange",
  approved: "green",
  rejected: "red",
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
  }).format(date);
}

function buildSummary(users = [], requests = []) {
  return {
    totalUsers: users.length,
    activeUsers: users.filter((item) => item.status === "active").length,
    directorCount: users.filter((item) => item.role === "director").length,
    pendingRequests: requests.filter((item) => item.status === "pending").length,
  };
}

function toRequestMeta(permissionKey = "") {
  const option = REQUEST_OPTIONS.find((item) => item.value === permissionKey);
  return {
    type: permissionKey,
    permissionKey,
    permissionLabel: option?.label || permissionKey,
  };
}

export function WorkspaceUsersPage() {
  const navigate = useNavigate();
  const app = App.useApp();
  const { user } = useAuth();
  const isDirector = user?.role === "director";
  const [requestForm] = Form.useForm();
  const [keyword, setKeyword] = React.useState("");
  const deferredKeyword = useDeferredValue(keyword.trim());
  const [role, setRole] = React.useState("all");
  const [status, setStatus] = React.useState("all");
  const [requestStatus, setRequestStatus] = React.useState("all");
  const [refreshToken, setRefreshToken] = React.useState(0);
  const [requestSaving, setRequestSaving] = React.useState(false);
  const [usersState, setUsersState] = React.useState({
    status: "loading",
    items: [],
    total: 0,
    error: "",
  });
  const [requestsState, setRequestsState] = React.useState({
    status: "loading",
    items: [],
    total: 0,
    error: "",
  });

  React.useEffect(() => {
    let active = true;
    setUsersState((current) => ({
      ...current,
      status: current.items.length > 0 ? "refreshing" : "loading",
      error: "",
    }));
    setRequestsState((current) => ({
      ...current,
      status: current.items.length > 0 ? "refreshing" : "loading",
      error: "",
    }));

    Promise.all([
      workspaceUsersApi.listWorkspaceUsers(
        {
          keyword: deferredKeyword,
          role,
          status,
        },
        user || {},
      ),
      workspaceUsersApi.listWorkspacePermissionRequests(
        {
          keyword: deferredKeyword,
          status: requestStatus,
        },
        user || {},
      ),
    ])
      .then(([usersResult, requestsResult]) => {
        if (!active) return;

        if (usersResult?.error) {
          setUsersState({
            status: "error",
            items: [],
            total: 0,
            error: usersResult.error.message || "用户列表加载失败。",
          });
        } else {
          setUsersState({
            status: "ready",
            items: usersResult?.items ?? [],
            total: usersResult?.total ?? 0,
            error: "",
          });
        }

        if (requestsResult?.error) {
          setRequestsState({
            status: "error",
            items: [],
            total: 0,
            error: requestsResult.error.message || "权限申请加载失败。",
          });
        } else {
          setRequestsState({
            status: "ready",
            items: requestsResult?.items ?? [],
            total: requestsResult?.total ?? 0,
            error: "",
          });
        }
      })
      .catch(() => {
        if (!active) return;
        setUsersState({
          status: "error",
          items: [],
          total: 0,
          error: "用户列表加载失败。",
        });
        setRequestsState({
          status: "error",
          items: [],
          total: 0,
          error: "权限申请加载失败。",
        });
      });

    return () => {
      active = false;
    };
  }, [deferredKeyword, refreshToken, requestStatus, role, status, user]);

  const summary = React.useMemo(
    () => buildSummary(usersState.items, requestsState.items),
    [requestsState.items, usersState.items],
  );

  const handleCreateRequest = async () => {
    try {
      const values = await requestForm.validateFields();
      setRequestSaving(true);
      const meta = toRequestMeta(values.permissionKey);
      const result = await workspaceUsersApi.createWorkspacePermissionRequest(
        {
          ...meta,
          reason: values.reason,
        },
        user || {},
      );
      if (result?.error) {
        showAppMessage(app, "error", result.error.message || "权限申请提交失败。");
        return;
      }
      showAppMessage(app, "success", "权限申请已提交。");
      requestForm.resetFields();
      setRefreshToken((value) => value + 1);
    } finally {
      setRequestSaving(false);
    }
  };

  const handleReviewRequest = async (requestId, decision) => {
    const result = await workspaceUsersApi.approveWorkspacePermissionRequest(
      requestId,
      {
        decision,
        comment: decision === "approved" ? "通过当前审批流授予权限。" : "当前申请暂不通过。",
      },
      user || {},
    );

    if (result?.error) {
      showAppMessage(app, "error", result.error.message || "审批失败。");
      return;
    }

    showAppMessage(app, "success", decision === "approved" ? "权限申请已通过。" : "权限申请已驳回。");
    setRefreshToken((value) => value + 1);
  };

  const userColumns = [
    {
      title: "账号",
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <Space wrap>
            <Text strong>{record.name}</Text>
            <Tag color="blue">{record.role}</Tag>
            <Tag color={statusColorMap[record.status] || "default"}>{record.status}</Tag>
          </Space>
          <Text type="secondary">{record.identifier}</Text>
          <Text type="secondary">{record.email}</Text>
        </Space>
      ),
    },
    {
      title: "部门 / 岗位",
      key: "department",
      render: (_, record) => `${record.department || "--"} / ${record.title || "--"}`,
    },
    {
      title: "数据范围",
      key: "scope",
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Text type="secondary">产品：{record.dataScope?.products || "--"}</Text>
          <Text type="secondary">供应商：{record.dataScope?.suppliers || "--"}</Text>
          <Text type="secondary">询报价：{record.dataScope?.quotes || "--"}</Text>
        </Space>
      ),
    },
    {
      title: "最近登录",
      dataIndex: "lastLoginAt",
      key: "lastLoginAt",
      render: (value) => formatDate(value),
    },
    {
      title: "操作",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            data-testid={`workspace-users-view-${record.id}`}
            onClick={() => navigate(`/workspace/settings/users/${record.id}`)}
          >
            查看
          </Button>
          <Button
            type="link"
            disabled={!isDirector}
            data-testid={`workspace-users-edit-${record.id}`}
            onClick={() => navigate(`/workspace/settings/users/${record.id}/edit`)}
          >
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  const requestColumns = [
    {
      title: "申请人",
      dataIndex: "userName",
      key: "userName",
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <Text strong>{record.userName}</Text>
          <Text type="secondary">{record.permissionLabel}</Text>
        </Space>
      ),
    },
    {
      title: "申请原因",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (value) => <Tag color={requestColorMap[value] || "default"}>{value}</Tag>,
    },
    {
      title: "提交时间",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value) => formatDate(value),
    },
    {
      title: "操作",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            disabled={!isDirector || record.status !== "pending"}
            icon={<CheckOutlined />}
            data-testid={`workspace-users-approve-${record.id}`}
            onClick={() => handleReviewRequest(record.id, "approved")}
          >
            通过
          </Button>
          <Button
            type="link"
            danger
            disabled={!isDirector || record.status !== "pending"}
            icon={<CloseOutlined />}
            data-testid={`workspace-users-reject-${record.id}`}
            onClick={() => handleReviewRequest(record.id, "rejected")}
          >
            驳回
          </Button>
        </Space>
      ),
    },
  ];

  if (usersState.status === "error" && requestsState.status === "error") {
    return (
      <WorkspaceShell>
        <AdminResultState status="error" title="权限与用户模块加载失败" subTitle={usersState.error || requestsState.error} />
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell>
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        <AdminPageHeader
          eyebrow="系统管理"
          title="权限与用户"
          description="统一管理后台账号、角色、数据可见范围，以及敏感权限申请审批。员工可提交自己的权限申请，总监可完成审批与分配。"
          extra={
            <Space wrap>
              <Button icon={<ReloadOutlined />} onClick={() => setRefreshToken((value) => value + 1)}>
                刷新列表
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                disabled={!isDirector}
                onClick={() => navigate("/workspace/settings/users/new")}
              >
                新建用户
              </Button>
            </Space>
          }
        />

        <AdminStatsRow
          items={[
            { key: "users", label: "账号总数", value: summary.totalUsers, description: "当前筛选结果中的后台账号数量。" },
            { key: "active", label: "启用账号", value: summary.activeUsers, description: "当前可正常登录和访问工作台的账号数量。" },
            { key: "director", label: "总监账号", value: summary.directorCount, description: "拥有审批与权限配置能力的账号数量。" },
            { key: "pending", label: "待审批申请", value: summary.pendingRequests, description: "尚未完成审批的敏感权限申请数量。" },
          ]}
        />

        <AdminFilterBar title="筛选条件" description="支持关键词、角色、状态和审批状态筛选。">
          <Input
            allowClear
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索账号、姓名、邮箱、部门或岗位"
            data-testid="workspace-users-search"
          />
          <Select value={role} onChange={setRole} options={ROLE_OPTIONS} style={{ minWidth: 160 }} />
          <Select value={status} onChange={setStatus} options={STATUS_OPTIONS} style={{ minWidth: 160 }} />
          <Select value={requestStatus} onChange={setRequestStatus} options={STATUS_OPTIONS} style={{ minWidth: 160 }} />
        </AdminFilterBar>

        <AdminFormSection title="提交权限申请" description="员工和总监都可以为自己提交权限申请，申请会进入审批列表。">
          <Form form={requestForm} layout="vertical">
            <div style={{ display: "grid", gridTemplateColumns: "minmax(240px, 320px) 1fr auto", gap: 16 }}>
              <Form.Item name="permissionKey" label="申请权限" rules={[{ required: true, message: "请选择申请权限" }]}>
                <Select options={REQUEST_OPTIONS} data-testid="workspace-users-request-permission" />
              </Form.Item>
              <Form.Item name="reason" label="申请原因" rules={[{ required: true, message: "请输入申请原因" }]}>
                <Input.TextArea rows={1} data-testid="workspace-users-request-reason" />
              </Form.Item>
              <Button
                type="primary"
                style={{ marginTop: 30 }}
                loading={requestSaving}
                onClick={handleCreateRequest}
                data-testid="workspace-users-request-submit"
              >
                提交申请
              </Button>
            </div>
          </Form>
        </AdminFormSection>

        <AdminTableCard
          title="用户列表"
          description={`${usersState.total} 个后台账号`}
          tableProps={{
            rowKey: "id",
            loading: usersState.status === "loading" || usersState.status === "refreshing",
            columns: userColumns,
            dataSource: usersState.items,
            pagination: false,
          }}
        />

        <AdminTableCard
          title="权限申请"
          description={`${requestsState.total} 条申请记录`}
          tableProps={{
            rowKey: "id",
            loading: requestsState.status === "loading" || requestsState.status === "refreshing",
            columns: requestColumns,
            dataSource: requestsState.items,
            pagination: false,
          }}
        />
      </Space>
    </WorkspaceShell>
  );
}

export default WorkspaceUsersPage;
