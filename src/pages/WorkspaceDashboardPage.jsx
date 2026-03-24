import React from "react";
import { BarChartOutlined, ProfileOutlined, TeamOutlined } from "@ant-design/icons";
import { Card, Col, Row, Space, Statistic, Typography } from "antd";
import { WorkspaceShell } from "../components/workspace/WorkspaceShell";
import { useAuth } from "../context/useAuth";

const { Paragraph, Text, Title } = Typography;

const dashboardConfigs = {
  employee: {
    eyebrow: "后台首页",
    title: "仪表盘",
    description: "员工从这里进入业务后台。当前阶段先固定后台首页结构、导航分组和核心模块入口，为后续业务闭环提供稳定壳层。",
    focusTitle: "今日工作入口",
    focusBody: "当前仪表盘先展示待办方向、模块入口和阶段性说明，不在这一轮提前扩展真实统计接口。",
    modules: [
      {
        title: "待办总览",
        description: "为员工保留今日任务、异常提醒和协作通知入口，后续波次可以继续填充真实数据。",
        icon: TeamOutlined,
      },
      {
        title: "资料快捷入口",
        description: "预留给公共资料、常用筛选和最近访问记录，当前仅固定布局与卡片样式。",
        icon: ProfileOutlined,
      },
      {
        title: "后续模块",
        description: "供应商、询价、导出等后续能力会继续挂接到同一套后台基座中。",
        icon: BarChartOutlined,
      },
    ],
  },
  director: {
    eyebrow: "后台首页",
    title: "仪表盘",
    description: "总监使用同一套后台壳层，但首页文案偏管理视角，强调阶段进度、模块状态与发布闭环。",
    focusTitle: "管理视角",
    focusBody: "后续可以在这里挂载审批、运营信号和跨团队观察点，当前先统一首页结构和 Ant Design 后台风格。",
    modules: [
      {
        title: "发布总览",
        description: "为总监保留产品、项目、轮播配置等发布状态总览区域。",
        icon: BarChartOutlined,
      },
      {
        title: "团队节奏",
        description: "后续用于查看跨团队协同、更新时间点和关键风险提示。",
        icon: TeamOutlined,
      },
      {
        title: "后续模块",
        description: "当前重点是锁定首页结构与入口层级，更多总监模块将在后续波次补齐。",
        icon: ProfileOutlined,
      },
    ],
  },
};

function PlaceholderCard({ item }) {
  const Icon = item.icon;

  return (
    <Card bordered={false} style={{ height: "100%" }}>
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "rgba(22, 119, 255, 0.12)",
            color: "#1677ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
          }}
        >
          <Icon />
        </div>
        <Title level={4} style={{ margin: 0 }}>
          {item.title}
        </Title>
        <Paragraph style={{ marginBottom: 0, color: "#64748b" }}>{item.description}</Paragraph>
      </Space>
    </Card>
  );
}

export function WorkspaceDashboardPage() {
  const { user } = useAuth();
  const config = dashboardConfigs[user?.role] ?? dashboardConfigs.employee;

  return (
    <WorkspaceShell eyebrow={config.eyebrow} title={config.title} description={config.description}>
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} xl={14}>
            <Card bordered={false}>
              <Text style={{ color: "#1677ff", fontWeight: 700, letterSpacing: "0.12em" }}>角色概览</Text>
              <Title level={3} style={{ marginTop: 12, marginBottom: 0 }}>
                {config.focusTitle}
              </Title>
              <Paragraph style={{ marginTop: 12, marginBottom: 0, color: "#64748b" }}>{config.focusBody}</Paragraph>
            </Card>
          </Col>
          <Col xs={24} xl={10}>
            <Card bordered={false} style={{ height: "100%" }}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic title="已接入模块" value={3} suffix="个" />
                </Col>
                <Col span={12}>
                  <Statistic title="当前阶段" value="第 1 波" />
                </Col>
                <Col span={12}>
                  <Statistic title="核心目标" value="后台基座" />
                </Col>
                <Col span={12}>
                  <Statistic title="当前角色" value={user?.role === "director" ? "总监" : "员工"} />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <div>
          <Text style={{ color: "#1677ff", fontWeight: 700, letterSpacing: "0.12em" }}>模块入口</Text>
          <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
            {config.modules.map((item) => (
              <Col key={item.title} xs={24} md={12} xl={8}>
                <PlaceholderCard item={item} />
              </Col>
            ))}
          </Row>
        </div>
      </Space>
    </WorkspaceShell>
  );
}

export default WorkspaceDashboardPage;
