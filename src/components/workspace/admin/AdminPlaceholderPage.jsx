import React from "react";
import { Card } from "antd";
import AdminResultState from "./AdminResultState";

export function AdminPlaceholderPage({ title, wave = "第 2 波", onBack }) {
  return (
    <Card bordered={false}>
      <AdminResultState
        status="info"
        title={`${title}正在排期开发`}
        subTitle={`${title} 已纳入 ${wave} 范围，当前后台导航已预留入口，功能页面将在后续波次补齐。`}
        actionLabel="返回仪表盘"
        onAction={onBack}
      />
    </Card>
  );
}

export default AdminPlaceholderPage;
