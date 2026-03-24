import React from "react";
import { Card, Table, Typography } from "antd";

const { Text, Title } = Typography;

export function AdminTableCard({ title, description, extra, tableProps = {}, style, bodyStyle }) {
  return (
    <Card
      bordered={false}
      style={style}
      styles={{ body: { padding: 0, ...bodyStyle } }}
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
      <Table {...tableProps} />
    </Card>
  );
}

export default AdminTableCard;
