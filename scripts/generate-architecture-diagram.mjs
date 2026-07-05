import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { architectureDiagramCss } from "./diagram-styles.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const iconsDir = join(root, "public/diagram-icons");
const svgOut = join(root, "public/architecture-diagram.svg");
const innerOut = join(root, "scripts/architecture-diagram-inner.mjs");
const ogSvgOut = join(root, "public/og-image.svg");

const localIcons = join(root, "../aws-icons");
const AWS_ICONS_BASE = existsSync(localIcons)
  ? localIcons
  : "https://raw.githubusercontent.com/jajera/aws-icons/main";

const diagramWidth = 1200;
const ACCOUNT_WIDTH = 276;
const ACCOUNT_GAP = 20;
const ACCOUNT_COUNT = 4;
const ACCOUNTS_SPAN =
  ACCOUNT_COUNT * ACCOUNT_WIDTH + (ACCOUNT_COUNT - 1) * ACCOUNT_GAP;
const ACCOUNTS_LEFT = (diagramWidth - ACCOUNTS_SPAN) / 2;

const HEADER_TITLE_Y = 30;
const HEADER_SUBTITLE_Y = 50;
const ACCOUNT_TOP = 78;
const ACCOUNT_TITLE_Y = ACCOUNT_TOP + 26;
const CONTENT_BOTTOM = 488;
const ACCOUNT_PANEL_HEIGHT = CONTENT_BOTTOM - ACCOUNT_TOP;
const LEGEND_Y = CONTENT_BOTTOM + 22;
const diagramHeight = LEGEND_Y + 32;

const REGION_PAD_BELOW_TITLE = 28;
const REGION_LABEL_OFFSET = 18;
const REGION_INSET = 4;

const FONT = {
  headerTitle: 20,
  headerSubtitle: 15,
  accountTitle: 17,
  regionLabel: 14,
  nodeLabel: 15,
  nodeSublabel: 13,
  legend: 14,
  badge: 40,
};

const accounts = [
  {
    id: "mgmt",
    label: "Management",
    tint: "#E7157B",
    regions: [
      {
        label: "Global",
        nodes: [
          {
            id: "org",
            label: "org-bootstrap",
            sublabel: "delegate + RAM org",
            path: "icons/service/management/Arch_AWS-Organizations_64.svg",
            size: 44,
            cx: 138,
            cy: 0,
          },
        ],
      },
    ],
  },
  {
    id: "network",
    label: "Network",
    tint: "#8C4FFF",
    singleRegion: true,
    regions: [
      {
        label: "ap-southeast-6",
        nodes: [
          {
            id: "ipam",
            label: "IPAM home",
            sublabel: "org / nz / au pools",
            path: "icons/service/networking/Arch_Amazon-Virtual-Private-Cloud_64.svg",
            size: 42,
            cx: 138,
            cy: 0,
          },
          {
            id: "ram",
            label: "RAM shares",
            sublabel: "org-nz-dev · org-au-sandbox",
            path: "icons/service/security/Arch_AWS-Resource-Access-Manager_64.svg",
            size: 40,
            cx: 138,
            cy: 0,
            tint: "#DD344C",
          },
        ],
      },
    ],
  },
  {
    id: "dev",
    label: "Dev",
    tint: "#7B68EE",
    singleRegion: true,
    regions: [
      {
        label: "ap-southeast-6",
        nodes: [
          {
            id: "vpc-dev",
            label: "workload-a VPC",
            sublabel: "10.64.0.0/20",
            path: "icons/service/networking/Arch_Amazon-Virtual-Private-Cloud_64.svg",
            size: 40,
            cx: 138,
            cy: 0,
          },
        ],
      },
    ],
  },
  {
    id: "sandbox",
    label: "Sandbox",
    tint: "#48A9A6",
    singleRegion: true,
    regions: [
      {
        label: "ap-southeast-2",
        nodes: [
          {
            id: "vpc-sbx",
            label: "workload-b VPC",
            sublabel: "10.128.0.0/20",
            path: "icons/service/networking/Arch_Amazon-Virtual-Private-Cloud_64.svg",
            size: 40,
            cx: 138,
            cy: 0,
          },
        ],
      },
    ],
  },
];

for (const [index, account] of accounts.entries()) {
  account.x = ACCOUNTS_LEFT + index * (ACCOUNT_WIDTH + ACCOUNT_GAP);
  account.width = ACCOUNT_WIDTH;
}

const GUTTER_MGMT_NET = accounts[0].x + ACCOUNT_WIDTH + ACCOUNT_GAP / 2;
const GUTTER_NET_DEV = accounts[1].x + ACCOUNT_WIDTH + ACCOUNT_GAP / 2;
const GUTTER_DEV_SBX = accounts[2].x + ACCOUNT_WIDTH + ACCOUNT_GAP / 2;

function applyRegionLayout() {
  const panelBottom = ACCOUNT_TOP + ACCOUNT_PANEL_HEIGHT;
  const regionAreaTop = ACCOUNT_TITLE_Y + REGION_PAD_BELOW_TITLE;
  const regionAreaBottom = panelBottom - 2;
  const fullBandH = regionAreaBottom - regionAreaTop;

  for (const account of accounts) {
    const region = account.regions[0];
    region.y = regionAreaTop;
    region.bandH = fullBandH;

    if (account.id === "mgmt") {
      region.nodes[0].cy = Math.round(fullBandH * 0.34);
    } else if (account.id === "network") {
      region.nodes.find((n) => n.id === "ipam").cy = Math.round(
        fullBandH * 0.36,
      );
      region.nodes.find((n) => n.id === "ram").cy = Math.round(
        fullBandH * 0.68,
      );
    } else {
      region.nodes[0].cy = Math.round(fullBandH * 0.5);
    }
  }

  const ipam = accounts[1].regions[0].nodes.find((n) => n.id === "ipam");
  const mgmtRegion = accounts[0].regions[0];
  const networkRegion = accounts[1].regions[0];
  mgmtRegion.nodes[0].cy = ipam.cy + (networkRegion.y - mgmtRegion.y);
}

applyRegionLayout();

const crossAccountTargets = [
  { id: "vpc-dev", sandbox: false },
  { id: "vpc-sbx", sandbox: true },
];

mkdirSync(iconsDir, { recursive: true });

function stripSvg(svgText) {
  return svgText
    .replace(/<\?xml[^?]*\?>/g, "")
    .replace(/<!DOCTYPE[^>]*>/g, "")
    .trim();
}

function extractInnerSvg(svgText) {
  const stripped = stripSvg(svgText);
  const match = stripped.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
  if (!match) throw new Error("Invalid SVG content");
  return match[1];
}

function getViewBox(svgText) {
  const stripped = stripSvg(svgText);
  const match = stripped.match(/viewBox="([^"]+)"/i);
  if (match) return match[1];
  const w = Number(stripped.match(/width="(\d+)/i)?.[1] ?? 64);
  const h = Number(stripped.match(/height="(\d+)/i)?.[1] ?? 64);
  return `0 0 ${w} ${h}`;
}

function parseViewBox(viewBox) {
  const [x, y, w, h] = viewBox.split(/\s+/).map(Number);
  return { x, y, w, h };
}

function stylizeIconInner(inner) {
  return inner.replaceAll('fill="#FFFFFF"', 'class="icon-glyph"');
}

async function loadIcon(node) {
  const filePath = join(AWS_ICONS_BASE, node.path);
  let svgText;
  if (filePath.startsWith("http")) {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`Failed to fetch ${filePath}`);
    svgText = await response.text();
  } else {
    svgText = readFileSync(filePath, "utf8");
  }
  writeFileSync(join(iconsDir, `${node.id}.svg`), svgText);
  return {
    viewBox: getViewBox(svgText),
    inner: stylizeIconInner(extractInnerSvg(svgText)),
  };
}

const iconCache = new Map();
async function getIconData(node) {
  if (!iconCache.has(node.id)) iconCache.set(node.id, await loadIcon(node));
  return iconCache.get(node.id);
}

const nodePositions = new Map();

function sublabelMarkup(absX, absY, nodeSize, text) {
  if (!text) return "";
  const baseY = absY + nodeSize / 2 + 35;
  if (!text.includes("·")) {
    return `<text x="${absX}" y="${baseY}" text-anchor="middle" class="node-sublabel" font-family="sans-serif" font-size="${FONT.nodeSublabel}">${text}</text>`;
  }
  const parts = text.split("·").map((p) => p.trim());
  const lineGap = FONT.nodeSublabel + 3;
  const tspans = parts
    .map(
      (part, i) =>
        `<tspan x="${absX}" dy="${i === 0 ? 0 : lineGap}">${part}</tspan>`,
    )
    .join("");
  return `<text x="${absX}" y="${baseY}" text-anchor="middle" class="node-sublabel" font-family="sans-serif" font-size="${FONT.nodeSublabel}">${tspans}</text>`;
}

function placeNode(account, region, node, iconData) {
  const absX = account.x + node.cx;
  const absY = region.y + node.cy;
  const viewBox = parseViewBox(iconData.viewBox);
  const scale = node.size / Math.max(viewBox.w, viewBox.h);
  const renderedW = viewBox.w * scale;
  const renderedH = viewBox.h * scale;
  const iconX = absX - renderedW / 2 - viewBox.x * scale;
  const iconY = absY - renderedH / 2 - viewBox.y * scale;

  nodePositions.set(node.id, {
    cx: absX,
    cy: absY,
    rx: renderedW / 2,
    ry: renderedH / 2,
  });

  const tint = node.tint ?? account.tint;
  return {
    icon: `<g transform="translate(${iconX} ${iconY}) scale(${scale})"><g fill="${tint}">${iconData.inner}</g></g>`,
    label: `<text x="${absX}" y="${absY + node.size / 2 + 18}" text-anchor="middle" class="node-label" font-family="sans-serif" font-size="${FONT.nodeLabel}" font-weight="600">${node.label}</text>`,
    sublabel: sublabelMarkup(absX, absY, node.size, node.sublabel),
  };
}

function accountPanel(account) {
  return `<rect class="account-panel" x="${account.x}" y="${ACCOUNT_TOP}" width="${account.width}" height="${ACCOUNT_PANEL_HEIGHT}" rx="10" stroke="${account.tint}" stroke-width="1.5" opacity="0.95"/>
  <text class="account-title" x="${account.x + account.width / 2}" y="${ACCOUNT_TITLE_Y}" text-anchor="middle" fill="${account.tint}" font-family="sans-serif" font-size="${FONT.accountTitle}" font-weight="700">${account.label}</text>`;
}

function regionBand(account, region) {
  return `<rect class="region-band" x="${account.x + REGION_INSET}" y="${region.y - 6}" width="${account.width - REGION_INSET * 2}" height="${region.bandH}" rx="6"/>
  <text class="region-label" x="${account.x + account.width / 2}" y="${region.y + REGION_LABEL_OFFSET}" text-anchor="middle" font-family="sans-serif" font-size="${FONT.regionLabel}" font-weight="600">${region.label}</text>`;
}

function arrowHead(x, y, dir = "right") {
  const s = 5;
  if (dir === "right") {
    return `<polygon points="${x - s},${y - s} ${x},${y} ${x - s},${y + s}" fill="currentColor"/>`;
  }
  return "";
}

function pathLine(
  d,
  {
    dashed = false,
    linkClass = "link-ram",
    arrowClass = "arrow-ram",
    arrowAt = "end",
  } = {},
) {
  const dash = dashed ? ' stroke-dasharray="7 5"' : "";
  const nums = d.match(/-?\d+(?:\.\d+)?/g) ?? [];
  const endX = Number(nums[nums.length - 2]);
  const endY = Number(nums[nums.length - 1]);
  const arrow =
    arrowAt === "end"
      ? `<g class="${arrowClass}">${arrowHead(endX, endY, "right")}</g>`
      : "";
  return `<path class="${linkClass}" d="${d}" stroke-width="1.5" fill="none"${dash}/>${arrow}`;
}

function buildDelegateLink() {
  const org = nodePositions.get("org");
  const ipam = nodePositions.get("ipam");
  if (!org || !ipam) return "";

  const startX = org.cx + org.rx + 6;
  const endX = ipam.cx - ipam.rx - 8;
  const y = ipam.cy;
  return pathLine(`M ${startX} ${y} L ${endX} ${y}`, {
    linkClass: "link-delegate",
    arrowClass: "arrow-delegate",
  });
}

function buildRamShareLinks() {
  const ram = nodePositions.get("ram");
  if (!ram) return "";

  const startX = ram.cx + ram.rx + 6;
  const startY = ram.cy;
  const targets = crossAccountTargets.map(({ id }) => nodePositions.get(id));
  const laneYs = crossAccountTargets
    .filter((t) => t.sandbox)
    .map(({ id, bypassY = 0 }) => nodePositions.get(id).cy + bypassY);
  const branchYs = [...targets.map((t) => t.cy), ...laneYs];
  const busTop = Math.min(startY, ...branchYs) - 16;
  const busBottom = Math.max(startY, ...branchYs) + 24;

  const entry = pathLine(
    `M ${startX} ${startY} L ${GUTTER_NET_DEV} ${startY}`,
    {
      dashed: true,
      arrowAt: "none",
    },
  );
  const spine = pathLine(
    `M ${GUTTER_NET_DEV} ${busTop} L ${GUTTER_NET_DEV} ${busBottom}`,
    { dashed: true, arrowAt: "none" },
  );
  const branches = crossAccountTargets
    .map(({ id, sandbox, bypassY = 0 }) => {
      const to = nodePositions.get(id);
      const endX = to.cx - to.rx - 8;
      if (!sandbox) {
        return pathLine(`M ${GUTTER_NET_DEV} ${to.cy} L ${endX} ${to.cy}`, {
          dashed: true,
        });
      }
      const laneY = to.cy + bypassY;
      if (laneY === to.cy) {
        return pathLine(
          `M ${GUTTER_NET_DEV} ${to.cy} L ${GUTTER_DEV_SBX} ${to.cy} L ${endX} ${to.cy}`,
          { dashed: true },
        );
      }
      return pathLine(
        `M ${GUTTER_NET_DEV} ${laneY} L ${GUTTER_DEV_SBX} ${laneY} L ${GUTTER_DEV_SBX} ${to.cy} L ${endX} ${to.cy}`,
        { dashed: true },
      );
    })
    .join("\n");

  return `${entry}\n${spine}\n${branches}`;
}

function routingGutters() {
  const gutterTop = ACCOUNT_TITLE_Y + REGION_PAD_BELOW_TITLE - 6;
  const gutterH = ACCOUNT_TOP + ACCOUNT_PANEL_HEIGHT - gutterTop + 6;
  return `<rect class="gutter" x="${GUTTER_NET_DEV - 10}" y="${gutterTop}" width="20" height="${gutterH}" rx="4"/>
  <rect class="gutter" x="${GUTTER_DEV_SBX - 10}" y="${gutterTop}" width="20" height="${gutterH}" rx="4"/>`;
}

function linkLegend() {
  const y = LEGEND_Y;
  const lineW = 50;
  const lineTextGap = 12;
  const itemGap = 28;
  const charW = 8;
  const items = [
    { lineClass: "legend-delegate", label: "delegate admin + RAM org" },
    { lineClass: "legend-ram", label: "RAM pool share" },
  ];

  const itemWidths = items.map(
    (item) => lineW + lineTextGap + item.label.length * charW,
  );
  const totalW = itemWidths[0] + itemGap + itemWidths[1];
  let x = (diagramWidth - totalW) / 2;

  return items
    .map((item, i) => {
      const lineX1 = x;
      const lineX2 = x + lineW;
      const textX = lineX2 + lineTextGap;
      const markup = `<line class="${item.lineClass}" x1="${lineX1}" y1="${y}" x2="${lineX2}" y2="${y}" stroke-width="2"/>
  <text class="legend-text" x="${textX}" y="${y + 5}" font-family="sans-serif" font-size="${FONT.legend}">${item.label}</text>`;
      x += itemWidths[i] + (i === 0 ? itemGap : 0);
      return markup;
    })
    .join("\n");
}

function bgGradient(id) {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
      <stop stop-color="#232F3E"/>
      <stop offset="1" stop-color="#131a22"/>
    </linearGradient>`;
}

function buildOgImageSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" fill="none" role="img" aria-label="Amazon VPC IPAM Multi-Account Walkthrough">
  <defs>
    ${bgGradient("ogBg")}
    <radialGradient id="ogGlow" cx="0.5" cy="0.42" r="0.55" gradientUnits="objectBoundingBox">
      <stop stop-color="#8C4FFF" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#8C4FFF" stop-opacity="0"/>
    </radialGradient>
    <pattern id="ogGrid" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="1" fill="#94a3b8" opacity="0.12"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" rx="12" fill="url(#ogBg)"/>
  <rect width="1200" height="630" fill="url(#ogGlow)"/>
  <rect x="1" y="1" width="1198" height="628" rx="11" stroke="#FF9900" stroke-width="1" fill="none" opacity="0.35"/>

  <text x="600" y="68" text-anchor="middle" fill="#f4f1f8" font-family="sans-serif" font-size="44" font-weight="700">VPC IPAM Multi-Account Walkthrough</text>
  <text x="600" y="110" text-anchor="middle" fill="#b8afc8" font-family="sans-serif" font-size="22">Delegate · pool hierarchy · RAM share · pool-backed VPCs</text>

  <rect x="268" y="136" width="148" height="34" rx="17" fill="#243040" stroke="#8C4FFF" stroke-width="1"/>
  <text x="342" y="158" text-anchor="middle" fill="#e8e0f4" font-family="sans-serif" font-size="15" font-weight="600">4 accounts</text>
  <rect x="428" y="136" width="132" height="34" rx="17" fill="#243040" stroke="#8C4FFF" stroke-width="1"/>
  <text x="494" y="158" text-anchor="middle" fill="#e8e0f4" font-family="sans-serif" font-size="15" font-weight="600">2 regions</text>
  <rect x="572" y="136" width="360" height="34" rx="17" fill="#243040" stroke="#8C4FFF" stroke-width="1"/>
  <text x="752" y="158" text-anchor="middle" fill="#e8e0f4" font-family="sans-serif" font-size="15" font-weight="600">org → regional → leaf pools</text>

  <rect x="64" y="188" width="1072" height="392" rx="14" fill="#1a2332" stroke="#3d4f63" stroke-width="1"/>
  <rect x="64" y="188" width="1072" height="392" rx="14" fill="url(#ogGrid)" opacity="0.55"/>

  <text x="600" y="224" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="13" font-weight="600" letter-spacing="0.08em">POOL HIERARCHY</text>

  <rect x="430" y="244" width="340" height="54" rx="10" fill="#243040" stroke="#8C4FFF" stroke-width="1.5"/>
  <text x="600" y="268" text-anchor="middle" fill="#f4f1f8" font-family="sans-serif" font-size="18" font-weight="700">org</text>
  <text x="600" y="286" text-anchor="middle" fill="#9b92b0" font-family="sans-serif" font-size="13">10.0.0.0/8 · no locale</text>

  <path d="M 520 298 L 520 322 L 360 322 L 360 346" stroke="#5a6a7e" stroke-width="1.5" fill="none"/>
  <path d="M 680 298 L 680 322 L 840 322 L 840 346" stroke="#5a6a7e" stroke-width="1.5" fill="none"/>

  <rect x="248" y="346" width="224" height="58" rx="10" fill="#243040" stroke="#7B68EE" stroke-width="1.5"/>
  <text x="360" y="370" text-anchor="middle" fill="#f4f1f8" font-family="sans-serif" font-size="16" font-weight="600">org/nz</text>
  <text x="360" y="390" text-anchor="middle" fill="#9b92b0" font-family="sans-serif" font-size="12">10.64.0.0/12 · ap-southeast-6</text>

  <rect x="728" y="346" width="224" height="58" rx="10" fill="#243040" stroke="#48A9A6" stroke-width="1.5"/>
  <text x="840" y="370" text-anchor="middle" fill="#f4f1f8" font-family="sans-serif" font-size="16" font-weight="600">org/au</text>
  <text x="840" y="390" text-anchor="middle" fill="#9b92b0" font-family="sans-serif" font-size="12">10.128.0.0/12 · ap-southeast-2</text>

  <line x1="360" y1="404" x2="360" y2="432" stroke="#5a6a7e" stroke-width="1.5"/>
  <line x1="840" y1="404" x2="840" y2="432" stroke="#5a6a7e" stroke-width="1.5"/>

  <rect x="248" y="432" width="224" height="52" rx="9" fill="#1e2936" stroke="#7B68EE" stroke-width="1.5" stroke-dasharray="6 4"/>
  <text x="360" y="454" text-anchor="middle" fill="#e8e0f4" font-family="sans-serif" font-size="14" font-weight="600">org/nz/dev</text>
  <text x="360" y="472" text-anchor="middle" fill="#9b92b0" font-family="sans-serif" font-size="11">10.64.0.0/20 VPC</text>

  <rect x="728" y="432" width="224" height="52" rx="9" fill="#1e2936" stroke="#48A9A6" stroke-width="1.5" stroke-dasharray="6 4"/>
  <text x="840" y="454" text-anchor="middle" fill="#e8e0f4" font-family="sans-serif" font-size="14" font-weight="600">org/au/sandbox</text>
  <text x="840" y="472" text-anchor="middle" fill="#9b92b0" font-family="sans-serif" font-size="11">10.128.0.0/20 VPC</text>

  <text x="600" y="512" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="13" font-weight="600" letter-spacing="0.08em">ACCOUNT FLOW</text>

  <rect x="327" y="524" width="118" height="36" rx="8" fill="#243040" stroke="#E7157B" stroke-width="1.5"/>
  <text x="386" y="547" text-anchor="middle" fill="#f4f1f8" font-family="sans-serif" font-size="13" font-weight="600">Management</text>

  <line x1="445" y1="542" x2="489" y2="542" stroke="#E7157B" stroke-width="2"/>
  <polygon points="484,537 489,542 484,547" fill="#E7157B"/>

  <rect x="489" y="524" width="104" height="36" rx="8" fill="#243040" stroke="#8C4FFF" stroke-width="1.5"/>
  <text x="541" y="547" text-anchor="middle" fill="#f4f1f8" font-family="sans-serif" font-size="13" font-weight="600">Network</text>

  <line x1="593" y1="542" x2="637" y2="542" stroke="#7B68EE" stroke-width="2" stroke-dasharray="7 5"/>
  <polygon points="632,537 637,542 632,547" fill="#7B68EE"/>

  <rect x="637" y="524" width="72" height="36" rx="8" fill="#243040" stroke="#7B68EE" stroke-width="1.5"/>
  <text x="673" y="547" text-anchor="middle" fill="#f4f1f8" font-family="sans-serif" font-size="13" font-weight="600">Dev</text>

  <line x1="709" y1="542" x2="753" y2="542" stroke="#7B68EE" stroke-width="2" stroke-dasharray="7 5"/>
  <polygon points="748,537 753,542 748,547" fill="#7B68EE"/>

  <rect x="753" y="524" width="96" height="36" rx="8" fill="#243040" stroke="#48A9A6" stroke-width="1.5"/>
  <text x="801" y="547" text-anchor="middle" fill="#f4f1f8" font-family="sans-serif" font-size="13" font-weight="600">Sandbox</text>

  <rect x="300" y="568" width="600" height="28" rx="6" fill="#243040" opacity="0.6"/>
  <text x="600" y="587" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="12">delegate admin · RAM pool share · allocate CIDR</text>

  <text x="600" y="612" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="17">jajera.github.io/amazon-vpc-ipam-multi-account-walkthrough</text>
</svg>`;
}

const vpcBadge = await getIconData({
  id: "vpc-badge",
  path: "icons/service/networking/Arch_Amazon-Virtual-Private-Cloud_64.svg",
  size: FONT.badge,
});
const badgeViewBox = parseViewBox(vpcBadge.viewBox);
const badgeScale = FONT.badge / Math.max(badgeViewBox.w, badgeViewBox.h);

const panels = accounts.map(accountPanel).join("\n");
const bands = accounts
  .flatMap((a) => a.regions.map((r) => regionBand(a, r)))
  .join("\n");

const placed = [];
for (const account of accounts) {
  for (const region of account.regions) {
    for (const node of region.nodes) {
      const iconData = await getIconData(node);
      const p = placeNode(account, region, node, iconData);
      placed.push(p.icon, p.label, p.sublabel);
    }
  }
}

const links = [buildDelegateLink(), buildRamShareLinks()]
  .filter(Boolean)
  .join("\n");

const header = `<g transform="translate(24 10) scale(${badgeScale})"><g fill="#8C4FFF">${stylizeIconInner(vpcBadge.inner)}</g></g>
<text class="header-title" x="${diagramWidth / 2}" y="${HEADER_TITLE_Y}" text-anchor="middle" font-family="sans-serif" font-size="${FONT.headerTitle}" font-weight="600">VPC IPAM multi-account sharing</text>
<text class="header-muted" x="${diagramWidth / 2}" y="${HEADER_SUBTITLE_Y}" text-anchor="middle" font-family="sans-serif" font-size="${FONT.headerSubtitle}">Network owns pools · RAM grants access · workloads allocate VPC CIDRs</text>`;

const diagramCore = `${header}
${panels}
${bands}
${routingGutters()}
${placed.join("\n")}
${links}
${linkLegend()}`;

const architectureSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${diagramWidth}" height="${diagramHeight}" viewBox="0 0 ${diagramWidth} ${diagramHeight}" fill="none" role="img" aria-label="Four-account VPC IPAM topology with delegation and RAM pool sharing">
  <defs>
    <style>${architectureDiagramCss}</style>
    ${bgGradient("archBg")}
  </defs>
  <rect class="canvas" width="${diagramWidth}" height="${diagramHeight}" rx="12"/>
  <rect class="canvas-border" x="1" y="1" width="${diagramWidth - 2}" height="${diagramHeight - 2}" rx="11"/>
  ${diagramCore}
</svg>`;

const innerModule = `export const architectureDiagramWidth = ${diagramWidth};
export const architectureDiagramHeight = ${diagramHeight};
export const architectureDiagramInner = ${JSON.stringify(diagramCore)};
`;

const ogSvg = buildOgImageSvg();

writeFileSync(svgOut, architectureSvg);
writeFileSync(innerOut, innerModule);
writeFileSync(ogSvgOut, ogSvg);
console.log(`Wrote ${svgOut}`);
console.log(`Wrote ${innerOut}`);
console.log(`Wrote ${ogSvgOut}`);
