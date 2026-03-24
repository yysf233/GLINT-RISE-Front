import React from "react";
import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Card, Empty, Image, List, Space, Tag, Typography } from "antd";

const { Text } = Typography;

export function AdminSortableMediaList({
  items = [],
  onMoveUp,
  onMoveDown,
  onRemove,
  renderMeta,
  emptyText = "暂无图片",
  style,
}) {
  if (items.length === 0) {
    return (
      <Card bordered={false} style={style}>
        <Empty description={emptyText} />
      </Card>
    );
  }

  return (
    <Card bordered={false} style={style}>
      <List
        dataSource={items}
        itemLayout="horizontal"
        renderItem={(item, index) => {
          const isFirst = index === 0;
          const isLast = index === items.length - 1;

          return (
            <List.Item
              actions={[
                <Button key="up" icon={<ArrowUpOutlined />} disabled={isFirst} onClick={() => onMoveUp?.(item, index)} />,
                <Button key="down" icon={<ArrowDownOutlined />} disabled={isLast} onClick={() => onMoveDown?.(item, index)} />,
                <Button key="remove" danger icon={<DeleteOutlined />} onClick={() => onRemove?.(item, index)} />,
              ]}
            >
              <List.Item.Meta
                avatar={
                  item.thumbnail ? (
                    <Image src={item.thumbnail} width={72} height={72} style={{ objectFit: "cover", borderRadius: 12 }} preview={false} />
                  ) : (
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 12,
                        background: "#f3f4f6",
                      }}
                    />
                  )
                }
                title={
                  <Space wrap size={8}>
                    <Text strong>{item.title ?? item.name ?? `图片 ${index + 1}`}</Text>
                    {item.isCover ? <Tag color="blue">封面</Tag> : null}
                  </Space>
                }
                description={
                  <Space direction="vertical" size={2}>
                    {item.description ? <Text type="secondary">{item.description}</Text> : null}
                    {renderMeta ? renderMeta(item, index) : null}
                  </Space>
                }
              />
            </List.Item>
          );
        }}
      />
    </Card>
  );
}

export default AdminSortableMediaList;
