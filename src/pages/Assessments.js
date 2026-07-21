import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Plus, Edit, Save, Trash2, X, CheckCircle, XCircle,
  Download, Upload, ClipboardList, FileSearch, ChevronRight, Copy,
  Loader2, Bot, Sparkles, User, Settings,
  BookOpen, ExternalLink, RotateCcw, Server
} from 'lucide-react';
import toast from 'react-hot-toast';
import Markdown from '../components/Markdown';

// Components
import FrameworkBadge from '../components/FrameworkBadge';
import UserSelector from '../components/UserSelector';
import ArtifactSelector from '../components/ArtifactSelector';
import FindingSelector from '../components/FindingSelector';
import ControlSelector from '../components/ControlSelector';
import SortableHeader from '../components/SortableHeader';
import ExportPasswordDialog from '../components/ExportPasswordDialog';
import EmptyState from '../components/EmptyState';
import ScoreSelect from '../components/ScoreSelect';

// Stores
import useAssessmentsStore, { normalizeAssessmentUsers, ASSESSMENT_USER_ROLES } from '../stores/assessmentsStore';
import useControlsStore from '../stores/controlsStore';
import useRequirementsStore, { isCsfRequirement } from '../stores/requirementsStore';
import useUserStore from '../stores/userStore';
import useAIStore from '../stores/aiStore';
import useUIStore from '../stores/uiStore';
import { formatInlineMarkdown, stripMarkdown } from '../utils/markdownText';
import { bankCoverage, getBankProcedure, canResetToCommunity, resetToCommunityUpdate, sourceUrlFor } from '../utils/procedureBank';
import { expandProcedureText, derivePlatformsFromObservations } from '../utils/platformBank';
import { canUseProfileWithProvider, buildTailorPrompt, tailoredProvenance, deriveStackTargets, describeStackPlan, bankAttachObservation, wizardAttachObservation, deterministicTailorUpdate, pickerObservationUpdate, pickerAvailability } from '../utils/procedureTailor';
import { buildEnvironmentMatrix, buildAttachPlan, cellKey, toggleCell, setColumn, columnFullySelected, columnTotal, countAttached, attachedCountForItem, availablePlatforms } from '../utils/environmentStep';
import { platformIdsFromInfrastructure } from '../utils/infraPresets';
import { getScoringScale, scoreBand, CMMI_LEVELS } from '../utils/scoringScale';
import { SYSTEM_NAME_MAX_LENGTH } from '../utils/externalLinks';
import { belongsToAssessment, isUnassigned } from '../utils/assessmentScope';
import ExternalLinksEditor from '../components/ExternalLinksEditor';
import ProcedureSourceBadge from '../components/ProcedureSourceBadge';
import PlatformAddendumBadges from '../components/PlatformAddendumBadges';
import PlatformCheckPicker from '../components/PlatformCheckPicker';
import useOrgProfileStore from '../stores/orgProfileStore';
import OrgProfileWizard from '../components/OrgProfileWizard';

// Helper function to format test procedures for display
const formatTestProcedures = (text) => {
  if (!text) return '';

  let formatted = text;

  // Add newlines before numbered steps (1., 2., 3., etc.)
  formatted = formatted.replace(/(\s)(\d+)\.\s+/g, '\n\n**$2.** ');

  // Add newlines before lettered sub-items (a., b., c., etc.)
  formatted = formatted.replace(/(\s)([a-z])\.\s+/g, '\n   - **$2.** ');

  // Add newlines before dash bullet points that follow text
  formatted = formatted.replace(/\s+-\s+/g, '\n   - ');

  // Clean up any excessive newlines at the start
  formatted = formatted.replace(/^\n+/, '');

  return formatted;
};

// Markdown helpers shared with Findings: formatInlineMarkdown breaks
// single-line catalog text into renderable markdown; stripMarkdown cleans
// truncated plain-text previews. See src/utils/markdownText.js.

const Assessments = () => {
  // Store state
  const assessments = useAssessmentsStore((state) => state.assessments);
  const currentAssessmentId = useAssessmentsStore((state) => state.currentAssessmentId);
  const setCurrentAssessmentId = useAssessmentsStore((state) => state.setCurrentAssessmentId);
  const createAssessment = useAssessmentsStore((state) => state.createAssessment);
  const deleteAssessment = useAssessmentsStore((state) => state.deleteAssessment);
  const getObservation = useAssessmentsStore((state) => state.getObservation);
  const updateObservation = useAssessmentsStore((state) => state.updateObservation);
  const getAssessment = useAssessmentsStore((state) => state.getAssessment);
  const updateAssessment = useAssessmentsStore((state) => state.updateAssessment);
  const updateQuarterlyObservation = useAssessmentsStore((state) => state.updateQuarterlyObservation);
  const addToScope = useAssessmentsStore((state) => state.addToScope);
  const removeFromScope = useAssessmentsStore((state) => state.removeFromScope);
  const bulkAddToScope = useAssessmentsStore((state) => state.bulkAddToScope);
  const getAssessmentProgress = useAssessmentsStore((state) => state.getAssessmentProgress);
  const exportAssessmentCSV = useAssessmentsStore((state) => state.exportAssessmentCSV);
  const importAssessmentsCSV = useAssessmentsStore((state) => state.importAssessmentsCSV);
  const exportAllAssessmentsCSV = useAssessmentsStore((state) => state.exportAllAssessmentsCSV);
  const cloneAssessment = useAssessmentsStore((state) => state.cloneAssessment);
  const addAssessmentUser = useAssessmentsStore((state) => state.addAssessmentUser);
  const removeAssessmentUser = useAssessmentsStore((state) => state.removeAssessmentUser);
  const setAssessmentUserRole = useAssessmentsStore((state) => state.setAssessmentUserRole);
  // Subscribed (not getState) so the roster editor re-renders on directory edits
  const directoryUsers = useUserStore((state) => state.users);

  const controls = useControlsStore((state) => state.controls);
  const getControl = useControlsStore((state) => state.getControl);

  const requirements = useRequirementsStore((state) => state.requirements);
  const getRequirement = useRequirementsStore((state) => state.getRequirement);

  // AI Store for test procedure generation
  const { llmProvider, generateWithOllama, generateWithClaude, ollamaStatus, claudeStatus, checkClaude, checkOllama } = useAIStore();

  // Local state
  const [view, setView] = useState('list'); // 'list', 'scope', 'assess'
  const [editMode, setEditMode] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  // Quarter sourced from the global uiStore so the terminal status bar
  // selectors stay in sync. Internal code keeps using 'Q1'..'Q4' strings.
  const selectedQuarterNum = useUIStore((s) => s.selectedQuarter);
  const setSelectedQuarterNum = useUIStore((s) => s.setSelectedQuarter);
  const selectedQuarter = `Q${selectedQuarterNum}`;
  const setSelectedQuarter = useCallback((q) => {
    const n = typeof q === 'string' ? parseInt(q.replace(/^Q/i, ''), 10) : Number(q);
    if (!Number.isNaN(n) && n >= 1 && n <= 4) setSelectedQuarterNum(n);
  }, [setSelectedQuarterNum]);

  // Export (optional password protection)
  const [showExportPasswordDialog, setShowExportPasswordDialog] = useState(false);
  const [showSingleExportPasswordDialog, setShowSingleExportPasswordDialog] = useState(false);

  // Post-create platform-check picker (plan PR-7)
  const [showPlatformPicker, setShowPlatformPicker] = useState(false);
  const allPlatformIds = useMemo(() => availablePlatforms().map((p) => p.id), []);
  // The dialog is per-subcategory state — close it when the item changes.
  useEffect(() => { setShowPlatformPicker(false); }, [selectedItemId]);

  // New assessment wizard state
  const [showNewModal, setShowNewModal] = useState(false);
  const [wizardStep, setWizardStep] = useState(1); // 1: Basic + Scope, 2: Environment, 3: Test Procedures, 4: Users
  const [newAssessment, setNewAssessment] = useState({
    name: '',
    description: '',
    scopeType: 'requirements',
    scoringScale: 10,
    year: new Date().getFullYear(),
    externalTracking: { enabled: false, systems: { findings: '', artifacts: '', controls: '' } }
  });
  const [selectedScopeItems, setSelectedScopeItems] = useState(new Set()); // Selected controls/requirements
  const [scopePreset, setScopePreset] = useState(null); // 'category' | 'subcategory' | 'all' | null (custom)
  const [scopeFilterText, setScopeFilterText] = useState('');
  const [useBankProcedures, setUseBankProcedures] = useState(true);
  const [showBankPreview, setShowBankPreview] = useState(false);
  const [tailorWithProfile, setTailorWithProfile] = useState(false);
  const [adaptStackRefs, setAdaptStackRefs] = useState(false);
  const [showProfileWizard, setShowProfileWizard] = useState(false);
  const [isTailoringItem, setIsTailoringItem] = useState(false);

  // Org profile (optional) — powers deterministic + AI tailoring
  const orgProfile = useOrgProfileStore((s) => s.profile);
  const hasOrgProfile = useOrgProfileStore((s) => s.hasProfile)();
  const cloudConsent = useOrgProfileStore((s) => s.cloudConsent);

  // Deterministic swap plan derived from the profile (no AI): which canned
  // tool/platform substitutions would fire, as human-readable lines.
  const stackPlan = useMemo(
    () => (orgProfile ? describeStackPlan(deriveStackTargets(orgProfile)) : []),
    [orgProfile]
  );
  const [generateTestProcedures, setGenerateTestProcedures] = useState(false);
  const [isGeneratingProcedures, setIsGeneratingProcedures] = useState(false);
  const [generatedProcedures, setGeneratedProcedures] = useState({});
  const [generationProgress, setGenerationProgress] = useState({ done: 0, total: 0 });
  const cancelGenerationRef = useRef(false);

  // Wizard Environment step (plan PR-6): ephemeral chip + cell state. The
  // chips seed from the saved org profile (pure read, never written back —
  // ratified); the assessment persists only the DERIVED platform set of
  // what actually attaches. All rules live in utils/environmentStep.js.
  const [envPlatforms, setEnvPlatforms] = useState([]);
  const [envSelections, setEnvSelections] = useState({});

  // Seed the platform chips each time the wizard opens. Open-time snapshot
  // on purpose: the profile store hydrates synchronously from localStorage
  // long before the modal can open, and a profile edited mid-wizard applies
  // on the next open (the reset link re-derives on demand).
  React.useEffect(() => {
    if (showNewModal) {
      setEnvPlatforms(platformIdsFromInfrastructure(orgProfile?.infrastructure));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showNewModal]);

  const envMatrix = useMemo(
    () => buildEnvironmentMatrix(Array.from(selectedScopeItems), envPlatforms),
    [selectedScopeItems, envPlatforms]
  );
  const envAttachedCount = useMemo(
    () => countAttached(envMatrix, envSelections),
    [envMatrix, envSelections]
  );

  // Wizard Users step (issue #290): people in scope for the assessment.
  // Rows are { name, email, role } while editing; on create they become
  // user-directory entries plus { userId, role } pairs on the assessment.
  const [wizardUsers, setWizardUsers] = useState([]);
  const [newUserRow, setNewUserRow] = useState({ name: '', email: '', role: 'auditor' });

  // Check provider status on mount
  React.useEffect(() => {
    if (llmProvider === 'ollama') {
      checkOllama();
    } else {
      checkClaude();
    }
  }, [llmProvider, checkOllama, checkClaude]);

  // Keyboard shortcut: 'n' to create new assessment
  React.useEffect(() => {
    const handleNewItem = () => {
      setShowNewModal(true);
    };
    window.addEventListener('keyboard-new-item', handleNewItem);
    return () => window.removeEventListener('keyboard-new-item', handleNewItem);
  }, []);

  // Scope picker state
  const [scopePickerSearch, setScopePickerSearch] = useState('');
  const [availableItemsSort, setAvailableItemsSort] = useState({ key: 'subcategoryId', direction: 'asc' });

  // Refs
  const fileInputRef = useRef(null);

  // Get current assessment
  const currentAssessment = useMemo(() => {
    return assessments.find(a => a.id === currentAssessmentId);
  }, [assessments, currentAssessmentId]);

  // The current assessment's user roster (issues #290/#297) — the scope for
  // the eval-panel user picker
  const rosterUserIds = useMemo(
    () => normalizeAssessmentUsers(currentAssessment?.users).map(u => u.userId),
    [currentAssessment]
  );
  const rosterUsers = useMemo(
    () => normalizeAssessmentUsers(currentAssessment?.users),
    [currentAssessment]
  );

  // Get progress for current assessment
  const progress = useMemo(() => {
    if (!currentAssessmentId) return null;
    return getAssessmentProgress(currentAssessmentId);
  }, [currentAssessmentId, getAssessmentProgress, currentAssessment]);

  // Get scoped items for current assessment
  const scopedItems = useMemo(() => {
    if (!currentAssessment) return [];

    return (currentAssessment.scopeIds || []).map(itemId => {
      if (currentAssessment.scopeType === 'controls') {
        const control = getControl(itemId);
        return control ? { ...control, type: 'control', itemId: control.controlId } : null;
      } else {
        // Try to find by id first, then by subcategoryId (for JIRA imports using subcategory IDs)
        let req = getRequirement(itemId);
        if (!req) {
          // Look for requirements where subcategoryId matches the scopeId
          req = requirements.find(r => r.subcategoryId === itemId);
        }
        return req ? { ...req, type: 'requirement', itemId: itemId } : null;
      }
    }).filter(Boolean);
  }, [currentAssessment, getControl, getRequirement, requirements]);

  // ---- Scoped-item CSF filters (issue #305) ----------------------------
  //
  // A real assessment scopes hundreds of subcategories; working through them
  // means working one function (or one category) at a time. These two filters
  // narrow the scoped list in BOTH the scope view and the evaluations table.
  // They are page-local view state: nothing here ever writes scopeIds.

  // The CSF function/category a scoped item belongs to. A requirement carries
  // them directly. A control carries neither, so they are derived from the
  // requirements it links to — a control can legitimately span more than one
  // function, hence sets rather than single values.
  const scopedItemFacets = useCallback((item) => {
    if (item.type === 'requirement') {
      return {
        functions: item.function ? [item.function] : [],
        categories: item.category ? [item.category] : []
      };
    }
    const functions = new Set();
    const categories = new Set();
    (item.linkedRequirementIds || []).forEach((reqId) => {
      const req = getRequirement(reqId);
      if (req?.function) functions.add(req.function);
      if (req?.category) categories.add(req.category);
    });
    return { functions: [...functions], categories: [...categories] };
  }, [getRequirement]);

  const [scopedFunctionFilter, setScopedFunctionFilter] = useState('');
  const [scopedCategoryFilter, setScopedCategoryFilter] = useState('');

  // Switching assessments clears the filters — a function that existed in the
  // old assessment's scope may not exist in the new one, and a filter matching
  // nothing reads as an empty assessment.
  useEffect(() => {
    setScopedFunctionFilter('');
    setScopedCategoryFilter('');
  }, [currentAssessmentId]);

  // Options come from the items actually in scope, not from the whole CSF
  // catalog, so the dropdowns never offer a choice that yields nothing.
  const scopedFunctionOptions = useMemo(() => {
    const found = new Set();
    scopedItems.forEach((item) => scopedItemFacets(item).functions.forEach((f) => found.add(f)));
    return [...found].sort();
  }, [scopedItems, scopedItemFacets]);

  // Categories narrow to the selected function, so the second dropdown only
  // ever offers categories that can actually be reached from the first.
  const scopedCategoryOptions = useMemo(() => {
    const found = new Set();
    scopedItems.forEach((item) => {
      const facets = scopedItemFacets(item);
      if (scopedFunctionFilter && !facets.functions.includes(scopedFunctionFilter)) return;
      facets.categories.forEach((c) => found.add(c));
    });
    return [...found].sort();
  }, [scopedItems, scopedItemFacets, scopedFunctionFilter]);

  const scopedFiltersActive = Boolean(scopedFunctionFilter || scopedCategoryFilter);

  const filteredScopedItems = useMemo(() => {
    if (!scopedFiltersActive) return scopedItems;
    return scopedItems.filter((item) => {
      const facets = scopedItemFacets(item);
      if (scopedFunctionFilter && !facets.functions.includes(scopedFunctionFilter)) return false;
      if (scopedCategoryFilter && !facets.categories.includes(scopedCategoryFilter)) return false;
      return true;
    });
  }, [scopedItems, scopedItemFacets, scopedFunctionFilter, scopedCategoryFilter, scopedFiltersActive]);

  // EVAL-nn is derived from the UNFILTERED position, so an item keeps its
  // number when a filter is applied. Numbering off the rendered index would
  // make the table and the detail header disagree the moment you filter.
  const evalNumberByItemId = useMemo(() => {
    const numbers = new Map();
    scopedItems.forEach((item, index) => numbers.set(item.itemId, index + 1));
    return numbers;
  }, [scopedItems]);

  const evalNumber = useCallback(
    (itemId) => String(evalNumberByItemId.get(itemId) || 0).padStart(2, '0'),
    [evalNumberByItemId]
  );

  // Prev/next walks the list the user is looking at. When the selected item is
  // outside the active filter (deep link, or the filter changed underneath it)
  // fall back to the full list so navigation is never dead.
  const navigationItems = useMemo(() => (
    filteredScopedItems.some((i) => i.itemId === selectedItemId) ? filteredScopedItems : scopedItems
  ), [filteredScopedItems, scopedItems, selectedItemId]);

  // A reusable pair of dropdowns — the scope view and the evaluations table
  // both drive the same filter state, so a filter set in one holds in the other.
  const renderScopedCsfFilters = (idPrefix) => (
    <div className="flex items-center gap-2">
      <select
        id={`${idPrefix}-function-filter`}
        value={scopedFunctionFilter}
        onChange={(e) => {
          setScopedFunctionFilter(e.target.value);
          // The chosen category may not exist under the new function.
          setScopedCategoryFilter('');
        }}
        className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        aria-label="Filter scoped items by CSF function"
        disabled={scopedFunctionOptions.length === 0}
      >
        <option value="">All functions</option>
        {scopedFunctionOptions.map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>
      <select
        id={`${idPrefix}-category-filter`}
        value={scopedCategoryFilter}
        onChange={(e) => setScopedCategoryFilter(e.target.value)}
        className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        aria-label="Filter scoped items by CSF category"
        disabled={scopedCategoryOptions.length === 0}
      >
        <option value="">All categories</option>
        {scopedCategoryOptions.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      {scopedFiltersActive && (
        <button
          type="button"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          onClick={() => {
            setScopedFunctionFilter('');
            setScopedCategoryFilter('');
          }}
        >
          Clear
        </button>
      )}
    </div>
  );

  // Get available items for scope selection
  const availableItems = useMemo(() => {
    if (!currentAssessment) return [];

    const scopeIds = currentAssessment.scopeIds || [];

    let items = [];

    if (currentAssessment.scopeType === 'controls') {
      // Offer only this assessment's controls plus unassigned ones (issue
      // #299) — controls stamped to another assessment (the demo set above
      // all) are not scope candidates here.
      items = controls.filter(c =>
        (belongsToAssessment(c, currentAssessment.id) || isUnassigned(c)) &&
        !scopeIds.includes(c.controlId)
      );
      if (scopePickerSearch) {
        const search = scopePickerSearch.toLowerCase();
        items = items.filter(c =>
          c.controlId.toLowerCase().includes(search) ||
          c.implementationDescription?.toLowerCase().includes(search)
        );
      }
      items = items.map(c => ({ ...c, type: 'control', itemId: c.controlId }));
    } else {
      // Filter out requirements that are already scoped (by id or subcategoryId)
      items = requirements.filter(r =>
        !scopeIds.includes(r.id) && !scopeIds.includes(r.subcategoryId)
      );
      if (currentAssessment.frameworkFilter) {
        items = items.filter(r => r.frameworkId === currentAssessment.frameworkFilter);
      }
      if (scopePickerSearch) {
        const search = scopePickerSearch.toLowerCase();
        items = items.filter(r =>
          r.id.toLowerCase().includes(search) ||
          r.subcategoryId?.toLowerCase().includes(search) ||
          r.function?.toLowerCase().includes(search) ||
          r.implementationExample?.toLowerCase().includes(search)
        );
      }
      items = items.map(r => ({ ...r, type: 'requirement', itemId: r.id }));
    }

    // Apply sorting
    items.sort((a, b) => {
      let aVal = '';
      let bVal = '';

      if (availableItemsSort.key === 'subcategoryId') {
        aVal = a.type === 'control' ? a.controlId : (a.subcategoryId || a.id);
        bVal = b.type === 'control' ? b.controlId : (b.subcategoryId || b.id);
      } else if (availableItemsSort.key === 'id') {
        aVal = a.type === 'control' ? a.controlId : a.id;
        bVal = b.type === 'control' ? b.controlId : b.id;
      } else if (availableItemsSort.key === 'implementationExample') {
        aVal = a.type === 'control' ? a.implementationDescription : (a.implementationExample || '');
        bVal = b.type === 'control' ? b.implementationDescription : (b.implementationExample || '');
      } else if (availableItemsSort.key === 'category') {
        aVal = a.category || '';
        bVal = b.category || '';
      } else {
        aVal = a[availableItemsSort.key] || '';
        bVal = b[availableItemsSort.key] || '';
      }

      const comparison = String(aVal).localeCompare(String(bVal));
      return availableItemsSort.direction === 'asc' ? comparison : -comparison;
    });

    return items;
  }, [currentAssessment, controls, requirements, scopePickerSearch, availableItemsSort]);

  // Get current observation
  const currentObservation = useMemo(() => {
    if (!currentAssessmentId || !selectedItemId) return null;
    return getObservation(currentAssessmentId, selectedItemId);
  }, [currentAssessmentId, selectedItemId, getObservation, currentAssessment]);

  // Helper functions — returns semantic badge classes
  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'Complete': return 'badge badge-success';
      case 'In Progress': return 'badge badge-info';
      case 'Submitted': return 'badge badge-warning';
      default: return 'badge badge-neutral';
    }
  }, []);

  // Assessments are scoped against NIST CSF 2.0 requirements only
  const csfRequirements = useMemo(() => requirements.filter(isCsfRequirement), [requirements]);

  // Scope presets: one implementation example per category, one per
  // subcategory, or the full catalog. "First" is catalog order, and the
  // category key is derived from the subcategory ID (e.g. "GV.SC-04" -> "GV.SC")
  // so both bundled and imported CSF catalogs group correctly.
  const scopePresets = useMemo(() => {
    const perCategory = [];
    const perSubcategory = [];
    const seenCategories = new Set();
    const seenSubcategories = new Set();
    for (const r of csfRequirements) {
      const subcategoryId = r.subcategoryId || '';
      const categoryId = subcategoryId.split('-')[0];
      if (categoryId && !seenCategories.has(categoryId)) {
        seenCategories.add(categoryId);
        perCategory.push(r.id);
      }
      if (subcategoryId && !seenSubcategories.has(subcategoryId)) {
        seenSubcategories.add(subcategoryId);
        perSubcategory.push(r.id);
      }
    }
    return {
      category: perCategory,
      subcategory: perSubcategory,
      all: csfRequirements.map(r => r.id)
    };
  }, [csfRequirements]);

  // Get items available for scope selection in wizard
  const wizardScopeItems = useMemo(() => {
    let items = [];
    if (newAssessment.scopeType === 'controls') {
      items = controls.map(c => ({
        id: c.controlId,
        label: c.controlId,
        description: c.implementationDescription || '',
        category: c.subcategoryId || '',
        type: 'control'
      }));
    } else {
      items = csfRequirements.map(r => ({
        id: r.id,
        label: r.subcategoryId || r.id,
        description: r.implementationExample || r.category || '',
        category: r.function || '',
        type: 'requirement'
      }));
    }

    // Apply filter
    if (scopeFilterText) {
      const search = scopeFilterText.toLowerCase();
      items = items.filter(item =>
        item.id.toLowerCase().includes(search) ||
        item.label.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search)
      );
    }

    return items;
  }, [newAssessment.scopeType, controls, csfRequirements, scopeFilterText]);

  // Wizard helper: check if AI is ready
  const isAIReady = llmProvider === 'ollama'
    ? ollamaStatus.available && ollamaStatus.hasModel
    : claudeStatus.configured;

  // Community-bank coverage over the current selection — computed live from
  // the generated bank, never assumed. Control-scope items resolve to zero
  // coverage (the bank is keyed by CSF subcategory).
  const scopeCoverage = useMemo(
    () => bankCoverage(Array.from(selectedScopeItems)),
    [selectedScopeItems]
  );

  // Items AI generation would target: with the bank attached, AI fills the
  // gaps; with it off, AI covers the whole selection.
  const aiTargetIds = useMemo(
    () => (useBankProcedures ? scopeCoverage.uncovered : Array.from(selectedScopeItems)),
    [useBankProcedures, scopeCoverage, selectedScopeItems]
  );

  // Generate test procedures with AI for the target items.
  // No silent cap: every target is generated, one sequential LLM round-trip
  // per item, with live progress and a cancel affordance.
  const handleGenerateTestProcedures = useCallback(async () => {
    if (selectedScopeItems.size === 0) {
      toast.error('Please select items in scope first');
      return;
    }

    const selectedIds = aiTargetIds;
    if (selectedIds.length === 0) {
      toast('All selected items already have community procedures — nothing for AI to generate.');
      return;
    }

    setIsGeneratingProcedures(true);
    cancelGenerationRef.current = false;
    setGenerationProgress({ done: 0, total: selectedIds.length });
    const procedures = { ...generatedProcedures };
    let done = 0;

    for (const itemId of selectedIds) {
      if (cancelGenerationRef.current) break;
      // Already generated (e.g. resuming after a cancel): counts as done.
      if (procedures[itemId]) {
        done += 1;
        setGenerationProgress({ done, total: selectedIds.length });
        continue;
      }

      let description = '';
      if (newAssessment.scopeType === 'controls') {
        const ctrl = controls.find(c => c.controlId === itemId);
        description = ctrl?.implementationDescription || '';
      } else {
        const req = requirements.find(r => r.id === itemId);
        description = req?.implementationExample || req?.category || '';
      }

      const prompt = `Generate test procedures for this NIST CSF 2.0 control assessment:

Control ID: ${itemId}
Description: ${description}

Provide 3-5 specific test procedures an auditor should follow. Include:
- What to examine (documents, configurations, etc.)
- Who to interview
- What tests to perform

Format as a numbered list. Be specific and actionable.`;

      try {
        let response;
        if (llmProvider === 'ollama') {
          response = await generateWithOllama(prompt, 500);
        } else {
          response = await generateWithClaude(prompt, 500);
        }
        procedures[itemId] = response;
      } catch (error) {
        console.error('Test procedure generation error:', error);
        procedures[itemId] = 'Failed to generate test procedures. Please try again.';
      }
      done += 1;
      setGenerationProgress({ done, total: selectedIds.length });
    }

    setGeneratedProcedures(procedures);
    setIsGeneratingProcedures(false);
    if (cancelGenerationRef.current && done < selectedIds.length) {
      toast(`Generation canceled after ${done} of ${selectedIds.length} items — run again to continue.`);
    } else {
      toast.success(`Generated procedures for ${done} of ${selectedIds.length} items`);
    }
  }, [selectedScopeItems, aiTargetIds, generatedProcedures, newAssessment.scopeType, controls, requirements, llmProvider, generateWithOllama, generateWithClaude]);

  // Wizard Users step handlers (issue #290)
  const handleAddWizardUser = useCallback(() => {
    const name = newUserRow.name.trim();
    const email = newUserRow.email.trim();
    if (!name) {
      toast.error('Name is required');
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('A valid email address is required');
      return;
    }
    if (wizardUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      toast.error('That email address is already in the list');
      return;
    }
    setWizardUsers(prev => [...prev, { name, email, role: newUserRow.role }]);
    setNewUserRow({ name: '', email: '', role: newUserRow.role });
  }, [newUserRow, wizardUsers]);

  const handleRemoveWizardUser = useCallback((email) => {
    setWizardUsers(prev => prev.filter(u => u.email !== email));
  }, []);

  // Reset wizard state
  const resetWizard = useCallback(() => {
    setWizardStep(1);
    setNewAssessment({ name: '', description: '', scopeType: 'requirements', scoringScale: 10, year: new Date().getFullYear(), externalTracking: { enabled: false, systems: { findings: '', artifacts: '', controls: '' } } });
    setSelectedScopeItems(new Set());
    setScopePreset(null);
    setScopeFilterText('');
    setUseBankProcedures(true);
    setEnvPlatforms([]);
    setEnvSelections({});
    setShowBankPreview(false);
    setTailorWithProfile(false);
    setAdaptStackRefs(false);
    setGenerateTestProcedures(false);
    setIsGeneratingProcedures(false);
    setGeneratedProcedures({});
    setGenerationProgress({ done: 0, total: 0 });
    cancelGenerationRef.current = false;
    setWizardUsers([]);
    setNewUserRow({ name: '', email: '', role: 'auditor' });
  }, []);

  // Handlers
  const handleCreateAssessment = useCallback(() => {
    if (!newAssessment.name) {
      toast.error('Assessment name is required');
      return;
    }

    if (selectedScopeItems.size === 0) {
      toast.error('Please select at least one item for the assessment scope');
      return;
    }

    // Users step (issue #290): rows become user-directory entries plus
    // { userId, role } pairs on the assessment. Email-authoritative on
    // purpose — two people who share a name but not an email stay two users.
    const ROLE_TITLES = { auditor: 'Auditor', 'control owner': 'Control Owner', stakeholder: 'Stakeholder' };
    const { findOrCreateUserByEmail } = useUserStore.getState();
    const scopedUsers = [];
    for (const row of wizardUsers) {
      const userId = findOrCreateUserByEmail({ name: row.name, email: row.email, title: ROLE_TITLES[row.role] });
      if (userId !== null && userId !== undefined) {
        scopedUsers.push({ userId, role: row.role });
      }
    }

    // Environment step (plan PR-6): which platform checks each item attaches
    // (checked cells only — the user is the only exclusion actor) and the
    // DERIVED platform set the assessment record persists.
    const attachPlan = buildAttachPlan(
      Array.from(selectedScopeItems), envSelections, envPlatforms, useBankProcedures
    );

    const created = createAssessment({ ...newAssessment, users: scopedUsers, platforms: attachPlan.platforms });

    // Add selected items to scope
    for (const itemId of selectedScopeItems) {
      addToScope(created.id, itemId);

      // Bank-first: attach the community procedure (full markdown, with
      // provenance) for every covered item; AI/manual fills the gaps.
      const bankEntry = useBankProcedures ? getBankProcedure(itemId) : null;
      if (bankEntry) {
        // Optional deterministic tailoring: substitute the org's name for
        // the case study's "Alma Security" and/or re-aim tool/platform
        // references at the org's stack (canned maps, no AI). The producer
        // stamps tailored provenance so share export can swap to pristine.
        // Platform checks selected in the Environment step ride as
        // references through the composed producer; with none selected the
        // update is byte-identical to the plain community attach.
        updateObservation(created.id, itemId, wizardAttachObservation(bankEntry, attachPlan.offersByItem[itemId], orgProfile, {
          substituteName: tailorWithProfile,
          adaptStack: adaptStackRefs
        }));
      } else if (generatedProcedures[itemId]) {
        updateObservation(created.id, itemId, { testProcedures: generatedProcedures[itemId] });
      }
    }

    setShowNewModal(false);
    resetWizard();
    setCurrentAssessmentId(created.id);
    setView('scope');
    toast.success(`Assessment "${created.name}" created with ${selectedScopeItems.size} items`);
  }, [newAssessment, createAssessment, selectedScopeItems, useBankProcedures, envSelections, envPlatforms, tailorWithProfile, adaptStackRefs, orgProfile, generatedProcedures, wizardUsers, addToScope, updateObservation, setCurrentAssessmentId, resetWizard]);

  const handleSelectAssessment = useCallback((assessment) => {
    setCurrentAssessmentId(assessment.id);
    setView('scope');
    setSelectedItemId(null);
  }, [setCurrentAssessmentId]);

  const handleDeleteAssessment = useCallback((assessmentId) => {
    const assessment = assessments.find(a => a.id === assessmentId);
    if (window.confirm(`Delete assessment "${assessment?.name}"?`)) {
      deleteAssessment(assessmentId);
      setView('list');
      toast.success('Assessment deleted');
    }
  }, [assessments, deleteAssessment]);

  const handleCloneAssessment = useCallback((assessmentId) => {
    const assessment = assessments.find(a => a.id === assessmentId);
    const newName = prompt('Enter name for cloned assessment:', `${assessment?.name} (Copy)`);
    if (newName) {
      const cloned = cloneAssessment(assessmentId, newName);
      setCurrentAssessmentId(cloned.id);
      setView('scope');
      toast.success('Assessment cloned');
    }
  }, [assessments, cloneAssessment, setCurrentAssessmentId]);

  const handleAddToScope = useCallback((itemId) => {
    if (!currentAssessmentId) return;
    addToScope(currentAssessmentId, itemId);
  }, [currentAssessmentId, addToScope]);

  const handleRemoveFromScope = useCallback((itemId) => {
    if (!currentAssessmentId) return;
    removeFromScope(currentAssessmentId, itemId);
  }, [currentAssessmentId, removeFromScope]);

  const handleAddAllInScope = useCallback(() => {
    if (!currentAssessmentId || currentAssessment?.scopeType !== 'requirements') return;

    const inScopeReqs = requirements
      .filter(r => r.inScope)
      .filter(r => !currentAssessment.frameworkFilter || r.frameworkId === currentAssessment.frameworkFilter)
      .map(r => r.id);

    bulkAddToScope(currentAssessmentId, inScopeReqs);
    toast.success(`Added ${inScopeReqs.length} in-scope requirements`);
  }, [currentAssessmentId, currentAssessment, requirements, bulkAddToScope]);

  const handleSelectItem = useCallback((itemId) => {
    setSelectedItemId(itemId);
    setView('assess');
    setEditMode(false);
  }, []);

  const handleObservationChange = useCallback((field, value) => {
    if (!currentAssessmentId || !selectedItemId) return;
    updateObservation(currentAssessmentId, selectedItemId, { [field]: value });
  }, [currentAssessmentId, selectedItemId, updateObservation]);

  // Recompute the assessment's derived platform set from the live
  // observations — the SINGLE derivation call site, run after every
  // composition-changing write (ratified: platforms is recomputed, never
  // incrementally mutated).
  const syncDerivedPlatforms = useCallback(() => {
    if (!currentAssessmentId) return;
    const assessment = getAssessment(currentAssessmentId);
    if (!assessment) return;
    updateAssessment(currentAssessmentId, {
      platforms: derivePlatformsFromObservations(assessment.observations)
    });
  }, [currentAssessmentId, getAssessment, updateAssessment]);

  // Dispatch one picker operation (add / addAll / remove / adopt) through
  // the pure producer. The observation is re-read from the store at
  // dispatch time so rapid consecutive operations never build on a stale
  // snapshot. A null update means nothing would change — no write.
  const handlePlatformCheckOperation = useCallback((operation) => {
    if (!currentAssessmentId || !selectedItemId) return;
    const fresh = getObservation(currentAssessmentId, selectedItemId);
    const update = pickerObservationUpdate(fresh, selectedItemId, operation);
    if (!update) return;
    updateObservation(currentAssessmentId, selectedItemId, update);
    syncDerivedPlatforms();
  }, [currentAssessmentId, selectedItemId, getObservation, updateObservation, syncDerivedPlatforms]);

  // Attach (or re-attach) the community procedure for the selected item.
  // The pure producer stamps pristine provenance (so the store's
  // modified-flag heuristic doesn't mark a deliberate attach as a
  // customization) and refuses to overwrite another bank's content.
  const handleInsertBankProcedure = useCallback((existingText) => {
    if (!currentAssessmentId || !selectedItemId) return;
    const existing = getObservation(currentAssessmentId, selectedItemId);
    const update = resetToCommunityUpdate(selectedItemId, existing?.procedureSource);
    if (!update) return;
    // The confirm says exactly what resets (plan §7 R-6): the procedure text
    // goes back to the pristine community version; platform addenda recorded
    // on the observation are NOT destroyed — they stay attached as their
    // pristine referenced versions (edits to them are reset too).
    const confirmMessage = update.platformProcedures?.length
      ? 'Reset the test procedure text to the pristine community version? Platform addenda stay attached and are reset to their pristine referenced versions (any edits to the text or the addenda are discarded).'
      : 'Reset the test procedure text to the pristine community version? Any edits to it are discarded.';
    if (existingText && existingText.trim() && !window.confirm(confirmMessage)) {
      return;
    }
    updateObservation(currentAssessmentId, selectedItemId, update);
    syncDerivedPlatforms();
    toast.success(`Community procedure for ${update.procedureSource.bankId} attached`);
  }, [currentAssessmentId, selectedItemId, getObservation, updateObservation, syncDerivedPlatforms]);

  // Deterministic tailoring of the selected item's procedure: canned
  // name + tool/platform substitutions from the org profile. No AI, no
  // key, nothing leaves the machine. Works on already-attached procedures
  // so existing assessments benefit without re-creation.
  const handleTailorDeterministic = useCallback((currentText) => {
    if (!currentAssessmentId || !selectedItemId || !currentText) return;
    if (!hasOrgProfile) {
      toast.error('Set up your organization profile first (Settings → Organization profile).');
      return;
    }
    const existing = getObservation(currentAssessmentId, selectedItemId);
    // The producer stamps tailored provenance — an untagged tailored
    // procedure would bypass the share-export pristine swap and leak
    // profile facts.
    const result = deterministicTailorUpdate(currentText, existing?.procedureSource, selectedItemId, orgProfile);
    if (!result) {
      toast('Nothing to adapt — this procedure already matches your profile. Name your cloud, EDR, or email platform in the org profile to enable swaps.', { duration: 6000 });
      return;
    }
    updateObservation(currentAssessmentId, selectedItemId, result.update);
    toast.success(result.swapCount > 0
      ? `Procedure adapted to your environment — ${result.swapCount} reference${result.swapCount === 1 ? '' : 's'} swapped (no AI)`
      : 'Organization name substituted (no AI)');
  }, [currentAssessmentId, selectedItemId, hasOrgProfile, orgProfile, getObservation, updateObservation]);

  // AI-tailor the selected item's procedure with the org profile.
  // Consent gate: the profile never goes to a CLOUD provider without the
  // explicit stored opt-in; local Ollama needs none.
  const handleTailorWithAI = useCallback(async (currentText) => {
    if (!currentAssessmentId || !selectedItemId) return;
    if (!hasOrgProfile) {
      toast.error('Set up your organization profile first (Settings → Organization profile).');
      return;
    }
    if (!canUseProfileWithProvider(llmProvider, cloudConsent)) {
      toast.error(
        'Sending your org profile to a cloud AI provider requires consent — enable it in ' +
        'Settings → Organization profile, or switch the AI provider to local Ollama.',
        { duration: 8000 }
      );
      return;
    }
    if (!isAIReady) {
      toast.error('AI provider is not ready.');
      return;
    }

    setIsTailoringItem(true);
    try {
      const prompt = buildTailorPrompt(currentText, orgProfile);
      const response = llmProvider === 'ollama'
        ? await generateWithOllama(prompt, 2500)
        : await generateWithClaude(prompt, 2500);
      const existing = getObservation(currentAssessmentId, selectedItemId);
      // ALWAYS stamp tailored provenance — an untagged tailored procedure
      // would bypass the share-export pristine swap and leak profile facts.
      updateObservation(currentAssessmentId, selectedItemId, {
        testProcedures: response,
        procedureSource: tailoredProvenance(existing?.procedureSource, selectedItemId)
      });
      toast.success('Procedure tailored to your organization');
    } catch (error) {
      console.error('Tailor error:', error);
      toast.error('Tailoring failed — the original text is unchanged.');
    }
    setIsTailoringItem(false);
  }, [currentAssessmentId, selectedItemId, hasOrgProfile, llmProvider, cloudConsent, isAIReady, orgProfile, generateWithOllama, generateWithClaude, getObservation, updateObservation]);

  const handleQuarterlyChange = useCallback((field, value) => {
    if (!currentAssessmentId || !selectedItemId) return;
    updateQuarterlyObservation(currentAssessmentId, selectedItemId, selectedQuarter, { [field]: value });
  }, [currentAssessmentId, selectedItemId, selectedQuarter, updateQuarterlyObservation]);

  const handleExport = useCallback(() => {
    if (!currentAssessmentId) return;
    setShowSingleExportPasswordDialog(true);
  }, [currentAssessmentId]);

  const handleCancelExportSingle = useCallback(() => {
    setShowSingleExportPasswordDialog(false);
  }, []);

  const handleConfirmExportSingle = useCallback(async (password) => {
    setShowSingleExportPasswordDialog(false);
    if (!currentAssessmentId) return;

    try {
      const trimmed = (password || '').trim();
      await exportAssessmentCSV(
        currentAssessmentId,
        useControlsStore,
        useRequirementsStore,
        useUserStore,
        { password: trimmed }
      );
      toast.success(trimmed ? 'Assessment exported (encrypted)' : 'Assessment exported');
    } catch (err) {
      console.error('Assessment export error:', err);
      toast.error('Export failed. Please try again.');
    }
  }, [currentAssessmentId, exportAssessmentCSV]);

  const handleAvailableItemsSort = useCallback((key) => {
    setAvailableItemsSort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileImport = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const count = await importAssessmentsCSV(text, useUserStore);
      toast.success(`Imported ${count} assessment(s)`);
    } catch (err) {
      console.error('Assessment import error:', err);
      toast.error('Import failed. Please verify the file and try again.');
    }

    e.target.value = '';
  }, [importAssessmentsCSV]);

  const handleExportAll = useCallback(() => {
    setShowExportPasswordDialog(true);
  }, []);

  const handleCancelExportAll = useCallback(() => {
    setShowExportPasswordDialog(false);
  }, []);

  const handleConfirmExportAll = useCallback(async (password) => {
    setShowExportPasswordDialog(false);
    try {
      const trimmed = (password || '').trim();
      await exportAllAssessmentsCSV(useControlsStore, useRequirementsStore, useUserStore, {
        password: trimmed
      });
      toast.success(trimmed ? 'Assessments exported (encrypted)' : 'Assessments exported');
    } catch (err) {
      console.error('Assessment export error:', err);
      toast.error('Export failed. Please verify the file and try again.');
    }
  }, [exportAllAssessmentsCSV]);

  const handleDownloadTemplate = useCallback(() => {
    const templateData = [
      {
        'ID': 'GV.OC-01 Ex1',
        'Assessment': '2025 Security Assessment',
        'Scope Type': 'controls',
        'Auditor': 'Auditor Name <auditor@example.com>',
        'Test Procedure(s)': 'Review documentation; Interview control owner; Test implementation',
        'Q1 Actual Score': '5',
        'Q1 Target Score': '5',
        'Q1 Observations': 'Q1 observation notes',
        'Q1 Observation Date': '2025-01-15',
        'Q1 Testing Status': 'Complete',
        'Q1 Examine': 'Yes',
        'Q1 Interview': 'Yes',
        'Q1 Test': 'Yes',
        'Q2 Actual Score': '6',
        'Q2 Target Score': '5',
        'Q2 Observations': 'Q2 observation notes',
        'Q2 Observation Date': '2025-04-15',
        'Q2 Testing Status': 'Complete',
        'Q2 Examine': 'Yes',
        'Q2 Interview': 'Yes',
        'Q2 Test': 'Yes',
        'Q3 Actual Score': '',
        'Q3 Target Score': '',
        'Q3 Observations': '',
        'Q3 Observation Date': '',
        'Q3 Testing Status': 'Not Started',
        'Q3 Examine': 'No',
        'Q3 Interview': 'No',
        'Q3 Test': 'No',
        'Q4 Actual Score': '',
        'Q4 Target Score': '',
        'Q4 Observations': '',
        'Q4 Observation Date': '',
        'Q4 Testing Status': 'Not Started',
        'Q4 Examine': 'No',
        'Q4 Interview': 'No',
        'Q4 Test': 'No',
        'Linked Artifacts': 'artifact1; artifact2',
        'Remediation Owner': 'Owner Name <owner@example.com>',
        'Action Plan': 'Example remediation action',
        'Remediation Due Date': '2025-03-01'
      }
    ];

    const headers = [
      'ID', 'Assessment', 'Scope Type', 'Auditor', 'Test Procedure(s)',
      'Q1 Actual Score', 'Q1 Target Score', 'Q1 Observations', 'Q1 Observation Date', 'Q1 Testing Status', 'Q1 Examine', 'Q1 Interview', 'Q1 Test',
      'Q2 Actual Score', 'Q2 Target Score', 'Q2 Observations', 'Q2 Observation Date', 'Q2 Testing Status', 'Q2 Examine', 'Q2 Interview', 'Q2 Test',
      'Q3 Actual Score', 'Q3 Target Score', 'Q3 Observations', 'Q3 Observation Date', 'Q3 Testing Status', 'Q3 Examine', 'Q3 Interview', 'Q3 Test',
      'Q4 Actual Score', 'Q4 Target Score', 'Q4 Observations', 'Q4 Observation Date', 'Q4 Testing Status', 'Q4 Examine', 'Q4 Interview', 'Q4 Test',
      'Linked Artifacts', 'Remediation Owner', 'Action Plan', 'Remediation Due Date'
    ];
    const csv = [
      headers.join(','),
      templateData.map(row => headers.map(h => `"${row[h] || ''}"`).join(',')).join('\n')
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'assessments_template.csv';
    link.click();
    toast.success('Template downloaded');
  }, []);

  // Render assessment list view
  const renderListView = () => (
    <div className="flex flex-col h-full">
      <div className="bg-gray-100 dark:bg-gray-800 p-4 border-b dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList size={24} className="text-blue-600" />
          <div>
            <h1 className="text-xl font-bold dark:text-white">Control Evaluations</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">{assessments.length} evaluation(s)</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
            onClick={() => setShowNewModal(true)}
          >
            <Plus size={16} />
            New Assessment
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            onChange={handleFileImport}
            style={{ display: 'none' }}
          />
          <button
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
            onClick={handleImportClick}
            title="Import assessments from CSV"
          >
            <Upload size={16} />
            Import
          </button>
          <button
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
            onClick={handleExportAll}
            title="Export all assessments to CSV"
          >
            <Download size={16} />
            Export
          </button>
          <button
            className="flex items-center gap-2 py-2 px-4 rounded-lg"
            style={{ backgroundColor: '#e5e7eb', color: '#1f2937' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d1d5db'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
            onClick={handleDownloadTemplate}
            title="Download CSV template"
          >
            <Download size={16} />
            Template
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {assessments.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <EmptyState
              icon={ClipboardList}
              title="No assessments yet"
              description="Create your first assessment to begin tracking your CSF posture."
              actionLabel="Create Assessment"
              onAction={() => setShowNewModal(true)}
            />
          </div>
        ) : (
          <div className="grid gap-4">
            {assessments.map(assessment => {
              const prog = getAssessmentProgress(assessment.id);
              return (
                <div
                  key={assessment.id}
                  className="bg-white border rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow"
                  onClick={() => handleSelectAssessment(assessment)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{assessment.name}</h3>
                      {assessment.description && (
                        <p className="text-gray-600 text-sm mt-1">{assessment.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>Scope: {assessment.scopeType === 'controls' ? 'Controls' : 'Requirements'}</span>
                        <span>{prog.total} items</span>
                        <button
                          className={`${getStatusColor(assessment.status)} hover:opacity-80 transition-opacity`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentAssessmentId(assessment.id);
                            // Get first scoped item
                            const firstScopeId = assessment.scopeIds?.[0];
                            if (firstScopeId) {
                              setSelectedItemId(firstScopeId);
                              setView('assess');
                            } else {
                              setView('scope');
                            }
                          }}
                          title="Click to score this assessment"
                        >
                          {prog.completed}/{prog.total} complete
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <button
                        className="p-2 rounded"
                        style={{ backgroundColor: '#e5e7eb', color: '#000000' }}
                        onClick={() => handleCloneAssessment(assessment.id)}
                        title="Clone assessment"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        className="p-2 hover:bg-gray-100 rounded"
                        onClick={() => handleDeleteAssessment(assessment.id)}
                        title="Delete assessment"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar with color gradient */}
                  <div className="mt-3">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${prog.percentage === 100 ? 'bg-green-500' :
                            prog.percentage >= 75 ? 'bg-emerald-500' :
                              prog.percentage >= 50 ? 'bg-blue-500' :
                                prog.percentage >= 25 ? 'bg-amber-500' :
                                  'bg-red-400'
                          }`}
                        style={{ width: `${prog.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className={`text-xs font-medium ${prog.percentage === 100 ? 'text-green-600 dark:text-green-400' :
                          prog.percentage >= 50 ? 'text-blue-600 dark:text-blue-400' :
                            'text-gray-500 dark:text-gray-400'
                        }`}>
                        {prog.percentage}% complete
                      </p>
                      {prog.percentage === 100 && (
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">✓ Done</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // Render scope definition view
  const renderScopeView = () => (
    <div className="flex flex-col h-full">
      <div className="bg-gray-100 dark:bg-gray-800 p-4 border-b dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              onClick={() => setView('list')}
            >
              <ChevronRight size={20} className="rotate-180 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-xl font-bold dark:text-white">{currentAssessment?.name}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Define scope - {currentAssessment?.scopeType === 'controls' ? 'Select Controls' : 'Select Requirements'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentAssessment?.scopeType === 'requirements' && (
              <button
                className="flex items-center gap-2 py-2 px-4 rounded-lg"
                style={{ backgroundColor: '#e5e7eb', color: '#000000' }}
                onClick={handleAddAllInScope}
              >
                <CheckCircle size={16} />
                Add All In-Scope
              </button>
            )}
            <button
              className="flex items-center gap-2 py-2 px-4 rounded-lg"
              style={{ backgroundColor: '#e5e7eb', color: '#000000' }}
              onClick={() => {
                if (scopedItems.length > 0) {
                  setSelectedItemId(scopedItems[0].itemId);
                  setView('assess');
                } else {
                  toast.error('Add items to scope first before scoring');
                }
              }}
              title="Enter quarterly scores and evaluations"
            >
              <FileSearch size={16} />
              Score Assessment
            </button>
            <button
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
              onClick={handleExport}
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Progress summary - clickable to navigate to scoring */}
        {progress && (
          <div className="mt-3 flex items-center gap-4 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Progress:</span>
            <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 dark:text-gray-300 rounded">{progress.total} scoped</span>
            <button
              className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-600 dark:text-white rounded hover:bg-green-200 dark:hover:bg-green-500 transition-colors cursor-pointer"
              onClick={() => {
                if (scopedItems.length > 0) {
                  setSelectedItemId(scopedItems[0].itemId);
                  setView('assess');
                }
              }}
              title="Click to start scoring"
            >
              {progress.completed} complete
            </button>
            <button
              className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white rounded hover:bg-blue-200 dark:hover:bg-blue-500 transition-colors cursor-pointer"
              onClick={() => {
                // Find first in-progress item
                const inProgressItem = scopedItems.find(item => {
                  const obs = currentAssessment?.observations?.[item.itemId];
                  return obs?.testingStatus === 'In Progress';
                });
                if (inProgressItem) {
                  setSelectedItemId(inProgressItem.itemId);
                  setView('assess');
                } else if (scopedItems.length > 0) {
                  setSelectedItemId(scopedItems[0].itemId);
                  setView('assess');
                }
              }}
              title="Click to continue scoring in-progress items"
            >
              {progress.inProgress} in progress
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 flex-1 min-h-0 overflow-hidden">
        {/* Scoped items */}
        <div className="border-r overflow-auto">
          <div className="p-3 bg-gray-50 border-b sticky top-0 z-10">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="font-medium">
                Scoped Items ({scopedFiltersActive
                  ? `${filteredScopedItems.length} of ${scopedItems.length}`
                  : scopedItems.length})
              </h3>
            </div>
            {/* CSF function/category filters (issue #305) */}
            {renderScopedCsfFilters('scope')}
          </div>
          {scopedItems.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No items in scope</p>
              <p className="text-sm mt-1">Add items from the right panel</p>
            </div>
          ) : filteredScopedItems.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No scoped items match this filter</p>
              <p className="text-sm mt-1">
                {scopedItems.length} item{scopedItems.length === 1 ? '' : 's'} in scope — clear the filter to see them
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredScopedItems.map(item => {
                const obs = currentAssessment ? currentAssessment.observations?.[item.itemId] : null;
                return (
                  <div
                    key={item.itemId}
                    className={`p-3 flex items-center justify-between hover:bg-blue-50 cursor-pointer ${selectedItemId === item.itemId ? 'bg-blue-100' : ''
                      }`}
                    onClick={() => handleSelectItem(item.itemId)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {item.type === 'requirement' && (
                          <FrameworkBadge frameworkId={item.frameworkId} size="xs" />
                        )}
                        <span className="font-medium">
                          {item.type === 'control' ? item.controlId : item.subcategoryId || item.id}
                        </span>
                        {obs?.testingStatus && (
                          <span className={getStatusColor(obs.testingStatus)}>
                            {obs.testingStatus}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                        {item.type === 'control'
                          ? item.implementationDescription
                          : item.category}
                      </p>
                    </div>
                    <button
                      className="p-1 hover:bg-red-100 rounded text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromScope(item.itemId);
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Available items */}
        <div className="overflow-auto flex flex-col">
          <div className="p-3 bg-gray-50 border-b sticky top-0 z-10">
            <h3 className="font-medium mb-2">Available Items ({availableItems.length})</h3>
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Search by ID, category, or implementation example..."
              value={scopePickerSearch}
              onChange={(e) => setScopePickerSearch(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-auto">
            <table className="table-professional min-w-full">
              <thead className="sticky top-0">
                <tr>
                  <th className="w-8 p-2"></th>
                  <SortableHeader
                    label="Subcategory"
                    sortKey="subcategoryId"
                    currentSort={availableItemsSort}
                    onSort={handleAvailableItemsSort}
                  />
                  <SortableHeader
                    label="ID"
                    sortKey="id"
                    currentSort={availableItemsSort}
                    onSort={handleAvailableItemsSort}
                  />
                  <SortableHeader
                    label="Implementation Example"
                    sortKey="implementationExample"
                    currentSort={availableItemsSort}
                    onSort={handleAvailableItemsSort}
                  />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {availableItems.slice(0, 100).map(item => (
                  <tr
                    key={item.itemId}
                    className="hover:bg-green-50 cursor-pointer"
                    onClick={() => handleAddToScope(item.itemId)}
                  >
                    <td className="p-2 text-center">
                      <Plus size={16} className="text-green-600 inline" />
                    </td>
                    <td className="p-2 text-sm">
                      <div className="flex items-center gap-2">
                        {item.type === 'requirement' && (
                          <FrameworkBadge frameworkId={item.frameworkId} size="xs" />
                        )}
                        <span className="font-medium">
                          {item.type === 'control' ? item.controlId : item.subcategoryId || item.id}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.category || ''}
                      </p>
                    </td>
                    <td className="p-2 text-sm font-mono text-xs text-gray-600">
                      {item.type === 'control' ? item.controlId : item.id}
                    </td>
                    <td className="p-2 text-sm">
                      <p className="text-xs text-gray-600 line-clamp-2 max-w-md">
                        {item.type === 'control'
                          ? item.implementationDescription
                          : item.implementationExample || '-'}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {availableItems.length > 100 && (
              <p className="p-3 text-center text-gray-500 text-sm border-t">
                Showing first 100 of {availableItems.length} items. Use search to filter.
              </p>
            )}
            {availableItems.length === 0 && (
              <p className="p-4 text-center text-gray-500 text-sm">
                No available items. All items may already be scoped.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Get status badge style (Jira-style) — returns semantic badge variant class
  const getJiraStatusStyle = (status) => {
    switch (status) {
      case 'Complete':
        return 'badge badge-success';
      case 'In Progress':
        return 'badge badge-info';
      case 'Submitted':
        return 'badge badge-warning';
      default:
        return 'badge badge-neutral';
    }
  };

  // Get score badge style (thresholds proportional to the assessment's scale)
  const getScoreBadgeStyle = (score) => {
    if (!score || score === 0) return 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300';
    const band = scoreBand(score, getScoringScale(currentAssessment));
    if (band === 'green') return 'bg-green-100 text-green-700 dark:bg-green-600 dark:text-white';
    if (band === 'yellow') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-600 dark:text-white';
    return 'bg-red-100 text-red-700 dark:bg-red-600 dark:text-white';
  };

  // Render assessment view - Jira-style: full table, then two-column detail on click
  const renderAssessView = () => {
    // Lookup is against the FULL list — a selected item must stay reachable
    // even when the active filter would hide it (issue #305).
    const currentItem = scopedItems.find(i => i.itemId === selectedItemId);
    // Prev/next index is against whichever list navigation is walking.
    const currentIndex = navigationItems.findIndex(i => i.itemId === selectedItemId);

    // If an item is selected, show the two-column detail view
    if (selectedItemId && currentObservation && currentItem) {
      return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900">
          {/* Detail Header - Jira style with back button */}
          <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 py-2">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <button
                className="hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1"
                onClick={() => setSelectedItemId(null)}
              >
                <ChevronRight size={16} className="rotate-180" />
                Back
              </button>
              <span>/</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">EVAL-{evalNumber(selectedItemId)}</span>
              <span className="flex items-center gap-1">
                <button
                  onClick={() => {
                    const prevIndex = currentIndex - 1;
                    if (prevIndex >= 0) setSelectedItemId(navigationItems[prevIndex].itemId);
                  }}
                  disabled={currentIndex <= 0}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30"
                >
                  <ChevronRight size={14} className="rotate-180" />
                </button>
                <button
                  onClick={() => {
                    const nextIndex = currentIndex + 1;
                    if (nextIndex < navigationItems.length) setSelectedItemId(navigationItems[nextIndex].itemId);
                  }}
                  disabled={currentIndex === -1 || currentIndex === navigationItems.length - 1}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30"
                >
                  <ChevronRight size={14} />
                </button>
              </span>
            </div>
          </div>

          {/* Title bar with subcategory ID and status */}
          <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {currentItem.type === 'control' ? currentItem.controlId : currentItem.subcategoryId || currentItem.id}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">+</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">...</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {editMode ? (
                  <select
                    value={currentObservation.quarters?.[selectedQuarter]?.testingStatus || 'Not Started'}
                    onChange={(e) => handleQuarterlyChange('testingStatus', e.target.value)}
                    className="px-3 py-1.5 rounded text-sm font-medium border cursor-pointer bg-blue-600 text-white border-blue-600"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Complete">Complete</option>
                  </select>
                ) : (
                  <span className={getJiraStatusStyle(currentObservation.quarters?.[selectedQuarter]?.testingStatus || 'Not Started')}>
                    {currentObservation.quarters?.[selectedQuarter]?.testingStatus || 'Not Started'}
                    <ChevronRight size={14} className="ml-1 rotate-90" />
                  </span>
                )}
                {editMode ? (
                  <button
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white py-1.5 px-3 rounded text-sm"
                    onClick={() => setEditMode(false)}
                  >
                    <Save size={14} />
                    Done
                  </button>
                ) : (
                  <button
                    className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 py-1.5 px-3 rounded text-sm border dark:border-gray-600"
                    onClick={() => setEditMode(true)}
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Two-column layout like Jira - 50/50 split */}
          <div className="grid grid-cols-2 flex-1 min-h-0 overflow-hidden">
            {/* Left column - Key details (50%) */}
            <div className="overflow-auto p-6 border-r dark:border-gray-700">
              <div className="space-y-6">
                {/* Key details section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <ChevronRight size={16} className="rotate-90" />
                    Key details
                  </h3>

                  {/* Description */}
                  <div className="mb-4">
                    <label className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Description</label>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {currentItem.type === 'control'
                        ? currentItem.implementationDescription || 'Add a description...'
                        : currentItem.implementationExample || currentItem.category || 'Add a description...'}
                    </p>
                  </div>

                  {/* Test Procedures */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        Test Procedures
                        <ProcedureSourceBadge source={currentObservation.procedureSource} />
                      </label>
                      <div className="flex items-center gap-3">
                        {editMode && hasOrgProfile && currentObservation.testProcedures && (
                          <button
                            type="button"
                            onClick={() => handleTailorDeterministic(currentObservation.testProcedures)}
                            className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1 hover:underline"
                            title="Swap platform/tool references (AWS, SentinelOne, O365, Slack) for your profile's stack using canned mappings — no AI, nothing leaves this machine"
                          >
                            <Settings size={12} /> Adapt to my environment
                          </button>
                        )}
                        {editMode && hasOrgProfile && currentObservation.testProcedures && (
                          <button
                            type="button"
                            onClick={() => handleTailorWithAI(currentObservation.testProcedures)}
                            disabled={isTailoringItem}
                            className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1 hover:underline disabled:opacity-50"
                            title="Rewrite this procedure for your organization using AI (profile-aware; cloud providers require consent)"
                          >
                            {isTailoringItem
                              ? (<><Loader2 size={12} className="animate-spin" /> Tailoring…</>)
                              : (<><Sparkles size={12} /> Tailor with AI</>)}
                          </button>
                        )}
                        {editMode && getBankProcedure(selectedItemId) && canResetToCommunity(currentObservation.procedureSource) && (
                          <button
                            type="button"
                            onClick={() => handleInsertBankProcedure(currentObservation.testProcedures)}
                            className="text-xs text-green-700 dark:text-green-400 flex items-center gap-1 hover:underline"
                            title={currentObservation.procedureSource ? 'Restore the pristine community version' : 'Insert the community-contributed procedure'}
                          >
                            {currentObservation.procedureSource
                              ? (<><RotateCcw size={12} /> Reset to community version</>)
                              : (<><BookOpen size={12} /> Insert community procedure</>)}
                          </button>
                        )}
                        {editMode && pickerAvailability(currentObservation, selectedItemId, allPlatformIds).canOpen && (
                          <button
                            type="button"
                            onClick={() => setShowPlatformPicker(true)}
                            className="text-xs text-blue-700 dark:text-blue-400 flex items-center gap-1 hover:underline"
                            title="Add or remove platform checks for this subcategory"
                          >
                            <Server size={12} /> Platform checks
                          </button>
                        )}
                        {!editMode && sourceUrlFor(currentObservation.procedureSource) && (
                          <a
                            href={sourceUrlFor(currentObservation.procedureSource)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                            title="Suggest an improvement to this community procedure on GitHub"
                          >
                            <ExternalLink size={12} /> Improve this procedure
                          </a>
                        )}
                      </div>
                    </div>
                    {!editMode && currentObservation.platformProcedures?.length > 0 && (
                      <PlatformAddendumBadges entries={currentObservation.platformProcedures} />
                    )}
                    {editMode ? (
                      <textarea
                        value={currentObservation.testProcedures || ''}
                        onChange={(e) => handleObservationChange('testProcedures', e.target.value)}
                        className="w-full p-3 text-sm border dark:border-gray-600 rounded-lg h-32 bg-white dark:bg-gray-700 dark:text-white"
                        placeholder="Document test procedures..."
                      />
                    ) : (
                      <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300">
                        {/* Bank-attached procedures are real markdown — render as-is
                            through the expansion choke point (platform addendum
                            references expand to text + attribution here); the
                            reformat helper is only for legacy free-text blobs. */}
                        <Markdown>
                          {(currentObservation.procedureSource || currentObservation.platformProcedures?.length
                            ? expandProcedureText(currentObservation)
                            : formatTestProcedures(currentObservation.testProcedures)) || 'No test procedures defined'}
                        </Markdown>
                      </div>
                    )}
                    {showPlatformPicker && (
                      <PlatformCheckPicker
                        itemId={selectedItemId}
                        observation={currentObservation}
                        canAttach={pickerAvailability(currentObservation, selectedItemId, allPlatformIds).canAttach}
                        onOperation={handlePlatformCheckOperation}
                        onClose={() => setShowPlatformPicker(false)}
                      />
                    )}
                  </div>

                  {/* Artifacts */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm text-gray-500 dark:text-gray-400">Artifacts</label>
                    </div>
                    <ArtifactSelector
                      selectedArtifacts={currentObservation.linkedArtifacts || []}
                      onChange={(artifacts) => handleObservationChange('linkedArtifacts', artifacts)}
                      disabled={!editMode}
                      assessmentId={currentAssessmentId}
                    />
                  </div>

                  {/* Findings */}
                  <div className="mb-4">
                    <FindingSelector
                      label="Findings"
                      selectedFindings={currentObservation.linkedFindings || []}
                      onChange={(findings) => handleObservationChange('linkedFindings', findings)}
                      disabled={!editMode}
                      assessmentId={currentAssessmentId}
                    />
                  </div>

                  {/* Controls (issue #294): in-app control links, same pattern
                      as Artifacts/Findings — chips jump to the Controls tab. */}
                  <div className="mb-4">
                    <ControlSelector
                      label="Controls"
                      selectedControls={currentObservation.linkedControls || []}
                      onChange={(controls) => handleObservationChange('linkedControls', controls)}
                      disabled={!editMode}
                      assessmentId={currentAssessmentId}
                    />
                  </div>

                  {/* External links (issue #288): add — not select — links to
                      findings / artifacts / controls tracked in external
                      systems (Jira, SharePoint, Hyperproof, ...). */}
                  <div className="mb-4">
                    <ExternalLinksEditor
                      key={selectedItemId}
                      links={currentObservation.externalLinks || []}
                      onChange={(links) => handleObservationChange('externalLinks', links)}
                      externalTracking={currentAssessment?.externalTracking}
                      disabled={!editMode}
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Right column - Details panel (50%) */}
            <div className="overflow-auto bg-gray-50 dark:bg-gray-800/50">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <ChevronRight size={16} className="rotate-90" />
                    Details
                  </h3>
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <Settings size={14} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Auditor (issue #290: the person performing this evaluation) */}
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Auditor</span>
                    <div className="text-right">
                      <UserSelector
                        selectedUsers={currentObservation.auditorId}
                        onChange={(userId) => handleObservationChange('auditorId', userId)}
                        disabled={!editMode}
                        scopeUserIds={rosterUserIds}
                        onAddToScope={(userId) => addAssessmentUser(currentAssessmentId, userId, 'auditor')}
                      />
                      {!currentObservation.auditorId && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Assign to me</p>
                      )}
                    </div>
                  </div>

                  {/* Assessment Methods */}
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Assessment Methods</span>
                    <div className="flex gap-3">
                      {['examine', 'interview', 'test'].map((method) => (
                        <label key={method} className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={currentObservation.quarters?.[selectedQuarter]?.[method] || false}
                            onChange={(e) => handleQuarterlyChange(method, e.target.checked)}
                            disabled={!editMode}
                            className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600 text-blue-600"
                          />
                          <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">{method}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Year (issue #291): the calendar year the quarters cover */}
                  {currentAssessment?.year && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Year</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{currentAssessment.year}</span>
                    </div>
                  )}

                  {/* Assessment users (issues #290/#297): the roster that scopes
                      the user pickers on this assessment. Editable here because
                      the wizard is the only other place the roster exists. */}
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Users</span>
                    <div className="text-right space-y-1">
                      {rosterUsers.length === 0 && (
                        <span className="text-sm text-gray-400">None</span>
                      )}
                      {rosterUsers.map(({ userId, role }) => {
                        const user = directoryUsers.find(u => u.id === userId);
                        if (!user) return null;
                        return (
                          <div key={userId} className="flex items-center gap-1.5 justify-end">
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate" title={user.email || user.name}>
                              {user.name}
                            </span>
                            {editMode ? (
                              <select
                                value={role}
                                onChange={(e) => setAssessmentUserRole(currentAssessmentId, userId, e.target.value)}
                                className="text-xs border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                aria-label={`Role for ${user.name}`}
                              >
                                {ASSESSMENT_USER_ROLES.map(r => (
                                  <option key={r} value={r}>{r}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{role}</span>
                            )}
                            {editMode && (
                              <button
                                onClick={() => removeAssessmentUser(currentAssessmentId, userId)}
                                className="text-gray-400 hover:text-red-500"
                                title={`Remove ${user.name} from this assessment`}
                                aria-label={`Remove ${user.name} from this assessment`}
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                      {editMode && (
                        <UserSelector
                          selectedUsers={null}
                          onChange={(userId) => addAssessmentUser(currentAssessmentId, userId)}
                        />
                      )}
                    </div>
                  </div>

                  {/* Quarter selector */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Quarter</span>
                    <div className="flex gap-1">
                      {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => {
                        const qData = currentObservation.quarters?.[q] || {};
                        const hasData = qData.testingStatus && qData.testingStatus !== 'Not Started';
                        return (
                          <button
                            key={q}
                            onClick={() => setSelectedQuarter(q)}
                            className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${selectedQuarter === q
                                ? 'bg-blue-600 dark:bg-blue-500 text-white'
                                : hasData
                                  ? 'bg-green-100 text-green-700 dark:bg-green-600 dark:text-white'
                                  : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                              }`}
                          >
                            {q}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Q Target Score */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{selectedQuarter} Target Score</span>
                    {editMode ? (
                      <ScoreSelect
                        value={currentObservation.quarters?.[selectedQuarter]?.targetScore || 0}
                        onChange={(score) => handleQuarterlyChange('targetScore', score)}
                        maxScore={getScoringScale(currentAssessment)}
                        label={`${selectedQuarter} Target Score`}
                      />
                    ) : (
                      <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-medium text-gray-700 dark:text-gray-300">
                        {currentObservation.quarters?.[selectedQuarter]?.targetScore || 0}
                      </span>
                    )}
                  </div>

                  {/* Q Actual Score */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{selectedQuarter} Actual Score</span>
                    {editMode ? (
                      <ScoreSelect
                        value={currentObservation.quarters?.[selectedQuarter]?.actualScore || 0}
                        onChange={(score) => handleQuarterlyChange('actualScore', score)}
                        maxScore={getScoringScale(currentAssessment)}
                        label={`${selectedQuarter} Actual Score`}
                      />
                    ) : (
                      <span className={`px-2 py-0.5 rounded text-sm font-bold ${getScoreBadgeStyle(currentObservation.quarters?.[selectedQuarter]?.actualScore)}`}>
                        {currentObservation.quarters?.[selectedQuarter]?.actualScore || 0}
                      </span>
                    )}
                  </div>

                  {/* Q Observations */}
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 block mb-2">{selectedQuarter} Observations</span>
                    {editMode ? (
                      <textarea
                        value={currentObservation.quarters?.[selectedQuarter]?.observations || ''}
                        onChange={(e) => handleQuarterlyChange('observations', e.target.value)}
                        className="w-full p-2 text-sm border dark:border-gray-600 rounded h-32 bg-white dark:bg-gray-700 dark:text-white"
                        placeholder={`Document ${selectedQuarter} observations...`}
                      />
                    ) : (
                      <div className="prose prose-sm max-w-none text-sm text-gray-700 dark:text-gray-300 max-h-48 overflow-auto">
                        <Markdown>{formatInlineMarkdown(currentObservation.quarters?.[selectedQuarter]?.observations) || 'None'}</Markdown>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Full-width table view when no item is selected
    return (
      <div className="flex flex-col h-full bg-white dark:bg-gray-900">
        {/* Header - Jira style */}
        <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                onClick={() => setView('scope')}
              >
                <ChevronRight size={18} className="rotate-180 text-gray-500 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{currentAssessment?.name}</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {scopedFiltersActive
                    ? `${filteredScopedItems.length} of ${scopedItems.length} evaluations`
                    : `${scopedItems.length} evaluations`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* CSF function/category filters (issue #305) — same state the
                  scope view drives, so a filter carries across the two views */}
              {renderScopedCsfFilters('assess')}
              {/* Quarter selector */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
                  <button
                    key={q}
                    onClick={() => setSelectedQuarter(q)}
                    className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${selectedQuarter === q
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
              <button
                className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 py-1.5 px-3 rounded text-sm"
                onClick={handleExport}
              >
                <Download size={14} />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Full-width Jira-style table */}
        <div className="flex-1 overflow-auto">
          {/* Column headers */}
          <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
            <div className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-max">
              <div className="w-8 flex-shrink-0"></div>
              <div className="w-32 flex-shrink-0">Work</div>
              <div className="w-28 flex-shrink-0">Auditor</div>
              <div className="w-64 flex-shrink-0">Test Procedures</div>
              <div className="w-48 flex-shrink-0">Description</div>
              <div className="w-16 flex-shrink-0">Artifacts</div>
              <div className="w-20 flex-shrink-0">{selectedQuarter} Target</div>
              <div className="w-20 flex-shrink-0">{selectedQuarter} Actual</div>
              <div className="w-48 flex-shrink-0">{selectedQuarter} Observations</div>
              <div className="w-24 flex-shrink-0">Status</div>
            </div>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredScopedItems.map((item) => {
              const obs = currentAssessment?.observations?.[item.itemId];
              const quarterData = obs?.quarters?.[selectedQuarter] || {};
              const auditor = obs?.auditorId ? useUserStore.getState().getUserById(obs.auditorId) : null;

              return (
                <div
                  key={item.itemId}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-w-max"
                  onClick={() => {
                    setSelectedItemId(item.itemId);
                    setEditMode(false);
                  }}
                >
                  {/* Checkbox placeholder */}
                  <div className="w-8 flex-shrink-0">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 dark:border-gray-600" onClick={(e) => e.stopPropagation()} />
                  </div>

                  {/* Work column */}
                  <div className="w-32 flex-shrink-0 flex items-center gap-2">
                    <div className="flex-shrink-0 w-5 h-5 rounded bg-blue-500 flex items-center justify-center">
                      <ClipboardList size={12} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                        EVAL-{evalNumber(item.itemId)}
                      </span>
                      <p className="text-sm text-gray-900 dark:text-white truncate">
                        {item.type === 'control' ? item.controlId : item.subcategoryId || item.id}
                      </p>
                    </div>
                  </div>

                  {/* Auditor column */}
                  <div className="w-28 flex-shrink-0 flex items-center">
                    {auditor ? (
                      <div className="flex items-center gap-1.5" title={auditor.name}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium ${['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'][
                          auditor.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 5
                          ]
                          }`}>
                          {auditor.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                          {auditor.name}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                          <User size={12} />
                        </div>
                        <span className="text-sm">Unassigned</span>
                      </div>
                    )}
                  </div>

                  {/* Test Procedures column */}
                  <div className="w-64 flex-shrink-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {obs?.testProcedures ? obs.testProcedures.substring(0, 80) + (obs.testProcedures.length > 80 ? '...' : '') : '-'}
                    </p>
                  </div>

                  {/* Description column */}
                  <div className="w-48 flex-shrink-0">
                    <p className="text-sm text-gray-500 dark:text-gray-500 truncate">
                      {item.type === 'control'
                        ? (item.implementationDescription?.substring(0, 60) || '-')
                        : (item.category?.substring(0, 60) || '-')}
                    </p>
                  </div>

                  {/* Artifacts column */}
                  <div className="w-16 flex-shrink-0">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {obs?.linkedArtifacts?.length || 'None'}
                    </span>
                  </div>

                  {/* Q Target Score */}
                  <div className="w-20 flex-shrink-0">
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300">
                      {quarterData.targetScore || '-'}
                    </span>
                  </div>

                  {/* Q Actual Score */}
                  <div className="w-20 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded text-sm font-bold ${getScoreBadgeStyle(quarterData.actualScore)}`}>
                      {quarterData.actualScore || '-'}
                    </span>
                  </div>

                  {/* Q Observations */}
                  <div className="w-48 flex-shrink-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {quarterData.observations ? stripMarkdown(quarterData.observations).substring(0, 50) + '...' : '-'}
                    </p>
                  </div>

                  {/* Status column */}
                  <div className="w-24 flex-shrink-0">
                    <span className={`uppercase ${getJiraStatusStyle(quarterData.testingStatus || obs?.testingStatus || 'Not Started')}`}>
                      {quarterData.testingStatus || obs?.testingStatus || 'Not Started'}
                      <ChevronRight size={12} className="ml-1 rotate-90" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer with count */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 px-4 py-2">
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>+ Create</span>
              <span>{filteredScopedItems.length} of {scopedItems.length}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Assessment views */}
      {view === 'list' && renderListView()}
      {view === 'scope' && currentAssessment && renderScopeView()}
      {view === 'assess' && currentAssessment && renderAssessView()}

      <ExportPasswordDialog
        isOpen={showExportPasswordDialog}
        title="Export All Assessments"
        description="Optionally set a password to encrypt the export before download."
        onCancel={handleCancelExportAll}
        onConfirm={handleConfirmExportAll}
      />

      <ExportPasswordDialog
        isOpen={showSingleExportPasswordDialog}
        title="Export Assessment"
        description="Optionally set a password to encrypt the export before download."
        onCancel={handleCancelExportSingle}
        onConfirm={handleConfirmExportSingle}
      />

      {/* New Assessment Wizard Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Header with step indicator */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">New Assessment</h3>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => { setShowNewModal(false); resetWizard(); }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Step indicator */}
              <div className="flex items-center justify-center gap-2">
                {[
                  { num: 1, label: 'Scope' },
                  { num: 2, label: 'Environment' },
                  { num: 3, label: 'Test Procedures' },
                  { num: 4, label: 'Users' }
                ].map((step, idx) => (
                  <React.Fragment key={step.num}>
                    <div className={`flex items-center gap-2 ${wizardStep === step.num ? 'text-blue-600' : wizardStep > step.num ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${wizardStep === step.num ? 'border-blue-600 bg-blue-50' :
                          wizardStep > step.num ? 'border-green-600 bg-green-50' : 'border-gray-300'
                        }`}>
                        {wizardStep > step.num ? <CheckCircle size={16} /> : step.num}
                      </div>
                      <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
                    </div>
                    {idx < 3 && <div className={`w-8 h-0.5 ${wizardStep > step.num ? 'bg-green-600' : 'bg-gray-300'}`} />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Step content */}
            <div className="flex-1 overflow-auto p-4">
              {/* Step 1: Basic Info + Scope */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Assessment Name *</label>
                    <input
                      type="text"
                      className="mt-1 w-full p-2 border rounded"
                      placeholder="e.g., Q1 2026 Security Assessment"
                      value={newAssessment.name}
                      onChange={(e) => setNewAssessment(prev => ({ ...prev, name: e.target.value }))}
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Year</label>
                    <input
                      type="number"
                      min="1970"
                      max="2100"
                      step="1"
                      className="mt-1 w-32 p-2 border rounded"
                      value={newAssessment.year}
                      onChange={(e) => setNewAssessment(prev => ({ ...prev, year: e.target.value === '' ? '' : Number(e.target.value) }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      The calendar year the Q1&ndash;Q4 scores cover.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      className="mt-1 w-full p-2 border rounded h-20"
                      placeholder="Optional description..."
                      value={newAssessment.description}
                      onChange={(e) => setNewAssessment(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Scoring Scale</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="scoringScale"
                          value="10"
                          checked={newAssessment.scoringScale !== 5}
                          onChange={() => setNewAssessment(prev => ({ ...prev, scoringScale: 10 }))}
                        />
                        <div>
                          <span className="font-medium">10-point scale</span>
                          <span className="text-green-600 ml-2">(Default)</span>
                          <p className="text-xs text-gray-500">
                            The Simply Cyber Academy scale (0&ndash;10). See the Scoring Legend page for band definitions.
                          </p>
                        </div>
                      </label>
                      <label className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="scoringScale"
                          value="5"
                          checked={newAssessment.scoringScale === 5}
                          onChange={() => setNewAssessment(prev => ({ ...prev, scoringScale: 5 }))}
                        />
                        <div>
                          <span className="font-medium">5-point maturity scale (CMMI-style)</span>
                          <p className="text-xs text-gray-500">
                            0&ndash;5 as in the NIST CSF Maturity Toolkit: {CMMI_LEVELS.map(l => `${l.level} ${l.name}`).join(' · ')}
                          </p>
                        </div>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Both scales support quarter-point precision (e.g. 3.25). The scale is locked once the assessment is created.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">External Tracking (Optional)</label>
                    <label className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={newAssessment.externalTracking.enabled}
                        onChange={(e) => setNewAssessment(prev => ({
                          ...prev,
                          externalTracking: { ...prev.externalTracking, enabled: e.target.checked }
                        }))}
                      />
                      <div>
                        <span className="font-medium">Track findings, artifacts, and controls in your own systems</span>
                        <p className="text-xs text-gray-500">
                          Name a separate system per record type &mdash; findings (ticket link), artifacts (document link),
                          and controls (compliance-tool link). Names label the link fields; the link fields themselves are
                          always available, with or without this option.
                        </p>
                      </div>
                    </label>
                    {newAssessment.externalTracking.enabled && (
                      <div className="mt-2 space-y-2">
                        {[
                          { type: 'findings', label: 'Findings system', placeholder: 'e.g., Jira, ServiceNow, Freshservice' },
                          { type: 'artifacts', label: 'Artifacts system', placeholder: 'e.g., SharePoint, Jira, Google Drive' },
                          { type: 'controls', label: 'Controls system', placeholder: 'e.g., Hyperproof, Confluence' }
                        ].map(({ type, label, placeholder }) => (
                          <div key={type}>
                            <label className="block text-sm font-medium text-gray-700">{label} <span className="font-normal text-gray-400">(optional)</span></label>
                            <input
                              type="text"
                              className="mt-1 w-full p-2 border rounded"
                              maxLength={SYSTEM_NAME_MAX_LENGTH}
                              placeholder={placeholder}
                              value={newAssessment.externalTracking.systems[type]}
                              onChange={(e) => setNewAssessment(prev => ({
                                ...prev,
                                externalTracking: {
                                  ...prev.externalTracking,
                                  systems: { ...prev.externalTracking.systems, [type]: e.target.value }
                                }
                              }))}
                            />
                          </div>
                        ))}
                        <p className="text-xs text-gray-500 mt-1">
                          Shown in link-field labels (e.g. &ldquo;Jira ticket URL&rdquo;, &ldquo;Finding links &middot; Jira&rdquo;).
                          Excluded from share exports by default.
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Scope Type</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="scopeType"
                          value="requirements"
                          checked={newAssessment.scopeType === 'requirements'}
                          onChange={(e) => {
                            setNewAssessment(prev => ({ ...prev, scopeType: e.target.value }));
                            setSelectedScopeItems(new Set());
                            setScopePreset(null);
                          }}
                        />
                        <div>
                          <span className="font-medium">By Requirements</span>
                          <span className="text-green-600 ml-2">(Recommended)</span>
                          <p className="text-xs text-gray-500">Assess directly against framework requirements</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="scopeType"
                          value="controls"
                          checked={newAssessment.scopeType === 'controls'}
                          onChange={(e) => {
                            setNewAssessment(prev => ({ ...prev, scopeType: e.target.value }));
                            setSelectedScopeItems(new Set());
                            setScopePreset(null);
                          }}
                        />
                        <div>
                          <span className="font-medium">By Controls</span>
                          {controls.length > 0 && (
                            <span className="text-gray-500 ml-2">({controls.length} available)</span>
                          )}
                          <p className="text-xs text-gray-500">Assess your organization's defined controls (Most commonly used for SOC2)</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {newAssessment.scopeType === 'requirements' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Scope Size</label>
                      <div className="space-y-2">
                        {[
                          {
                            key: 'category',
                            label: 'One example per category',
                            description: 'A quick baseline: the first implementation example from each CSF category'
                          },
                          {
                            key: 'subcategory',
                            label: 'One example per subcategory',
                            description: 'Standard coverage: the first implementation example from each CSF subcategory'
                          },
                          {
                            key: 'all',
                            label: 'All implementation examples',
                            description: 'Comprehensive: every CSF implementation example in the catalog'
                          }
                        ].map(preset => (
                          <label
                            key={preset.key}
                            className={`flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-gray-50 ${scopePreset === preset.key ? 'border-blue-500 bg-blue-50' : ''}`}
                          >
                            <input
                              type="radio"
                              name="scopePreset"
                              value={preset.key}
                              checked={scopePreset === preset.key}
                              onChange={() => {
                                setScopePreset(preset.key);
                                setSelectedScopeItems(new Set(scopePresets[preset.key]));
                              }}
                            />
                            <div>
                              <span className="font-medium">{preset.label}</span>
                              <span className="text-gray-500 ml-2">({scopePresets[preset.key].length} items)</span>
                              <p className="text-xs text-gray-500">{preset.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Scope Item Selection */}
                  <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 p-3 border-b">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-700">
                            Select {newAssessment.scopeType === 'controls' ? 'Controls' : 'Requirements'} in Scope
                          </h4>
                          <span className="text-sm text-blue-600 font-medium">
                            {selectedScopeItems.size} selected
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="flex-1 p-2 border rounded text-sm"
                            placeholder="Filter by ID, description..."
                            value={scopeFilterText}
                            onChange={(e) => setScopeFilterText(e.target.value)}
                          />
                          <button
                            type="button"
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            onClick={() => {
                              const allIds = new Set(wizardScopeItems.map(item => item.id));
                              setSelectedScopeItems(allIds);
                              setScopePreset(null);
                            }}
                          >
                            Select All
                          </button>
                          <button
                            type="button"
                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            onClick={() => {
                              setSelectedScopeItems(new Set());
                              setScopePreset(null);
                            }}
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {wizardScopeItems.length === 0 ? (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            No items available. {newAssessment.scopeType === 'controls' ? 'Add controls in the Controls tab.' : 'No CSF requirements loaded.'}
                          </div>
                        ) : (
                          <div className="divide-y">
                            {wizardScopeItems.slice(0, 100).map(item => (
                              <label
                                key={item.id}
                                className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-50 ${selectedScopeItems.has(item.id) ? 'bg-blue-50' : ''
                                  }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedScopeItems.has(item.id)}
                                  onChange={(e) => {
                                    const newSet = new Set(selectedScopeItems);
                                    if (e.target.checked) {
                                      newSet.add(item.id);
                                    } else {
                                      newSet.delete(item.id);
                                    }
                                    setSelectedScopeItems(newSet);
                                    setScopePreset(null);
                                  }}
                                  className="mt-1 rounded"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{item.label}</span>
                                    {item.category && (
                                      <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                                        {item.category}
                                      </span>
                                    )}
                                  </div>
                                  {item.description && (
                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
                                  )}
                                </div>
                              </label>
                            ))}
                            {wizardScopeItems.length > 100 && (
                              <div className="p-3 text-center text-gray-500 text-xs">
                                Showing first 100 of {wizardScopeItems.length} items. Use filter to narrow down.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                </div>
              )}

              {/* Step 2: Test Procedures — community bank first, AI fills the gaps */}
              {/* Step 2: Environment (plan PR-6) — per-assessment platform
                  selection. Chips are ephemeral and seed from the org profile
                  (read-only); the assessment stores only what attaches. */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Server size={20} className="text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-900 dark:text-blue-200">Which platforms does this assessment cover? (optional)</h4>
                        <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                          Pick a platform to see its configuration checks, drawn from CISA's SCuBA
                          secure configuration baselines. Checks you select attach alongside the
                          community test procedure for that subcategory. Nothing attaches unless
                          you select it, and you can skip this step entirely.
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          {availablePlatforms().map(({ id, label }) => (
                            <button
                              key={id}
                              type="button"
                              onClick={() => setEnvPlatforms((prev) => (
                                prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
                              ))}
                              className={`px-3 py-1.5 text-sm rounded-full border ${envPlatforms.includes(id)
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            >
                              {label}
                            </button>
                          ))}
                          {hasOrgProfile && (
                            <button
                              type="button"
                              onClick={() => setEnvPlatforms(platformIdsFromInfrastructure(orgProfile?.infrastructure))}
                              className="text-sm text-blue-700 dark:text-blue-400 underline ml-1"
                            >
                              Same as my org profile
                            </button>
                          )}
                        </div>
                        {hasOrgProfile && platformIdsFromInfrastructure(orgProfile?.infrastructure).length > 0 && (
                          <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">
                            Pre-selected from your saved org profile. Changes here apply to this
                            assessment only and never modify the profile.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {envPlatforms.length > 0 && !useBankProcedures && (
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Platform checks attach alongside community test procedures, which are turned
                      off in the next step. Turn them back on for these selections to apply.
                    </p>
                  )}

                  {envPlatforms.length > 0 && envMatrix.rows.length === 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {newAssessment.scopeType === 'controls'
                        ? 'Platform checks map to CSF subcategories, so control-scope items have no matches.'
                        : 'None of your scoped items have platform checks for these platforms.'}
                    </p>
                  )}

                  {envPlatforms.length > 0 && envMatrix.rows.length > 0 && (
                    <div className="border dark:border-gray-600 rounded-lg overflow-hidden">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-600 flex items-center justify-between flex-wrap gap-2">
                        <span className="text-sm font-medium dark:text-white">
                          {envAttachedCount} of {envMatrix.totalAvailable} available checks selected
                        </span>
                        <div className="flex gap-3">
                          {envPlatforms.filter((p) => columnTotal(envMatrix, p) > 0).map((platformId) => {
                            const allOn = columnFullySelected(envMatrix, envSelections, platformId);
                            const label = availablePlatforms().find((ap) => ap.id === platformId)?.label || platformId;
                            return (
                              <button
                                key={platformId}
                                type="button"
                                onClick={() => setEnvSelections(setColumn(envMatrix, envSelections, platformId, !allOn))}
                                className="text-sm text-blue-700 dark:text-blue-400 underline"
                              >
                                {allOn
                                  ? `Clear ${label}`
                                  : `Select all ${label} (${columnTotal(envMatrix, platformId)} checks)`}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y dark:divide-gray-700">
                        {envMatrix.rows.map((row) => (
                          <div key={row.itemId} className="p-2 px-3 flex items-center justify-between gap-3">
                            <span className="text-sm dark:text-gray-200 min-w-0 truncate" title={row.title}>
                              <span className="font-medium">{row.itemId}</span>
                              <span className="text-gray-500 dark:text-gray-400"> — {row.title}</span>
                            </span>
                            <div className="flex gap-4 shrink-0">
                              {envPlatforms.filter((p) => p in row.cells).map((platformId) => (
                                <label key={platformId} className="flex items-center gap-1.5 text-sm cursor-pointer dark:text-gray-300">
                                  <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded"
                                    checked={!!envSelections[cellKey(row.itemId, platformId)]}
                                    onChange={() => setEnvSelections(toggleCell(envSelections, row.itemId, platformId))}
                                  />
                                  {availablePlatforms().find((ap) => ap.id === platformId)?.label || platformId}
                                  <span className="text-gray-500 dark:text-gray-400">({row.cells[platformId]})</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      {envMatrix.noOfferCount > 0 && (
                        <p className="p-2 px-3 text-xs text-gray-500 dark:text-gray-400 border-t dark:border-gray-600">
                          {envMatrix.noOfferCount} of your scoped items have no platform checks for
                          these platforms. Their community procedures attach as usual.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-4">
                  {/* Card 1: community-contributed procedures (default ON) */}
                  <div className={`border rounded-lg p-4 ${useBankProcedures ? 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700' : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-600'}`}>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useBankProcedures}
                        onChange={(e) => setUseBankProcedures(e.target.checked)}
                        className="w-5 h-5 rounded mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <BookOpen size={18} className="text-green-700" />
                          <span className="font-medium text-green-900 dark:text-green-200">Use community test procedures (recommended)</span>
                        </div>
                        <p className="text-sm text-green-800 dark:text-green-300 mt-1">
                          Start from expert procedures contributed by the CSF Profile community —
                          step-by-step tests, pass/fail criteria, interview questions, and evidence
                          requests. Instant, offline, and fully editable after creation.
                        </p>
                        <p className="text-sm font-medium mt-2 text-green-900 dark:text-green-200">
                          {scopeCoverage.covered.length} of {selectedScopeItems.size} selected items have community procedures
                        </p>
                        {envPlatforms.length > 0 && (
                          <p className="text-sm text-green-800 dark:text-green-300 mt-1">
                            {envAttachedCount} platform {envAttachedCount === 1 ? 'check' : 'checks'} from
                            the Environment step {envAttachedCount === 1 ? 'attaches' : 'attach'} as
                            addenda ({envMatrix.totalAvailable} available).
                          </p>
                        )}
                        {scopeCoverage.uncovered.length > 0 && (
                          <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                            {newAssessment.scopeType === 'controls'
                              ? 'Community procedures cover CSF subcategories, so control-scope items have no bank match — generate with AI below or write your own after creation.'
                              : `${scopeCoverage.uncovered.length} selected item(s) have no community procedure yet — generate with AI below or write your own after creation.`}
                          </p>
                        )}
                      </div>
                    </label>
                    {useBankProcedures && scopeCoverage.covered.length > 0 && (
                      <div className="mt-3 ml-8">
                        <button
                          type="button"
                          onClick={() => setShowBankPreview(!showBankPreview)}
                          className="text-sm text-green-700 dark:text-green-400 underline"
                        >
                          {showBankPreview ? 'Hide preview' : `Preview procedures (${scopeCoverage.covered.length})`}
                        </button>
                        {showBankPreview && (
                          <div className="max-h-56 overflow-y-auto space-y-2 mt-2">
                            {scopeCoverage.covered.map((id) => {
                              const entry = getBankProcedure(id);
                              // Preview through the same producer the create
                              // path uses (in its untailored form), so the
                              // previewed trunk text cannot diverge from what
                              // attaches.
                              const previewText = bankAttachObservation(entry).testProcedures;
                              return (
                                <details key={id} className="p-2 bg-white dark:bg-gray-700 rounded border text-sm">
                                  <summary className="cursor-pointer font-medium">{id} — {entry.title}</summary>
                                  <pre className="whitespace-pre-wrap text-xs text-gray-600 dark:text-gray-300 mt-2 max-h-40 overflow-y-auto">
                                    {previewText.slice(0, 1500)}{previewText.length > 1500 ? '\n…(full procedure attaches on create)' : ''}
                                  </pre>
                                  {attachedCountForItem(envMatrix, envSelections, id) > 0 && (
                                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                                      + {attachedCountForItem(envMatrix, envSelections, id)} platform
                                      {attachedCountForItem(envMatrix, envSelections, id) === 1 ? ' check attaches' : ' checks attach'} as
                                      addenda (not shown in this preview).
                                    </p>
                                  )}
                                </details>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card 2: tailor to the organization (optional, needs profile) */}
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Settings size={20} className="text-amber-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-amber-900 dark:text-amber-200">Tailor to your organization (optional)</h4>
                        {hasOrgProfile ? (
                          <>
                            <label className="flex items-center gap-2 mt-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={tailorWithProfile}
                                onChange={(e) => setTailorWithProfile(e.target.checked)}
                                className="w-4 h-4 rounded"
                                disabled={!useBankProcedures}
                              />
                              <span className="text-sm text-amber-900 dark:text-amber-200">
                                Substitute my organization's name into attached procedures
                              </span>
                            </label>
                            <label className="flex items-start gap-2 mt-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={adaptStackRefs}
                                onChange={(e) => setAdaptStackRefs(e.target.checked)}
                                className="w-4 h-4 rounded mt-0.5"
                                disabled={!useBankProcedures || stackPlan.length === 0}
                              />
                              <span className="text-sm text-amber-900 dark:text-amber-200">
                                Adapt tool &amp; platform references to my environment (no AI)
                              </span>
                            </label>
                            {stackPlan.length > 0 ? (
                              <ul className="text-xs text-amber-700 dark:text-amber-400 mt-1 ml-6 list-disc space-y-0.5">
                                {stackPlan.map((line) => <li key={line}>{line}</li>)}
                              </ul>
                            ) : (
                              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 ml-6">
                                No swaps apply yet — the community procedures are written against an
                                AWS + SentinelOne + O365 + Slack stack. Select a different cloud
                                (Google Cloud, Azure, on-premises) or name your EDR / email / chat
                                platform in the profile to enable canned substitutions.
                              </p>
                            )}
                            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                              Uses your saved profile{orgProfile?.orgName ? ` (${orgProfile.orgName})` : ''} —{' '}
                              <button type="button" className="underline" onClick={() => setShowProfileWizard(true)}>edit</button>.
                              Both options also work per-requirement after creation ("Adapt to my environment").
                              {!useBankProcedures && ' (Enable community procedures above to tailor them.)'}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                              Answer a few optional questions (business type, size, systems, security
                              tools, crown jewels) and procedures adapt to your environment. Skippable —
                              you can set this up any time.
                            </p>
                            <button
                              type="button"
                              onClick={() => setShowProfileWizard(true)}
                              className="mt-2 px-3 py-1.5 text-sm border border-amber-400 text-amber-800 dark:text-amber-300 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40"
                            >
                              Set up org profile (~2 min)
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card 3: AI generation — optional, targets the gaps */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Bot size={24} className="text-purple-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-purple-900 dark:text-purple-200">Generate with AI (Experimental, optional)</h4>
                        <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                          {useBankProcedures
                            ? 'AI drafts procedures for items the community bank does not cover.'
                            : 'AI drafts procedures from scratch for every selected item.'}
                          {' '}Each item is one model round-trip, so larger batches take time — progress is shown and you can cancel.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg mt-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${llmProvider === 'ollama' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                          {llmProvider === 'ollama' ? 'Ollama' : 'Claude'}
                        </span>
                        {isAIReady ? (
                          <span className="text-green-600 text-sm flex items-center gap-1">
                            <CheckCircle size={14} /> Ready
                          </span>
                        ) : (
                          <span className="text-red-600 text-sm flex items-center gap-1">
                            <XCircle size={14} /> Not Ready
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        {aiTargetIds.length} of {selectedScopeItems.size} selected items targeted
                      </p>
                    </div>

                    <label className="flex items-center gap-3 p-4 border dark:border-gray-600 rounded-lg cursor-pointer hover:bg-white/40 mt-3">
                      <input
                        type="checkbox"
                        checked={generateTestProcedures}
                        onChange={(e) => setGenerateTestProcedures(e.target.checked)}
                        className="w-5 h-5 rounded"
                        disabled={!isAIReady || aiTargetIds.length === 0}
                      />
                      <div>
                        <span className="font-medium dark:text-white">Generate test procedures</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {aiTargetIds.length === 0
                            ? 'Every selected item is covered by community procedures — nothing for AI to generate.'
                            : `AI will create test procedures for all ${aiTargetIds.length} targeted item(s) — no cap.`}
                        </p>
                      </div>
                    </label>

                    {generateTestProcedures && (
                      <div className="mt-3 space-y-2">
                        <button
                          onClick={handleGenerateTestProcedures}
                          disabled={isGeneratingProcedures || !isAIReady}
                          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                        >
                          {isGeneratingProcedures ? (
                            <>
                              <Loader2 className="animate-spin" size={18} />
                              Generating {generationProgress.done} of {generationProgress.total}...
                            </>
                          ) : (
                            <>
                              <Sparkles size={18} />
                              Generate Now
                            </>
                          )}
                        </button>
                        {isGeneratingProcedures && (
                          <>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full transition-all"
                                style={{ width: `${generationProgress.total ? Math.round((generationProgress.done / generationProgress.total) * 100) : 0}%` }}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => { cancelGenerationRef.current = true; }}
                              className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg text-sm"
                            >
                              Cancel — keep what's generated so far
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {Object.keys(generatedProcedures).length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700">Generated Procedures ({Object.keys(generatedProcedures).length})</h4>
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {Object.entries(generatedProcedures).map(([id, proc]) => (
                          <div key={id} className="p-3 bg-gray-50 rounded border">
                            <p className="font-medium text-sm">{id}</p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{proc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Users in scope (issue #290) */}
              {wizardStep === 4 && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <User size={24} className="text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-900">Users (Optional)</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Add the people in scope for this assessment. Each person gets a role:
                          auditor (performs the evaluations), control owner (owns the controls
                          being assessed), or stakeholder (reviews the results). They are added
                          to the user directory and can be assigned as auditors on evaluations.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Add user row */}
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto] gap-2 items-end">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        className="mt-1 w-full p-2 border rounded"
                        placeholder="e.g., Jane Alvarez"
                        value={newUserRow.name}
                        onChange={(e) => setNewUserRow(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email address</label>
                      <input
                        type="email"
                        className="mt-1 w-full p-2 border rounded"
                        placeholder="e.g., jane@example.com"
                        value={newUserRow.email}
                        onChange={(e) => setNewUserRow(prev => ({ ...prev, email: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddWizardUser(); } }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Role</label>
                      <select
                        className="mt-1 p-2 border rounded"
                        value={newUserRow.role}
                        onChange={(e) => setNewUserRow(prev => ({ ...prev, role: e.target.value }))}
                      >
                        <option value="auditor">Auditor</option>
                        <option value="control owner">Control Owner</option>
                        <option value="stakeholder">Stakeholder</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-1"
                      onClick={handleAddWizardUser}
                    >
                      <Plus size={16} />
                      Add
                    </button>
                  </div>

                  {/* Added users list */}
                  {wizardUsers.length > 0 ? (
                    <div className="space-y-2">
                      {wizardUsers.map(u => (
                        <div key={u.email} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2 min-w-0">
                            <User size={16} className="text-gray-400 flex-shrink-0" />
                            <span className="text-sm font-medium truncate">{u.name}</span>
                            <span className="text-xs text-gray-500 truncate">{u.email}</span>
                            <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700 capitalize flex-shrink-0">
                              {u.role}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveWizardUser(u.email)}
                            className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                            aria-label={`Remove ${u.name}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No users added yet. You can skip this step and manage users later from the Users page.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer navigation */}
            <div className="p-4 border-t flex justify-between">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => {
                  if (wizardStep === 1) {
                    setShowNewModal(false);
                    resetWizard();
                  } else {
                    setWizardStep(prev => prev - 1);
                  }
                }}
              >
                {wizardStep === 1 ? 'Cancel' : 'Back'}
              </button>

              <div className="flex gap-2">
                {wizardStep < 4 && (
                  <button
                    className="px-4 py-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setWizardStep(prev => prev + 1)}
                  >
                    Skip
                  </button>
                )}
                {wizardStep < 4 ? (
                  <button
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded disabled:bg-gray-300"
                    onClick={() => {
                      if (wizardStep === 1) {
                        if (!newAssessment.name) {
                          toast.error('Assessment name is required');
                          return;
                        }
                        if (selectedScopeItems.size === 0) {
                          toast.error('Please select at least one item for the assessment scope');
                          return;
                        }
                      }
                      setWizardStep(prev => prev + 1);
                    }}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-2"
                    onClick={handleCreateAssessment}
                  >
                    <CheckCircle size={16} />
                    Create Assessment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showProfileWizard && (
        <OrgProfileWizard onClose={() => setShowProfileWizard(false)} />
      )}
    </div>
  );
};

export default Assessments;
