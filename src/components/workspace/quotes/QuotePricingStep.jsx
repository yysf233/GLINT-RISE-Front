import React from "react";
import { Card, Empty, Input, List, Space, Tag, Typography } from "antd";

const { Paragraph, Text } = Typography;

export function QuotePricingStep({ pricingPreview, pricingEntries = [], onChangePricingEntry }) {
  const pricingMap = new Map(pricingEntries.map((item) => [item.matchId, item]));

  return (
    <Card bordered={false} title="Step4 加价 / 模具费 / 交期余量">
      {(pricingPreview?.items ?? []).length > 0 ? (
        <List
          dataSource={pricingPreview.items}
          renderItem={(item) => {
            const entry = pricingMap.get(item.matchId) || {};

            return (
              <List.Item>
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  <Space wrap>
                    <Text strong>{item.productName}</Text>
                    <Tag color="blue">{item.supplierName}</Tag>
                    <Tag color="default">数量 {item.quantity}</Tag>
                    <Tag color="default">{item.procurementMode}</Tag>
                  </Space>

                  <Space wrap style={{ width: "100%" }}>
                    <div style={{ minWidth: 180 }}>
                      <Text strong>加价幅度 %</Text>
                      <Input
                        value={entry.markupRate ?? 0}
                        onChange={(event) => onChangePricingEntry?.(item.matchId, "markupRate", event.target.value)}
                        data-testid={`workspace-quotes-markup-${item.matchId}`}
                      />
                    </div>

                    <div style={{ minWidth: 180 }}>
                      <Text strong>模具费</Text>
                      <Input
                        value={entry.toolingFee ?? 0}
                        onChange={(event) => onChangePricingEntry?.(item.matchId, "toolingFee", event.target.value)}
                        data-testid={`workspace-quotes-tooling-${item.matchId}`}
                      />
                    </div>

                    <div style={{ minWidth: 180 }}>
                      <Text strong>交期余量（天）</Text>
                      <Input
                        value={entry.leadTimeBufferDays ?? 0}
                        onChange={(event) =>
                          onChangePricingEntry?.(item.matchId, "leadTimeBufferDays", event.target.value)
                        }
                        data-testid={`workspace-quotes-buffer-${item.matchId}`}
                      />
                    </div>
                  </Space>

                  <Space wrap>
                    {item.baseUnitCostVisible !== null ? (
                      <Tag color="gold">内部成本基线 {item.baseUnitCostVisible}</Tag>
                    ) : (
                      <Tag color="default">内部成本已按权限隐藏</Tag>
                    )}
                    <Tag color="green">对外单价 {item.outwardUnitPrice}</Tag>
                    <Tag color="blue">总工期 {item.leadTimeDays} 天</Tag>
                    <Tag color="purple">总价 {item.outwardLineTotal}</Tag>
                  </Space>

                  <Paragraph style={{ marginBottom: 0, color: "#64748b" }}>
                    修改参数后会立即刷新报价预览。员工仅可看到对外结果，总监可额外看到内部成本基线。
                  </Paragraph>
                </Space>
              </List.Item>
            );
          }}
        />
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="请先完成产品匹配和供应商选择。" />
      )}
    </Card>
  );
}

export default QuotePricingStep;
