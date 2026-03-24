import React from "react";
import { Card, Empty, List, Select, Space, Tag, Typography } from "antd";

const { Paragraph, Text } = Typography;

const SORT_OPTIONS = [
  { value: "score", label: "默认综合评分" },
  { value: "price", label: "按价格带" },
  { value: "leadTime", label: "按交期" },
  { value: "capability", label: "按工艺能力" },
];

export function QuoteSuppliersStep({
  matches = [],
  recommendations = [],
  supplierSortBy = "score",
  supplierSelections = [],
  onSortChange,
  onSelectSupplier,
}) {
  const recommendationMap = new Map(recommendations.map((item) => [item.matchId, item]));
  const selectionMap = new Map(supplierSelections.map((item) => [item.matchId, item.supplierId]));
  const visibleMatches = matches.filter((match) => match.productId && !match.skipped);

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }} data-testid="workspace-quotes-step-3">
      <Card
        bordered={false}
        title="Step3 供应商推荐与排序"
        extra={
          <Select
            value={supplierSortBy}
            options={SORT_OPTIONS}
            style={{ minWidth: 220 }}
            onChange={onSortChange}
            data-testid="workspace-quotes-supplier-sort"
          />
        }
      >
        <List
          dataSource={visibleMatches}
          locale={{ emptyText: "当前没有可继续推荐供应商的产品匹配。" }}
          renderItem={(match) => {
            const recommendation = recommendationMap.get(match.id);
            const options = (recommendation?.items ?? []).map((item) => ({
              value: item.supplierId,
              label: `${item.supplierName} / ${item.rating}级 / ${item.leadTimeBand || "--"} / ${item.priceBand || "--"}`,
            }));

            return (
              <List.Item>
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  <Space wrap>
                    <Text strong>{match.requirementName}</Text>
                    <Tag color="blue">{match.productId}</Tag>
                  </Space>

                  {options.length > 0 ? (
                    <>
                      <Select
                        value={selectionMap.get(match.id) || undefined}
                        options={options}
                        style={{ width: "100%" }}
                        onChange={(value) => onSelectSupplier?.(match.id, value)}
                        data-testid={`workspace-quotes-supplier-select-${match.id}`}
                      />

                      <Space wrap>
                        {(recommendation?.items ?? []).map((item) => (
                          <Tag key={`${match.id}-${item.supplierId}`} color={item.isMasked ? "gold" : "default"}>
                            {item.supplierName} / {item.rating}级 / {item.leadTimeBand}
                          </Tag>
                        ))}
                      </Space>
                    </>
                  ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="当前未找到可推荐供应商，请回到 Step2 调整产品匹配。" />
                  )}

                  <Paragraph style={{ marginBottom: 0, color: "#64748b" }}>
                    推荐结果已经结合产品关联、评分、交期和工艺能力计算。切换排序后，选择结果会保留在当前询价草稿里。
                  </Paragraph>
                </Space>
              </List.Item>
            );
          }}
        />
      </Card>
    </Space>
  );
}

export default QuoteSuppliersStep;
