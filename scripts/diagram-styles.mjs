/** Shared SVG diagram styles — dark default, light via prefers-color-scheme */
export const diagramFrameCss = `
  .diagram-frame { fill: #1e2836; stroke: #3d4f63; stroke-width: 1.5; }
  @media (prefers-color-scheme: light) {
    .diagram-frame { fill: #f8fafc; stroke: #c5cdd6; }
  }
`;

export const docDiagramCss = `
  ${diagramFrameCss}
  .panel { fill: #243040; stroke: #3d4f63; stroke-width: 1; }
  .panel-title { fill: #f4f1f8; font-family: sans-serif; font-size: 13px; font-weight: 600; }
  .node-label { fill: #f4f1f8; font-family: sans-serif; font-size: 12px; font-weight: 600; }
  .node-sublabel { fill: #9b92b0; font-family: sans-serif; font-size: 10px; }
  .region-label { fill: #94a3b8; font-family: sans-serif; font-size: 11px; font-weight: 600; }
  .legend-text { fill: #94a3b8; font-family: sans-serif; font-size: 11px; }
  @media (prefers-color-scheme: light) {
    .panel-title, .node-label { fill: #1f2937; }
    .node-sublabel, .region-label, .legend-text { fill: #4b5563; }
  }
`;

export const architectureDiagramCss = `
  svg { color-scheme: dark light; }
  .canvas { fill: url(#archBg); }
  .canvas-border { stroke: #FF9900; stroke-width: 1; fill: none; opacity: 0.35; }
  .header-title { fill: #f4f1f8; font-family: sans-serif; font-size: 20px; font-weight: 600; text-anchor: middle; }
  .header-muted { fill: #94a3b8; font-family: sans-serif; font-size: 15px; text-anchor: middle; }
  .account-panel { fill: #1e2936; stroke-width: 1.5; opacity: 0.95; }
  .account-title { text-anchor: middle; }
  .region-band { fill: #243040; stroke: #3d4f63; stroke-width: 1; }
  .region-label { fill: #94a3b8; font-family: sans-serif; font-size: 14px; font-weight: 600; text-anchor: middle; }
  .node-label { fill: #f4f1f8; font-family: sans-serif; font-size: 15px; font-weight: 600; text-anchor: middle; }
  .node-sublabel { fill: #9b92b0; font-family: sans-serif; font-size: 13px; text-anchor: middle; }
  .link-delegate { stroke: #E7157B; stroke-width: 1.5; fill: none; }
  .link-ram { stroke: #7B68EE; stroke-width: 1.5; fill: none; stroke-dasharray: 7 5; }
  .arrow-delegate { fill: #E7157B; }
  .arrow-ram { fill: #7B68EE; }
  .gutter { fill: #7B68EE; opacity: 0.06; }
  .legend-text { fill: #94a3b8; font-family: sans-serif; font-size: 14px; }
  .legend-delegate { stroke: #E7157B; stroke-width: 2; fill: none; }
  .legend-ram { stroke: #7B68EE; stroke-width: 2; stroke-dasharray: 7 5; fill: none; }
  .icon-glyph { fill: #FFFFFF; }
  @media (prefers-color-scheme: light) {
    #archBg stop:nth-child(1) { stop-color: #f1f5f9; }
    #archBg stop:nth-child(2) { stop-color: #e2e8f0; }
    .header-title, .node-label { fill: #1f2937; }
    .header-muted, .region-label, .legend-text { fill: #4b5563; }
    .node-sublabel { fill: #6b7280; }
    .account-panel { fill: #f8fafc; }
    .region-band { fill: #eef1f5; stroke: #c5cdd6; }
  }
`;

export function wrapSvg({ width, height, ariaLabel, body, extraCss = "" }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" role="img" aria-label="${ariaLabel}">
  <defs>
    <style>${docDiagramCss}${extraCss}</style>
  </defs>
  <rect class="diagram-frame" x="1" y="1" width="${width - 2}" height="${height - 2}" rx="10"/>
  ${body}
</svg>`;
}
