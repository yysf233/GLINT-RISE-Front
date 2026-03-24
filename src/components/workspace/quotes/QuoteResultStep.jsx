import React from "react";
import { Alert, Button, Card, Empty, Space, Tag, Typography } from "antd";
import { DownloadOutlined, ExportOutlined } from "@ant-design/icons";

const { Paragraph, Text } = Typography;

export function QuoteResultStep({ quote, pricingPreview, generating = false, onGenerate, onOpenExports }) {
  const hasLines = (pricingPreview?.items ?? []).length > 0;
  const hasSheet = Boolean(quote?.quoteSheet);

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }} data-testid="workspace-quotes-step-5">
      <Card bordered={false} title="Step5 生成标准报价单 / 导出联动">
        {hasLines ? (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Space wrap>
              <Tag color="blue">产品行数 {pricingPreview.totals?.lineCount ?? 0}</Tag>
              <Tag color="purple">总数量 {pricingPreview.totals?.totalQuantity ?? 0}</Tag>
              <Tag color="green">对外总额 {pricingPreview.totals?.totalAmount ?? 0}</Tag>
              <Tag color="gold">模具费合计 {pricingPreview.totals?.totalToolingFee ?? 0}</Tag>
            </Space>

            <Alert
              type="info"
              showIcon
              message="标准报价单会固化当前报价参数"
              description="点击生成后会立即下载一份 Excel 标准报价单，并把当前询价状态更新为已生成报价单。随后可进入导出中心继续生成对外资料。"
            />

            <Space wrap>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                loading={generating}
                onClick={onGenerate}
                data-testid="workspace-quotes-generate"
              >
                生成并下载标准报价单
              </Button>

              <Button
                icon={<ExportOutlined />}
                disabled={!hasSheet}
                onClick={onOpenExports}
                data-testid="workspace-quotes-open-exports"
              >
                前往导出中心
              </Button>
            </Space>

            {hasSheet ? (
              <Card size="small" title="最近一次生成结果">
                <Space direction="vertical" size={8}>
                  <Text strong>{quote.quoteSheet.filename}</Text>
                  <Paragraph style={{ marginBottom: 0, color: "#64748b" }}>
                    标准报价单已经生成。下一步可以进入导出中心生成 PDF、PPTX 等对外资料包。
                  </Paragraph>
                </Space>
              </Card>
            ) : null}
          </Space>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="请先完成前四步，系统才能生成标准报价单。" />
        )}
      </Card>
    </Space>
  );
}

export default QuoteResultStep;
