import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Gauge, Search, Upload } from 'lucide-react';
import useMetricsStore from '../stores/metricsStore';
import useRequirementsStore from '../stores/requirementsStore';
import useFrameworksStore from '../stores/frameworksStore';

/**
 * Metrics — drill down from CSF functions → categories → subcategories to the
 * KPIs / KRIs / metrics of the user's imported catalogues (Settings →
 * Metrics Catalogue). The repository ships no metric content: everything on
 * this page came from the user's own local CSV files.
 */

const TYPE_CHIP_STYLES = {
  KPI: 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-700',
  KRI: 'bg-red-100 text-red-800 border border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700',
  metric: 'bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-500'
};

const TypeChip = ({ type }) => (
  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${TYPE_CHIP_STYLES[type] || TYPE_CHIP_STYLES.metric}`}>
    {type}
  </span>
);

const CountBadge = ({ count }) => (
  <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
    {count} {count === 1 ? 'metric' : 'metrics'}
  </span>
);

const DetailRow = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="w-28 shrink-0 font-medium text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-gray-800 dark:text-gray-200 break-words min-w-0">{value}</span>
    </div>
  );
};

const MetricCard = ({ metric }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800">
      <button
        type="button"
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {open ? <ChevronDown size={14} className="shrink-0" /> : <ChevronRight size={14} className="shrink-0" />}
        <TypeChip type={metric.type} />
        <span className="text-xs font-mono text-gray-500 dark:text-gray-400 shrink-0">{metric.id}</span>
        <span className="text-sm text-gray-900 dark:text-gray-100 truncate">{metric.name}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1 space-y-1.5 border-t border-gray-100 dark:border-gray-700">
          <DetailRow label="Description" value={metric.description} />
          <DetailRow label="Formula" value={metric.formula} />
          <DetailRow label="Unit" value={metric.unit} />
          <DetailRow label="Target" value={metric.target} />
          <DetailRow label="Direction" value={metric.direction ? metric.direction.replace(/_/g, ' ') : ''} />
          <DetailRow label="Frequency" value={metric.frequency} />
          <DetailRow label="Data source" value={metric.dataSource} />
          <DetailRow label="Subcategories" value={(metric.subcategoryIds || []).join(', ')} />
          <DetailRow label="License" value={metric.license} />
          <DetailRow label="Catalogue" value={metric.catalogSlug} />
          <DetailRow label="References" value={metric.references} />
          <DetailRow label="Notes" value={metric.notes} />
        </div>
      )}
    </div>
  );
};

const Metrics = () => {
  const metrics = useMetricsStore((s) => s.metrics);
  const requirements = useRequirementsStore((s) => s.requirements);
  const frameworks = useFrameworksStore((s) => s.frameworks);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [expanded, setExpanded] = useState({});

  const toggle = (key) => setExpanded((e) => ({ ...e, [key]: !e[key] }));

  // CSF hierarchy of the default framework: function → category → subcategories.
  const hierarchy = useMemo(() => {
    const defaultFramework = frameworks.find((f) => f.isDefault) || frameworks[0] || null;
    const rows = defaultFramework
      ? requirements.filter((r) => r.frameworkId === defaultFramework.id)
      : requirements;

    const functions = new Map();
    rows.forEach((r) => {
      if (!r.function || !r.subcategoryId) return;
      if (!functions.has(r.function)) functions.set(r.function, new Map());
      const categories = functions.get(r.function);
      const categoryName = r.category || '(uncategorized)';
      if (!categories.has(categoryName)) categories.set(categoryName, new Map());
      const subs = categories.get(categoryName);
      if (!subs.has(r.subcategoryId)) {
        subs.set(r.subcategoryId, r.subcategoryDescription || '');
      }
    });
    return functions;
  }, [frameworks, requirements]);

  // Filtered metrics, indexed by subcategory ID.
  const { bySubcategory, filtered, unmappedCount } = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filteredMetrics = metrics.filter((m) => {
      if (typeFilter !== 'all' && m.type !== typeFilter) return false;
      if (!q) return true;
      return [m.id, m.name, m.description, m.dataSource, (m.subcategoryIds || []).join(' ')]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });

    const index = new Map();
    const knownSubs = new Set();
    hierarchy.forEach((categories) => categories.forEach((subs) => subs.forEach((_, id) => knownSubs.add(id))));

    let unmapped = 0;
    filteredMetrics.forEach((m) => {
      let mappedSomewhere = false;
      (m.subcategoryIds || []).forEach((subId) => {
        if (!index.has(subId)) index.set(subId, []);
        index.get(subId).push(m);
        if (knownSubs.has(subId)) mappedSomewhere = true;
      });
      if (!mappedSomewhere) unmapped += 1;
    });

    return { bySubcategory: index, filtered: filteredMetrics, unmappedCount: unmapped };
  }, [metrics, hierarchy, search, typeFilter]);

  const distinctCount = (subIds) => {
    const seen = new Set();
    subIds.forEach((id) => (bySubcategory.get(id) || []).forEach((m) => seen.add(m.id)));
    return seen.size;
  };

  if (metrics.length === 0) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <Gauge size={40} className="mx-auto text-gray-400 dark:text-gray-500" />
        <h1 className="text-xl font-bold mt-4 text-gray-900 dark:text-gray-100">Metrics</h1>
        <p className="mt-3 text-gray-600 dark:text-gray-300">
          No metrics yet. This app ships no metric content — you bring your own catalogue
          as a local CSV file (KPIs, KRIs, and metrics mapped to CSF subcategories) and it
          stays on this machine.
        </p>
        <p className="mt-3 text-gray-600 dark:text-gray-300">
          To add metrics, open <strong>Settings</strong> and use the{' '}
          <strong>Metrics Catalogue (CSV)</strong> card to upload your catalogue.
        </p>
        <Link
          to="/settings"
          className="inline-flex items-center gap-2 mt-4 text-sm px-4 py-2 rounded"
          style={{ backgroundColor: '#0d9488', color: '#ffffff' }}
        >
          <Upload size={16} />
          Import a metrics catalogue in Settings
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Gauge size={20} />
          Metrics
        </h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search metrics…"
              className="pl-7 pr-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="py-1.5 px-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            aria-label="Filter by type"
          >
            <option value="all">All types</option>
            <option value="KPI">KPI</option>
            <option value="KRI">KRI</option>
            <option value="metric">metric</option>
          </select>
        </div>
      </div>

      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        {filtered.length} of {metrics.length} imported metrics shown. Counts include every
        catalogue mapping — a metric mapped to several subcategories counts under each, and
        inherited (control-default) mappings count the same as direct ones; each metric's
        references record mapping provenance and confidence.
        {unmappedCount > 0 && ` ${unmappedCount} metric(s) map only to subcategories not in the active framework.`}
      </p>

      <div className="mt-4 space-y-3">
        {[...hierarchy.entries()].map(([functionName, categories]) => {
          const functionSubIds = [];
          categories.forEach((subs) => subs.forEach((_, id) => functionSubIds.push(id)));
          const functionCount = distinctCount(functionSubIds);
          if (functionCount === 0 && (search || typeFilter !== 'all')) return null;
          const fnKey = `fn:${functionName}`;
          return (
            <div key={functionName} className="border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
              <button
                type="button"
                className="w-full flex items-center gap-2 px-4 py-3 text-left"
                onClick={() => toggle(fnKey)}
                aria-expanded={Boolean(expanded[fnKey])}
              >
                {expanded[fnKey] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span className="font-semibold text-gray-900 dark:text-gray-100">{functionName}</span>
                <CountBadge count={functionCount} />
              </button>

              {expanded[fnKey] && (
                <div className="px-4 pb-3 space-y-2">
                  {[...categories.entries()].map(([categoryName, subs]) => {
                    const catSubIds = [...subs.keys()];
                    const catCount = distinctCount(catSubIds);
                    if (catCount === 0 && (search || typeFilter !== 'all')) return null;
                    const catKey = `${fnKey}|cat:${categoryName}`;
                    return (
                      <div key={categoryName} className="border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800">
                        <button
                          type="button"
                          className="w-full flex items-center gap-2 px-3 py-2 text-left"
                          onClick={() => toggle(catKey)}
                          aria-expanded={Boolean(expanded[catKey])}
                        >
                          {expanded[catKey] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{categoryName}</span>
                          <CountBadge count={catCount} />
                        </button>

                        {expanded[catKey] && (
                          <div className="px-3 pb-3 space-y-2">
                            {catSubIds.map((subId) => {
                              const subMetrics = bySubcategory.get(subId) || [];
                              if (subMetrics.length === 0) return null;
                              return (
                                <div key={subId}>
                                  <div className="flex items-center gap-2 py-1">
                                    <span className="text-xs font-mono font-semibold text-gray-700 dark:text-gray-300">{subId}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{subs.get(subId)}</span>
                                  </div>
                                  <div className="space-y-1.5">
                                    {subMetrics.map((m) => (
                                      <MetricCard key={`${subId}-${m.id}`} metric={m} />
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Metrics;
