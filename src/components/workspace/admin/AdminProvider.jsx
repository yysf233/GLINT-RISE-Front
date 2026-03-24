import React from "react";
import { App as AntApp, ConfigProvider } from "antd";
import adminTheme from "./adminTheme";

export function AdminProvider({ children }) {
  return (
    <ConfigProvider theme={adminTheme}>
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  );
}

export default AdminProvider;
