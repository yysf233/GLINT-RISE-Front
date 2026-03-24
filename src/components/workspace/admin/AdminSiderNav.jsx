import React from "react";
import {
  AlertOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  DatabaseOutlined,
  ExportOutlined,
  FileSearchOutlined,
  HomeOutlined,
  PictureOutlined,
  ProfileOutlined,
  SettingOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Space, Tag, Typography } from "antd";
import { getAdminNavGroups } from "./adminNavConfig";

const { Sider } = Layout;
const { Text, Title } = Typography;

const iconMap = {
  "/workspace/dashboard": <HomeOutlined />,
  "/workspace/products": <DatabaseOutlined />,
  "/workspace/projects": <ProfileOutlined />,
  "/workspace/content": <SettingOutlined />,
  "/workspace/content/banners": <PictureOutlined />,
  "/workspace/suppliers": <TeamOutlined />,
  "/workspace/quotes": <BarChartOutlined />,
  "/workspace/exports": <ExportOutlined />,
  "/workspace/settings/content": <AppstoreOutlined />,
  "/workspace/settings/users": <TeamOutlined />,
  "/workspace/settings/logs": <FileSearchOutlined />,
};

function getSelectedKey(groups, pathname) {
  const allItems = groups.flatMap((group) => group.items);
  const matched = allItems.find((item) => pathname === item.to || pathname.startsWith(`${item.to}/`));
  return matched?.to ?? pathname;
}

export function AdminSiderNav({ role, pathname, onNavigate, collapsed = false, onCollapse }) {
  const groups = getAdminNavGroups(role);
  const selectedKey = getSelectedKey(groups, pathname);
  const items = groups.map((group) => ({
    key: group.label,
    type: "group",
    label: group.label,
    children: group.items.map((item) => ({
      key: item.to,
      icon: iconMap[item.to] ?? <AlertOutlined />,
      label: (
        <Space size={8}>
          <span>{item.label}</span>
          {item.isPlaceholder ? <Tag color="default">待开发</Tag> : null}
        </Space>
      ),
    })),
  }));

  return (
    <Sider
      width={272}
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      breakpoint="lg"
      style={{ minHeight: "100vh", padding: 16, background: "#0f172a" }}
    >
      <div
        style={{
          padding: 16,
          borderRadius: 20,
          background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
          border: "1px solid rgba(255,255,255,0.08)",
          marginBottom: 16,
        }}
      >
        <Text style={{ color: "rgba(255,255,255,0.72)", fontSize: 12, letterSpacing: "0.16em" }}>GLINT RISE</Text>
        <Title level={4} style={{ color: "#ffffff", margin: "10px 0 0" }}>
          业务后台
        </Title>
        <Text style={{ color: "rgba(255,255,255,0.65)" }}>面向员工、总监与开发者的统一管理界面</Text>
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={items}
        onClick={({ key }) => onNavigate(key)}
        style={{ background: "transparent", borderInlineEnd: "none" }}
      />
    </Sider>
  );
}

export default AdminSiderNav;
