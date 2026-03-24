import React from "react";
import { Card, Space, Steps, Typography } from "antd";

const { Text, Title } = Typography;

export function AdminStepShell({
  title,
  description,
  extra,
  steps = [],
  current = 0,
  onChange,
  children,
  style,
}) {
  return (
    <Card
      bordered={false}
      style={style}
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
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        <Steps current={current} items={steps} onChange={onChange} />
        <div>{children}</div>
      </Space>
    </Card>
  );
}

export default AdminStepShell;
