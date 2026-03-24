import React from "react";
import { Breadcrumb, Space, Typography } from "antd";

const { Text, Title, Paragraph } = Typography;

export function AdminPageHeader({ eyebrow, title, description, breadcrumbItems = [], extra }) {
  return (
    <Space direction="vertical" size={8} style={{ width: "100%" }}>
      {breadcrumbItems.length > 0 ? <Breadcrumb items={breadcrumbItems} /> : null}
      {eyebrow ? (
        <Text style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: "#1677ff" }}>{eyebrow}</Text>
      ) : null}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <Title level={2} style={{ margin: 0 }}>
            {title}
          </Title>
          {description ? (
            <Paragraph style={{ marginTop: 8, marginBottom: 0, maxWidth: 880, color: "#64748b" }}>{description}</Paragraph>
          ) : null}
        </div>
        {extra ? <div>{extra}</div> : null}
      </div>
    </Space>
  );
}

export default AdminPageHeader;
