import React from "react";
import { ArrowRightOutlined, SafetyCertificateOutlined, SwapOutlined } from "@ant-design/icons";
import { Button, Card, Col, Row, Space, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { WorkspaceShell } from "../components/workspace/WorkspaceShell";
import { useAuth } from "../context/useAuth";
import { getDefaultWorkspaceRoute } from "../utils/authRoutes";

const { Paragraph, Text, Title } = Typography;

const roleLabels = {
  employee: "员工账号",
  director: "总监账号",
  developer: "开发者账号",
};

export function WorkspaceForbiddenPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isSwitching, setIsSwitching] = React.useState(false);
  const fallbackRoute = getDefaultWorkspaceRoute(user?.role) ?? "/home";

  const handleSwitchAccount = async () => {
    if (isSwitching) {
      return;
    }

    setIsSwitching(true);

    try {
      await logout();
      navigate("/login", { replace: true });
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <WorkspaceShell
      eyebrow="权限限制"
      title="无权限访问"
      description="当前账号已经登录，但没有访问该后台页面的权限。你可以返回默认工作台，或切换账号后重新进入。"
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card bordered={false}>
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "rgba(250, 173, 20, 0.16)",
                  color: "#faad14",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                }}
              >
                <SafetyCertificateOutlined />
              </div>
              <div>
                <Title level={3} style={{ marginBottom: 8 }}>
                  权限恢复动作
                </Title>
                <Paragraph style={{ marginBottom: 0, color: "#64748b" }}>
                  当前角色为 {roleLabels[user?.role] ?? "受保护账号"}。你可以返回自己的默认工作台，或切换账号后重新访问目标页面。
                </Paragraph>
              </div>
              <Space wrap>
                <Button type="primary" icon={<ArrowRightOutlined />} onClick={() => navigate(fallbackRoute)}>
                  返回我的工作台
                </Button>
                <Button icon={<SwapOutlined />} loading={isSwitching} onClick={handleSwitchAccount}>
                  切换账号
                </Button>
              </Space>
            </Space>
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card bordered={false}>
            <Text style={{ color: "#1677ff", fontWeight: 700, letterSpacing: "0.12em" }}>下一步建议</Text>
            <Paragraph style={{ marginTop: 12, marginBottom: 0, color: "#64748b" }}>
              如果当前账号不具备权限，请先返回自己的默认工作台；如果是角色不匹配，请退出登录并切换为有权限的账号。
            </Paragraph>
          </Card>
        </Col>
      </Row>
    </WorkspaceShell>
  );
}

export default WorkspaceForbiddenPage;
