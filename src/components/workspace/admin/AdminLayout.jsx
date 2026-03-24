import React from "react";
import { Layout, theme } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import AdminPageHeader from "./AdminPageHeader";
import AdminSiderNav from "./AdminSiderNav";
import AdminTopbar from "./AdminTopbar";

const { Header, Content } = Layout;

function toBreadcrumbItems(pathname, title) {
  const baseItems = [{ title: "业务后台" }];

  if (pathname.startsWith("/workspace/content")) {
    return [...baseItems, { title: "系统管理" }, { title }];
  }

  if (pathname.startsWith("/workspace/products")) {
    return [...baseItems, { title: "商品与项目" }, { title }];
  }

  if (pathname.startsWith("/workspace/projects")) {
    return [...baseItems, { title: "商品与项目" }, { title }];
  }

  return [...baseItems, { title }];
}

export function AdminLayout({
  role,
  eyebrow,
  title,
  description,
  isLoggingOut,
  onLogout,
  onBackToPublicSite,
  children,
}) {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <Layout style={{ minHeight: "100vh", background: token.colorBgLayout }}>
      <AdminSiderNav role={role} pathname={location.pathname} onNavigate={navigate} collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout>
        <Header
          style={{
            padding: "20px 24px 8px",
            background: "transparent",
            height: "auto",
            lineHeight: "normal",
          }}
        >
          <AdminTopbar
            role={role}
            isLoggingOut={isLoggingOut}
            onBackToPublicSite={onBackToPublicSite}
            onLogout={onLogout}
          />
        </Header>
        <Content style={{ padding: "0 24px 24px" }}>
          <div
            style={{
              background: token.colorBgContainer,
              borderRadius: token.borderRadiusLG,
              boxShadow: token.boxShadowSecondary,
              border: `1px solid ${token.colorBorderSecondary}`,
              padding: 24,
            }}
          >
            <AdminPageHeader
              eyebrow={eyebrow}
              title={title}
              description={description}
              breadcrumbItems={toBreadcrumbItems(location.pathname, title)}
            />
          </div>
          <div style={{ marginTop: 24 }}>{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default AdminLayout;
