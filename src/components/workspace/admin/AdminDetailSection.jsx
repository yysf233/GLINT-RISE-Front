import React from "react";
import { Card, Descriptions, Typography } from "antd";

const { Text, Title } = Typography;

export function AdminDetailSection({
  title,
  description,
  extra,
  items = [],
  column = 2,
  bordered = true,
  children,
  style,
}) {
  return (
    <Card
      bordered={false}
      style={style}
      title={
        title || description ? (
          <div>
            {title ? <Title level={5} style={{ margin: 0 }}>{title}</Title> : null}
            {description ? (
              <Text type="secondary" style={{ display: "block", marginTop: 4 }}>
                {description}
              </Text>
            ) : null}
          </div>
        ) : null
      }
      extra={extra}
    >
      <Descriptions bordered={bordered} column={column} items={items} />
      {children ? <div style={{ marginTop: 16 }}>{children}</div> : null}
    </Card>
  );
}

export default AdminDetailSection;
