import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Minus, Plus, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "../components/layout/PageShell";
import { useNotice } from "../context/useNotice";
import { readPublishedTimelineProjects } from "../services/publicSiteContent";
import { buildPublicCaseTimelineModel } from "../utils/publicCaseTimeline";
import { shareCurrentPage } from "../utils/shareCurrentPage";

const MIN_SCALE = 0.8;
const MAX_SCALE = 1.6;
const BASE_SCALE = 1;
const TRACK_START_X = 160;
const TRACK_SPACING = 240;
const DEFAULT_VIEWPORT_HEIGHT = 840;
const CARD_HEIGHT = 280;
const TIMELINE_TOP_PADDING = 32;
const TIMELINE_BOTTOM_PADDING = 24;
const PREFERRED_CARD_OFFSET_Y = 170;
const MIN_CARD_OFFSET_Y = 16;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getTimelineLayout(viewportHeight) {
  const safeViewportHeight = Math.max(
    viewportHeight || DEFAULT_VIEWPORT_HEIGHT,
    TIMELINE_TOP_PADDING + TIMELINE_BOTTOM_PADDING + CARD_HEIGHT * 2 + MIN_CARD_OFFSET_Y * 2,
  );
  const availableOffset =
    (safeViewportHeight - TIMELINE_TOP_PADDING - TIMELINE_BOTTOM_PADDING - CARD_HEIGHT * 2) / 2;
  const cardOffsetY = Math.min(PREFERRED_CARD_OFFSET_Y, Math.max(MIN_CARD_OFFSET_Y, Math.floor(availableOffset)));
  const axisY = TIMELINE_TOP_PADDING + CARD_HEIGHT + cardOffsetY;

  return {
    axisY,
    cardOffsetY,
  };
}

function getCardPosition(side, axisY, cardOffsetY) {
  return side === "below" ? axisY + cardOffsetY : axisY - cardOffsetY - CARD_HEIGHT;
}

export function CaseTimelinePage() {
  const navigate = useNavigate();
  const { showNotice } = useNotice();
  const viewportRef = useRef(null);
  const dragRef = useRef({
    active: false,
    startX: 0,
    startOffsetX: 0,
  });
  const [scale, setScale] = useState(BASE_SCALE);
  const [offsetX, setOffsetX] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(DEFAULT_VIEWPORT_HEIGHT);

  const timelineModel = useMemo(() => buildPublicCaseTimelineModel(readPublishedTimelineProjects()), []);
  const tickIndexMap = useMemo(
    () =>
      new Map(
        timelineModel.ticks.map((tick, index) => [tick.order, index]),
      ),
    [timelineModel.ticks],
  );
  const timelineLayout = useMemo(() => getTimelineLayout(viewportHeight), [viewportHeight]);

  const trackWidth = Math.max(1320, TRACK_START_X * 2 + Math.max(timelineModel.ticks.length - 1, 0) * TRACK_SPACING);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) {
      return undefined;
    }

    const syncViewportHeight = () => {
      const nextHeight = node.clientHeight || DEFAULT_VIEWPORT_HEIGHT;
      setViewportHeight(nextHeight);
    };

    syncViewportHeight();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", syncViewportHeight);
      return () => {
        window.removeEventListener("resize", syncViewportHeight);
      };
    }

    const observer = new ResizeObserver(() => {
      syncViewportHeight();
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  const updateScale = (delta) => {
    setScale((current) => clamp(Number((current + delta).toFixed(2)), MIN_SCALE, MAX_SCALE));
  };

  const handlePointerDown = (event) => {
    dragRef.current = {
      active: true,
      startX: event.clientX,
      startOffsetX: offsetX,
    };
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current.active) {
      return;
    }

    const distance = event.clientX - dragRef.current.startX;
    setOffsetX(dragRef.current.startOffsetX + distance);
  };

  const handlePointerUp = () => {
    dragRef.current.active = false;
  };

  const handleWheel = (event) => {
    event.preventDefault();
    updateScale(event.deltaY > 0 ? -0.08 : 0.08);
  };

  return (
    <PageShell lockViewport hideFooter>
      <section
        className="mx-auto flex h-full min-h-0 max-w-[1600px] text-white"
        data-case-timeline-layout="horizontal-canvas"
        aria-label="案例时间轴"
      >
        <div
          data-testid="case-timeline-canvas"
          className="relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[34px] border border-white/6 bg-[#111214]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "100px 100px",
            boxShadow: "0 28px 72px rgba(0,0,0,0.28)",
          }}
        >
          <div className="flex items-center justify-between gap-4 px-8 py-7">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/cases")}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/4 text-white/78 transition hover:bg-white/10 hover:text-white"
                aria-label="返回案例总览"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <div className="text-[10px] tracking-[0.28em] text-white/36">CASE TIMELINE</div>
                <h1
                  className="mt-2 text-white"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "2.35rem",
                    fontWeight: 800,
                    letterSpacing: "-0.05em",
                    lineHeight: 0.92,
                  }}
                >
                  案例时间轴
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-8 text-sm md:flex">
                <span className="font-semibold text-[#bac3ff]">时间轴</span>
                <span className="text-white/52">归档</span>
                <span className="text-white/52">洞察</span>
              </div>
              <button
                type="button"
                onClick={() => shareCurrentPage("案例时间轴", showNotice, "/case-timeline")}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-2.5 text-sm tracking-[0.16em] text-white/78 transition hover:bg-white/10 hover:text-white"
                aria-label="分享时间轴"
              >
                <Share2 className="h-4 w-4" />
                分享时间轴
              </button>
            </div>
          </div>

            <div
              ref={viewportRef}
              data-testid="case-timeline-viewport"
              className="relative min-h-0 flex-1 overflow-hidden cursor-grab active:cursor-grabbing"
              onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onWheel={handleWheel}
          >
            <div
              data-testid="case-timeline-track"
              className="absolute inset-y-0 left-0"
              style={{
                width: trackWidth,
                transform: `translateX(${offsetX}px) scale(${scale})`,
                transformOrigin: "left center",
              }}
            >
              <div
                className="absolute left-0 right-0"
                style={{
                  top: timelineLayout.axisY,
                  height: 1,
                  background: "rgba(255,255,255,0.24)",
                }}
              />

              {timelineModel.years.map((year, index) => (
                <div
                  key={year.year}
                  data-testid={`case-timeline-year-tick-${index}`}
                  className="absolute"
                  style={{
                    left: TRACK_START_X + year.startIndex * TRACK_SPACING - 10,
                    top: timelineLayout.axisY + 36,
                  }}
                >
                  <div className="text-5xl font-black tracking-[-0.05em] text-white">{year.year}</div>
                </div>
              ))}

              {timelineModel.ticks.map((tick, index) => {
                const x = TRACK_START_X + index * TRACK_SPACING;
                return (
                  <div key={tick.id}>
                    <div
                      data-testid={`case-timeline-quarter-tick-${index}`}
                      className="absolute"
                      style={{ left: x - 1, top: timelineLayout.axisY - 12 }}
                    >
                      <div className="h-6 w-[2px] bg-white/24" />
                    </div>
                    <div
                      className="absolute text-[11px] tracking-[0.22em] text-white/34"
                      style={{ left: x - 28, top: timelineLayout.axisY + 92 }}
                    >
                      {tick.quarter}
                    </div>
                  </div>
                );
              })}

              {timelineModel.cards.map((card, index) => {
                const tickIndex = tickIndexMap.get(card.tickOrder) ?? index;
                const x = TRACK_START_X + tickIndex * TRACK_SPACING;
                const cardY = getCardPosition(card.side, timelineLayout.axisY, timelineLayout.cardOffsetY);
                const connectorHeight = card.side === "below" ? timelineLayout.cardOffsetY : timelineLayout.cardOffsetY + 40;

                return (
                  <div key={card.id}>
                    <div
                      className="absolute rounded-full"
                      style={{
                        left: x - 6,
                        top: timelineLayout.axisY - 6,
                        width: 12,
                        height: 12,
                        background: card.accent === "featured" ? "#bac3ff" : "rgba(255,255,255,0.28)",
                        boxShadow: card.accent === "featured" ? "0 0 18px rgba(186,195,255,0.42)" : "none",
                      }}
                    />
                    <div
                      className="absolute w-px bg-white/24"
                      style={{
                        left: x,
                        top: card.side === "below" ? timelineLayout.axisY : cardY + CARD_HEIGHT,
                        height: connectorHeight,
                      }}
                    />
                    <button
                      type="button"
                      disabled={card.disabled}
                      data-testid={`case-timeline-card-${index}`}
                      onClick={() => {
                        if (!card.disabled) {
                          navigate(`/case/${card.publicCaseId}`);
                        }
                      }}
                      className="absolute flex h-[280px] w-[320px] flex-col rounded-[24px] border border-white/8 bg-[#2a2a2d]/88 p-6 text-left backdrop-blur-xl transition hover:-translate-y-1 disabled:cursor-default disabled:opacity-75"
                      style={{
                        left: x - 160,
                        top: cardY,
                        boxShadow: "0 28px 72px rgba(0,0,0,0.28)",
                      }}
                    >
                      <div className="text-[10px] tracking-[0.28em] text-[#bac3ff]">{card.category || "案例项目"}</div>
                      <div
                        className="mt-5 text-white"
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "2rem",
                          fontWeight: 700,
                          letterSpacing: "-0.04em",
                          lineHeight: 0.98,
                        }}
                      >
                        {card.title}
                      </div>
                      <p
                        className="mt-4 overflow-hidden text-sm leading-7 text-white/72"
                        style={{
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 3,
                        }}
                      >
                        {card.summary}
                      </p>
                      <div className="mt-auto flex items-center justify-between text-xs tracking-[0.18em] text-white/42">
                        <span>{card.timelineQuarter} {card.timelineYear}</span>
                        <span>{card.disabled ? "未关联详情" : "查看详情"}</span>
                      </div>
                    </button>
                  </div>
                );
              })}

              {timelineModel.cards.length === 0 ? (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="text-[10px] tracking-[0.3em] text-white/36">TIMELINE EMPTY</div>
                  <div className="mt-4 text-3xl font-bold tracking-[-0.04em] text-white">暂无已发布时间轴项目</div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="absolute bottom-8 left-8 flex items-center gap-5 rounded-full border border-white/10 bg-[#18191d]/90 px-5 py-3 text-xs tracking-[0.22em] text-white/58 backdrop-blur-xl">
            <span>当前视图</span>
            <span className="h-8 w-px bg-white/10" />
            <span className="inline-flex items-center gap-2 text-white">
              <span className="h-2.5 w-2.5 rounded-full bg-[#bac3ff]" />
              LIVE EVOLUTION
            </span>
          </div>

          <div className="absolute bottom-8 right-8 flex flex-col items-center gap-4 rounded-[22px] border border-white/10 bg-[#18191d]/92 px-3 py-4 text-white shadow-[0_20px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl">
            <button
              type="button"
              data-testid="case-timeline-zoom-in"
              onClick={() => updateScale(0.1)}
              className="rounded-full bg-[#101114] p-3 transition hover:bg-[#202127]"
              aria-label="放大时间轴"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              data-testid="case-timeline-zoom-out"
              onClick={() => updateScale(-0.1)}
              className="rounded-full bg-[#101114] p-3 transition hover:bg-[#202127]"
              aria-label="缩小时间轴"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              type="button"
              data-testid="case-timeline-zoom-reset"
              onClick={() => {
                setScale(BASE_SCALE);
                setOffsetX(0);
              }}
              className="rounded-full bg-[#bac3ff]/10 px-3 py-2 text-xs text-[#bac3ff] transition hover:bg-[#bac3ff]/18"
              aria-label="重置时间轴缩放"
            >
              {Math.round(scale * 100)}%
            </button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

export default CaseTimelinePage;
