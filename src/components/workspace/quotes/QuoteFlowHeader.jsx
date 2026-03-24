import React from "react";
import { Button, Card, Space, Steps, Tag, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";

const { Paragraph, Text, Title } = Typography;

const DEFAULT_STEP_ITEMS = [
  { title: "Step1", description: "导入需求" },
  { title: "Step2", description: "匹配产品" },
  { title: "Step3", description: "推荐供应商" },
  { title: "Step4", description: "报价预览" },
  { title: "Step5", description: "生成标准单" },
];

function buildMetaTags(quoteMeta = [], activeTitle, status, updatedAt) {
  if (quoteMeta.length > 0) {
    return quoteMeta;
  }

  const items = [];

  if (activeTitle) {
    items.push({ key: "title", label: "当前单据", value: activeTitle, color: "blue" });
  }

  if (status) {
    items.push({
      key: "status",
      label: "状态",
      value: status === "quoted" ? "已生成报价单" : "草稿",
      color: status === "quoted" ? "green" : "gold",
    });
  }

  if (updatedAt) {
    items.push({ key: "updatedAt", label: "最近更新", value: updatedAt, color: "default" });
  }

  return items;
}

export function QuoteFlowHeader({
  title,
  description,
  currentStep = 1,
  stepItems = [],
  quoteMeta = [],
  activeTitle,
  status,
  updatedAt,
  onNewQuote,
  onRefresh,
  onStepChange,
}) {
  const resolvedTitle = title || activeTitle || "未命名询价单";
  const resolvedDescription =
    description ||
    "用五步流程完成需求导入、产品匹配、供应商推荐、报价预览和标准报价单生成，并与导出中心联动。";
  const resolvedStepItems = stepItems.length > 0 ? stepItems : DEFAULT_STEP_ITEMS;
  const resolvedMeta = buildMetaTags(quoteMeta, activeTitle, status, updatedAt);

  return (
    <Card
      bordered={false}
      style={{
        background:
          "linear-gradient(135deg, rgba(22,119,255,0.14) 0%, rgba(14,21,40,0.94) 52%, rgba(14,21,40,0.98) 100%)",
        color: "#fff",
        overflow: "hidden",
      }}
      styles={{ body: { padding: 28 } }}
    >
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Text style={{ color: "rgba(255,255,255,0.72)", fontSize: 12, letterSpacing: "0.16em" }}>
            询报价流程
          </Text>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              alignItems: "flex-start",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <Title level={2} style={{ margin: 0, color: "#fff" }}>
                {resolvedTitle}
              </Title>
              <Paragraph style={{ marginTop: 8, marginBottom: 0, maxWidth: 900, color: "rgba(255,255,255,0.8)" }}>
                {resolvedDescription}
              </Paragraph>
            </div>

            <Space wrap>
              <Button icon={<ReloadOutlined />} onClick={onRefresh}>
                刷新数据
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={onNewQuote} data-testid="workspace-quotes-new">
                新建询价单
              </Button>
            </Space>
          </div>
        </Space>

        {resolvedMeta.length > 0 ? (
          <Space wrap>
            {resolvedMeta.map((item) => (
              <Tag key={item.key ?? item.label} color={item.color || "default"} style={{ marginInlineEnd: 0 }}>
                {item.label}：{item.value}
              </Tag>
            ))}
          </Space>
        ) : null}

        <Steps current={Math.max(0, currentStep - 1)} items={resolvedStepItems} onChange={(index) => onStepChange?.(index + 1)} />
      </Space>
    </Card>
  );
}

export default QuoteFlowHeader;
