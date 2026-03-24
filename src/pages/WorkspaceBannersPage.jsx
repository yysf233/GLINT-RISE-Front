import React from "react";
import {
  App,
  Button,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Tag,
  Typography,
} from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { AdminFilterBar } from "../components/workspace/admin/AdminFilterBar";
import { AdminFormSection } from "../components/workspace/admin/AdminFormSection";
import { AdminPageHeader } from "../components/workspace/admin/AdminPageHeader";
import { AdminResultState } from "../components/workspace/admin/AdminResultState";
import { AdminSortableMediaList } from "../components/workspace/admin/AdminSortableMediaList";
import { AdminStatsRow } from "../components/workspace/admin/AdminStatsRow";
import { AdminTableCard } from "../components/workspace/admin/AdminTableCard";
import { WorkspaceShell } from "../components/workspace/WorkspaceShell";
import workspaceBannersApi from "../services/workspace/workspaceBannersApi";
import { showAppMessage } from "../utils/safeAppMessage";
import { buildWorkspaceBannerPayload, createWorkspaceBannerFormDefaults, mapWorkspaceBannerToForm } from "../utils/workspaceBannerForm";
import { validateWorkspaceBannerTarget } from "../utils/workspaceBannerTargets";

const { Text } = Typography;

const STATUS_OPTIONS = [
  { value: "all", label: "全部状态" },
  { value: "online", label: "已上线" },
  { value: "offline", label: "已下线" },
];

const EDITOR_STATUS_OPTIONS = STATUS_OPTIONS.filter((item) => item.value !== "all");

const statusLabelMap = {
  online: "已上线",
  offline: "已下线",
};

const statusColorMap = {
  online: "green",
  offline: "default",
};

function formatDate(value) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function text(value) {
  return String(value ?? "").trim();
}

function moveItem(items, fromIndex, toIndex) {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function toDisplayImages(items, hero) {
  return items.map((url, index) => ({
    id: `banner-image-${index + 1}`,
    thumbnail: url,
    title: `图片 ${index + 1}`,
    description: url,
    isCover: text(url) === text(hero),
    url,
  }));
}

export function WorkspaceBannersPage() {
  const app = App.useApp();
  const [form] = Form.useForm();
  const [keyword, setKeyword] = React.useState("");
  const deferredKeyword = React.useDeferredValue(keyword);
  const [status, setStatus] = React.useState("all");
  const [refreshToken, setRefreshToken] = React.useState(0);
  const [pageState, setPageState] = React.useState({
    status: "loading",
    items: [],
    error: "",
  });
  const [editorState, setEditorState] = React.useState({
    open: false,
    mode: "create",
    currentBannerId: "",
  });
  const [imageUrls, setImageUrls] = React.useState([]);
  const [newImageUrl, setNewImageUrl] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [isReordering, setIsReordering] = React.useState(false);
  const heroValue = Form.useWatch("hero", form);

  React.useEffect(() => {
    let active = true;

    setPageState((current) => ({
      ...current,
      status: current.items.length > 0 ? "refreshing" : "loading",
      error: "",
    }));

    workspaceBannersApi
      .listWorkspaceBanners()
      .then((result) => {
        if (!active) {
          return;
        }

        if (result?.error) {
          setPageState({
            status: "error",
            items: [],
            error: result.error.message || "无法加载轮播列表。",
          });
          return;
        }

        setPageState({
          status: "ready",
          items: result?.items ?? [],
          error: "",
        });
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setPageState({
          status: "error",
          items: [],
          error: "无法加载轮播列表。",
        });
      });

    return () => {
      active = false;
    };
  }, [refreshToken]);

  const filteredItems = React.useMemo(() => {
    const normalizedKeyword = text(deferredKeyword).toLowerCase();

    return pageState.items.filter((item) => {
      const statusMatched = status === "all" ? true : item.status === status;
      if (!statusMatched) {
        return false;
      }

      if (!normalizedKeyword) {
        return true;
      }

      const haystack = [
        item.title,
        item.target,
        item.hero,
        ...(Array.isArray(item.images) ? item.images : []),
      ]
        .map((value) => text(value).toLowerCase())
        .join(" ");

      return haystack.includes(normalizedKeyword);
    });
  }, [deferredKeyword, pageState.items, status]);

  const stats = React.useMemo(() => {
    const onlineCount = pageState.items.filter((item) => item.status === "online").length;
    const offlineCount = pageState.items.filter((item) => item.status === "offline").length;

    return {
      total: pageState.items.length,
      onlineCount,
      offlineCount,
    };
  }, [pageState.items]);

  const resetEditor = React.useCallback(() => {
    form.resetFields();
    form.setFieldsValue(createWorkspaceBannerFormDefaults());
    setImageUrls([]);
    setNewImageUrl("");
    setEditorState({
      open: false,
      mode: "create",
      currentBannerId: "",
    });
  }, [form]);

  const openCreateEditor = React.useCallback(() => {
    form.setFieldsValue(createWorkspaceBannerFormDefaults());
    setImageUrls([]);
    setNewImageUrl("");
    setEditorState({
      open: true,
      mode: "create",
      currentBannerId: "",
    });
  }, [form]);

  const openEditEditor = React.useCallback(
    (banner) => {
      const values = mapWorkspaceBannerToForm(banner);
      form.setFieldsValue(values);
      setImageUrls(values.images.length > 0 ? values.images : values.hero ? [values.hero] : []);
      setNewImageUrl("");
      setEditorState({
        open: true,
        mode: "edit",
        currentBannerId: banner.id,
      });
    },
    [form],
  );

  const handleSave = async (values) => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      const payload = buildWorkspaceBannerPayload({
        ...values,
        images: imageUrls,
      });

      const result = editorState.mode === "edit" && editorState.currentBannerId
        ? await workspaceBannersApi.updateWorkspaceBanner(editorState.currentBannerId, payload)
        : await workspaceBannersApi.createWorkspaceBanner(payload);

      if (result?.error) {
        showAppMessage(app, "error", result.error.message || "轮播保存失败。");
        return;
      }

      showAppMessage(app, "success", editorState.mode === "edit" ? "轮播已更新。" : "轮播已创建。");
      resetEditor();
      setRefreshToken((value) => value + 1);
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickStatus = async (banner) => {
    if (!banner?.id || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      const nextStatus = banner.status === "online" ? "offline" : "online";
      const result = await workspaceBannersApi.updateWorkspaceBanner(banner.id, {
        status: nextStatus,
      });

      if (result?.error) {
        showAppMessage(app, "error", result.error.message || "无法更新轮播状态。");
        return;
      }

      showAppMessage(app, "success", nextStatus === "online" ? "轮播已上线。" : "轮播已下线。");
      setRefreshToken((value) => value + 1);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMoveBanner = async (fromIndex, toIndex) => {
    if (isReordering) {
      return;
    }

    setIsReordering(true);
    try {
      const result = await workspaceBannersApi.reorderWorkspaceBanners(fromIndex, toIndex);
      if (result?.error) {
        showAppMessage(app, "error", result.error.message || "轮播排序失败。");
        return;
      }

      showAppMessage(app, "success", "轮播顺序已更新。");
      setRefreshToken((value) => value + 1);
    } finally {
      setIsReordering(false);
    }
  };

  const addImage = () => {
    const normalized = text(newImageUrl);
    if (!normalized) {
      return;
    }

    setImageUrls((current) => [...current, normalized]);
    setNewImageUrl("");

    const currentHero = text(form.getFieldValue("hero"));
    if (!currentHero) {
      form.setFieldValue("hero", normalized);
    }
  };

  const handleMoveImage = (fromIndex, toIndex) => {
    setImageUrls((current) => moveItem(current, fromIndex, toIndex));
  };

  const handleRemoveImage = (removedUrl) => {
    let nextHero = "";
    setImageUrls((current) => {
      const next = current.filter((item) => item !== removedUrl);
      nextHero = next[0] ?? "";
      return next;
    });
    if (text(form.getFieldValue("hero")) === text(removedUrl)) {
      form.setFieldValue("hero", nextHero);
    }
  };

  const columns = [
    {
      title: "轮播信息",
      dataIndex: "title",
      key: "title",
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <Text strong>{record.title}</Text>
          <Text type="secondary">{record.id}</Text>
          <Text type="secondary">{record.target}</Text>
        </Space>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (value) => <Tag color={statusColorMap[value] || "default"}>{statusLabelMap[value] || value}</Tag>,
    },
    {
      title: "封面",
      dataIndex: "hero",
      key: "hero",
      render: (value) => (
        <Text ellipsis style={{ maxWidth: 220, display: "inline-block" }}>
          {value || "--"}
        </Text>
      ),
    },
    {
      title: "图片数",
      dataIndex: "images",
      key: "images",
      render: (value) => `${Array.isArray(value) ? value.length : 0} 张`,
    },
    {
      title: "更新时间",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (value) => formatDate(value),
    },
    {
      title: "操作",
      key: "actions",
      render: (_, record) => {
        const actualIndex = pageState.items.findIndex((item) => item.id === record.id);

        return (
        <Space wrap>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEditEditor(record)}>
            编辑
          </Button>
          <Button type="link" onClick={() => handleQuickStatus(record)}>
            {record.status === "online" ? "下线" : "上线"}
          </Button>
          <Button
            type="link"
            icon={<ArrowUpOutlined />}
            disabled={actualIndex <= 0 || isReordering}
            onClick={() => handleMoveBanner(actualIndex, actualIndex - 1)}
          >
            上移
          </Button>
          <Button
            type="link"
            icon={<ArrowDownOutlined />}
            disabled={actualIndex === -1 || actualIndex >= pageState.items.length - 1 || isReordering}
            onClick={() => handleMoveBanner(actualIndex, actualIndex + 1)}
          >
            下移
          </Button>
        </Space>
        );
      },
    },
  ];

  const imageItems = React.useMemo(() => toDisplayImages(imageUrls, heroValue), [heroValue, imageUrls]);

  return (
    <WorkspaceShell>
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        <AdminPageHeader
          eyebrow="内容投放"
          title="轮播与推荐"
          description="统一管理首页轮播的标题、跳转目标、上下线状态与图片顺序，当前先聚焦 mock 投放闭环。"
          extra={(
            <Space wrap>
              <Button icon={<ReloadOutlined />} onClick={() => setRefreshToken((value) => value + 1)}>
                刷新列表
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreateEditor}>
                新建轮播
              </Button>
            </Space>
          )}
        />

        <AdminStatsRow
          items={[
            {
              key: "total",
              label: "轮播总数",
              value: stats.total,
              description: "当前后台维护的全部轮播记录。",
            },
            {
              key: "online",
              label: "已上线",
              value: stats.onlineCount,
              description: "会同步给公开站读取的轮播数量。",
            },
            {
              key: "offline",
              label: "已下线",
              value: stats.offlineCount,
              description: "已保留但暂不对外展示的轮播数量。",
            },
          ]}
        />

        <AdminFilterBar
          title="筛选与维护"
          description="支持按标题和跳转目标检索，并可直接做排序和上下线切换。"
        >
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索轮播标题、目标路由或图片地址"
            allowClear
          />
          <Select value={status} onChange={setStatus} options={STATUS_OPTIONS} style={{ minWidth: 160 }} />
        </AdminFilterBar>

        {pageState.status === "error" ? (
          <AdminResultState status="error" title="无法加载轮播列表" subTitle={pageState.error} />
        ) : (
          <AdminTableCard
            title="轮播列表"
            description={`${filteredItems.length} 条记录`}
            tableProps={{
              rowKey: "id",
              columns,
              dataSource: filteredItems,
              pagination: false,
              loading: pageState.status === "loading" || pageState.status === "refreshing",
            }}
          />
        )}
      </Space>

      <Drawer
        title={editorState.mode === "edit" ? "编辑轮播" : "新建轮播"}
        open={editorState.open}
        onClose={resetEditor}
        width={720}
        destroyOnClose
        extra={(
          <Space>
            <Button onClick={resetEditor}>取消</Button>
            <Button type="primary" loading={isSaving} onClick={() => form.submit()}>
              保存轮播
            </Button>
          </Space>
        )}
      >
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <AdminFormSection
            title="基础信息"
            description="维护轮播标题、上下线状态与站内跳转目标。"
            formProps={{
              form,
              onFinish: handleSave,
              initialValues: createWorkspaceBannerFormDefaults(),
            }}
            footer={(
              <Space wrap>
                <Tag color="blue">轮播页仅支持站内路由</Tag>
                <Tag color="default">示例：`/products`、`/cases`</Tag>
              </Space>
            )}
          >
            <Form.Item
              label="轮播标题"
              name="title"
              rules={[{ required: true, message: "请输入轮播标题" }]}
            >
              <Input placeholder="例如：首页主视觉" />
            </Form.Item>
            <Form.Item label="状态" name="status" rules={[{ required: true, message: "请选择状态" }]}>
              <Select options={EDITOR_STATUS_OPTIONS} />
            </Form.Item>
            <Form.Item
              label="跳转目标"
              name="target"
              rules={[
                { required: true, message: "请输入跳转目标" },
                {
                  validator: async (_, value) => {
                    const validation = validateWorkspaceBannerTarget(value);
                    if (!validation.valid) {
                      throw new Error(validation.message);
                    }
                  },
                },
              ]}
            >
              <Input placeholder="例如：/products 或 #/cases" />
            </Form.Item>
            <Form.Item
              label="封面图"
              name="hero"
              rules={[{ required: true, message: "请输入封面图地址" }]}
            >
              <Input placeholder="输入封面图 URL" />
            </Form.Item>
          </AdminFormSection>

          <AdminFormSection
            title="图片排序"
            description="支持为轮播维护图片集合，并在当前页直接调整顺序。"
            useForm={false}
            footer={(
              <Space.Compact style={{ width: "100%" }}>
                <Input
                  value={newImageUrl}
                  onChange={(event) => setNewImageUrl(event.target.value)}
                  placeholder="输入要加入轮播的图片地址"
                  onPressEnter={addImage}
                />
                <Button type="primary" onClick={addImage}>
                  添加图片
                </Button>
              </Space.Compact>
            )}
          >
            <AdminSortableMediaList
              items={imageItems}
              emptyText="暂未添加轮播图片"
              onMoveUp={(_, index) => handleMoveImage(index, index - 1)}
              onMoveDown={(_, index) => handleMoveImage(index, index + 1)}
              onRemove={(item) => handleRemoveImage(item.url)}
              renderMeta={(item) => (
                <Button type="link" size="small" onClick={() => form.setFieldValue("hero", item.url)}>
                  设为封面
                </Button>
              )}
            />
          </AdminFormSection>
        </Space>
      </Drawer>
    </WorkspaceShell>
  );
}

export default WorkspaceBannersPage;
