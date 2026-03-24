import React from "react";
import { useNavigate } from "react-router-dom";
import { App, Button, Card, Col, Input, List, Row, Space, Tag, Typography } from "antd";
import { ArrowLeftOutlined, CloudUploadOutlined, FileSearchOutlined } from "@ant-design/icons";
import { AdminPageHeader } from "../components/workspace/admin/AdminPageHeader";
import { AdminResultState } from "../components/workspace/admin/AdminResultState";
import { WorkspaceShell } from "../components/workspace/WorkspaceShell";
import { useAuth } from "../context/useAuth";
import workspaceSuppliersApi from "../services/workspace/workspaceSuppliersApi";
import { showAppMessage } from "../utils/safeAppMessage";

const { Paragraph, Text, Title } = Typography;

const SAMPLE_IMPORT = `Nova Factory||Strategic retail launch|3600|12-18天|高|retail, flagship|内部员工|false|Mina|13800000010|mina@nova.test|88|12|Precision metal shop|wp-lumina-arc|Primary strategic factory
Inner Assembly Lab||Prototype batches|1800|7-10天|中|prototype, assembly|内部员工|true|Iris|13800000003|iris@supplier.test|76|4|Prototype assembly and short-cycle verification|wp-smart-hub|Private prototype supplier`;

export function WorkspaceSupplierImportPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const app = App.useApp();
  const [rawText, setRawText] = React.useState(SAMPLE_IMPORT);
  const [previewState, setPreviewState] = React.useState({
    status: "idle",
    items: [],
    warnings: [],
    error: "",
  });
  const [isImporting, setIsImporting] = React.useState(false);

  const handlePreview = async () => {
    setPreviewState({
      status: "loading",
      items: [],
      warnings: [],
      error: "",
    });

    const result = await workspaceSuppliersApi.previewWorkspaceSuppliersImport(rawText);
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
      items: (result.preview ?? []).filter((entry) => entry.supplier).map((entry) => entry.supplier),
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
      const result = await workspaceSuppliersApi.importWorkspaceSuppliers(rawText, user || {});
      if (result?.error) {
        showAppMessage(app, "error", result.error.message || "导入失败，请重试。");
        return;
      }

      showAppMessage(app, "success", `已导入 ${result.importedCount ?? 0} 条供应商记录。`);
      navigate("/workspace/suppliers");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <WorkspaceShell>
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        <AdminPageHeader
          eyebrow="批量导入"
          title="批量导入供应商"
          description="支持按管道符分隔的文本导入。未填写评级时会根据适配度和专利数自动评级；员工导入时 owner 固定为本人。"
          extra={
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/workspace/suppliers")}>
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
                顺序：`name|rating|cooperationHistory|companyArea|leadTimeBand|priceBand|tags|owner|isPrivate|contactName|contactPhone|contactEmail|fitScore|patentCount|capacitySummary|relatedProductIds|summary`
              </Paragraph>
              <Input.TextArea
                value={rawText}
                onChange={(event) => setRawText(event.target.value)}
                rows={12}
                placeholder="粘贴批量导入文本"
                data-testid="workspace-supplier-import-text"
              />
              <Space style={{ marginTop: 16 }} wrap>
                <Button
                  icon={<FileSearchOutlined />}
                  onClick={handlePreview}
                  data-testid="workspace-supplier-import-preview"
                  loading={previewState.status === "loading"}
                >
                  预览导入
                </Button>
                <Button
                  type="primary"
                  icon={<CloudUploadOutlined />}
                  onClick={handleImport}
                  data-testid="workspace-supplier-import-submit"
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
                <Paragraph type="secondary">点击“预览导入”生成校验结果，确认后再写入 mock 数据。</Paragraph>
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

              {previewState.items.length > 0 ? (
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  {previewState.items.map((item, index) => (
                    <Card key={`${item.name}-${index}`} size="small" className="admin-surface">
                      <Space direction="vertical" size={6} style={{ width: "100%" }}>
                        <Space style={{ width: "100%", justifyContent: "space-between" }}>
                          <Text strong>{item.name}</Text>
                          <Text type="secondary">{item.rating} 级</Text>
                        </Space>
                        <Text type="secondary">{item.summary || item.cooperationHistory}</Text>
                        <Space size={8} wrap>
                          <Tag>{item.leadTimeBand}</Tag>
                          <Tag>{item.priceBand}</Tag>
                          <Tag color={item.isPrivate ? "gold" : "blue"}>{item.isPrivate ? "私有" : "公开"}</Tag>
                          <Tag>{item.owner || "导入后由当前用户补全"}</Tag>
                          {(item.tags ?? []).map((tag) => (
                            <Tag key={`${item.name}-${tag}`}>{tag}</Tag>
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

export default WorkspaceSupplierImportPage;
