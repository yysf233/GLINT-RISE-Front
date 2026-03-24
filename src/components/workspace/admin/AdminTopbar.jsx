import React from "react";
import { ArrowLeftOutlined, LogoutOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Space, Tag } from "antd";

const roleLabels = {
  employee: "员工账号",
  director: "总监账号",
  developer: "开发者账号",
};

export function AdminTopbar({ role, isLoggingOut, onBackToPublicSite, onLogout }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <Input
        prefix={<SearchOutlined />}
        placeholder="搜索后台模块、产品、项目"
        style={{ maxWidth: 360 }}
        allowClear
      />

      <Space wrap size={12}>
        <Tag color="blue" style={{ marginInlineEnd: 0, paddingInline: 12, lineHeight: "30px", borderRadius: 999 }}>
          {roleLabels[role] ?? "受保护账号"}
        </Tag>
        <Button icon={<ArrowLeftOutlined />} onClick={onBackToPublicSite}>
          返回官网
        </Button>
        <Button type="primary" icon={<LogoutOutlined />} loading={isLoggingOut} onClick={onLogout}>
          退出登录
        </Button>
      </Space>
    </div>
  );
}

export default AdminTopbar;
