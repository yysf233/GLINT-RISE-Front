import React from "react";
import { Card, Space, Typography, Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";

const { Dragger } = Upload;
const { Paragraph, Text, Title } = Typography;

export function AdminUploadPanel({
  title,
  description,
  hint,
  extra,
  uploadProps = {},
  children,
  style,
}) {
  return (
    <Card
      bordered={false}
      style={style}
      title={
        title || description ? (
          <Space direction="vertical" size={4}>
            {title ? <Title level={5} style={{ margin: 0 }}>{title}</Title> : null}
            {description ? <Text type="secondary">{description}</Text> : null}
          </Space>
        ) : null
      }
      extra={extra}
    >
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Dragger multiple style={{ padding: "8px 0" }} {...uploadProps}>
          <p style={{ fontSize: 28, margin: "8px 0" }}>
            <InboxOutlined />
          </p>
          <Paragraph style={{ marginBottom: 4 }}>点击或拖拽文件到此区域上传</Paragraph>
          {hint ? <Text type="secondary">{hint}</Text> : null}
        </Dragger>
        {children ? <div>{children}</div> : null}
      </Space>
    </Card>
  );
}

export default AdminUploadPanel;
