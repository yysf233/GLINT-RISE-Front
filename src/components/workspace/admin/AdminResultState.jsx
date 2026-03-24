import React from "react";
import { Button, Result } from "antd";

export function AdminResultState({ status = "info", title, subTitle, actionLabel, onAction }) {
  return (
    <Result
      status={status}
      title={title}
      subTitle={subTitle}
      extra={
        actionLabel && onAction ? (
          <Button type="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null
      }
    />
  );
}

export default AdminResultState;
