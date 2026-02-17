import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  Plus, Edit, Save, Trash2, X, CheckCircle, XCircle,
  Download, Upload, ClipboardList, FileSearch, ChevronRight, Copy,
  FileUp, FileText, Loader2, Bot, Sparkles, User, Settings
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

// Components
import FrameworkBadge from '../components/FrameworkBadge';
import UserSelector from '../components/UserSelector';
import ArtifactSelector from '../components/ArtifactSelector';
import FindingSelector from '../components/FindingSelector';
import SortableHeader from '../components/SortableHeader';
import ExportPasswordDialog from '../components/ExportPasswordDialog';

// Stores
import useAssessmentsStore from '../stores/assessmentsStore';
import useControlsStore from '../stores/controlsStore';
import useRequirementsStore from '../stores/requirementsStore';
import useFrameworksStore from '../stores/frameworksStore';
import useUserStore from '../stores/userStore';
import useAIStore from '../stores/aiStore';

// File upload security configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.txt', '.md', '.csv', '.pdf', '.docx'];
const ALLOWED_MIME_TYPES = [
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Sanitize filename to prevent path traversal and injection
const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 255);
};

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

const Assessments = () => {
  // Store state
  const assessments = useAssessmentsStore((state) => state.assessments);
  const currentAssessmentId = useAssessmentsStore((state) => state.currentAssessmentId);
  const setCurrentAssessmentId = useAssessmentsStore((state) => state.setCurrentAssessmentId);
  const createAssessment = useAssessmentsStore((state) => state.createAssessment);
  const deleteAssessment = useAssessmentsStore((state) => state.deleteAssessment);
  const getObservation = useAssessmentsStore((state) => state.getObservation);
  const updateObservation = useAssessmentsStore((state) => state.updateObservation);
  const updateQuarterlyObservation = useAssessmentsStore((state) => state.updateQuarterlyObservation);
  const addToScope = useAssessmentsStore((state) => state.addToScope);
  const removeFromScope = useAssessmentsStore((state) => state.removeFromScope);
  const bulkAddToScope = useAssessmentsStore((state) => state.bulkAddToScope);
  const getAssessmentProgress = useAssessmentsStore((state) => state.getAssessmentProgress);
  const exportAssessmentCSV = useAssessmentsStore((state) => state.exportAssessmentCSV);
  const importAssessmentsCSV = useAssessmentsStore((state) => state.importAssessmentsCSV);
  const exportAllAssessmentsCSV = useAssessmentsStore((state) => state.exportAllAssessmentsCSV);
  const cloneAssessment = useAssessmentsStore((state) => state.cloneAssessment);

  const controls = useControlsStore((state) => state.controls);
  const getControl = useControlsStore((state) => state.getControl);

  const requirements = useRequirementsStore((state) => state.requirements);
  const getRequirement = useRequirementsStore((state) => state.getRequirement);

  const frameworks = useFrameworksStore((state) => state.frameworks);
  const getEnabledFrameworks = useFrameworksStore((state) => state.getEnabledFrameworks);

  // AI Store for test procedure generation
  const { llmProvider, generateWithOllama, generateWithClaude, ollamaStatus, claudeApiKey, checkOllama } = useAIStore();

  // Local state
  const [view, setView] = useState('list'); // 'list', 'scope', 'assess'
  const [editMode, setEditMode] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedQuarter, setSelectedQuarter] = useState('Q1'); // Q1, Q2, Q3, Q4

  // Export (optional password protection)
  const [showExportPasswordDialog, setShowExportPasswordDialog] = useState(false);
  const [showSingleExportPasswordDialog, setShowSingleExportPasswordDialog] = useState(false);

  // New assessment wizard state
  const [showNewModal, setShowNewModal] = useState(false);
  const [wizardStep, setWizardStep] = useState(1); // 1: Basic + Scope, 2: Test Procedures, 3: Evidence Upload
  const [newAssessment, setNewAssessment] = useState({
    name: '',
    description: '',
    scopeType: 'requirements',
    frameworkFilter: ''
  });
  const [selectedScopeItems, setSelectedScopeItems] = useState(new Set()); // Selected controls/requirements
  const [scopeFilterText, setScopeFilterText] = useState('');
  const [generateTestProcedures, setGenerateTestProcedures] = useState(false);
  const [isGeneratingProcedures, setIsGeneratingProcedures] = useState(false);
  const [generatedProcedures, setGeneratedProcedures] = useState({});
  const [uploadedEvidence, setUploadedEvidence] = useState([]);
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [isAnalyzingEvidence, setIsAnalyzingEvidence] = useState(false);
  const [evidenceAnalysis, setEvidenceAnalysis] = useState(null);

  // Check Ollama status on mount
  React.useEffect(() => {
    if (llmProvider === 'ollama') {
      checkOllama();
    }
  }, [llmProvider, checkOllama]);

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

  // Get available items for scope selection
  const availableItems = useMemo(() => {
    if (!currentAssessment) return [];

    const scopeIds = currentAssessment.scopeIds || [];

    let items = [];

    if (currentAssessment.scopeType === 'controls') {
      items = controls.filter(c => !scopeIds.includes(c.controlId));
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

  // Helper functions
  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'Complete': return 'text-green-600 bg-green-100 dark:bg-green-600 dark:text-white';
      case 'In Progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-600 dark:text-white';
      case 'Submitted': return 'text-orange-600 bg-orange-100 dark:bg-orange-600 dark:text-white';
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  }, []);

  const enabledFrameworks = useMemo(() => getEnabledFrameworks(), [frameworks]);

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
      let reqs = requirements;
      if (newAssessment.frameworkFilter) {
        reqs = reqs.filter(r => r.frameworkId === newAssessment.frameworkFilter);
      }
      items = reqs.map(r => ({
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
  }, [newAssessment.scopeType, newAssessment.frameworkFilter, controls, requirements, scopeFilterText]);

  // Wizard helper: check if AI is ready
  const isAIReady = llmProvider === 'ollama'
    ? ollamaStatus.available && ollamaStatus.hasModel
    : !!claudeApiKey;

  // Generate test procedures for selected scope items
  const handleGenerateTestProcedures = useCallback(async () => {
    if (selectedScopeItems.size === 0) {
      toast.error('Please select items in scope first');
      return;
    }

    setIsGeneratingProcedures(true);
    const procedures = { ...generatedProcedures };

    // Get selected items (limit to first 10 for performance)
    const selectedIds = Array.from(selectedScopeItems).slice(0, 10);

    for (const itemId of selectedIds) {
      // Skip if already generated
      if (procedures[itemId]) continue;

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
        procedures[itemId] = `Error generating: ${error.message}`;
      }
    }

    setGeneratedProcedures(procedures);
    setIsGeneratingProcedures(false);
    toast.success(`Generated procedures for ${Object.keys(procedures).length} items`);
  }, [selectedScopeItems, generatedProcedures, newAssessment.scopeType, controls, requirements, llmProvider, generateWithOllama, generateWithClaude]);

  // Extract text from uploaded file
  const extractTextFromFile = async (file) => {
    if (file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
      return await file.text();
    }
    return `[Content from ${file.name} - PDF/DOCX extraction requires additional setup. Please use TXT or MD files.]`;
  };

  // Handle evidence file upload with validation
  const handleEvidenceUpload = useCallback(async (files) => {
    const newDocs = [];
    for (const file of files) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File "${file.name}" exceeds 10MB limit`);
        continue;
      }

      // Validate file extension
      const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
      if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
        toast.error(`File "${file.name}" has unsupported type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
        continue;
      }

      // Validate MIME type (additional check)
      if (file.type && !ALLOWED_MIME_TYPES.includes(file.type) && file.type !== '') {
        console.warn(`File "${file.name}" has unexpected MIME type: ${file.type}`);
      }

      // Sanitize filename
      const safeName = sanitizeFilename(file.name);

      const text = await extractTextFromFile(file);
      newDocs.push({
        id: uuidv4(),
        name: safeName,
        originalName: file.name,
        type: file.type,
        size: file.size,
        text: text,
        status: 'ready'
      });
    }
    setUploadedEvidence(prev => [...prev, ...newDocs]);
  }, []);

  // Analyze evidence documents
  const handleAnalyzeEvidence = useCallback(async () => {
    if (uploadedEvidence.length === 0 && !evidenceNotes.trim()) {
      toast.error('Please upload documents or add notes first.');
      return;
    }

    setIsAnalyzingEvidence(true);
    setEvidenceAnalysis(null);

    const allText = uploadedEvidence.map(d =>
      `=== ${d.name} ===\n${d.text}`
    ).join('\n\n') + (evidenceNotes ? `\n\n=== User Notes ===\n${evidenceNotes}` : '');

    const prompt = `Analyze these organizational documents to pre-populate a NIST CSF 2.0 assessment.

DOCUMENTS PROVIDED:
${allText.substring(0, 8000)}

Identify evidence for CSF 2.0 controls. Respond in JSON format:
{
  "findings": [
    {"controlId": "GV.PO-01", "score": "yes", "confidence": 0.85, "evidence": "Brief description", "quote": "Relevant quote"}
  ],
  "coverage": {"GOVERN": 45, "IDENTIFY": 30, "PROTECT": 60, "DETECT": 20, "RESPOND": 55, "RECOVER": 15},
  "gaps": ["Major gaps identified"],
  "recommendations": ["Key recommendations"]
}

Use scores: "yes" (complete evidence), "partial" (incomplete), "planned" (intentions), "no" (none found).`;

    try {
      let response;
      if (llmProvider === 'ollama') {
        response = await generateWithOllama(prompt, 3000);
      } else {
        response = await generateWithClaude(prompt, 3000);
      }

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setEvidenceAnalysis(JSON.parse(jsonMatch[0]));
      } else {
        setEvidenceAnalysis({ raw: response, error: 'Could not parse JSON' });
      }
    } catch (error) {
      setEvidenceAnalysis({ error: error.message });
    }

    setIsAnalyzingEvidence(false);
  }, [uploadedEvidence, evidenceNotes, llmProvider, generateWithOllama, generateWithClaude]);

  // Reset wizard state
  const resetWizard = useCallback(() => {
    setWizardStep(1);
    setNewAssessment({ name: '', description: '', scopeType: 'requirements', frameworkFilter: '' });
    setSelectedScopeItems(new Set());
    setScopeFilterText('');
    setGenerateTestProcedures(false);
    setIsGeneratingProcedures(false);
    setGeneratedProcedures({});
    setUploadedEvidence([]);
    setEvidenceNotes('');
    setIsAnalyzingEvidence(false);
    setEvidenceAnalysis(null);
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

    const created = createAssessment(newAssessment);

    // Add selected items to scope
    for (const itemId of selectedScopeItems) {
      addToScope(created.id, itemId);

      // Apply generated test procedure if available
      if (generatedProcedures[itemId]) {
        updateObservation(created.id, itemId, { testProcedures: generatedProcedures[itemId] });
      }
    }

    // Apply evidence analysis findings (for items already in scope)
    if (evidenceAnalysis?.findings) {
      for (const finding of evidenceAnalysis.findings) {
        if (selectedScopeItems.has(finding.controlId)) {
          const existingObs = getObservation(created.id, finding.controlId);
          const existingProcedures = existingObs?.testProcedures || '';
          updateObservation(created.id, finding.controlId, {
            testProcedures: existingProcedures + `\n\nEvidence: ${finding.evidence}\nQuote: "${finding.quote}"`,
          });
        }
      }
    }

    setShowNewModal(false);
    resetWizard();
    setCurrentAssessmentId(created.id);
    setView('scope');
    toast.success(`Assessment "${created.name}" created with ${selectedScopeItems.size} items`);
  }, [newAssessment, createAssessment, selectedScopeItems, generatedProcedures, evidenceAnalysis, addToScope, updateObservation, getObservation, setCurrentAssessmentId, resetWizard]);

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
      toast.error(`Export failed: ${err.message}`);
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
      toast.error(`Import failed: ${err.message}`);
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
      toast.error(`Export failed: ${err.message}`);
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
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <ClipboardList size={48} className="mb-4 opacity-50" />
            <p className="text-lg">No assessments yet</p>
            <p className="text-sm mt-2">Click "New Assessment" to create one or "Import" to import from CSV</p>
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
                          className={`${getStatusColor(assessment.status)} px-2 py-0.5 rounded hover:opacity-80 transition-opacity`}
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
                        className="p-2 hover:bg-gray-100 rounded"
                        onClick={() => handleCloneAssessment(assessment.id)}
                        title="Clone assessment"
                      >
                        <Copy size={16} className="text-gray-500" />
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
                        className={`h-full transition-all duration-300 ${
                          prog.percentage === 100 ? 'bg-green-500' :
                          prog.percentage >= 75 ? 'bg-emerald-500' :
                          prog.percentage >= 50 ? 'bg-blue-500' :
                          prog.percentage >= 25 ? 'bg-amber-500' :
                          'bg-red-400'
                        }`}
                        style={{ width: `${prog.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className={`text-xs font-medium ${
                        prog.percentage === 100 ? 'text-green-600 dark:text-green-400' :
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
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg"
                onClick={handleAddAllInScope}
              >
                <CheckCircle size={16} />
                Add All In-Scope
              </button>
            )}
            <button
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg"
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
          <div className="p-3 bg-gray-50 border-b sticky top-0">
            <h3 className="font-medium">Scoped Items ({scopedItems.length})</h3>
          </div>
          {scopedItems.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No items in scope</p>
              <p className="text-sm mt-1">Add items from the right panel</p>
            </div>
          ) : (
            <div className="divide-y">
              {scopedItems.map(item => {
                const obs = currentAssessment ? currentAssessment.observations?.[item.itemId] : null;
                return (
                  <div
                    key={item.itemId}
                    className={`p-3 flex items-center justify-between hover:bg-blue-50 cursor-pointer ${
                      selectedItemId === item.itemId ? 'bg-blue-100' : ''
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
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(obs.testingStatus)}`}>
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
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
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

  // Get status badge style (Jira-style)
  const getJiraStatusStyle = (status) => {
    switch (status) {
      case 'Complete':
        return 'bg-green-100 text-green-700 dark:bg-green-600 dark:text-white';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white';
      case 'Submitted':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-600 dark:text-white';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Get score badge style
  const getScoreBadgeStyle = (score) => {
    if (!score || score === 0) return 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300';
    if (score >= 8) return 'bg-green-100 text-green-700 dark:bg-green-600 dark:text-white';
    if (score >= 5) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-600 dark:text-white';
    return 'bg-red-100 text-red-700 dark:bg-red-600 dark:text-white';
  };

  // Render assessment view - Jira-style: full table, then two-column detail on click
  const renderAssessView = () => {
    const currentItem = scopedItems.find(i => i.itemId === selectedItemId);
    const currentIndex = scopedItems.findIndex(i => i.itemId === selectedItemId);

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
              <span className="text-blue-600 dark:text-blue-400 font-medium">EVAL-{String(currentIndex + 1).padStart(2, '0')}</span>
              <span className="flex items-center gap-1">
                <button
                  onClick={() => {
                    const prevIndex = currentIndex - 1;
                    if (prevIndex >= 0) setSelectedItemId(scopedItems[prevIndex].itemId);
                  }}
                  disabled={currentIndex === 0}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30"
                >
                  <ChevronRight size={14} className="rotate-180" />
                </button>
                <button
                  onClick={() => {
                    const nextIndex = currentIndex + 1;
                    if (nextIndex < scopedItems.length) setSelectedItemId(scopedItems[nextIndex].itemId);
                  }}
                  disabled={currentIndex === scopedItems.length - 1}
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
                  <span className={`inline-flex items-center px-3 py-1.5 rounded text-sm font-medium ${getJiraStatusStyle(currentObservation.quarters?.[selectedQuarter]?.testingStatus || 'Not Started')}`}>
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
                    <label className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Test Procedures</label>
                    {editMode ? (
                      <textarea
                        value={currentObservation.testProcedures || ''}
                        onChange={(e) => handleObservationChange('testProcedures', e.target.value)}
                        className="w-full p-3 text-sm border dark:border-gray-600 rounded-lg h-32 bg-white dark:bg-gray-700 dark:text-white"
                        placeholder="Document test procedures..."
                      />
                    ) : (
                      <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300">
                        <ReactMarkdown>{formatTestProcedures(currentObservation.testProcedures) || 'No test procedures defined'}</ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {/* Artifacts */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm text-gray-500 dark:text-gray-400">Artifacts</label>
                      {!editMode && <span className="text-sm text-blue-600 dark:text-blue-400 cursor-pointer">Add URL</span>}
                    </div>
                    <ArtifactSelector
                      selectedArtifacts={currentObservation.linkedArtifacts || []}
                      onChange={(artifacts) => handleObservationChange('linkedArtifacts', artifacts)}
                      disabled={!editMode}
                    />
                  </div>

                  {/* Findings */}
                  <div className="mb-4">
                    <FindingSelector
                      label="Findings"
                      selectedFindings={currentObservation.linkedFindings || []}
                      onChange={(findings) => handleObservationChange('linkedFindings', findings)}
                      disabled={!editMode}
                    />
                  </div>

                  {/* Linked work items placeholder */}
                  <div className="mb-4">
                    <label className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Linked work items</label>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Add linked work item</p>
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
                  {/* Assignee */}
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Assignee</span>
                    <div className="text-right">
                      <UserSelector
                        selectedUsers={currentObservation.auditorId}
                        onChange={(userId) => handleObservationChange('auditorId', userId)}
                        disabled={!editMode}
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
                            className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                              selectedQuarter === q
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
                      <select
                        value={currentObservation.quarters?.[selectedQuarter]?.targetScore || 0}
                        onChange={(e) => handleQuarterlyChange('targetScore', Number(e.target.value))}
                        className="w-16 p-1 text-sm border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white"
                      >
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
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
                      <select
                        value={currentObservation.quarters?.[selectedQuarter]?.actualScore || 0}
                        onChange={(e) => handleQuarterlyChange('actualScore', Number(e.target.value))}
                        className="w-16 p-1 text-sm border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white"
                      >
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
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
                      <div className="text-sm text-gray-700 dark:text-gray-300 max-h-48 overflow-auto">
                        {currentObservation.quarters?.[selectedQuarter]?.observations || 'None'}
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
                <p className="text-xs text-gray-500 dark:text-gray-400">{scopedItems.length} evaluations</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Quarter selector */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
                  <button
                    key={q}
                    onClick={() => setSelectedQuarter(q)}
                    className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                      selectedQuarter === q
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
              <div className="w-28 flex-shrink-0">Assignee</div>
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
            {scopedItems.map((item, index) => {
              const obs = currentAssessment?.observations?.[item.itemId];
              const quarterData = obs?.quarters?.[selectedQuarter] || {};
              const auditor = obs?.auditorId ? useUserStore.getState().getUser(obs.auditorId) : null;

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
                        EVAL-{String(index + 1).padStart(2, '0')}
                      </span>
                      <p className="text-sm text-gray-900 dark:text-white truncate">
                        {item.type === 'control' ? item.controlId : item.subcategoryId || item.id}
                      </p>
                    </div>
                  </div>

                  {/* Assignee column */}
                  <div className="w-28 flex-shrink-0 flex items-center">
                    {auditor ? (
                      <div className="flex items-center gap-1.5" title={auditor.name}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                          ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'][
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
                      {quarterData.observations ? quarterData.observations.substring(0, 50) + '...' : '-'}
                    </p>
                  </div>

                  {/* Status column */}
                  <div className="w-24 flex-shrink-0">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase ${getJiraStatusStyle(quarterData.testingStatus || obs?.testingStatus || 'Not Started')}`}>
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
              <span>{scopedItems.length} of {scopedItems.length}</span>
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
                  { num: 2, label: 'Test Procedures' },
                  { num: 3, label: 'Evidence' }
                ].map((step, idx) => (
                  <React.Fragment key={step.num}>
                    <div className={`flex items-center gap-2 ${wizardStep === step.num ? 'text-blue-600' : wizardStep > step.num ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                        wizardStep === step.num ? 'border-blue-600 bg-blue-50' :
                        wizardStep > step.num ? 'border-green-600 bg-green-50' : 'border-gray-300'
                      }`}>
                        {wizardStep > step.num ? <CheckCircle size={16} /> : step.num}
                      </div>
                      <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
                    </div>
                    {idx < 2 && <div className={`w-8 h-0.5 ${wizardStep > step.num ? 'bg-green-600' : 'bg-gray-300'}`} />}
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
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      className="mt-1 w-full p-2 border rounded h-20"
                      placeholder="Optional description..."
                      value={newAssessment.description}
                      onChange={(e) => setNewAssessment(prev => ({ ...prev, description: e.target.value }))}
                    />
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
                          onChange={(e) => setNewAssessment(prev => ({ ...prev, scopeType: e.target.value }))}
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
                          onChange={(e) => setNewAssessment(prev => ({ ...prev, scopeType: e.target.value }))}
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
                      <label className="block text-sm font-medium text-gray-700">Framework Filter</label>
                      <select
                        className="mt-1 w-full p-2 border rounded"
                        value={newAssessment.frameworkFilter}
                        onChange={(e) => {
                          setNewAssessment(prev => ({ ...prev, frameworkFilter: e.target.value }));
                          setSelectedScopeItems(new Set()); // Reset selection when framework changes
                        }}
                      >
                        <option value="">All Frameworks</option>
                        {enabledFrameworks.map(fw => (
                          <option key={fw.id} value={fw.id}>{fw.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Scope Item Selection */}
                  {(newAssessment.scopeType === 'controls' || newAssessment.frameworkFilter) && (
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
                            }}
                          >
                            Select All
                          </button>
                          <button
                            type="button"
                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            onClick={() => setSelectedScopeItems(new Set())}
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {wizardScopeItems.length === 0 ? (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            No items available. {newAssessment.scopeType === 'controls' ? 'Add controls in the Controls tab.' : 'Select a framework above.'}
                          </div>
                        ) : (
                          <div className="divide-y">
                            {wizardScopeItems.slice(0, 100).map(item => (
                              <label
                                key={item.id}
                                className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-50 ${
                                  selectedScopeItems.has(item.id) ? 'bg-blue-50' : ''
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
                  )}
                </div>
              )}

              {/* Step 2: Test Procedure Generation */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Bot size={24} className="text-purple-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-purple-900">AI-Generated Test Procedures</h4>
                        <p className="text-sm text-purple-700 mt-1">
                          Optionally generate test procedures for your selected scope using AI.
                          You can refine these after the assessment is created.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                    <p className="text-sm text-blue-600 font-medium">
                      {selectedScopeItems.size} items selected
                    </p>
                  </div>

                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={generateTestProcedures}
                      onChange={(e) => setGenerateTestProcedures(e.target.checked)}
                      className="w-5 h-5 rounded"
                      disabled={!isAIReady || selectedScopeItems.size === 0}
                    />
                    <div>
                      <span className="font-medium">Generate test procedures</span>
                      <p className="text-sm text-gray-500">
                        AI will create test procedures for {Math.min(selectedScopeItems.size, 10)} of {selectedScopeItems.size} selected items
                      </p>
                    </div>
                  </label>

                  {generateTestProcedures && (
                    <button
                      onClick={handleGenerateTestProcedures}
                      disabled={isGeneratingProcedures || !isAIReady}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                    >
                      {isGeneratingProcedures ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          Generating Procedures...
                        </>
                      ) : (
                        <>
                          <Sparkles size={18} />
                          Generate Now
                        </>
                      )}
                    </button>
                  )}

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

              {/* Step 3: Evidence Upload */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <FileUp size={24} className="text-orange-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-orange-900">Evidence Upload (Optional)</h4>
                        <p className="text-sm text-orange-700 mt-1">
                          Upload documents to give your assessment a head start. AI will analyze them to identify existing controls and evidence.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                  </div>

                  {/* File drop zone */}
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-orange-400 transition-colors"
                    onClick={() => document.getElementById('wizardFileInput')?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleEvidenceUpload(Array.from(e.dataTransfer.files));
                    }}
                  >
                    <input
                      id="wizardFileInput"
                      type="file"
                      multiple
                      hidden
                      accept=".txt,.md,.pdf,.docx"
                      onChange={(e) => handleEvidenceUpload(Array.from(e.target.files))}
                    />
                    <Upload size={32} className="mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-600">Drop files here or click to upload</p>
                    <p className="text-xs text-gray-400 mt-1">TXT, MD supported (PDF/DOCX coming soon)</p>
                  </div>

                  {/* Uploaded files list */}
                  {uploadedEvidence.length > 0 && (
                    <div className="space-y-2">
                      {uploadedEvidence.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <FileText size={16} className="text-gray-400" />
                            <span className="text-sm">{doc.name}</span>
                            <span className="text-xs text-gray-400">({(doc.size / 1024).toFixed(1)} KB)</span>
                          </div>
                          <button
                            onClick={() => setUploadedEvidence(prev => prev.filter(d => d.id !== doc.id))}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                    <textarea
                      value={evidenceNotes}
                      onChange={e => setEvidenceNotes(e.target.value)}
                      placeholder="Add context about your security program..."
                      className="w-full h-24 px-3 py-2 border rounded-lg text-sm resize-none"
                    />
                  </div>

                  {/* Analyze button */}
                  {(uploadedEvidence.length > 0 || evidenceNotes.trim()) && (
                    <button
                      onClick={handleAnalyzeEvidence}
                      disabled={isAnalyzingEvidence || !isAIReady}
                      className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                    >
                      {isAnalyzingEvidence ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          Analyzing Evidence...
                        </>
                      ) : (
                        <>
                          <Sparkles size={18} />
                          Analyze Evidence
                        </>
                      )}
                    </button>
                  )}

                  {/* Analysis results */}
                  {evidenceAnalysis && !evidenceAnalysis.error && (
                    <div className="space-y-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-900 flex items-center gap-2">
                        <CheckCircle size={16} />
                        Analysis Complete
                      </h4>
                      {evidenceAnalysis.findings && (
                        <p className="text-sm text-green-700">
                          Found evidence for {evidenceAnalysis.findings.length} controls
                        </p>
                      )}
                      {evidenceAnalysis.gaps && evidenceAnalysis.gaps.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-700">Gaps identified:</p>
                          <ul className="text-xs text-gray-600 list-disc list-inside">
                            {evidenceAnalysis.gaps.slice(0, 3).map((gap, i) => (
                              <li key={i}>{gap}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {evidenceAnalysis?.error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm">{evidenceAnalysis.error}</p>
                    </div>
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
                {wizardStep < 3 && (
                  <button
                    className="px-4 py-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setWizardStep(prev => prev + 1)}
                  >
                    Skip
                  </button>
                )}
                {wizardStep < 3 ? (
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
    </div>
  );
};

export default Assessments;
