import React from "react";
import { useDeferredValue, startTransition } from "react";
import { App, Alert, Button, Input, Select, Space, Tag, Typography } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { AdminFilterBar } from "../components/workspace/admin/AdminFilterBar";
import { AdminPageHeader } from "../components/workspace/admin/AdminPageHeader";
import { AdminResultState } from "../components/workspace/admin/AdminResultState";
import { AdminStatsRow } from "../components/workspace/admin/AdminStatsRow";
import { AdminTableCard } from "../components/workspace/admin/AdminTableCard";
import { WorkspaceShell } from "../components/workspace/WorkspaceShell";
import { useAuth } from "../context/useAuth";
import workspaceLogsApi from "../services/workspace/workspaceLogsApi";
import { showAppMessage } from "../utils/safeAppMessage";

const { Text } = Typography;

const MODULE_OPTIONS = [
  { value: "all", label: "全部模块" },
  { value: "products", label: "产品管理" },
  { value: "projects", label: "项目管理" },
  { value: "banners", label: "轮播管理" },
  { value: "suppliers", label: "供应商管理" },
  { value: "quotes", label: "询报价流程" },
  { value: "exports", label: "导出中心" },
  { value: "users", label: "权限与用户" },
  { value: "site-settings", label: "站点配置" },
  { value: "public-site", label: "公开站" },
  { value: "search", label: "搜索页" },
];

const LEVEL_OPTIONS = [
  { value: "all", label: "全部级别" },
  { value: "info", label: "信息" },
  { value: "success", label: "成功" },
  { value: "warning", label: "警告" },
  { value: "error", label: "错误" },
];

const ACCESS_TYPE_OPTIONS = [
  { value: "all", label: "全部访问类型" },
  { value: "login", label: "登录" },
  { value: "product-share", label: "产品分享" },
  { value: "case-share", label: "案例分享" },
  { value: "export-download", label: "导出下载" },
];

const SEVERITY_OPTIONS = [
  { value: "all", label: "全部严重级别" },
  { value: "high", label: "高" },
  { value: "medium", label: "中" },
  { value: "low", label: "低" },
];

const ALERT_STATUS_OPTIONS = [
  { value: "all", label: "全部告警状态" },
  { value: "active", label: "待处理" },
  { value: "acknowledged", label: "已确认" },
  { value: "resolved", label: "已恢复" },
];

const levelColorMap = {
  info: "blue",
  success: "green",
  warning: "orange",
  error: "red",
};

const severityColorMap = {
  high: "red",
  medium: "orange",
  low: "blue",
};

const alertStatusColorMap = {
  active: "red",
  acknowledged: "gold",
  resolved: "green",
};

const accessStatusColorMap = {
  success: "green",
  opened: "blue",
  downloaded: "purple",
  blocked: "red",
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

function normalizeQuery(keyword, module, level, severity, alertStatus, accessType) {
  return {
    keyword: keyword.trim(),
    module,
    level,
    severity,
    alertStatus,
    accessType,
  };
}

export function WorkspaceLogsPage() {
  const app = App.useApp();
  const { user } = useAuth();
  const isDirector = user?.role === "director";
  const [keyword, setKeyword] = React.useState("");
  const deferredKeyword = useDeferredValue(keyword);
  const [module, setModule] = React.useState("all");
  const [level, setLevel] = React.useState("all");
  const [severity, setSeverity] = React.useState("all");
  const [alertStatus, setAlertStatus] = React.useState("all");
  const [accessType, setAccessType] = React.useState("all");
  const [refreshToken, setRefreshToken] = React.useState(0);
  const [pageState, setPageState] = React.useState({
    status: "loading",
    accessLevel: "limited",
    summary: null,
    activityLogs: [],
    accessLogs: [],
    alerts: [],
    error: "",
  });

  React.useEffect(() => {
    let active = true;

    setPageState((current) => ({
      ...current,
      status: current.summary ? "refreshing" : "loading",
      error: "",
    }));

    workspaceLogsApi
      .getWorkspaceLogsDashboard(
        normalizeQuery(deferredKeyword, module, level, severity, alertStatus, accessType),
        user || {},
      )
      .then((result) => {
        if (!active) return;

        if (result?.error) {
          setPageState({
            status: "error",
            accessLevel: "limited",
            summary: null,
            activityLogs: [],
            accessLogs: [],
            alerts: [],
            error: result.error.message || "日志与监控加载失败。",
          });
          return;
        }

        setPageState({
          status: "ready",
          accessLevel: result?.accessLevel || "limited",
          summary: result?.summary || null,
          activityLogs: result?.activityLogs || [],
          accessLogs: result?.accessLogs || [],
          alerts: result?.alerts || [],
          error: "",
        });
      })
      .catch(() => {
        if (!active) return;
        setPageState({
          status: "error",
          accessLevel: "limited",
          summary: null,
          activityLogs: [],
          accessLogs: [],
          alerts: [],
          error: "日志与监控加载失败。",
        });
      });

    return () => {
      active = false;
    };
  }, [accessType, alertStatus, deferredKeyword, level, module, refreshToken, severity, user]);

  const handleRefresh = () => {
    startTransition(() => {
      setRefreshToken((value) => value + 1);
    });
  };

  const handleAcknowledge = async (alertId) => {
    const result = await workspaceLogsApi.acknowledgeWorkspaceMonitorAlert(alertId, user || {});
    if (result?.error) {
      showAppMessage(app, "error", result.error.message || "告警确认失败。");
      return;
    }

    showAppMessage(app, "success", "告警已确认。");
    handleRefresh();
  };

  const stats = pageState.summary
    ? [
        {
          key: "activity",
          label: "操作日志",
          value: pageState.summary.totalActivityLogs,
          description: pageState.accessLevel === "full" ? "当前筛选条件下的全量操作日志。" : "当前账号可见的个人操作日志。",
        },
        {
          key: "access",
          label: "访问记录",
          value: pageState.summary.totalAccessLogs,
          description: "包含登录、分享与导出下载的访问记录。",
        },
        {
          key: "active-alerts",
          label: "待处理告警",
          value: pageState.summary.activeAlerts,
          description: "当前仍需要关注的运行或业务告警数量。",
        },
        {
          key: "critical-alerts",
          label: "高优先级告警",
          value: pageState.summary.criticalAlerts,
          description: "高严重级别且未恢复的监控告警数量。",
        },
      ]
    : [];

  const activityColumns = [
    {
      title: "时间",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 180,
      render: (value) => formatDateTime(value),
    },
    {
      title: "模块",
      dataIndex: "moduleLabel",
      key: "moduleLabel",
      width: 140,
    },
    {
      title: "对象",
      dataIndex: "entityTitle",
      key: "entityTitle",
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Text strong>{record.entityTitle || "--"}</Text>
          <Text type="secondary">{record.entityId || "--"}</Text>
        </Space>
      ),
    },
    {
      title: "动作",
      dataIndex: "action",
      key: "action",
      width: 120,
      render: (value, record) => <Tag color={levelColorMap[record.level] || "default"}>{value}</Tag>,
    },
    {
      title: "操作人",
      dataIndex: "actor",
      key: "actor",
      width: 120,
    },
    {
      title: "说明",
      dataIndex: "message",
      key: "message",
    },
  ];

  const accessColumns = [
    {
      title: "时间",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 180,
      render: (value) => formatDateTime(value),
    },
    {
      title: "访问类型",
      dataIndex: "type",
      key: "type",
      width: 140,
    },
    {
      title: "访问人",
      dataIndex: "actor",
      key: "actor",
      width: 120,
    },
    {
      title: "渠道",
      dataIndex: "channel",
      key: "channel",
      width: 120,
    },
    {
      title: "目标",
      dataIndex: "targetTitle",
      key: "targetTitle",
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Text strong>{record.targetTitle || "--"}</Text>
          <Text type="secondary">{record.targetPath || "--"}</Text>
        </Space>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (value) => <Tag color={accessStatusColorMap[value] || "default"}>{value}</Tag>,
    },
  ];

  const alertColumns = [
    {
      title: "告警",
      dataIndex: "title",
      key: "title",
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Space wrap>
            <Text strong data-testid={`workspace-logs-alert-title-${record.id}`}>{record.title}</Text>
            <Tag color={severityColorMap[record.severity] || "default"}>{record.severity}</Tag>
            <Tag color={alertStatusColorMap[record.status] || "default"} data-testid={`workspace-logs-alert-status-${record.id}`}>
              {record.status}
            </Tag>
          </Space>
          <Text type="secondary">{record.summary || "--"}</Text>
          {record.detail ? (
            <Text data-testid={`workspace-logs-alert-detail-${record.id}`}>{record.detail}</Text>
          ) : null}
          {record.acknowledgedBy ? (
            <Text type="secondary" data-testid={`workspace-logs-alert-acknowledger-${record.id}`}>
              {record.acknowledgedBy}
            </Text>
          ) : null}
        </Space>
      ),
    },
    {
      title: "模块",
      dataIndex: "module",
      key: "module",
      width: 140,
    },
    {
      title: "责任人",
      dataIndex: "owner",
      key: "owner",
      width: 120,
    },
    {
      title: "最近发现",
      dataIndex: "lastDetectedAt",
      key: "lastDetectedAt",
      width: 180,
      render: (value) => formatDateTime(value),
    },
    {
      title: "操作",
      key: "actions",
      width: 160,
      render: (_, record) => (
        <Button
          type="link"
          disabled={!isDirector || record.status !== "active"}
          onClick={() => handleAcknowledge(record.id)}
          data-testid={`workspace-logs-acknowledge-${record.id}`}
        >
          确认告警
        </Button>
      ),
    },
  ];

  if (pageState.status === "error") {
    return (
      <WorkspaceShell>
        <AdminResultState status="error" title="日志与监控加载失败" subTitle={pageState.error} />
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell>
      <div data-testid="workspace-logs-page">
        <Space direction="vertical" size={24} style={{ width: "100%" }}>
          <AdminPageHeader
            eyebrow="系统管理"
            title={<span data-testid="workspace-logs-title">日志与监控</span>}
            description="统一查看后台模块操作记录、登录与分享访问轨迹，以及公开站与后台的运行告警。总监拥有全量日志与告警确认能力，普通员工默认仅查看个人范围。"
            extra={
              <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                刷新日志
              </Button>
            }
          />

          <Text data-testid="workspace-logs-access-level" style={{ display: "none" }}>
            {pageState.accessLevel}
          </Text>

          {pageState.accessLevel === "limited" ? (
            <Alert
              type="info"
              showIcon
              data-testid="workspace-logs-scope-notice"
              message="当前为个人视角"
              description="你只能查看与自己相关的操作和访问记录，告警详情会自动脱敏。若需要全量查看，请通过权限与用户模块申请日志查看权限。"
            />
          ) : null}

          <AdminStatsRow items={stats} />

          <AdminFilterBar title="筛选条件" description="支持按模块、级别、访问类型、告警状态和关键词组合筛选。">
            <Input
              allowClear
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="搜索模块、对象、说明或告警标题"
              style={{ minWidth: 260 }}
              data-testid="workspace-logs-search"
            />
            <Select value={module} onChange={setModule} options={MODULE_OPTIONS} style={{ minWidth: 160 }} />
            <Select value={level} onChange={setLevel} options={LEVEL_OPTIONS} style={{ minWidth: 140 }} />
            <Select value={accessType} onChange={setAccessType} options={ACCESS_TYPE_OPTIONS} style={{ minWidth: 160 }} />
            <Select value={severity} onChange={setSeverity} options={SEVERITY_OPTIONS} style={{ minWidth: 140 }} />
            <Select value={alertStatus} onChange={setAlertStatus} options={ALERT_STATUS_OPTIONS} style={{ minWidth: 160 }} />
          </AdminFilterBar>

          <div data-testid="workspace-logs-activity-table">
            <AdminTableCard
              title="操作日志"
              description={`${pageState.activityLogs.length} 条记录`}
              tableProps={{
                rowKey: "id",
                columns: activityColumns,
                dataSource: pageState.activityLogs,
                loading: pageState.status === "loading" || pageState.status === "refreshing",
                pagination: { pageSize: 8, showSizeChanger: false },
                scroll: { x: 1080 },
              }}
            />
          </div>

          <div data-testid="workspace-logs-access-table">
            <AdminTableCard
              title="访问记录"
              description={`${pageState.accessLogs.length} 条记录`}
              tableProps={{
                rowKey: "id",
                columns: accessColumns,
                dataSource: pageState.accessLogs,
                loading: pageState.status === "loading" || pageState.status === "refreshing",
                pagination: { pageSize: 8, showSizeChanger: false },
                scroll: { x: 980 },
              }}
            />
          </div>

          <div data-testid="workspace-logs-alerts-table">
            <AdminTableCard
              title="监控告警"
              description={`${pageState.alerts.length} 条告警`}
              tableProps={{
                rowKey: "id",
                columns: alertColumns,
                dataSource: pageState.alerts.map((item) => ({
                  ...item,
                  status: item.status,
                })),
                loading: pageState.status === "loading" || pageState.status === "refreshing",
                pagination: { pageSize: 8, showSizeChanger: false },
                scroll: { x: 1080 },
              }}
            />
          </div>
        </Space>
      </div>
    </WorkspaceShell>
  );
}

export default WorkspaceLogsPage;
