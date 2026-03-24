import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, List, Space, Tag, Typography } from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { AdminDetailSection } from "../components/workspace/admin/AdminDetailSection";
import { AdminPageHeader } from "../components/workspace/admin/AdminPageHeader";
import { AdminResultState } from "../components/workspace/admin/AdminResultState";
import { WorkspaceShell } from "../components/workspace/WorkspaceShell";
import { useAuth } from "../context/useAuth";
import workspaceUsersApi from "../services/workspace/workspaceUsersApi";

const { Text } = Typography;

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

function permissionTextMap(permissions = {}) {
  return [
    ["内容维护", permissions.contentMaintenance],
    ["站点配置", permissions.siteSettings],
    ["供应商敏感信息", permissions.supplierSensitive],
    ["带价导出", permissions.pricedExport],
    ["用户管理", permissions.userAdmin],
    ["日志查看", permissions.logAccess],
  ];
}

export function WorkspaceUserDetailPage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user } = useAuth();
  const isDirector = user?.role === "director";
  const [pageState, setPageState] = React.useState({
    status: "loading",
    user: null,
    requests: [],
    error: "",
  });

  React.useEffect(() => {
    let active = true;

    workspaceUsersApi
      .getWorkspaceUser(userId, user || {})
      .then((result) => {
        if (!active) return;
        if (result?.error || !result?.user) {
          setPageState({
            status: "error",
            user: null,
            requests: [],
            error: result?.error?.message || "用户详情加载失败。",
          });
          return;
        }

        setPageState({
          status: "ready",
          user: result.user,
          requests: result.requests ?? [],
          error: "",
        });
      })
      .catch(() => {
        if (!active) return;
        setPageState({
          status: "error",
          user: null,
          requests: [],
          error: "用户详情加载失败。",
        });
      });

    return () => {
      active = false;
    };
  }, [user, userId]);

  if (pageState.status === "error") {
    return (
      <WorkspaceShell>
        <AdminResultState
          status="error"
          title="用户详情不可用"
          subTitle={pageState.error}
          actionLabel="返回列表"
          onAction={() => navigate("/workspace/settings/users")}
        />
      </WorkspaceShell>
    );
  }

  const detailUser = pageState.user;
  if (!detailUser) {
    return (
      <WorkspaceShell>
        <AdminResultState status="info" title="正在加载用户详情" />
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell>
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        <AdminPageHeader
          eyebrow="系统管理"
          title={detailUser.name}
          description="查看账号基础信息、权限能力、数据范围和审批记录。"
          extra={
            <Space wrap>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/workspace/settings/users")}>
                返回列表
              </Button>
              <Button
                type="primary"
                icon={<EditOutlined />}
                disabled={!isDirector}
                onClick={() => navigate(`/workspace/settings/users/${detailUser.id}/edit`)}
              >
                编辑用户
              </Button>
            </Space>
          }
        />

        <AdminDetailSection
          title="基础信息"
          items={[
            { key: "identifier", label: "账号标识", children: detailUser.identifier || "--" },
            { key: "email", label: "邮箱", children: detailUser.email || "--" },
            { key: "role", label: "角色", children: <Tag color="blue">{detailUser.role}</Tag> },
            { key: "status", label: "状态", children: <Tag>{detailUser.status}</Tag> },
            { key: "department", label: "部门", children: detailUser.department || "--" },
            { key: "title", label: "岗位", children: detailUser.title || "--" },
            { key: "lastLogin", label: "最近登录", children: formatDate(detailUser.lastLoginAt) },
            { key: "updatedAt", label: "最近更新", children: formatDate(detailUser.updatedAt) },
          ]}
        />

        <AdminDetailSection
          title="权限能力"
          items={permissionTextMap(detailUser.permissions).map(([label, enabled]) => ({
            key: label,
            label,
            children: enabled ? <Tag color="green">已开启</Tag> : <Tag>未开启</Tag>,
          }))}
        />

        <AdminDetailSection
          title="数据可见范围"
          items={[
            { key: "products", label: "产品数据", children: detailUser.dataScope?.products || "--" },
            { key: "suppliers", label: "供应商数据", children: detailUser.dataScope?.suppliers || "--" },
            { key: "quotes", label: "询报价数据", children: detailUser.dataScope?.quotes || "--" },
            { key: "notes", label: "备注", span: 3, children: detailUser.notes || "--" },
          ]}
        />

        <Card bordered={false} title="审批记录">
          <List
            dataSource={pageState.requests}
            locale={{ emptyText: "暂无审批记录" }}
            renderItem={(item) => (
              <List.Item>
                <Space direction="vertical" size={4} style={{ width: "100%" }}>
                  <Space wrap>
                    <Text strong>{item.permissionLabel}</Text>
                    <Tag color={item.status === "approved" ? "green" : item.status === "rejected" ? "red" : "orange"}>
                      {item.status}
                    </Tag>
                  </Space>
                  <Text type="secondary">{item.reason}</Text>
                  <Text type="secondary">
                    提交时间：{formatDate(item.createdAt)} / 审批人：{item.reviewerName || "--"}
                  </Text>
                </Space>
              </List.Item>
            )}
          />
        </Card>

        <Card bordered={false} title="操作日志">
          <List
            dataSource={detailUser.logs ?? []}
            locale={{ emptyText: "暂无操作日志" }}
            renderItem={(item) => (
              <List.Item>
                <Space direction="vertical" size={4}>
                  <Text strong>{item.action}</Text>
                  <Text type="secondary">{item.message}</Text>
                  <Text type="secondary">
                    {formatDate(item.timestamp)} / {item.actor || "--"}
                  </Text>
                </Space>
              </List.Item>
            )}
          />
        </Card>
      </Space>
    </WorkspaceShell>
  );
}

export default WorkspaceUserDetailPage;
