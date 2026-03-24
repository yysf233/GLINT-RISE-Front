import React from "react";
import { Alert } from "antd";

export function PermissionGuardNotice({ message, description, type = "warning" }) {
  return <Alert showIcon type={type} message={message} description={description} />;
}

export default PermissionGuardNotice;
