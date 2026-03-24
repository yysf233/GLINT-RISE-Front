import React from "react";
import { CheckCircleOutlined, FileTextOutlined, ToolOutlined } from "@ant-design/icons";
import { Card, Col, Row, Space, Typography } from "antd";
import { WorkspaceShell } from "../components/workspace/WorkspaceShell";

const { Paragraph, Text, Title } = Typography;

const contentModules = [
  {
    title: "内容维护入口",
    description: "开发者从这里进入站点内容维护能力，后续会继续补齐站点配置、推荐配置和发布规则。",
    icon: ToolOutlined,
  },
  {
    title: "结构校验",
    description: "保留字段校验、路由检查和基础规则的位置，当前只先固定管理端的排版与说明。",
    icon: CheckCircleOutlined,
  },
  {
    title: "发布复核",
    description: "后续可补发布前检查与回归提醒，这一轮只需要明确开发者的维护落点。",
    icon: FileTextOutlined,
  },
];

export function WorkspaceContentPage() {
  return (
    <WorkspaceShell
      eyebrow="系统管理"
      title="内容管理"
      description="开发者账号落在内容管理页面。当前先保留站点维护入口和后续能力边界，不提前扩展复杂 CMS。"
    >
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} xl={14}>
            <Card bordered={false}>
              <Text style={{ color: "#1677ff", fontWeight: 700, letterSpacing: "0.12em" }}>当前范围</Text>
              <Title level={3} style={{ marginTop: 12, marginBottom: 0 }}>
                维护入口已就绪
              </Title>
              <Paragraph style={{ marginTop: 12, marginBottom: 0, color: "#64748b" }}>
                这一轮先把开发者的内容维护落点和后台样式统一起来，不提前扩展真实 CMS 表单与版本流转。
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} xl={10}>
            <Card bordered={false} style={{ height: "100%" }}>
              <Paragraph style={{ marginBottom: 0, color: "#64748b" }}>
                后续高权限系统会继续在这里补齐首页轮播配置、推荐位配置、标签管理、日志与监控等模块。
              </Paragraph>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          {contentModules.map((item) => {
            const Icon = item.icon;

            return (
              <Col key={item.title} xs={24} md={12} xl={8}>
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
              </Col>
            );
          })}
        </Row>
      </Space>
    </WorkspaceShell>
  );
}

export default WorkspaceContentPage;
