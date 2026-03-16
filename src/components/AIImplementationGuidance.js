import React, { useState } from 'react';
import useAIStore from '../stores/aiStore';

/**
 * AIImplementationGuidance Component
 *
 * Inline AI feature for the Controls tab.
 * Provides implementation guidance for any CSF control using the NIST corpus.
 *
 * Usage in ControlDetails.js:
 * <AIImplementationGuidance
 *   controlId="DE.AE-02"
 *   controlTitle="Potentially adverse events are analyzed..."
 *   subcategory="Adverse Event Analysis"
 *   sp80053Mappings={["SI-4", "AU-6", "IR-4"]}
 *   currentMaturity={5}
 *   targetMaturity={7}
 * />
 */

const AIImplementationGuidance = ({
  controlId,
  controlTitle,
  subcategory,
  sp80053Mappings = [],
  currentMaturity,
  targetMaturity,
  onClose
}) => {
  const [guidance, setGuidance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');

  const { llmProvider, generateWithOllama, generateWithClaude, searchHuggingFace, ollamaStatus } = useAIStore();

  const generateGuidance = async () => {
    setIsLoading(true);
    setError(null);

    const prompt = `You are a NIST CSF implementation specialist. Provide detailed implementation guidance for this control.

CONTROL: ${controlId}
TITLE: ${controlTitle || 'Not specified'}
SUBCATEGORY: ${subcategory || 'Not specified'}
SP 800-53 MAPPINGS: ${sp80053Mappings.length > 0 ? sp80053Mappings.join(', ') : 'None specified'}
CURRENT MATURITY: ${currentMaturity || 'Not assessed'}/10
TARGET MATURITY: ${targetMaturity || 'Not set'}/10

Provide implementation guidance in these sections:

## 1. OVERVIEW
Brief explanation of what this control requires and why it matters (2-3 sentences).

## 2. IMPLEMENTATION STEPS
Numbered list of 5-7 concrete steps to implement this control:
1. Step with specific action
2. Step with specific action
...

## 3. QUICK WINS
3 actions that can be done in the first week to show progress:
- Quick win 1
- Quick win 2
- Quick win 3

## 4. COMMON PITFALLS
3 mistakes to avoid:
- Pitfall 1
- Pitfall 2
- Pitfall 3

## 5. EVIDENCE REQUIREMENTS
What documentation/artifacts demonstrate compliance:
- Evidence type 1
- Evidence type 2
- Evidence type 3

## 6. TOOLS & TECHNOLOGIES
Specific tools that support this control (prefer open-source or widely available):
- Tool 1: brief description
- Tool 2: brief description
- Tool 3: brief description

Be specific and actionable. Reference SP 800-53 controls where relevant.`;

    try {
      // Search HuggingFace for relevant NIST content
      let hfContext = '';
      try {
        const hfResults = await searchHuggingFace(controlId, 3);
        if (hfResults && hfResults.length > 0) {
          hfContext = `\n\nRELEVANT NIST GUIDANCE:\n${hfResults.map(r =>
            `[${r.source || 'NIST'}]: ${r.text?.substring(0, 300)}...`
          ).join('\n')}`;
        }
      } catch (hfErr) {
        console.warn('HuggingFace search failed:', hfErr);
      }

      const fullPrompt = prompt + hfContext;

      let response;
      if (llmProvider === 'ollama') {
        response = await generateWithOllama(fullPrompt, 2000);
      } else {
        response = await generateWithClaude(fullPrompt, 2000);
      }

      // Parse sections from response
      const sections = parseSections(response);

      setGuidance({
        raw: response,
        sections,
        provider: llmProvider,
        hasHfContext: hfContext.length > 0
      });
    } catch (err) {
      console.error('Guidance generation error:', err);
      setError('Failed to generate implementation guidance. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Parse markdown sections from response
  const parseSections = (text) => {
    const sections = {
      overview: '',
      steps: '',
      quickWins: '',
      pitfalls: '',
      evidence: '',
      tools: ''
    };

    const sectionPatterns = [
      { key: 'overview', pattern: /##?\s*1\.?\s*OVERVIEW\s*([\s\S]*?)(?=##?\s*2|$)/i },
      { key: 'steps', pattern: /##?\s*2\.?\s*IMPLEMENTATION STEPS\s*([\s\S]*?)(?=##?\s*3|$)/i },
      { key: 'quickWins', pattern: /##?\s*3\.?\s*QUICK WINS\s*([\s\S]*?)(?=##?\s*4|$)/i },
      { key: 'pitfalls', pattern: /##?\s*4\.?\s*COMMON PITFALLS\s*([\s\S]*?)(?=##?\s*5|$)/i },
      { key: 'evidence', pattern: /##?\s*5\.?\s*EVIDENCE REQUIREMENTS\s*([\s\S]*?)(?=##?\s*6|$)/i },
      { key: 'tools', pattern: /##?\s*6\.?\s*TOOLS\s*([\s\S]*?)$/i }
    ];

    sectionPatterns.forEach(({ key, pattern }) => {
      const match = text.match(pattern);
      if (match) {
        sections[key] = match[1].trim();
      }
    });

    return sections;
  };

  // Auto-generate on mount
  React.useEffect(() => {
    if (!guidance && !isLoading) {
      generateGuidance();
    }
  }, []);

  const sectionTabs = [
    { key: 'overview', label: 'Overview', icon: '📋' },
    { key: 'steps', label: 'Steps', icon: '📝' },
    { key: 'quickWins', label: 'Quick Wins', icon: '⚡' },
    { key: 'pitfalls', label: 'Pitfalls', icon: '⚠️' },
    { key: 'evidence', label: 'Evidence', icon: '📁' },
    { key: 'tools', label: 'Tools', icon: '🔧' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-green-200 dark:border-green-800 p-4 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{llmProvider === 'ollama' ? '🦙' : '🤖'}</span>
          <h3 className="font-semibold text-gray-800 dark:text-white">Implementation Guidance</h3>
          {ollamaStatus?.hasModel && llmProvider === 'ollama' && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">NIST-trained</span>
          )}
          {guidance?.hasHfContext && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">+ HuggingFace</span>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        )}
      </div>

      {/* Control Info */}
      <div className="mb-4 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
        <div className="font-medium text-gray-800 dark:text-white">{controlId}</div>
        {controlTitle && (
          <div className="text-gray-600 dark:text-gray-300 text-xs mt-1">{controlTitle}</div>
        )}
        {sp80053Mappings.length > 0 && (
          <div className="mt-2 flex gap-1 flex-wrap">
            {sp80053Mappings.map(mapping => (
              <span key={mapping} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {mapping}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="text-4xl animate-pulse mb-2">{llmProvider === 'ollama' ? '🦙' : '📚'}</div>
          <p className="text-sm text-gray-500">Generating implementation guidance...</p>
          <p className="text-xs text-gray-400 mt-1">
            {llmProvider === 'ollama' ? 'Using local NIST model' : 'Using Claude API'}
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded p-3 mb-3">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={generateGuidance}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Try again
          </button>
        </div>
      )}

      {/* Guidance Result */}
      {guidance && !isLoading && (
        <>
          {/* Section Tabs */}
          <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
            {sectionTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${activeSection === tab.key
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Section Content */}
          <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-80 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-700 rounded">
            {guidance.sections[activeSection] || 'No content available for this section.'}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4 pt-3 border-t dark:border-gray-700">
            <button
              onClick={generateGuidance}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              Regenerate
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(guidance.raw);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              Copy All
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
              >
                Close
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AIImplementationGuidance;
