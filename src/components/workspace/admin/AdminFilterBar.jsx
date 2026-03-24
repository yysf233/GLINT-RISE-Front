import React from "react";
import { Card, Space, Typography } from "antd";

const { Text, Title } = Typography;

export function AdminFilterBar({ title, description, extra, children, style, bodyStyle }) {
  return (
    <Card
      bordered={false}
      style={{ ...style }}
      styles={{ body: { padding: 20, ...bodyStyle } }}
      title={
        title || description ? (
          <Space direction="vertical" size={4}>
            {title ? <Title level={5} style={{ margin: 0 }}>{title}</Title> : null}
            {description ? <Text type="secondary">{description}</Text> : null}
          </Space>
        ) : null
      }
      extra={extra}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "end" }}>{children}</div>
    </Card>
  );
}

export default AdminFilterBar;
