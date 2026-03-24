import React from "react";
import { Card, Form, Space, Typography } from "antd";

const { Text, Title } = Typography;

export function AdminFormSection({
  title,
  description,
  extra,
  children,
  formProps = {},
  footer,
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
      <Form layout="vertical" {...formProps}>
        {children}
        {footer ? <div style={{ marginTop: 24 }}>{footer}</div> : null}
      </Form>
    </Card>
  );
}

export default AdminFormSection;
