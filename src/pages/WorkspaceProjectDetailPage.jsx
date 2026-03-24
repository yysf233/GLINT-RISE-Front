import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Image, List, Space, Tag, Timeline, Typography } from "antd";
import { ArrowLeftOutlined, EditOutlined, LinkOutlined } from "@ant-design/icons";
import { AdminDetailSection } from "../components/workspace/admin/AdminDetailSection";
import { AdminPageHeader } from "../components/workspace/admin/AdminPageHeader";
import { AdminResultState } from "../components/workspace/admin/AdminResultState";
import { WorkspaceShell } from "../components/workspace/WorkspaceShell";
import workspaceProjectsApi from "../services/workspace/workspaceProjectsApi";

const { Paragraph, Text, Title } = Typography;

const statusTextMap = {
  active: "已发布",
  draft: "草稿",
  archived: "已归档",
};

const statusColorMap = {
  active: "green",
  draft: "orange",
  archived: "default",
};

const industryTextMap = {
  Retail: "零售",
  Security: "安防",
};

const categoryTextMap = {
  "Case Study": "案例项目",
  "Brand Campaign": "品牌活动",
  "Space Experience": "空间体验",
};

function formatDateTime(value) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function WorkspaceProjectDetailPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [state, setState] = React.useState({
    status: "loading",
    project: null,
    error: "",
  });

  React.useEffect(() => {
    let isActive = true;
    setState({ status: "loading", project: null, error: "" });

    workspaceProjectsApi
      .getWorkspaceProject(projectId)
      .then((result) => {
        if (!isActive) return;
        if (result?.error || !result?.project) {
          setState({
            status: "error",
            project: null,
            error: result?.error?.message || "无法加载该项目。",
          });
          return;
        }

        setState({
          status: "ready",
          project: result.project,
          error: "",
        });
      })
      .catch(() => {
        if (!isActive) return;
        setState({
          status: "error",
          project: null,
          error: "无法加载该项目。",
        });
      });

    return () => {
      isActive = false;
    };
  }, [projectId]);

  const project = state.project;

  return (
    <WorkspaceShell>
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        <AdminPageHeader
          eyebrow="项目详情"
          title={project?.title || "项目详情"}
          description="查看项目的公开映射、时间轴进度与关联产品。"
          extra={
            <Space wrap>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/workspace/projects")}>
                返回列表
              </Button>
              {project?.publicCaseId ? (
                <Button icon={<LinkOutlined />} onClick={() => navigate(`/case/${project.publicCaseId}`)}>
                  公开预览
                </Button>
              ) : null}
              {project ? (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  data-testid="workspace-project-detail-edit"
                  onClick={() => navigate(`/workspace/projects/${project.id}/edit`)}
                >
                  编辑项目
                </Button>
              ) : null}
            </Space>
          }
        />

        {state.status === "loading" ? (
          <AdminResultState status="info" title="正在加载项目信息" subTitle="请稍候" />
        ) : null}

        {state.status === "error" ? (
          <AdminResultState
            status="error"
            title="加载失败"
            subTitle={state.error}
            actionLabel="返回列表"
            onAction={() => navigate("/workspace/projects")}
          />
        ) : null}

        {project ? (
          <>
            <Card bordered={false}>
              <Space
                align="start"
                size={24}
                style={{ width: "100%", justifyContent: "space-between", flexWrap: "wrap" }}
              >
                <Space direction="vertical" size={12} style={{ flex: 1, minWidth: 280 }}>
                  <Title level={4} style={{ margin: 0 }}>
                    {project.title}
                  </Title>
                  <Text type="secondary">{project.id}</Text>
                  <Paragraph style={{ marginBottom: 0 }}>{project.summary || project.short || "暂无项目摘要"}</Paragraph>
                  <Space wrap>
                    <Tag color={statusColorMap[project.status] || "default"}>
                      {statusTextMap[project.status] || project.status}
                    </Tag>
                    <Tag>{categoryTextMap[project.category] || project.category || "未分类"}</Tag>
                    <Tag>{industryTextMap[project.industry] || project.industry || "未设置行业"}</Tag>
                    <Tag>{project.year || "未设置年份"}</Tag>
                  </Space>
                </Space>
                <Image
                  src={project.hero}
                  alt={project.title}
                  width={280}
                  height={180}
                  style={{ objectFit: "cover", borderRadius: 12 }}
                  preview={false}
                />
              </Space>
            </Card>

            <AdminDetailSection
              title="基础信息"
              items={[
                { key: "owner", label: "负责人", children: project.owner || "--" },
                { key: "industry", label: "行业", children: industryTextMap[project.industry] || project.industry || "--" },
                { key: "year", label: "年份", children: project.year || "--" },
                { key: "publicCaseId", label: "公开案例 ID", children: project.publicCaseId || "未关联" },
                { key: "short", label: "短摘要", children: project.short || "暂无短摘要" },
                { key: "updatedAt", label: "更新时间", children: formatDateTime(project.updatedAt) },
              ]}
            />

            <Card bordered={false} title="项目时间轴">
              {project.timeline?.length ? (
                <Timeline
                  items={project.timeline
                    .slice()
                    .sort((left, right) => left.order - right.order)
                    .map((node) => ({
                      children: (
                        <Space direction="vertical" size={2}>
                          <Text strong>{node.label}</Text>
                          {node.description ? <Text type="secondary">{node.description}</Text> : null}
                        </Space>
                      ),
                    }))}
                />
              ) : (
                <Text type="secondary">暂无时间轴节点</Text>
              )}
            </Card>

            <Card bordered={false} title="关联产品">
              {project.relatedProducts?.length ? (
                <List
                  dataSource={project.relatedProducts}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        item.id ? (
                          <Button key="internal" type="link" onClick={() => navigate(`/workspace/products/${item.id}`)}>
                            查看内部产品
                          </Button>
                        ) : null,
                        item.publicProductId ? (
                          <Button key="public" type="link" onClick={() => navigate(`/product/${item.publicProductId}`)}>
                            公开预览
                          </Button>
                        ) : null,
                      ].filter(Boolean)}
                    >
                      <List.Item.Meta
                        title={item.id || "未绑定内部产品"}
                        description={item.publicProductId ? `公开产品 ID：${item.publicProductId}` : "未绑定公开产品"}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Text type="secondary">暂无关联产品</Text>
              )}
            </Card>

            <Card bordered={false} title="操作日志">
              {project.logs?.length ? (
                <List
                  dataSource={project.logs.slice().reverse()}
                  renderItem={(log) => (
                    <List.Item>
                      <List.Item.Meta
                        title={`${log.action} · ${log.actor || "system"}`}
                        description={`${formatDateTime(log.timestamp)} · ${log.message || "无说明"}`}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Text type="secondary">暂无操作日志</Text>
              )}
            </Card>
          </>
        ) : null}
      </Space>
    </WorkspaceShell>
  );
}

export default WorkspaceProjectDetailPage;
