/**
 * ==============================================================================
 * COLUMN SPARKLINES REFERENCE & ARCHIVE
 * ==============================================================================
 * This file archives the complete, fully-tested implementation of:
 * 1. Component Row Column Sparklines (per-button 1-minute interval bars & dividers)
 * 2. Section Timeline Minute Headers (`1'`, `2'`, `3'`, etc.)
 * 3. Total Whole Group Opportunities to Respond Column Sparkline Graphic Panel
 * 4. Total Small Group Opportunities to Respond Column Sparkline Graphic Panel
 * 5. Total Instructional Feedback Population Pyramid Column Sparkline Graphic Panel
 *    (Dual-directional sparkline: positive OTRs on top in green with tallies,
 *     negative OTRs below in red with tallies, grey 0 for zero-count minutes)
 * 
 * To restore this feature in a future iteration, refer to the integration guide
 * at the bottom of this file.
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. DATA LINE WRAPPER (Used in buildResultsLines)
// ------------------------------------------------------------------------------
/**
 * Wraps a result line string with minute-binned sparkline metadata.
 * @param {string} text - The display text (e.g. "  Choral Response: 4")
 * @param {number[]} binsArray - Minute-by-minute tally counts [min0, min1, ...]
 * @param {string} color - Hex color for the column bars
 * @returns {string|{text: string, sparkline: {bins: number[], color: string}}}
 */
function makeLine(text, binsArray, color) {
  if (binsArray && Array.isArray(binsArray)) {
    return { text, sparkline: { bins: binsArray, color } };
  }
  return text;
}

// ------------------------------------------------------------------------------
// 2. TIMELINE HEADER (Rendered above sparklines on section header lines)
// ------------------------------------------------------------------------------
/**
 * Renders minute numbers ('1', '2'', etc.) or tick marks across the timeline.
 */
function renderSparklineTimelineHeader(root, svgNS, sparkX, sparkW, colW, totalMinutes, yPos, fontSans) {
  function el(ns, name, attrs = {}, text = "") {
    const node = document.createElementNS(ns, name);
    for (const [k, v] of Object.entries(attrs)) {
      node.setAttribute(k, String(v));
    }
    if (text) node.textContent = text;
    return node;
  }

  for (let m = 0; m < totalMinutes; m++) {
    const colCenter = sparkX + m * colW + (colW / 2);
    let showText = false;
    if (colW >= 18) {
      showText = true;
    } else if (colW >= 13) {
      showText = (m === 0 || (m + 1) % 2 === 0 || m === totalMinutes - 1);
    } else {
      showText = (m === 0 || (m + 1) % 5 === 0 || m === totalMinutes - 1);
    }

    if (showText) {
      root.appendChild(el(svgNS, "text", {
        x: colCenter,
        y: yPos - 1,
        "text-anchor": "middle",
        "font-size": 10,
        "font-family": fontSans,
        "font-weight": 700,
        fill: "#475569"
      }, `${m + 1}'`));
    } else {
      root.appendChild(el(svgNS, "line", {
        x1: colCenter,
        y1: yPos - 5,
        x2: colCenter,
        y2: yPos - 2,
        stroke: "#94a3b8",
        "stroke-width": 1
      }));
    }
  }
}

// ------------------------------------------------------------------------------
// 3. ROW-LEVEL COLUMN SPARKLINE (Rendered for individual button rows)
// ------------------------------------------------------------------------------
/**
 * Renders a row's column sparkline with vertical 1-minute dividers, baseline,
 * and stacked tick-segmented column bars.
 */
function renderColumnSparkline(root, svgNS, sparkline, sparkX, sparkW, colW, totalMinutes, yPos, unitH = 3) {
  function el(ns, name, attrs = {}, text = "") {
    const node = document.createElementNS(ns, name);
    for (const [k, v] of Object.entries(attrs)) {
      node.setAttribute(k, String(v));
    }
    if (text) node.textContent = text;
    return node;
  }

  const trackH = 18;
  const trackY = yPos - 14;
  const baseY = trackY + trackH - 3;

  // 1. Vertical column dividers (1-minute window dividers)
  for (let m = 1; m < totalMinutes; m++) {
    const lx = sparkX + m * colW;
    root.appendChild(el(svgNS, "line", {
      x1: lx,
      y1: trackY + 1,
      x2: lx,
      y2: trackY + trackH - 1,
      stroke: "#e2e8f0",
      "stroke-width": 1,
      "stroke-dasharray": colW > 25 ? "2 2" : "none"
    }));
  }

  // 2. Horizontal baseline rule
  root.appendChild(el(svgNS, "line", {
    x1: sparkX,
    y1: baseY,
    x2: sparkX + sparkW,
    y2: baseY,
    stroke: "#cbd5e1",
    "stroke-width": 1
  }));

  // 3. In each 1-minute window:
  const bins = sparkline.bins || [];
  const maxBarH = 15;
  const barW = Math.max(4, Math.min(18, Math.round(colW * 0.6)));

  for (let m = 0; m < totalMinutes; m++) {
    const count = bins[m] || 0;
    const colCenter = sparkX + m * colW + (colW / 2);
    const barX = colCenter - (barW / 2);

    if (count === 0) {
      // Subtle baseline dot indicating zero count
      root.appendChild(el(svgNS, "circle", {
        cx: colCenter,
        cy: baseY,
        r: 1.5,
        fill: "#cbd5e1"
      }));
    } else {
      // Height strictly correlates to count
      const barH = Math.min(maxBarH, Math.max(2, Math.round(count * unitH * 10) / 10));
      const barY = baseY - barH;

      const rectEl = el(svgNS, "rect", {
        x: barX,
        y: barY,
        width: barW,
        height: barH,
        rx: 1,
        fill: sparkline.color || "#38bdf8"
      });
      rectEl.appendChild(el(svgNS, "title", {}, `${count} in min ${m + 1}`));
      root.appendChild(rectEl);

      // Horizontal segment tick lines dividing each individual data point
      if (count > 1 && unitH >= 2) {
        for (let pt = 1; pt < count; pt++) {
          const tickY = baseY - Math.round(pt * unitH * 10) / 10;
          if (tickY > barY + 1) {
            root.appendChild(el(svgNS, "line", {
              x1: barX,
              y1: tickY,
              x2: barX + barW,
              y2: tickY,
              stroke: "#ffffff",
              "stroke-width": 1
            }));
          }
        }
      }
    }
  }
}

// ------------------------------------------------------------------------------
// 4. TOTAL WHOLE GROUP OTR COLUMN SPARKLINE PANEL
// ------------------------------------------------------------------------------
/**
 * Renders the Total Whole Group OTR summary panel on the right side.
 * Layout hierarchy:
 *  1. Timeline minutes ('1', '2'')
 *  2. Column bars with segment lines + counts on top (or grey 0)
 *  3. Baseline rule
 *  4. Panel title ("TOTAL WHOLE GROUP OPPORTUNITIES TO RESPOND")
 *  5. Rate & total count stat
 *  6. Goal text ("Goal: 3–5 / min")
 */
function renderTotalWholeGroupPanel(root, svgNS, options) {
  const {
    currentYOffset, pad, lineH, fontSans,
    totalMinutes, colW, sparkW,
    otrWholeFirstLineIdx, otrWholeLastLineIdx,
    wholeCounts, minuteWgEvents, totalWholeCount,
    getOtrEventDetails, el
  } = options;

  const panelW = 285;
  const panelX = 495;
  const panelH = 155;
  const totalColW = colW;
  const totalSparkW = sparkW;
  const totalSparkX = panelX + (panelW - totalSparkW) / 2;
  const totalBarW = Math.max(4, Math.min(18, Math.round(totalColW * 0.6)));

  const wholeFirstLineY = currentYOffset + pad + (otrWholeFirstLineIdx + 1) * lineH;
  const wholeLastLineY = currentYOffset + pad + (otrWholeLastLineIdx + 1) * lineH;
  const wholeSectionMidY = (wholeFirstLineY + wholeLastLineY) / 2;
  const wgPanelY = Math.max(currentYOffset + pad, wholeSectionMidY - (panelH / 2));

  const timelineY = wgPanelY + 14;
  const baseY = wgPanelY + 68;
  const maxWgCount = Math.max(1, ...wholeCounts);
  const maxBarH = 34;
  const wgUnitH = maxWgCount <= 4 ? 7 : (maxBarH / maxWgCount);

  // Minutes above column sparklines
  for (let m = 0; m < totalMinutes; m++) {
    const colCenter = totalSparkX + m * totalColW + (totalColW / 2);
    const showMin = (totalColW >= 18) || (m === 0 || (m + 1) % 5 === 0 || m === totalMinutes - 1);
    if (showMin) {
      root.appendChild(el(svgNS, "text", {
        x: colCenter,
        y: timelineY,
        "text-anchor": "middle",
        "font-size": 9.5,
        "font-family": fontSans,
        "font-weight": 700,
        fill: "#475569"
      }, `${m + 1}'`));
    } else {
      root.appendChild(el(svgNS, "line", {
        x1: colCenter,
        y1: timelineY - 4,
        x2: colCenter,
        y2: timelineY - 1,
        stroke: "#94a3b8",
        "stroke-width": 1
      }));
    }
  }

  // Baseline rule
  root.appendChild(el(svgNS, "line", {
    x1: totalSparkX,
    y1: baseY,
    x2: totalSparkX + totalSparkW,
    y2: baseY,
    stroke: "#94a3b8",
    "stroke-width": 1.5
  }));

  // Minute dividers
  for (let m = 1; m < totalMinutes; m++) {
    const lx = totalSparkX + m * totalColW;
    root.appendChild(el(svgNS, "line", {
      x1: lx,
      y1: timelineY + 4,
      x2: lx,
      y2: baseY + 2,
      stroke: "#e2e8f0",
      "stroke-width": 1,
      "stroke-dasharray": totalColW > 24 ? "2 2" : "none"
    }));
  }

  // Column bars
  for (let m = 0; m < totalMinutes; m++) {
    const wgList = minuteWgEvents[m] || [];
    const count = wgList.length;
    const colCenter = totalSparkX + m * totalColW + (totalColW / 2);
    const barX = colCenter - (totalBarW / 2);

    if (count === 0) {
      root.appendChild(el(svgNS, "circle", { cx: colCenter, cy: baseY, r: 1.5, fill: "#cbd5e1" }));
      root.appendChild(el(svgNS, "text", {
        x: colCenter, y: baseY - 6, "text-anchor": "middle",
        "font-size": 8.5, "font-family": fontSans, "font-weight": 700, fill: "#64748b"
      }, "0"));
    } else {
      let curY = baseY;
      for (let idx = 0; idx < wgList.length; idx++) {
        const ev = wgList[idx];
        const details = getOtrEventDetails(ev.kind);
        const segColor = ev._customColor || details.color;
        const segLabel = ev._customLabel || details.label;
        const segH = Math.max(2, Math.round(wgUnitH * 10) / 10);
        const segY = curY - segH;

        const rectEl = el(svgNS, "rect", {
          x: barX, y: segY, width: totalBarW, height: segH,
          rx: (curY === baseY ? 1 : 0), fill: segColor
        });
        rectEl.appendChild(el(svgNS, "title", {}, `Min ${m + 1}, #${idx + 1}: Whole Group - ${segLabel}`));
        root.appendChild(rectEl);

        if (idx > 0) {
          root.appendChild(el(svgNS, "line", {
            x1: barX, y1: curY, x2: barX + totalBarW, y2: curY,
            stroke: "#ffffff", "stroke-width": 1
          }));
        }
        curY -= segH;
      }

      root.appendChild(el(svgNS, "text", {
        x: colCenter, y: curY - 4, "text-anchor": "middle",
        "font-size": 8.5, "font-family": fontSans, "font-weight": 700, fill: "#64748b"
      }, String(count)));
    }
  }

  // Panel Title
  root.appendChild(el(svgNS, "text", {
    x: panelX + panelW / 2, y: wgPanelY + 92, "text-anchor": "middle",
    "font-size": 11, "font-weight": 800, "font-family": fontSans,
    fill: "#334155", "letter-spacing": "0.5px"
  }, "TOTAL WHOLE GROUP OPPORTUNITIES TO RESPOND"));

  // Rate & Count
  const wgRateNum = totalMinutes > 0 ? (totalWholeCount / totalMinutes) : 0;
  const wgRateVal = wgRateNum.toFixed(1);
  const isWgGoalMet = wgRateNum >= 3;
  const wgRatioColor = isWgGoalMet ? "#16a34a" : "#dc2626";

  const statTextEl = el(svgNS, "text", { x: panelX + panelW / 2, y: wgPanelY + 114, "text-anchor": "middle", "font-family": fontSans });
  statTextEl.appendChild(el(svgNS, "tspan", { "font-size": 20, "font-weight": 800, fill: wgRatioColor }, `${wgRateVal}`));
  statTextEl.appendChild(el(svgNS, "tspan", { "font-size": 12, "font-weight": 600, fill: "#64748b" }, ` / min  ·  ${totalWholeCount} total`));
  root.appendChild(statTextEl);

  // Goal
  root.appendChild(el(svgNS, "text", {
    x: panelX + panelW / 2, y: wgPanelY + 130, "text-anchor": "middle",
    "font-size": 10.5, "font-weight": 600, "font-family": fontSans, fill: "#64748b"
  }, "Goal: 3–5 / min"));

  return wgPanelY;
}

// ------------------------------------------------------------------------------
// 5. TOTAL SMALL GROUP OTR COLUMN SPARKLINE PANEL
// ------------------------------------------------------------------------------
/**
 * Renders the Total Small Group OTR summary panel on the right side.
 */
function renderTotalSmallGroupPanel(root, svgNS, options) {
  const {
    currentYOffset, pad, lineH, fontSans,
    totalMinutes, colW, sparkW, wgPanelY, hasOtrWholeLines,
    otrSmallFirstLineIdx, otrSmallLastLineIdx,
    smallCounts, minuteSgEvents, totalSmallCount,
    getOtrEventDetails, el
  } = options;

  const panelW = 285;
  const panelX = 495;
  const panelH = 155;
  const totalColW = colW;
  const totalSparkW = sparkW;
  const totalSparkX = panelX + (panelW - totalSparkW) / 2;
  const totalBarW = Math.max(4, Math.min(18, Math.round(totalColW * 0.6)));

  const smallFirstLineY = currentYOffset + pad + (otrSmallFirstLineIdx + 1) * lineH;
  const smallLastLineY = currentYOffset + pad + (otrSmallLastLineIdx + 1) * lineH;
  const smallSectionMidY = (smallFirstLineY + smallLastLineY) / 2;
  let targetSgPanelY = smallSectionMidY - (panelH / 2);
  if (hasOtrWholeLines && wgPanelY !== -1 && targetSgPanelY < wgPanelY + panelH + 10) {
    targetSgPanelY = wgPanelY + panelH + 10;
  }
  const sgPanelY = Math.max(currentYOffset + pad, targetSgPanelY);

  const timelineY = sgPanelY + 14;
  const baseY = sgPanelY + 68;
  const maxSgCount = Math.max(1, ...smallCounts);
  const maxBarH = 34;
  const sgUnitH = maxSgCount <= 4 ? 7 : (maxBarH / maxSgCount);

  // Minutes
  for (let m = 0; m < totalMinutes; m++) {
    const colCenter = totalSparkX + m * totalColW + (totalColW / 2);
    const showMin = (totalColW >= 18) || (m === 0 || (m + 1) % 5 === 0 || m === totalMinutes - 1);
    if (showMin) {
      root.appendChild(el(svgNS, "text", {
        x: colCenter, y: timelineY, "text-anchor": "middle",
        "font-size": 9.5, "font-family": fontSans, "font-weight": 700, fill: "#475569"
      }, `${m + 1}'`));
    } else {
      root.appendChild(el(svgNS, "line", {
        x1: colCenter, y1: timelineY - 4, x2: colCenter, y2: timelineY - 1, stroke: "#94a3b8", "stroke-width": 1
      }));
    }
  }

  // Baseline
  root.appendChild(el(svgNS, "line", {
    x1: totalSparkX, y1: baseY, x2: totalSparkX + totalSparkW, y2: baseY, stroke: "#94a3b8", "stroke-width": 1.5
  }));

  // Minute dividers
  for (let m = 1; m < totalMinutes; m++) {
    const lx = totalSparkX + m * totalColW;
    root.appendChild(el(svgNS, "line", {
      x1: lx, y1: timelineY + 4, x2: lx, y2: baseY + 2, stroke: "#e2e8f0", "stroke-width": 1,
      "stroke-dasharray": totalColW > 24 ? "2 2" : "none"
    }));
  }

  // Column bars
  for (let m = 0; m < totalMinutes; m++) {
    const sgList = minuteSgEvents[m] || [];
    const count = sgList.length;
    const colCenter = totalSparkX + m * totalColW + (totalColW / 2);
    const barX = colCenter - (totalBarW / 2);

    if (count === 0) {
      root.appendChild(el(svgNS, "circle", { cx: colCenter, cy: baseY, r: 1.5, fill: "#cbd5e1" }));
      root.appendChild(el(svgNS, "text", {
        x: colCenter, y: baseY - 6, "text-anchor": "middle",
        "font-size": 8.5, "font-family": fontSans, "font-weight": 700, fill: "#64748b"
      }, "0"));
    } else {
      let curY = baseY;
      for (let idx = 0; idx < sgList.length; idx++) {
        const ev = sgList[idx];
        const details = getOtrEventDetails(ev.kind);
        const segColor = ev._customColor || details.color;
        const segLabel = ev._customLabel || details.label;
        const segH = Math.max(2, Math.round(sgUnitH * 10) / 10);
        const segY = curY - segH;

        const rectEl = el(svgNS, "rect", {
          x: barX, y: segY, width: totalBarW, height: segH,
          rx: (curY === baseY ? 1 : 0), fill: segColor
        });
        rectEl.appendChild(el(svgNS, "title", {}, `Min ${m + 1}, #${idx + 1}: Small Group - ${segLabel}`));
        root.appendChild(rectEl);

        if (idx > 0) {
          root.appendChild(el(svgNS, "line", {
            x1: barX, y1: curY, x2: barX + totalBarW, y2: curY, stroke: "#ffffff", "stroke-width": 1
          }));
        }
        curY -= segH;
      }

      root.appendChild(el(svgNS, "text", {
        x: colCenter, y: curY - 4, "text-anchor": "middle",
        "font-size": 8.5, "font-family": fontSans, "font-weight": 700, fill: "#64748b"
      }, String(count)));
    }
  }

  // Panel Title
  root.appendChild(el(svgNS, "text", {
    x: panelX + panelW / 2, y: sgPanelY + 92, "text-anchor": "middle",
    "font-size": 11, "font-weight": 800, "font-family": fontSans,
    fill: "#334155", "letter-spacing": "0.5px"
  }, "TOTAL SMALL GROUP OPPORTUNITIES TO RESPOND"));

  // Rate & Count
  const sgRateNum = totalMinutes > 0 ? (totalSmallCount / totalMinutes) : 0;
  const sgRateVal = sgRateNum.toFixed(1);
  const isSgGoalMet = sgRateNum >= 3;
  const sgRatioColor = isSgGoalMet ? "#16a34a" : "#dc2626";

  const statTextEl = el(svgNS, "text", { x: panelX + panelW / 2, y: sgPanelY + 114, "text-anchor": "middle", "font-family": fontSans });
  statTextEl.appendChild(el(svgNS, "tspan", { "font-size": 20, "font-weight": 800, fill: sgRatioColor }, `${sgRateVal}`));
  statTextEl.appendChild(el(svgNS, "tspan", { "font-size": 12, "font-weight": 600, fill: "#64748b" }, ` / min  ·  ${totalSmallCount} total`));
  root.appendChild(statTextEl);

  // Goal
  root.appendChild(el(svgNS, "text", {
    x: panelX + panelW / 2, y: sgPanelY + 130, "text-anchor": "middle",
    "font-size": 10.5, "font-weight": 600, "font-family": fontSans, fill: "#64748b"
  }, "Goal: 3–5 / min"));

  return sgPanelY;
}

// ------------------------------------------------------------------------------
// 6. TOTAL INSTRUCTIONAL FEEDBACK POPULATION PYRAMID SPARKLINE PANEL
// ------------------------------------------------------------------------------
/**
 * Renders the Total Instructional Feedback dual-directional population pyramid sparkline panel.
 * Positive tallies render upward (green/blue segments with green total count on top).
 * Negative tallies render downward (orange/red segments with red total count below).
 * Grey '0' for minutes with zero positive or zero negative counts.
 */
function renderTotalInstructionalFeedbackPyramid(root, svgNS, options) {
  const {
    currentYOffset, pad, lineH, fontSans,
    totalMinutes, colW, sparkW, wgPanelY, sgPanelY, hasOtrWholeLines, hasOtrSmallLines,
    praiseFirstCompLineIdx, praiseLastCompLineIdx,
    posBins, negBins, totalPos, totalNeg, ratioVal, praiseRatioColor,
    specificLine, generalLine, correctiveLine, customPositiveLines,
    redirectLine, genCritLine, indCritLine,
    el
  } = options;

  const firstCompY = currentYOffset + pad + (praiseFirstCompLineIdx + 1) * lineH;
  const lastCompY = currentYOffset + pad + (praiseLastCompLineIdx + 1) * lineH;
  const sectionMidY = (firstCompY + lastCompY) / 2;

  const panelW = 285;
  const panelX = 495;
  const panelH = 175;
  let panelY = sectionMidY - (panelH / 2);
  if (hasOtrSmallLines && sgPanelY !== -1 && panelY < sgPanelY + 155 + 10) {
    panelY = sgPanelY + 155 + 10;
  } else if (hasOtrWholeLines && wgPanelY !== -1 && panelY < wgPanelY + 155 + 10) {
    panelY = wgPanelY + 155 + 10;
  }
  panelY = Math.max(currentYOffset + pad, panelY);

  const maxPosCount = Math.max(0, ...posBins);
  const maxNegCount = Math.max(0, ...negBins);
  const maxPyramidCount = Math.max(1, maxPosCount, maxNegCount);

  const totalColW = colW;
  const totalSparkW = sparkW;
  const totalSparkX = panelX + (panelW - totalSparkW) / 2;
  const timelineY = panelY + 14;
  const baseY = panelY + 58;
  const maxBarH = 26;
  const pyramidUnitH = maxPyramidCount <= 4 ? 6 : (maxBarH / maxPyramidCount);

  // Minutes
  for (let m = 0; m < totalMinutes; m++) {
    const colCenter = totalSparkX + m * totalColW + (totalColW / 2);
    const showMin = (totalColW >= 18) || (m === 0 || (m + 1) % 5 === 0 || m === totalMinutes - 1);
    if (showMin) {
      root.appendChild(el(svgNS, "text", {
        x: colCenter, y: timelineY, "text-anchor": "middle",
        "font-size": 9.5, "font-family": fontSans, "font-weight": 700, fill: "#475569"
      }, `${m + 1}'`));
    } else {
      root.appendChild(el(svgNS, "line", {
        x1: colCenter, y1: timelineY - 4, x2: colCenter, y2: timelineY - 1, stroke: "#94a3b8", "stroke-width": 1
      }));
    }
  }

  // Baseline rule
  root.appendChild(el(svgNS, "line", {
    x1: totalSparkX, y1: baseY, x2: totalSparkX + totalSparkW, y2: baseY, stroke: "#94a3b8", "stroke-width": 1.5
  }));

  // Orientation labels
  root.appendChild(el(svgNS, "text", {
    x: totalSparkX - 5, y: baseY - 10, "text-anchor": "end",
    "font-size": 8.5, "font-family": fontSans, "font-weight": 700, fill: "#16a34a"
  }, "+ Pos"));

  root.appendChild(el(svgNS, "text", {
    x: totalSparkX - 5, y: baseY + 18, "text-anchor": "end",
    "font-size": 8.5, "font-family": fontSans, "font-weight": 700, fill: "#dc2626"
  }, "− Neg"));

  // Dividers
  for (let m = 1; m < totalMinutes; m++) {
    const lx = totalSparkX + m * totalColW;
    root.appendChild(el(svgNS, "line", {
      x1: lx, y1: timelineY + 4, x2: lx, y2: baseY + maxBarH + 2, stroke: "#e2e8f0", "stroke-width": 1,
      "stroke-dasharray": totalColW > 24 ? "2 2" : "none"
    }));
  }

  const totalBarW = Math.max(4, Math.min(18, Math.round(totalColW * 0.6)));

  for (let m = 0; m < totalMinutes; m++) {
    const pCount = posBins[m] || 0;
    const nCount = negBins[m] || 0;
    const colCenter = totalSparkX + m * totalColW + (totalColW / 2);
    const barX = colCenter - (totalBarW / 2);

    if (pCount === 0 && nCount === 0) {
      root.appendChild(el(svgNS, "circle", { cx: colCenter, cy: baseY, r: 1.5, fill: "#cbd5e1" }));
    }

    // Positive bars (ABOVE baseline)
    let curY = baseY;
    if (pCount > 0) {
      const posSegs = [
        { label: "Specific Praise", count: (specificLine?.sparkline?.bins?.[m]) || 0, color: "#22c55e" },
        { label: "General Praise", count: (generalLine?.sparkline?.bins?.[m]) || 0, color: "#4ade80" },
        { label: "Corrective Feedback", count: (correctiveLine?.sparkline?.bins?.[m]) || 0, color: "#38bdf8" }
      ];
      for (const cl of customPositiveLines) {
        posSegs.push({ label: cl.text.trim(), count: (cl.sparkline?.bins?.[m]) || 0, color: "#2dd4bf" });
      }

      for (const seg of posSegs) {
        if (seg.count > 0) {
          const segH = Math.max(2, Math.round(seg.count * pyramidUnitH * 10) / 10);
          const segY = curY - segH;
          const rectEl = el(svgNS, "rect", {
            x: barX, y: segY, width: totalBarW, height: segH,
            rx: (curY === baseY ? 1 : 0), fill: seg.color
          });
          rectEl.appendChild(el(svgNS, "title", {}, `Min ${m + 1}: ${seg.count} ${seg.label} (above line)`));
          root.appendChild(rectEl);

          if (seg.count > 1 && pyramidUnitH >= 2) {
            for (let pt = 1; pt < seg.count; pt++) {
              const tickY = curY - Math.round(pt * pyramidUnitH * 10) / 10;
              if (tickY > segY + 1) {
                root.appendChild(el(svgNS, "line", {
                  x1: barX, y1: tickY, x2: barX + totalBarW, y2: tickY, stroke: "#ffffff", "stroke-width": 1
                }));
              }
            }
          }
          curY -= segH;
        }
      }
    }

    // Positive count on top (green) or grey 0
    if (pCount > 0) {
      root.appendChild(el(svgNS, "text", {
        x: colCenter, y: curY - 4, "text-anchor": "middle",
        "font-size": 8.5, "font-family": fontSans, "font-weight": 700, fill: "#16a34a"
      }, String(pCount)));
    } else {
      root.appendChild(el(svgNS, "text", {
        x: colCenter, y: baseY - 6, "text-anchor": "middle",
        "font-size": 8.5, "font-family": fontSans, "font-weight": 700, fill: "#64748b"
      }, "0"));
    }

    // Negative bars (BELOW baseline)
    let curNegY = baseY;
    if (nCount > 0) {
      const negSegs = [
        { label: "Redirective Statements", count: (redirectLine?.sparkline?.bins?.[m]) || 0, color: "#fb923c" },
        { label: "General Criticism", count: (genCritLine?.sparkline?.bins?.[m]) || 0, color: "#f87171" },
        { label: "Individual Criticism", count: (indCritLine?.sparkline?.bins?.[m]) || 0, color: "#ef4444" }
      ];

      for (const seg of negSegs) {
        if (seg.count > 0) {
          const segH = Math.max(2, Math.round(seg.count * pyramidUnitH * 10) / 10);
          const segY = curNegY;
          const rectEl = el(svgNS, "rect", {
            x: barX, y: segY, width: totalBarW, height: segH,
            rx: (curNegY === baseY ? 1 : 0), fill: seg.color
          });
          rectEl.appendChild(el(svgNS, "title", {}, `Min ${m + 1}: ${seg.count} ${seg.label} (below line)`));
          root.appendChild(rectEl);

          if (seg.count > 1 && pyramidUnitH >= 2) {
            for (let pt = 1; pt < seg.count; pt++) {
              const tickY = curNegY + Math.round(pt * pyramidUnitH * 10) / 10;
              if (tickY < segY + segH - 1) {
                root.appendChild(el(svgNS, "line", {
                  x1: barX, y1: tickY, x2: barX + totalBarW, y2: tickY, stroke: "#ffffff", "stroke-width": 1
                }));
              }
            }
          }
          curNegY += segH;
        }
      }
    }

    // Negative count below (red) or grey 0
    if (nCount > 0) {
      root.appendChild(el(svgNS, "text", {
        x: colCenter, y: curNegY + 10, "text-anchor": "middle",
        "font-size": 8.5, "font-family": fontSans, "font-weight": 700, fill: "#dc2626"
      }, String(nCount)));
    } else {
      root.appendChild(el(svgNS, "text", {
        x: colCenter, y: baseY + 11, "text-anchor": "middle",
        "font-size": 8.5, "font-family": fontSans, "font-weight": 700, fill: "#64748b"
      }, "0"));
    }
  }

  // Panel Title
  root.appendChild(el(svgNS, "text", {
    x: panelX + panelW / 2, y: panelY + 114, "text-anchor": "middle",
    "font-size": 11.5, "font-weight": 800, "font-family": fontSans,
    fill: "#334155", "letter-spacing": "0.5px"
  }, "TOTAL INSTRUCTIONAL FEEDBACK"));

  // Ratio Stat
  const statTextEl = el(svgNS, "text", { x: panelX + panelW / 2, y: panelY + 138, "text-anchor": "middle", "font-family": fontSans });
  statTextEl.appendChild(el(svgNS, "tspan", { "font-size": 22, "font-weight": 800, fill: praiseRatioColor }, `${ratioVal}`));
  statTextEl.appendChild(el(svgNS, "tspan", { "font-size": 13, "font-weight": 600, fill: "#64748b" }, ` ratio  ·  +${totalPos} / −${totalNeg}`));
  root.appendChild(statTextEl);

  // Goal
  root.appendChild(el(svgNS, "text", {
    x: panelX + panelW / 2, y: panelY + 154, "text-anchor": "middle",
    "font-size": 11, "font-weight": 600, "font-family": fontSans, fill: "#64748b"
  }, "Goal: 5:1 positive to negative"));

  return panelY;
}
