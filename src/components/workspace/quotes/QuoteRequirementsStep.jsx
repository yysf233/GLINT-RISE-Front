import React from "react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Divider,
  Input,
  InputNumber,
  Space,
  Tag,
  Typography,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

const { Paragraph, Text, Title } = Typography;
const { TextArea } = Input;

function getNumericValue(value) {
  return value === "" || value === null || value === undefined ? undefined : Number(value);
}

export function QuoteRequirementsStep({
  title,
  requirements = [],
  importText = "",
  importTemplate = "",
  importPreview = null,
  previewingImport = false,
  onTitleChange,
  onRequirementChange,
  onAddRequirement,
  onRemoveRequirement,
  onImportTextChange,
  onPreviewImport,
  onApplyImport,
}) {
  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }} data-testid="workspace-quotes-step-1">
      <Card bordered={false}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Title level={4} style={{ margin: 0 }}>
            Step1 需求导入 / 新建询价
          </Title>
          <Paragraph style={{ marginBottom: 0, color: "#64748b" }}>
            你可以先粘贴批量导入文本，也可以直接在线补充单条需求。标题和至少一条有效需求保存后，系统会自动进入产品匹配。
          </Paragraph>

          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            <div>
              <Text strong>询价标题</Text>
              <Input
                value={title}
                onChange={(event) => onTitleChange?.(event.target.value)}
                placeholder="例如：春季门店设备升级询价"
                data-testid="workspace-quotes-title"
              />
            </div>
          </div>
        </Space>
      </Card>

      <Card bordered={false}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Space direction="vertical" size={4}>
            <Title level={5} style={{ margin: 0 }}>
              导入文本
            </Title>
            <Text type="secondary">格式：{importTemplate}</Text>
          </Space>

          <TextArea
            rows={5}
            value={importText}
            onChange={(event) => onImportTextChange?.(event.target.value)}
            placeholder="每行一条需求，使用管道分隔字段"
            data-testid="workspace-quotes-import-text"
          />

          <Space wrap>
            <Button loading={previewingImport} onClick={onPreviewImport} data-testid="workspace-quotes-import-preview">
              预览导入结果
            </Button>
            <Button
              onClick={onApplyImport}
              disabled={!importPreview?.preview?.length}
              data-testid="workspace-quotes-import-apply"
            >
              应用导入结果
            </Button>
          </Space>

          {importPreview?.warnings?.length > 0 ? (
            <Alert
              type="warning"
              showIcon
              message="导入内容存在问题"
              description={
                <ul style={{ margin: 0, paddingInlineStart: 18 }}>
                  {importPreview.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              }
            />
          ) : null}

          {importPreview?.preview?.length > 0 ? (
            <Card size="small" style={{ background: "#f8fafc" }}>
              <Space direction="vertical" size={8} style={{ width: "100%" }}>
                <Text strong>导入预览</Text>
                {importPreview.preview.map((item) => (
                  <Space key={`${item.index}-${item.requirement?.id || "invalid"}`} wrap>
                    <Tag color={item.requirement ? "blue" : "red"}>{item.requirement ? "有效" : "无效"}</Tag>
                    <Text>{item.requirement?.name || `第 ${item.index} 行`}</Text>
                    {item.requirement ? <Text type="secondary">{item.requirement.keywords.join(" / ")}</Text> : null}
                  </Space>
                ))}
              </Space>
            </Card>
          ) : null}
        </Space>
      </Card>

      <Card
        bordered={false}
        title="在线填写需求"
        extra={
          <Button icon={<PlusOutlined />} onClick={onAddRequirement} data-testid="workspace-quotes-add-requirement">
            新增需求行
          </Button>
        }
      >
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {requirements.length === 0 ? (
            <Alert type="info" showIcon message="当前没有需求行" description="可以先导入文本，也可以直接新增一条需求后手动填写。" />
          ) : null}

          {requirements.map((requirement, index) => (
            <Card
              key={requirement.id}
              size="small"
              title={`需求 ${index + 1}`}
              extra={
                <Button
                  danger
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => onRemoveRequirement?.(requirement.id)}
                  data-testid={`workspace-quotes-remove-requirement-${index}`}
                >
                  删除
                </Button>
              }
            >
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                <div>
                  <Text strong>需求名称</Text>
                  <Input
                    value={requirement.name}
                    onChange={(event) => onRequirementChange?.(requirement.id, "name", event.target.value)}
                    data-testid={`workspace-quotes-requirement-name-${index}`}
                  />
                </div>

                <div>
                  <Text strong>关键词</Text>
                  <Input
                    value={requirement.keywordsText}
                    onChange={(event) => onRequirementChange?.(requirement.id, "keywordsText", event.target.value)}
                    placeholder="例如：smart hub, device"
                    data-testid={`workspace-quotes-requirement-keywords-${index}`}
                  />
                </div>

                <div>
                  <Text strong>数量</Text>
                  <InputNumber
                    min={1}
                    value={getNumericValue(requirement.quantity)}
                    onChange={(value) => onRequirementChange?.(requirement.id, "quantity", value ?? "")}
                    style={{ width: "100%" }}
                    data-testid={`workspace-quotes-requirement-quantity-${index}`}
                  />
                </div>

                <div>
                  <Text strong>目标交期（天）</Text>
                  <InputNumber
                    min={1}
                    value={getNumericValue(requirement.targetLeadDays)}
                    onChange={(value) => onRequirementChange?.(requirement.id, "targetLeadDays", value ?? "")}
                    style={{ width: "100%" }}
                    data-testid={`workspace-quotes-requirement-lead-${index}`}
                  />
                </div>

                <div>
                  <Text strong>目标价格带</Text>
                  <Input
                    value={requirement.targetPriceBand}
                    onChange={(event) => onRequirementChange?.(requirement.id, "targetPriceBand", event.target.value)}
                    placeholder="例如：中 / 高"
                    data-testid={`workspace-quotes-requirement-priceband-${index}`}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <Checkbox
                    checked={requirement.isCustom}
                    onChange={(event) => onRequirementChange?.(requirement.id, "isCustom", event.target.checked)}
                    data-testid={`workspace-quotes-requirement-custom-${index}`}
                  >
                    定制需求
                  </Checkbox>
                </div>
              </div>

              <Divider />

              <div>
                <Text strong>备注</Text>
                <TextArea
                  rows={3}
                  value={requirement.notes}
                  onChange={(event) => onRequirementChange?.(requirement.id, "notes", event.target.value)}
                  data-testid={`workspace-quotes-requirement-notes-${index}`}
                />
              </div>
            </Card>
          ))}
        </Space>
      </Card>
    </Space>
  );
}

export default QuoteRequirementsStep;
