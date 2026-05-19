// Pure utility functions for the dashboard top strip (issue #212).
// No React, no Zustand — just data in, data out, so Jest tests can pin behavior.

export const DEFAULT_SLA_DAYS = 90; // TODO(v2): make per-assessment

export const FUNCTION_ORDER = [
  'GOVERN (GV)', 'IDENTIFY (ID)', 'PROTECT (PR)', 'DETECT (DE)', 'RESPOND (RS)', 'RECOVER (RC)',
];

export const FUNCTION_WEIGHTS = {
  'GOVERN (GV)': 1.2,
  'IDENTIFY (ID)': 1.0,
  'PROTECT (PR)': 1.1,
  'DETECT (DE)': 1.1,
  'RESPOND (RS)': 1.0,
  'RECOVER (RC)': 0.9,
};

export const CATEGORY_ORDER = [
  'GV.OC', 'GV.OV', 'GV.PO', 'GV.RM', 'GV.RR', 'GV.SC',
  'ID.AM', 'ID.IM', 'ID.RA',
  'PR.AA', 'PR.AT', 'PR.DS', 'PR.IR', 'PR.PS',
  'DE.AE', 'DE.CM',
  'RS.AN', 'RS.CO', 'RS.MA', 'RS.MI',
  'RC.CO', 'RC.RP',
];

const FUNCTION_PREFIX_MAP = {
  GV: 'GOVERN (GV)',
  ID: 'IDENTIFY (ID)',
  PR: 'PROTECT (PR)',
  DE: 'DETECT (DE)',
  RS: 'RESPOND (RS)',
  RC: 'RECOVER (RC)',
};

const PRIORITY_IMPACT = { Critical: 4, High: 3, Medium: 2, Low: 1 };

export function safeNum(value, fallback = '--') {
  if (value === null || value === undefined) return fallback;
  if (typeof value !== 'number') return fallback;
  if (!Number.isFinite(value)) return fallback;
  return value;
}

export function normalizeFunctionName(func) {
  if (!func) return 'Unknown';
  const upper = String(func).toUpperCase();
  if (upper.includes('GOVERN') || upper.startsWith('GV')) return 'GOVERN (GV)';
  if (upper.includes('IDENTIFY') || upper.startsWith('ID')) return 'IDENTIFY (ID)';
  if (upper.includes('PROTECT') || upper.startsWith('PR')) return 'PROTECT (PR)';
  if (upper.includes('DETECT') || upper.startsWith('DE')) return 'DETECT (DE)';
  if (upper.includes('RESPOND') || upper.startsWith('RS')) return 'RESPOND (RS)';
  if (upper.includes('RECOVER') || upper.startsWith('RC')) return 'RECOVER (RC)';
  return String(func);
}

export function extractCategoryId(controlId) {
  if (!controlId) return 'Unknown';
  const match = String(controlId).match(/^([A-Z]{2}\.[A-Z]{2})/);
  if (match) return match[1];
  const fallback = String(controlId).split('-')[0];
  return fallback || 'Unknown';
}

export function functionFromCategoryId(categoryId) {
  if (!categoryId || categoryId.length < 2) return 'Unknown';
  const prefix = categoryId.substring(0, 2);
  return FUNCTION_PREFIX_MAP[prefix] || 'Unknown';
}

export function normalizeStatus(status) {
  if (!status) return 'Not Started';
  const s = String(status).trim().toLowerCase();
  if (s === 'not started' || s === 'open' || s === 'todo' || s === 'to do') return 'Not Started';
  if (s === 'in progress') return 'In Progress';
  if (s === 'resolved' || s === 'done' || s === 'closed') return 'Resolved';
  return 'Not Started';
}

export function normalizePriority(priority) {
  if (!priority) return 'Medium';
  const p = String(priority).trim().toLowerCase();
  if (p === 'critical') return 'Critical';
  if (p === 'high') return 'High';
  if (p === 'medium') return 'Medium';
  if (p === 'low') return 'Low';
  return 'Medium';
}

// ── Card 1: Overall Maturity ───────────────────────────────────────────────
export function overallMaturity({ dashboardData, selectedQuarter }) {
  if (!Array.isArray(dashboardData) || dashboardData.length === 0 || !selectedQuarter) {
    return { value: null, target: null, trend: null, subtitle: null };
  }
  const qKey = `Q${selectedQuarter}`;
  const prevKey = selectedQuarter > 1 ? `Q${selectedQuarter - 1}` : null;

  const actualThis = [];
  const targetThis = [];
  const actualPrev = [];
  dashboardData.forEach((item) => {
    const q = item && item.quarters ? item.quarters[qKey] : null;
    if (q) {
      if (typeof q.actualScore === 'number' && q.actualScore > 0) actualThis.push(q.actualScore);
      if (typeof q.targetScore === 'number' && q.targetScore > 0) targetThis.push(q.targetScore);
    }
    if (prevKey) {
      const qp = item && item.quarters ? item.quarters[prevKey] : null;
      if (qp && typeof qp.actualScore === 'number' && qp.actualScore > 0) actualPrev.push(qp.actualScore);
    }
  });

  const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
  const value = avg(actualThis);
  const target = avg(targetThis);

  let trend = null;
  if (prevKey && actualPrev.length > 0 && value !== null) {
    const prevAvg = avg(actualPrev);
    if (prevAvg !== null) {
      const delta = value - prevAvg;
      const rounded = Math.round(delta * 10) / 10;
      let direction = 'neutral';
      if (rounded > 0) direction = 'up';
      else if (rounded < 0) direction = 'down';
      const sign = rounded > 0 ? '+' : rounded < 0 ? '' : '+';
      trend = {
        direction,
        delta: `${sign}${rounded.toFixed(1)}`,
        prevQuarter: prevKey,
      };
    }
  }

  return {
    value: value === null ? null : Math.round(value * 10) / 10,
    target: target === null ? null : Math.round(target * 10) / 10,
    trend,
    subtitle: `Average actual score, Q${selectedQuarter}`,
  };
}

// ── Card 2: Risk Exposure ──────────────────────────────────────────────────
export function riskExposure({ findings, assessmentId, slaDays = DEFAULT_SLA_DAYS, reportDate }) {
  const empty = {
    value: null,
    critCount: 0,
    highCount: 0,
    medLowCount: 0,
    oldestOpenDays: null,
    slaBreached: false,
    isEmpty: true,
  };
  if (!Array.isArray(findings) || !assessmentId) return empty;
  const scoped = findings.filter((f) => f && f.assessmentId === assessmentId);
  if (scoped.length === 0) return empty;

  const now = reportDate instanceof Date ? reportDate.getTime() : Date.now();

  let critCount = 0;
  let highCount = 0;
  let medLowCount = 0;
  let oldestOpenDays = null;
  let openCritUnresolved = 0;

  scoped.forEach((f) => {
    const prio = normalizePriority(f.priority);
    const stat = normalizeStatus(f.status);
    if (stat !== 'Resolved') {
      if (prio === 'Critical') {
        openCritUnresolved += 1;
        critCount += 1;
      } else if (prio === 'High') {
        highCount += 1;
      } else {
        medLowCount += 1;
      }

      if (f.createdDate) {
        const t = new Date(f.createdDate).getTime();
        if (Number.isFinite(t)) {
          const days = Math.floor((now - t) / 86400000);
          if (oldestOpenDays === null || days > oldestOpenDays) oldestOpenDays = days;
        }
      }
    }
  });

  return {
    value: openCritUnresolved,
    critCount,
    highCount,
    medLowCount,
    oldestOpenDays,
    slaBreached: oldestOpenDays !== null && oldestOpenDays > slaDays,
    isEmpty: false,
  };
}

// ── Card 3: Weakest Function ───────────────────────────────────────────────
export function weakestFunction({ pivotTableData, selectedQuarter }) {
  if (!Array.isArray(pivotTableData) || pivotTableData.length === 0 || !selectedQuarter) return null;
  const aKey = `Q${selectedQuarter}Actual`;
  const tKey = `Q${selectedQuarter}Target`;

  const rows = pivotTableData
    .map((r) => {
      const actual = r ? r[aKey] : null;
      const target = r ? r[tKey] : null;
      if (actual === null || actual === undefined || target === null || target === undefined) return null;
      if (!Number.isFinite(actual) || !Number.isFinite(target)) return null;
      return { name: r.name, actual, target, gap: target - actual };
    })
    .filter(Boolean)
    .sort((a, b) => b.gap - a.gap);

  if (rows.length === 0 || rows[0].gap <= 0) return null;
  const top = rows[0];
  let tieBreaker = null;
  if (rows.length > 1 && Math.abs(rows[1].actual - top.actual) < 1e-6) {
    tieBreaker = { otherFunction: rows[1].name, actual: Math.round(rows[1].actual * 10) / 10 };
  }
  return {
    functionCode: top.name,
    actual: Math.round(top.actual * 10) / 10,
    target: Math.round(top.target * 10) / 10,
    delta: Math.round((top.actual - top.target) * 10) / 10, // negative when behind target
    tieBreaker,
  };
}

// ── Top 5 Gaps ─────────────────────────────────────────────────────────────
export function top5Gaps({ subcategoryData }) {
  if (!Array.isArray(subcategoryData) || subcategoryData.length === 0) return [];
  return subcategoryData
    .map((row) => {
      const actual = typeof row.actualScore === 'number' ? row.actualScore : 0;
      const target = typeof row.desiredTarget === 'number' ? row.desiredTarget : 0;
      const gap = target - actual;
      let color = 'green';
      if (actual < target - 1.5) color = 'red';
      else if (actual < target - 0.5) color = 'amber';
      return {
        categoryId: row.categoryId,
        actual: Math.round(actual * 10) / 10,
        target: Math.round(target * 10) / 10,
        gap: Math.round(gap * 10) / 10,
        color,
      };
    })
    .filter((r) => r.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 5);
}

// ── Status derivation ──────────────────────────────────────────────────────
export function deriveSubcategoryStatus({ linkedFindings, nowMs }) {
  if (!Array.isArray(linkedFindings) || linkedFindings.length === 0) {
    return { status: 'NOT STARTED', label: 'NOT STARTED', oldestInProgressAgeDays: null };
  }
  const now = typeof nowMs === 'number' ? nowMs : Date.now();
  const counts = { Resolved: 0, 'In Progress': 0, 'Not Started': 0 };
  let oldestInProgress = null;
  linkedFindings.forEach((f) => {
    const s = normalizeStatus(f.status);
    counts[s] = (counts[s] || 0) + 1;
    if (s === 'In Progress' && f.createdDate) {
      const t = new Date(f.createdDate).getTime();
      if (Number.isFinite(t)) {
        const days = Math.floor((now - t) / 86400000);
        if (oldestInProgress === null || days > oldestInProgress) oldestInProgress = days;
      }
    }
  });
  const total = linkedFindings.length;
  if (counts.Resolved > total - counts.Resolved) {
    return {
      status: 'RESOLVED',
      label: `RESOLVED (${counts.Resolved} of ${total})`,
      oldestInProgressAgeDays: oldestInProgress,
    };
  }
  if (counts['In Progress'] > 0) {
    if (oldestInProgress !== null && oldestInProgress > 60) {
      return {
        status: 'STALLED',
        label: `STALLED ${oldestInProgress}d`,
        oldestInProgressAgeDays: oldestInProgress,
      };
    }
    return { status: 'IN PROGRESS', label: 'IN PROGRESS', oldestInProgressAgeDays: oldestInProgress };
  }
  return { status: 'NOT STARTED', label: 'NOT STARTED', oldestInProgressAgeDays: oldestInProgress };
}

// ── Investment Priorities ──────────────────────────────────────────────────
export function investmentPriorities({ subcategoryData, findings, assessmentId, functionWeights }) {
  if (!Array.isArray(subcategoryData) || subcategoryData.length === 0) return [];
  const weights = functionWeights || FUNCTION_WEIGHTS;
  const scopedFindings = Array.isArray(findings)
    ? findings.filter((f) => f && f.controlId && f.assessmentId === assessmentId)
    : [];

  const rows = subcategoryData.map((sub) => {
    const linked = scopedFindings.filter((f) => extractCategoryId(f.controlId) === sub.categoryId);
    const target = typeof sub.desiredTarget === 'number' ? sub.desiredTarget : 0;
    const actual = typeof sub.actualScore === 'number' ? sub.actualScore : 0;
    const gap = Math.max(0, target - actual);
    const func = functionFromCategoryId(sub.categoryId);
    const fnWeight = typeof weights[func] === 'number' ? weights[func] : 1.0;

    let priorityImpactMax = 1;
    let critCount = 0;
    linked.forEach((f) => {
      const p = normalizePriority(f.priority);
      const w = PRIORITY_IMPACT[p] || 1;
      if (w > priorityImpactMax) priorityImpactMax = w;
      if (p === 'Critical') critCount += 1;
    });

    const impactWeight = Math.max(priorityImpactMax, fnWeight);
    const score = gap * impactWeight * Math.log(1 + linked.length);

    const statusInfo = deriveSubcategoryStatus({ linkedFindings: linked });
    const sortedByDate = [...linked].sort((a, b) => {
      const ta = a.lastModified ? new Date(a.lastModified).getTime() : 0;
      const tb = b.lastModified ? new Date(b.lastModified).getTime() : 0;
      return tb - ta;
    });
    const inProgress = sortedByDate.find((f) => normalizeStatus(f.status) === 'In Progress');
    const commentFinding = inProgress || sortedByDate[0] || null;

    return {
      categoryId: sub.categoryId,
      function: func,
      gap: Math.round(gap * 10) / 10,
      linkedFindings: linked.length,
      critCount,
      owner: linked[0] && linked[0].remediationOwner !== undefined ? linked[0].remediationOwner : null,
      status: statusInfo.status,
      statusLabel: statusInfo.label,
      score: Math.round(score * 1000) / 1000,
      linkedFindingIds: linked.map((f) => f.id),
      commentFindingId: commentFinding ? commentFinding.id : null,
      commentFindingDescription: commentFinding
        ? (commentFinding.description || commentFinding.summary || '')
        : '',
    };
  });

  return rows.sort((a, b) => b.score - a.score).map((r, i) => ({ ...r, rank: i + 1 }));
}
