import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useAIStore from '../stores/aiStore';
import useRequirementsStore from '../stores/requirementsStore';
import { CheckSquare, ChevronDown, ChevronRight, Copy, ArrowLeft, Loader2 } from 'lucide-react';

// SP 800-53 Control Mappings for CSF 2.0 subcategories
const CONTROL_MAPPINGS = {
  // GOVERN (GV)
  "GV.OC-01": ["PM-1", "PM-7", "PM-11"],
  "GV.OC-02": ["PM-11", "SA-8", "PM-25"],
  "GV.OC-03": ["PM-8", "AC-1", "SA-9"],
  "GV.OC-04": ["CP-2", "PM-11", "SA-9"],
  "GV.OC-05": ["PM-9", "SR-2", "SA-9"],
  "GV.RM-01": ["PM-9", "PM-28", "RA-1"],
  "GV.RM-02": ["PM-9", "PM-28"],
  "GV.RM-03": ["PM-9", "PM-28", "RA-3"],
  "GV.PO-01": ["PL-1", "PM-1", "AC-1"],
  "GV.PO-02": ["PL-1", "PM-1"],
  // IDENTIFY (ID)
  "ID.AM-01": ["CM-8", "PM-5"],
  "ID.AM-02": ["CM-8", "PM-5", "SA-22"],
  "ID.AM-03": ["AC-4", "CA-3", "PL-8"],
  "ID.RA-01": ["RA-5", "SI-2", "CA-7"],
  "ID.RA-02": ["PM-16", "SI-5", "RA-3"],
  // PROTECT (PR)
  "PR.AA-01": ["IA-5", "AC-2", "IA-4"],
  "PR.AA-03": ["IA-2", "IA-8", "IA-11"],
  "PR.AA-05": ["AC-3", "AC-6", "AC-24"],
  "PR.DS-01": ["SC-28", "SC-13", "MP-4"],
  "PR.DS-02": ["SC-8", "SC-13", "SC-23"],
  "PR.PS-01": ["CM-2", "CM-6", "CM-7"],
  "PR.PS-02": ["SI-2", "CM-3", "SA-22"],
  // DETECT (DE)
  "DE.CM-01": ["SI-4", "AU-6", "AC-2"],
  "DE.CM-03": ["AU-6", "AC-2", "AU-12"],
  "DE.AE-02": ["IR-4", "SI-4", "AU-6"],
  "DE.AE-03": ["AU-6", "SI-4", "IR-4"],
  // RESPOND (RS)
  "RS.MA-01": ["IR-4", "IR-8", "IR-9"],
  "RS.MA-02": ["IR-4", "IR-5", "IR-6"],
  "RS.MA-03": ["IR-4", "IR-5", "IR-8"],
  "RS.MA-04": ["IR-4", "IR-6", "IR-7"],
  "RS.AN-03": ["IR-4", "AU-6", "SI-4"],
  "RS.CO-02": ["IR-6", "IR-7", "IR-4"],
  "RS.MI-01": ["IR-4", "SC-7", "AC-4"],
  // RECOVER (RC)
  "RC.RP-01": ["CP-10", "IR-4", "CP-2"],
  "RC.RP-02": ["CP-10", "CP-2", "IR-4"],
  "RC.RP-03": ["CP-9", "CP-10", "SI-13"],
  "RC.CO-03": ["IR-6", "CP-2", "IR-4"]
};

// CSF 2.0 Functions and their colors
const CSF_FUNCTIONS = {
  GOVERN: { color: 'purple', code: 'GV' },
  IDENTIFY: { color: 'blue', code: 'ID' },
  PROTECT: { color: 'green', code: 'PR' },
  DETECT: { color: 'yellow', code: 'DE' },
  RESPOND: { color: 'red', code: 'RS' },
  RECOVER: { color: 'orange', code: 'RC' }
};

const ScopeSelector = ({ embedded = false }) => {
  const navigate = useNavigate();
  const { llmProvider, generateWithOllama, generateWithClaude, searchHF, dataMode, ollamaStatus, claudeApiKey, checkOllama } = useAIStore();
  const requirements = useRequirementsStore((state) => state.requirements);

  // Check Ollama status on mount
  useEffect(() => {
    if (llmProvider === 'ollama') {
      checkOllama();
    }
  }, [llmProvider, checkOllama]);

  const [selectedScope, setSelectedScope] = useState(new Set());
  const [testProcedures, setTestProcedures] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentControl, setCurrentControl] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [expandedControl, setExpandedControl] = useState(null);

  // Get unique subcategories from requirements as controls
  const allControls = useMemo(() => {
    const csfRequirements = requirements.filter(r => r.frameworkId === 'nist-csf-2.0');
    const subcategoryMap = new Map();

    csfRequirements.forEach(req => {
      if (req.subcategoryId && !subcategoryMap.has(req.subcategoryId)) {
        subcategoryMap.set(req.subcategoryId, {
          code: req.subcategoryId,
          description: req.subcategoryDescription || req.category || '',
          function: req.function || '',
          category: req.category || '',
          sp80053: CONTROL_MAPPINGS[req.subcategoryId] || []
        });
      }
    });

    return Array.from(subcategoryMap.values());
  }, [requirements]);

  const getAllControls = () => allControls;

  const filteredControls = getAllControls().filter(c =>
    !filterText ||
    c.code.toLowerCase().includes(filterText.toLowerCase()) ||
    c.description.toLowerCase().includes(filterText.toLowerCase()) ||
    c.function.toLowerCase().includes(filterText.toLowerCase())
  );

  const toggleScope = (controlId) => {
    setSelectedScope(prev => {
      const newSet = new Set(prev);
      if (newSet.has(controlId)) {
        newSet.delete(controlId);
      } else {
        newSet.add(controlId);
      }
      return newSet;
    });
  };

  const selectAllInFunction = (funcName) => {
    const funcControls = getAllControls().filter(c => c.function === funcName);
    setSelectedScope(prev => {
      const newSet = new Set(prev);
      funcControls.forEach(c => newSet.add(c.code));
      return newSet;
    });
  };

  const clearScope = () => {
    setSelectedScope(new Set());
    setTestProcedures({});
  };

  // Generate test procedure for a single control
  const generateTestProcedure = async (controlId) => {
    setIsGenerating(true);
    setCurrentControl(controlId);

    const control = getAllControls().find(c => c.code === controlId);
    if (!control) return;

    // Search HF for assessment procedure guidance
    let hfContext = "";
    if (dataMode !== 'lightweight') {
      const searchTerms = [...(control.sp80053 || []), 'assessment procedure'];
      for (const term of searchTerms.slice(0, 2)) {
        const results = await searchHF(term, 3);
        results.forEach(r => {
          const text = r.row?.text || '';
          if (text) hfContext += text.substring(0, 400) + '\n---\n';
        });
      }
    }

    const prompt = `You are a NIST auditor creating test procedures for CSF 2.0 compliance assessment.

CONTROL: ${controlId}
DESCRIPTION: ${control.description}
FUNCTION: ${control.function}
SP 800-53 MAPPINGS: ${control.sp80053.join(', ') || 'See guidance'}

${hfContext ? `RELEVANT NIST GUIDANCE:\n${hfContext}` : ''}

Generate comprehensive test procedures following SP 800-53A format:

## TEST PROCEDURES FOR ${controlId}

### 1. EXAMINE (Document Review)
List specific documents/artifacts to review:
- Document 1: [what to look for]
- Document 2: [what to look for]
- Document 3: [what to look for]

### 2. INTERVIEW (Personnel Questions)
Questions to ask relevant personnel:
- Q1: [specific question for role]
- Q2: [specific question for role]
- Q3: [specific question for role]

### 3. TEST (Technical Validation)
Technical tests to perform:
- Test 1: [steps and expected results]
- Test 2: [steps and expected results]

### 4. EVIDENCE CHECKLIST
☐ Evidence item 1
☐ Evidence item 2
☐ Evidence item 3

### 5. PASS/FAIL CRITERIA
Clear criteria for determining compliance status.

Be specific, actionable, and auditor-focused.`;

    try {
      let response;
      if (llmProvider === 'ollama') {
        response = await generateWithOllama(prompt, 2000);
      } else {
        response = await generateWithClaude(prompt, 2000);
      }
      setTestProcedures(prev => ({ ...prev, [controlId]: response }));
    } catch (error) {
      setTestProcedures(prev => ({ ...prev, [controlId]: `Error: ${error.message}` }));
    }

    setIsGenerating(false);
    setCurrentControl(null);
  };

  // Generate all procedures
  const generateAllProcedures = async () => {
    const scopeArray = Array.from(selectedScope);
    for (const controlId of scopeArray) {
      if (!testProcedures[controlId]) {
        await generateTestProcedure(controlId);
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const isReady = llmProvider === 'ollama'
    ? ollamaStatus.available && ollamaStatus.hasModel
    : !!claudeApiKey;

  return (
    <div className={embedded ? "h-full bg-gray-50" : "min-h-screen bg-gray-50"}>
      {/* Header - only show when not embedded */}
      {!embedded && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Scope Selector + Test Procedures</h1>
                  <p className="text-sm text-gray-500">Select controls in scope, then generate AI-powered test procedures</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className={`px-2 py-1 rounded ${llmProvider === 'ollama' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                  {llmProvider === 'ollama' ? '🦙 Ollama' : '🤖 Claude'}
                </span>
                {!isReady && (
                  <span className="px-2 py-1 rounded bg-red-100 text-red-700">Not Ready</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compact header for embedded mode */}
      {embedded && (
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-gray-600">Select controls in scope, then generate AI-powered test procedures</p>
          <div className="flex items-center gap-2 text-sm">
            <span className={`px-2 py-1 rounded ${llmProvider === 'ollama' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
              {llmProvider === 'ollama' ? '🦙 Ollama' : '🤖 Claude'}
            </span>
            {!isReady && (
              <span className="px-2 py-1 rounded bg-red-100 text-red-700">Not Ready</span>
            )}
          </div>
        </div>
      )}

      <div className={embedded ? "px-4 py-4 h-[calc(100%-57px)] overflow-auto" : "max-w-7xl mx-auto px-4 py-6"}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Control Selection */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Select Controls in Scope</h2>
              <span className="text-sm text-blue-600 font-medium">{selectedScope.size} selected</span>
            </div>

            {/* Quick Select Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(CSF_FUNCTIONS).map(([func, { color }]) => (
                <button
                  key={func}
                  onClick={() => selectAllInFunction(func)}
                  className={`px-3 py-1 text-xs rounded-lg transition-all bg-${color}-100 text-${color}-700 hover:bg-${color}-200`}
                  style={{
                    backgroundColor: `var(--${color}-100, #e5e7eb)`,
                    color: `var(--${color}-700, #374151)`
                  }}
                >
                  {func}
                </button>
              ))}
              <button
                onClick={clearScope}
                className="px-3 py-1 text-xs rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300"
              >
                Clear All
              </button>
            </div>

            {/* Search */}
            <input
              type="text"
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
              placeholder="Filter controls..."
              className="w-full px-3 py-2 border rounded-lg mb-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

            {/* Control List */}
            <div className="max-h-[500px] overflow-y-auto space-y-1">
              {allControls.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No CSF requirements loaded. Import data in Frameworks tab.</div>
              ) : (
                filteredControls.map(control => (
                  <label
                    key={control.code}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedScope.has(control.code) ? 'bg-blue-50 border border-blue-200' : 'border border-transparent'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedScope.has(control.code)}
                      onChange={() => toggleScope(control.code)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 text-xs font-medium text-white rounded bg-gray-600">
                          {control.code}
                        </span>
                        <span className="text-xs text-gray-400">{control.function}</span>
                        {control.sp80053.length > 0 && (
                          <span className="text-xs text-gray-400">→ {control.sp80053.slice(0, 2).join(', ')}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{control.description}</p>
                    </div>
                  </label>
                ))
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={generateAllProcedures}
              disabled={selectedScope.size === 0 || isGenerating || !isReady}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Generating... ({currentControl})
                </>
              ) : (
                <>
                  <CheckSquare size={18} />
                  Generate Test Procedures ({selectedScope.size})
                </>
              )}
            </button>
          </div>

          {/* Right: Test Procedures */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Generated Test Procedures</h2>

            {Object.keys(testProcedures).length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CheckSquare size={48} className="mx-auto mb-3 opacity-30" />
                <p>Select controls and click "Generate" to create test procedures</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {Array.from(selectedScope).map(controlId => (
                  <div key={controlId} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedControl(expandedControl === controlId ? null : controlId)}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 text-left"
                    >
                      <div className="flex items-center gap-2">
                        {expandedControl === controlId ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        <span className="font-medium text-sm">{controlId}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        testProcedures[controlId]
                          ? 'bg-green-100 text-green-700'
                          : currentControl === controlId
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-500'
                      }`}>
                        {testProcedures[controlId] ? '✓ Ready' : currentControl === controlId ? 'Generating...' : 'Pending'}
                      </span>
                    </button>
                    {expandedControl === controlId && testProcedures[controlId] && (
                      <div className="p-4 bg-gray-50 border-t">
                        <pre className="text-xs whitespace-pre-wrap text-gray-700 max-h-64 overflow-y-auto font-mono">
                          {testProcedures[controlId]}
                        </pre>
                        <button
                          onClick={() => copyToClipboard(testProcedures[controlId])}
                          className="mt-3 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                        >
                          <Copy size={14} />
                          Copy to clipboard
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScopeSelector;
