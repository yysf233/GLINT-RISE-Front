const now = "2026-03-24T00:00:00.000Z";

function createBannerArtwork(title, subtitle, accent, tone) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${tone}" />
          <stop offset="100%" stop-color="#0a0b0f" />
        </linearGradient>
        <radialGradient id="glow" cx="75%" cy="24%" r="56%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.42" />
          <stop offset="100%" stop-color="${accent}" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#bg)" />
      <circle cx="1240" cy="220" r="260" fill="url(#glow)" />
      <circle cx="360" cy="720" r="220" fill="${accent}" fill-opacity="0.12" />
      <rect x="52" y="52" width="1496" height="796" rx="42" fill="none" stroke="${accent}" stroke-opacity="0.16" />
      <g stroke="${accent}" stroke-opacity="0.3" fill="none">
        <path d="M88 118h220M88 156h140M88 194h260" stroke-width="3" />
        <path d="M1130 700h260M1130 736h180M1130 772h320" stroke-width="3" />
      </g>
      <text x="92" y="122" fill="${accent}" font-size="28" font-family="Arial, 'Microsoft YaHei', sans-serif" letter-spacing="8">GLINT RISE</text>
      <text x="92" y="492" fill="#ffffff" font-size="94" font-weight="700" font-family="Arial, 'Microsoft YaHei', sans-serif">${title}</text>
      <text x="92" y="560" fill="#d7dcee" font-size="34" font-family="Arial, 'Microsoft YaHei', sans-serif">${subtitle}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const bannerVisuals = {
  flagship: createBannerArtwork("星穹七号处理器", "关键基础设施旗舰处理器模组", "#c6cdfd", "#111317"),
  security: createBannerArtwork("量子安防网络", "面向关键场景的安全叙事案例", "#e6c6ff", "#0f1015"),
  hub: createBannerArtwork("企业数据协同中枢", "数据中台与业务协同展示系统", "#8fd3ff", "#101217"),
};

export const workspaceBannerSeeds = [
  {
    id: "wb-001",
    title: "旗舰处理器专题",
    status: "online",
    target: "/product/lumina-arc",
    hero: bannerVisuals.flagship,
    images: [bannerVisuals.flagship],
    updatedAt: now,
    logs: [
      {
        timestamp: now,
        action: "seed",
        actor: "system",
        message: "已写入旗舰处理器专题轮播。",
      },
    ],
  },
  {
    id: "wb-002",
    title: "量子安防案例专题",
    status: "offline",
    target: "/case/quantum-security-protocol",
    hero: bannerVisuals.security,
    images: [bannerVisuals.security],
    updatedAt: now,
    logs: [
      {
        timestamp: now,
        action: "seed",
        actor: "system",
        message: "已写入量子安防案例专题轮播。",
      },
    ],
  },
  {
    id: "wb-003",
    title: "企业协同中枢专题",
    status: "online",
    target: "/case/enterprise-data-synergy",
    hero: bannerVisuals.hub,
    images: [bannerVisuals.hub],
    updatedAt: now,
    logs: [
      {
        timestamp: now,
        action: "seed",
        actor: "system",
        message: "已写入企业协同中枢专题轮播。",
      },
    ],
  },
];

export const workspaceBannerSeedState = {
  version: 1,
  nextSequence: 4,
  items: workspaceBannerSeeds,
  generatedAt: now,
};

export default workspaceBannerSeeds;
