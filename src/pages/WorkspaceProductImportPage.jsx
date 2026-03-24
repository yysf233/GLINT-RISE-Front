import React from "react";
import { useNavigate } from "react-router-dom";
import { App, Button, Card, Col, Input, List, Row, Space, Tag, Typography } from "antd";
import { ArrowLeftOutlined, CloudUploadOutlined, FileSearchOutlined } from "@ant-design/icons";
import { AdminPageHeader } from "../components/workspace/admin/AdminPageHeader";
import { AdminResultState } from "../components/workspace/admin/AdminResultState";
import { WorkspaceShell } from "../components/workspace/WorkspaceShell";
import workspaceProductsApi from "../services/workspaceProductsApi";
import { mapWorkspaceProductImportPreview } from "../utils/workspaceProductForm";
import { showAppMessage } from "../utils/safeAppMessage";

const { Paragraph, Text, Title } = Typography;

const SAMPLE_IMPORT = `Aurora Stage Grid|aurora-stage-grid|space|draft|Mina Wu|4600|3100|immersive, launch|yes|Spatial product grid for stage and gallery deployments.
Signal Relay Mini|signal-relay-mini|device|active|Harper Lin|1580|940|compact, retail|no|Compact smart device for light operational rollouts.`;

export function WorkspaceProductImportPage() {
  const navigate = useNavigate();
  const app = App.useApp();
  const [rawText, setRawText] = React.useState(SAMPLE_IMPORT);
  const [previewState, setPreviewState] = React.useState({
    status: "idle",
    items: [],
    warnings: [],
    error: "",
  });
  const [isImporting, setIsImporting] = React.useState(false);

  const previewItems = React.useMemo(
    () => mapWorkspaceProductImportPreview(previewState.items),
    [previewState.items],
  );

  const handlePreview = async () => {
    setPreviewState({
      status: "loading",
      items: [],
      warnings: [],
      error: "",
    });

    const result = await workspaceProductsApi.previewWorkspaceProductImport(rawText);

    if (result?.error) {
      setPreviewState({
        status: "error",
        items: [],
        warnings: [],
        error: result.error.message || "无法预览导入内容。",
      });
      return;
    }

    setPreviewState({
      status: "ready",
      items: (result.preview ?? [])
        .filter((entry) => entry.product)
        .map((entry) => entry.product),
      warnings: result.warnings ?? [],
      error: "",
    });
  };

  const handleImport = async () => {
    if (isImporting) return;

    if (previewState.status !== "ready") {
      await handlePreview();
      return;
    }

    setIsImporting(true);

    try {
      const result = await workspaceProductsApi.importWorkspaceProducts(rawText);

      if (result?.error) {
        showAppMessage(app, "error", result.error.message || "导入失败，请重试。");
        return;
      }

      showAppMessage(app, "success", `已导入 ${result.importedCount ?? 0} 条产品记录。`);
      navigate("/workspace/products");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <WorkspaceShell>
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        <AdminPageHeader
          eyebrow="批量导入"
          title="批量导入产品"
          description="粘贴管道符分隔的文本，预览后写入 mock 数据。"
          extra={
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/workspace/products")}>
              返回列表
            </Button>
          }
        />

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={14}>
            <Card bordered={false}>
              <Title level={5} style={{ marginBottom: 12 }}>
                导入格式
              </Title>
              <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                顺序：<Text code>name|id|category|status|owner|retailPrice|internalCost|tags|needsUpdate|summary</Text>
              </Paragraph>
              <Input.TextArea
                value={rawText}
                onChange={(event) => setRawText(event.target.value)}
                rows={12}
                placeholder="粘贴批量导入文本"
                data-testid="workspace-product-import-text"
              />
              <Space style={{ marginTop: 16 }} wrap>
                <Button
                  icon={<FileSearchOutlined />}
                  onClick={handlePreview}
                  data-testid="workspace-product-import-preview"
                  loading={previewState.status === "loading"}
                >
                  预览导入
                </Button>
                <Button
                  type="primary"
                  icon={<CloudUploadOutlined />}
                  onClick={handleImport}
                  data-testid="workspace-product-import-submit"
                  loading={isImporting}
                >
                  确认导入
                </Button>
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card bordered={false}>
              <Title level={5} style={{ marginBottom: 12 }}>
                预览结果
              </Title>

              {previewState.status === "idle" ? (
                <Paragraph type="secondary">点击“预览导入”生成校验结果，确认无误后再导入。</Paragraph>
              ) : null}

              {previewState.status === "loading" ? (
                <Paragraph type="secondary">正在生成预览...</Paragraph>
              ) : null}

              {previewState.status === "error" ? (
                <AdminResultState status="error" title="预览失败" subTitle={previewState.error} />
              ) : null}

              {previewState.warnings.length > 0 ? (
                <Card size="small" className="admin-warning-card">
                  <Title level={5} style={{ marginBottom: 8 }}>
                    警告提示
                  </Title>
                  <List
                    size="small"
                    dataSource={previewState.warnings}
                    renderItem={(warning) => <List.Item>{warning}</List.Item>}
                  />
                </Card>
              ) : null}

              {previewItems.length > 0 ? (
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  {previewItems.map((item) => (
                    <Card key={item.id} size="small" className="admin-surface">
                      <Space direction="vertical" size={6} style={{ width: "100%" }}>
                        <Space style={{ width: "100%", justifyContent: "space-between" }}>
                          <Text strong>{item.name}</Text>
                          <Text type="secondary">{item.id}</Text>
                        </Space>
                        <Text type="secondary">{item.summary}</Text>
                        <Space size={8} wrap>
                          <Tag>{item.category}</Tag>
                          <Tag color="blue">{item.status}</Tag>
                          <Tag>{item.owner}</Tag>
                          {item.tags.map((tag) => (
                            <Tag key={`${item.id}-${tag}`}>{tag}</Tag>
                          ))}
                        </Space>
                      </Space>
                    </Card>
                  ))}
                </Space>
              ) : null}
            </Card>
          </Col>
        </Row>
      </Space>
    </WorkspaceShell>
  );
}

export default WorkspaceProductImportPage;
