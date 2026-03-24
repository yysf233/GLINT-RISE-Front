import React from "react";
import { Alert, Button, Card, Select, Space, Tag, Typography } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

const { Paragraph, Text, Title } = Typography;

export function QuoteMatchesStep({
  matches = [],
  products = [],
  onChangeMatchProduct,
  onAddManualMatch,
  onRemoveMatch,
}) {
  const productOptions = products.map((product) => ({
    value: product.id,
    label: `${product.name} (${product.id})`,
  }));
  const visibleMatches = matches.filter((item) => !item.skipped);

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }} data-testid="workspace-quotes-step-2">
      <Card bordered={false}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Title level={4} style={{ margin: 0 }}>
            Step2 匹配产品结果
          </Title>
          <Paragraph style={{ marginBottom: 0, color: "#64748b" }}>
            系统会根据关键词自动匹配产品。这里支持手动替换、补充和删除，确保进入供应商推荐前的产品清单准确可控。
          </Paragraph>
          <Button icon={<PlusOutlined />} onClick={onAddManualMatch} data-testid="workspace-quotes-add-match">
            手动补充产品
          </Button>
        </Space>
      </Card>

      {visibleMatches.length === 0 ? (
        <Alert
          type="info"
          showIcon
          message="当前没有可用的匹配结果"
          description="请先在 Step1 保存至少一条有效需求，系统会自动生成产品匹配结果。"
        />
      ) : (
        visibleMatches.map((match, index) => {
          const candidateProducts = productOptions.filter((item) => match.candidateProductIds?.includes(item.value));
          const selectOptions = candidateProducts.length > 0 ? candidateProducts : productOptions;

          return (
            <Card
              key={match.id}
              bordered={false}
              title={`需求 ${index + 1}：${match.requirementName}`}
              extra={
                <Button
                  danger
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => onRemoveMatch?.(match.id)}
                  data-testid={`workspace-quotes-remove-match-${index}`}
                >
                  删除匹配
                </Button>
              }
            >
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <Space wrap>
                  <Tag color="blue">候选产品 {candidateProducts.length || productOptions.length}</Tag>
                  <Tag color="gold">当前主匹配 {match.productId || "未选择"}</Tag>
                  {match.manualAdded ? <Tag color="purple">手动补充</Tag> : null}
                </Space>

                <div>
                  <Text strong>主匹配产品</Text>
                  <Select
                    showSearch
                    optionFilterProp="label"
                    value={match.productId || undefined}
                    options={selectOptions}
                    onChange={(value) => onChangeMatchProduct?.(match.id, value)}
                    placeholder="请选择匹配产品"
                    style={{ width: "100%" }}
                    data-testid={`workspace-quotes-match-product-${index}`}
                  />
                </div>

                <div>
                  <Text strong>候选产品</Text>
                  <Space wrap style={{ marginTop: 8 }}>
                    {candidateProducts.length > 0 ? (
                      candidateProducts.map((item) => (
                        <Tag key={item.value} color={item.value === match.productId ? "blue" : "default"}>
                          {item.label}
                        </Tag>
                      ))
                    ) : (
                      <Text type="secondary">当前条目无候选集，已开放全部产品供手动选择。</Text>
                    )}
                  </Space>
                </div>
              </Space>
            </Card>
          );
        })
      )}
    </Space>
  );
}

export default QuoteMatchesStep;
