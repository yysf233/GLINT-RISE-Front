import React from "react";
import { useNavigate } from "react-router-dom";
import { App, Button, Space, Typography } from "antd";
import { AdminPageHeader } from "../components/workspace/admin/AdminPageHeader";
import { AdminResultState } from "../components/workspace/admin/AdminResultState";
import { AdminStatsRow } from "../components/workspace/admin/AdminStatsRow";
import { AdminTableCard } from "../components/workspace/admin/AdminTableCard";
import { WorkspaceShell } from "../components/workspace/WorkspaceShell";
import { QuoteFlowHeader } from "../components/workspace/quotes/QuoteFlowHeader";
import { QuoteMatchesStep } from "../components/workspace/quotes/QuoteMatchesStep";
import { QuotePricingStep } from "../components/workspace/quotes/QuotePricingStep";
import { QuoteRequirementsStep } from "../components/workspace/quotes/QuoteRequirementsStep";
import { QuoteResultStep } from "../components/workspace/quotes/QuoteResultStep";
import { QuoteSuppliersStep } from "../components/workspace/quotes/QuoteSuppliersStep";
import { useAuth } from "../context/useAuth";
import workspaceProductsApi from "../services/workspaceProductsApi";
import workspaceQuotesApi from "../services/workspace/workspaceQuotesApi";
import workspaceSuppliersApi from "../services/workspace/workspaceSuppliersApi";
import { downloadTextFile } from "../utils/downloadTextFile";
import { showAppMessage } from "../utils/safeAppMessage";
import {
  buildWorkspaceQuoteMatches,
  buildWorkspaceQuotePricingPreview,
  buildWorkspaceQuoteSupplierRecommendations,
  normalizeWorkspaceQuoteRequirements,
} from "../utils/workspaceQuoteFlow";
import { getWorkspaceQuoteImportTemplate } from "../utils/workspaceQuoteImport";

const { Text } = Typography;

const QUOTE_STEP_ITEMS = [
  { title: "Step1", description: "导入需求" },
  { title: "Step2", description: "匹配产品" },
  { title: "Step3", description: "推荐供应商" },
  { title: "Step4", description: "报价预览" },
  { title: "Step5", description: "生成标准单" },
];

function createDraftRequirement(index = 0) {
  return {
    id: `draft-requirement-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
    name: "",
    keywordsText: "",
    quantity: "",
    targetLeadDays: "",
    targetPriceBand: "",
    isCustom: false,
    notes: "",
  };
}

function createEmptyEditor() {
  return {
    id: null,
    title: "",
    owner: "",
    status: "draft",
    currentStep: 1,
    updatedAt: "",
    requirements: [createDraftRequirement(0)],
    importText: "",
    importPreview: null,
    matches: [],
    supplierSortBy: "score",
    supplierSelections: [],
    pricingEntries: [],
    quoteSheet: null,
  };
}

function formatText(value) {
  return String(value ?? "").trim();
}

function buildRequirementsPayload(requirements = []) {
  return requirements.map((item) => ({
    id: item.id,
    name: item.name,
    keywords: item.keywordsText,
    quantity: item.quantity,
    targetLeadDays: item.targetLeadDays,
    targetPriceBand: item.targetPriceBand,
    isCustom: item.isCustom,
    notes: item.notes,
  }));
}

function mapQuoteToEditor(quote) {
  return {
    id: quote.id,
    title: quote.title,
    owner: quote.owner,
    status: quote.status,
    currentStep: quote.currentStep,
    updatedAt: quote.updatedAt,
    requirements: (quote.requirements ?? []).map((requirement, index) => ({
      id: requirement.id || `quote-requirement-${index + 1}`,
      name: requirement.name || "",
      keywordsText: Array.isArray(requirement.keywords) ? requirement.keywords.join(", ") : "",
      quantity: requirement.quantity === 0 ? "" : String(requirement.quantity ?? ""),
      targetLeadDays: requirement.targetLeadDays === 0 ? "" : String(requirement.targetLeadDays ?? ""),
      targetPriceBand: requirement.targetPriceBand || "",
      isCustom: requirement.isCustom === true,
      notes: requirement.notes || "",
    })),
    importText: "",
    importPreview: null,
    matches: quote.matches ?? [],
    supplierSortBy: quote.supplierSortBy || "score",
    supplierSelections: quote.supplierSelections ?? [],
    pricingEntries: quote.pricingEntries ?? [],
    quoteSheet: quote.quoteSheet ?? null,
  };
}

function deriveQuoteEditor(editor, { products = [], suppliers = [], viewer = {} } = {}) {
  const requirementPayload = buildRequirementsPayload(editor.requirements);
  const resolvedMatches = buildWorkspaceQuoteMatches(requirementPayload, products, editor.matches);
  const pendingManualMatches = (editor.matches ?? [])
    .filter((item) => item?.manualAdded && !item?.skipped && !formatText(item?.productId))
    .map((item, index) => ({
      id: formatText(item.id) || `quote-match-pending-${index + 1}`,
      requirementId: formatText(item.requirementId) || `manual-${index + 1}`,
      requirementName: formatText(item.requirementName) || "手动补充产品",
      productId: "",
      candidateProductIds: Array.isArray(item.candidateProductIds) ? item.candidateProductIds.filter(Boolean) : [],
      manualAdded: true,
      skipped: false,
    }));
  const matches = [
    ...resolvedMatches,
    ...pendingManualMatches.filter((item) => !resolvedMatches.some((match) => match.id === item.id)),
  ];
  const supplierSortBy = formatText(editor.supplierSortBy) || "score";
  const supplierRecommendations = buildWorkspaceQuoteSupplierRecommendations(matches, suppliers, viewer, supplierSortBy);
  const recommendationMap = new Map(supplierRecommendations.map((item) => [item.matchId, item.items ?? []]));
  const selectionMap = new Map(
    (editor.supplierSelections ?? []).map((item) => [formatText(item.matchId), formatText(item.supplierId)]),
  );
  const pricingMap = new Map(
    (editor.pricingEntries ?? []).map((item) => [
      formatText(item.matchId),
      {
        matchId: formatText(item.matchId),
        markupRate: Number(item.markupRate) || 0,
        toolingFee: Number(item.toolingFee) || 0,
        leadTimeBufferDays: Number(item.leadTimeBufferDays) || 0,
      },
    ]),
  );

  const visibleMatches = matches.filter((match) => match.productId && !match.skipped);
  const supplierSelections = visibleMatches.map((match) => ({
    matchId: match.id,
    supplierId: selectionMap.get(match.id) || formatText(recommendationMap.get(match.id)?.[0]?.supplierId),
  }));
  const pricingEntries = visibleMatches.map((match) => {
    const existing = pricingMap.get(match.id);
    return {
      matchId: match.id,
      markupRate: Number(existing?.markupRate) || 0,
      toolingFee: Number(existing?.toolingFee) || 0,
      leadTimeBufferDays: Number(existing?.leadTimeBufferDays) || 0,
    };
  });
  const pricingPreview = buildWorkspaceQuotePricingPreview(
    {
      requirements: requirementPayload,
      matches,
      supplierSelections,
      pricingEntries,
    },
    {
      products,
      suppliers,
      viewer,
    },
  );

  return {
    ...editor,
    supplierSortBy,
    matches,
    supplierRecommendations,
    supplierSelections,
    pricingEntries,
    pricingPreview,
  };
}

function buildSummary(items = [], currentEditor) {
  return {
    total: items.length,
    draftCount: items.filter((item) => item.status === "draft").length,
    quotedCount: items.filter((item) => item.status === "quoted").length,
    lineCount:
      currentEditor.pricingPreview?.totals?.lineCount ??
      currentEditor.matches.filter((item) => item.productId && !item.skipped).length,
  };
}

function formatDate(value) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function getNextButtonLabel(step) {
  if (step === 4) return "保存并进入 Step5";
  return "保存并进入下一步";
}

function canAdvance(editor) {
  if (editor.currentStep === 1) {
    return formatText(editor.title) && normalizeWorkspaceQuoteRequirements(buildRequirementsPayload(editor.requirements)).length > 0;
  }

  if (editor.currentStep === 2) {
    return editor.matches.some((item) => item.productId && !item.skipped);
  }

  if (editor.currentStep === 3) {
    const visibleMatchIds = editor.matches.filter((item) => item.productId && !item.skipped).map((item) => item.id);
    return visibleMatchIds.length > 0 && visibleMatchIds.every((id) => editor.supplierSelections.some((item) => item.matchId === id && item.supplierId));
  }

  if (editor.currentStep === 4) {
    return (editor.pricingPreview?.items ?? []).length > 0;
  }

  return false;
}

export function WorkspaceQuotesPage() {
  const navigate = useNavigate();
  const app = App.useApp();
  const { user } = useAuth();
  const [products, setProducts] = React.useState([]);
  const [suppliers, setSuppliers] = React.useState([]);
  const [quotes, setQuotes] = React.useState([]);
  const [editor, setEditor] = React.useState(createEmptyEditor);
  const [status, setStatus] = React.useState("loading");
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [previewingImport, setPreviewingImport] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);

  const editorView = deriveQuoteEditor(editor, { products, suppliers, viewer: user || {} });
  const summary = buildSummary(quotes, editorView);
  const quoteMeta = [
    { key: "id", label: "单据编号", value: editorView.id || "未保存", color: "blue" },
    { key: "owner", label: "负责人", value: editorView.owner || user?.name || "--", color: "default" },
    {
      key: "status",
      label: "状态",
      value: editorView.status === "quoted" ? "已生成报价单" : "草稿",
      color: editorView.status === "quoted" ? "green" : "gold",
    },
    { key: "updatedAt", label: "最近更新", value: formatDate(editorView.updatedAt), color: "default" },
  ];

  React.useEffect(() => {
    let active = true;

    const loadWorkspaceData = async () => {
      setStatus((current) => (current === "ready" ? "refreshing" : "loading"));
      setError("");

      const [productsResult, suppliersResult, quotesResult] = await Promise.all([
        workspaceProductsApi.listWorkspaceProducts({}),
        workspaceSuppliersApi.listWorkspaceSuppliers({}, user || {}),
        workspaceQuotesApi.listWorkspaceQuotes(user || {}),
      ]);

      if (!active) {
        return;
      }

      const errorResult = [productsResult, suppliersResult, quotesResult].find((result) => result?.error);
      if (errorResult?.error) {
        setStatus("error");
        setError(errorResult.error.message || "询报价流程加载失败。");
        return;
      }

      setProducts(productsResult?.items ?? []);
      setSuppliers(suppliersResult?.items ?? []);
      setQuotes(quotesResult?.items ?? []);

      if (editor.id) {
        const detailResult = await workspaceQuotesApi.getWorkspaceQuote(editor.id, user || {});
        if (!active) {
          return;
        }
        if (!detailResult?.error && detailResult?.quote) {
          setEditor(mapQuoteToEditor(detailResult.quote));
        }
      } else if ((quotesResult?.items ?? []).length === 0) {
        setEditor(createEmptyEditor());
      }

      setStatus("ready");
    };

    loadWorkspaceData().catch(() => {
      if (!active) return;
      setStatus("error");
      setError("询报价流程加载失败。");
    });

    return () => {
      active = false;
    };
  }, [user]);

  const reloadAll = async (selectedId) => {
    setStatus((current) => (current === "ready" ? "refreshing" : "loading"));
    setError("");

    const [productsResult, suppliersResult, quotesResult] = await Promise.all([
      workspaceProductsApi.listWorkspaceProducts({}),
      workspaceSuppliersApi.listWorkspaceSuppliers({}, user || {}),
      workspaceQuotesApi.listWorkspaceQuotes(user || {}),
    ]);

    const errorResult = [productsResult, suppliersResult, quotesResult].find((result) => result?.error);
    if (errorResult?.error) {
      setStatus("error");
      setError(errorResult.error.message || "询报价流程加载失败。");
      return;
    }

    setProducts(productsResult?.items ?? []);
    setSuppliers(suppliersResult?.items ?? []);
    setQuotes(quotesResult?.items ?? []);

    const targetId = selectedId || editor.id;
    if (targetId) {
      const detailResult = await workspaceQuotesApi.getWorkspaceQuote(targetId, user || {});
      if (detailResult?.error || !detailResult?.quote) {
        setStatus("error");
        setError(detailResult?.error?.message || "询价单加载失败。");
        return;
      }
      setEditor(mapQuoteToEditor(detailResult.quote));
    } else if ((quotesResult?.items ?? []).length === 0) {
      setEditor(createEmptyEditor());
    }

    setStatus("ready");
  };

  const updateRequirement = (requirementId, key, value) => {
    setEditor((current) => ({
      ...current,
      requirements: current.requirements.map((item) =>
        item.id === requirementId
          ? {
              ...item,
              [key]: value,
            }
          : item,
      ),
    }));
  };

  const updateMatchProduct = (matchId, productId) => {
    setEditor((current) => ({
      ...current,
      matches: current.matches.map((match) =>
        match.id === matchId
          ? {
              ...match,
              productId,
              skipped: false,
              candidateProductIds: [...new Set([...(match.candidateProductIds ?? []), productId].filter(Boolean))],
            }
          : match,
      ),
    }));
  };

  const updatePricingEntry = (matchId, key, value) => {
    setEditor((current) => {
      const exists = current.pricingEntries.some((item) => item.matchId === matchId);
      const nextValue = value === "" ? 0 : value;

      return {
        ...current,
        pricingEntries: exists
          ? current.pricingEntries.map((item) =>
              item.matchId === matchId
                ? {
                    ...item,
                    [key]: nextValue,
                  }
                : item,
            )
          : [
              ...current.pricingEntries,
              {
                matchId,
                markupRate: 0,
                toolingFee: 0,
                leadTimeBufferDays: 0,
                [key]: nextValue,
              },
            ],
      };
    });
  };

  const openQuote = async (quoteId) => {
    const result = await workspaceQuotesApi.getWorkspaceQuote(quoteId, user || {});
    if (result?.error || !result?.quote) {
      showAppMessage(app, "error", result?.error?.message || "询价单加载失败。");
      return;
    }
    setEditor(mapQuoteToEditor(result.quote));
  };

  const saveQuote = async (nextStep, overrides = {}) => {
    const draft = deriveQuoteEditor(editor, { products, suppliers, viewer: user || {} });
    const payload = {
      title: draft.title,
      currentStep: nextStep,
      requirements: buildRequirementsPayload(draft.requirements),
      matches: overrides.matches ?? draft.matches,
      supplierSortBy: overrides.supplierSortBy ?? draft.supplierSortBy,
      supplierSelections: overrides.supplierSelections ?? draft.supplierSelections,
      pricingEntries: overrides.pricingEntries ?? draft.pricingEntries,
    };

    const result = draft.id
      ? await workspaceQuotesApi.updateWorkspaceQuoteDraft(draft.id, payload, user || {})
      : await workspaceQuotesApi.createWorkspaceQuoteDraft(payload, user || {});

    if (result?.error || !result?.quote) {
      throw new Error(result?.error?.message || "询价草稿保存失败。");
    }

    setEditor(mapQuoteToEditor(result.quote));
    await reloadAll(result.quote.id);
    return result.quote;
  };

  const handlePreviewImport = async () => {
    setPreviewingImport(true);
    try {
      const result = await workspaceQuotesApi.previewWorkspaceQuoteImport(editorView.importText);
      setEditor((current) => ({
        ...current,
        importPreview: result,
      }));
    } finally {
      setPreviewingImport(false);
    }
  };

  const handleApplyImport = () => {
    const importedRequirements = (editorView.importPreview?.preview ?? [])
      .filter((item) => item.requirement)
      .map((item) => ({
        id: item.requirement.id,
        name: item.requirement.name,
        keywordsText: (item.requirement.keywords ?? []).join(", "),
        quantity: String(item.requirement.quantity ?? ""),
        targetLeadDays: String(item.requirement.targetLeadDays ?? ""),
        targetPriceBand: item.requirement.targetPriceBand || "",
        isCustom: item.requirement.isCustom === true,
        notes: item.requirement.notes || "",
      }));

    if (importedRequirements.length === 0) {
      return;
    }

    setEditor((current) => ({
      ...current,
      requirements:
        current.requirements.length === 1 && !formatText(current.requirements[0].name)
          ? importedRequirements
          : [...current.requirements, ...importedRequirements],
      importPreview: null,
      importText: "",
    }));
  };

  const handleNext = async () => {
    if (!canAdvance(editorView) || saving || editorView.currentStep >= 5) {
      return;
    }

    setSaving(true);
    try {
      await saveQuote(editorView.currentStep + 1);
      showAppMessage(app, "success", "询价草稿已保存。");
    } catch (saveError) {
      showAppMessage(app, "error", saveError.message || "询价草稿保存失败。");
    } finally {
      setSaving(false);
    }
  };

  const handlePrevious = () => {
    setEditor((current) => ({
      ...current,
      currentStep: Math.max(1, current.currentStep - 1),
    }));
  };

  const handleGenerate = async () => {
    if (!editorView.id || generating) {
      return;
    }

    setGenerating(true);
    try {
      const result = await workspaceQuotesApi.generateWorkspaceQuoteSheet(editorView.id, user || {});
      if (result?.error || !result?.download) {
        throw new Error(result?.error?.message || "标准报价单生成失败。");
      }

      downloadTextFile(
        result.download.filename,
        result.download.content,
        result.download.mimeType || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      setEditor(mapQuoteToEditor(result.quote));
      await reloadAll(result.quote.id);
      showAppMessage(app, "success", "标准报价单已生成并开始下载。");
    } catch (generateError) {
      showAppMessage(app, "error", generateError.message || "标准报价单生成失败。");
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenExports = () => {
    const productIds = editorView.matches.filter((item) => item.productId && !item.skipped).map((item) => item.productId);
    const supplierIds = editorView.supplierSelections.map((item) => item.supplierId).filter(Boolean);

    navigate("/workspace/exports", {
      state: {
        prefill: {
          title: `${editorView.title} 对外资料`,
          version: "public",
          format: "pdf",
          productIds,
          supplierIds,
          notes: `来自询价单 ${editorView.id || "未保存草稿"}`,
        },
      },
    });
  };

  const columns = [
    {
      title: "询价单",
      dataIndex: "title",
      key: "title",
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <Text strong>{record.title}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.id}
          </Text>
          <Text type="secondary">
            Step {record.currentStep} / {record.requirementCount} 个需求 / {record.matchCount} 个产品
          </Text>
        </Space>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (value) => (value === "quoted" ? "已生成报价单" : "草稿"),
    },
    {
      title: "负责人",
      dataIndex: "owner",
      key: "owner",
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
      render: (_, record) => (
        <Button type="link" onClick={() => openQuote(record.id)} data-testid={`workspace-quotes-open-${record.id}`}>
          继续编辑
        </Button>
      ),
    },
  ];

  const renderStep = () => {
    if (editorView.currentStep === 1) {
      return (
        <QuoteRequirementsStep
          title={editorView.title}
          requirements={editorView.requirements}
          importText={editorView.importText}
          importTemplate={getWorkspaceQuoteImportTemplate()}
          importPreview={editorView.importPreview}
          previewingImport={previewingImport}
          onTitleChange={(value) => setEditor((current) => ({ ...current, title: value }))}
          onImportTextChange={(value) => setEditor((current) => ({ ...current, importText: value }))}
          onPreviewImport={handlePreviewImport}
          onApplyImport={handleApplyImport}
          onAddRequirement={() =>
            setEditor((current) => ({
              ...current,
              requirements: [...current.requirements, createDraftRequirement(current.requirements.length)],
            }))
          }
          onRequirementChange={updateRequirement}
          onRemoveRequirement={(requirementId) =>
            setEditor((current) => ({
              ...current,
              requirements:
                current.requirements.length > 1
                  ? current.requirements.filter((item) => item.id !== requirementId)
                  : [createDraftRequirement(0)],
            }))
          }
        />
      );
    }

    if (editorView.currentStep === 2) {
      return (
        <QuoteMatchesStep
          matches={editorView.matches}
          products={products}
          onChangeMatchProduct={updateMatchProduct}
          onAddManualMatch={() =>
            setEditor((current) => ({
              ...current,
              matches: [
                ...current.matches,
                {
                  id: `quote-match-manual-${Date.now()}`,
                  requirementId: `manual-${Date.now()}`,
                  requirementName: "手动补充产品",
                  productId: "",
                  candidateProductIds: [],
                  manualAdded: true,
                  skipped: false,
                },
              ],
            }))
          }
          onRemoveMatch={(matchId) =>
            setEditor((current) => ({
              ...current,
              matches: current.matches.map((item) =>
                item.id === matchId
                  ? {
                      ...item,
                      skipped: true,
                      productId: "",
                    }
                  : item,
              ),
            }))
          }
        />
      );
    }

    if (editorView.currentStep === 3) {
      return (
        <QuoteSuppliersStep
          matches={editorView.matches}
          recommendations={editorView.supplierRecommendations}
          supplierSortBy={editorView.supplierSortBy}
          supplierSelections={editorView.supplierSelections}
          onSortChange={(value) => setEditor((current) => ({ ...current, supplierSortBy: value }))}
          onSelectSupplier={(matchId, supplierId) =>
            setEditor((current) => ({
              ...current,
              supplierSelections: current.supplierSelections.some((item) => item.matchId === matchId)
                ? current.supplierSelections.map((item) =>
                    item.matchId === matchId ? { ...item, supplierId } : item,
                  )
                : [...current.supplierSelections, { matchId, supplierId }],
            }))
          }
        />
      );
    }

    if (editorView.currentStep === 4) {
      return (
        <QuotePricingStep
          pricingPreview={editorView.pricingPreview}
          pricingEntries={editorView.pricingEntries}
          onChangePricingEntry={updatePricingEntry}
        />
      );
    }

    return (
      <QuoteResultStep
        quote={editorView}
        pricingPreview={editorView.pricingPreview}
        generating={generating}
        onGenerate={handleGenerate}
        onOpenExports={handleOpenExports}
      />
    );
  };

  return (
    <WorkspaceShell>
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        <AdminPageHeader
          eyebrow="采购与导出"
          title="询报价流程"
          description="以单路由五步流覆盖需求导入、产品匹配、供应商推荐、报价预览和标准报价单生成。"
        />

        <QuoteFlowHeader
          title={editorView.title || "未命名询价单"}
          description="保存草稿后会自动复用当前产品库、供应商库和权限脱敏规则；Step5 生成后可直接前往导出中心。"
          currentStep={editorView.currentStep}
          stepItems={QUOTE_STEP_ITEMS}
          quoteMeta={quoteMeta}
          onNewQuote={() => setEditor(createEmptyEditor())}
          onRefresh={() => {
            reloadAll(editorView.id).catch(() => {
              setStatus("error");
              setError("询报价流程加载失败。");
            });
          }}
          onStepChange={(nextStep) => {
            if (nextStep <= editorView.currentStep) {
              setEditor((current) => ({
                ...current,
                currentStep: nextStep,
              }));
            }
          }}
        />

        <AdminStatsRow
          items={[
            { key: "total", label: "询价单总数", value: summary.total, description: "当前账号可见的询价草稿与已报价记录。" },
            { key: "draft", label: "草稿数", value: summary.draftCount, description: "仍可继续完善的询价流程草稿。" },
            { key: "quoted", label: "已报价数", value: summary.quotedCount, description: "已生成标准报价单的询价记录。" },
            { key: "line", label: "当前产品行", value: summary.lineCount, description: "当前编辑中的有效报价产品行数。" },
          ]}
        />

        {status === "error" ? (
          <AdminResultState status="error" title="询报价流程加载失败" subTitle={error} />
        ) : (
          <>
            {renderStep()}

            <Space wrap style={{ justifyContent: "space-between", width: "100%" }}>
              <Button disabled={editorView.currentStep <= 1} onClick={handlePrevious} data-testid="workspace-quotes-prev">
                上一步
              </Button>
              {editorView.currentStep < 5 ? (
                <Button
                  type="primary"
                  loading={saving}
                  disabled={!canAdvance(editorView)}
                  onClick={handleNext}
                  data-testid="workspace-quotes-next"
                >
                  {getNextButtonLabel(editorView.currentStep)}
                </Button>
              ) : null}
            </Space>

            <AdminTableCard
              title="最近询价单"
              description="支持继续编辑当前账号可见的询价草稿和已报价记录。"
              tableProps={{
                rowKey: "id",
                columns,
                dataSource: quotes,
                loading: status === "loading" || status === "refreshing",
                pagination: false,
                locale: { emptyText: "暂无询价记录" },
              }}
            />
          </>
        )}
      </Space>
    </WorkspaceShell>
  );
}

export default WorkspaceQuotesPage;
