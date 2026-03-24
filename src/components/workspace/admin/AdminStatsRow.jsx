import React from "react";
import { Card, Col, Row, Statistic, Typography } from "antd";

const { Text } = Typography;

export function AdminStatsRow({ items = [], gutter = 16 }) {
  return (
    <Row gutter={[gutter, gutter]}>
      {items.map((item) => (
        <Col key={item.key ?? item.label} xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ height: "100%" }}>
            <Statistic
              title={item.label}
              value={item.value}
              valueStyle={item.valueStyle}
              prefix={item.prefix}
              suffix={item.suffix}
            />
            {item.description ? (
              <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
                {item.description}
              </Text>
            ) : null}
          </Card>
        </Col>
      ))}
    </Row>
  );
}

export default AdminStatsRow;
