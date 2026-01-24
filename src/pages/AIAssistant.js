import React, { useEffect, useState } from 'react';
import useAIStore from '../stores/aiStore';
import useAssessmentsStore from '../stores/assessmentsStore';
import useControlsStore from '../stores/controlsStore';

/**
 * AI Assistant Page
 *
 * Provides AI-powered gap analysis, implementation guidance, and remediation planning
 * using Ollama (local) or Claude API with the HuggingFace NIST cybersecurity dataset.
 */

const AIAssistant = () => {
  const [activeTab, setActiveTab] = useState('analysis');
  const [questionInput, setQuestionInput] = useState('');

  // AI Store
  const {
    llmProvider, setLlmProvider,
    claudeApiKey, setClaudeApiKey,
    dataMode, setDataMode,
    ollamaStatus, checkOllama,
    isAnalyzing, analysisResult, analysisError,
    analyzeAssessmentGaps,
    selectedControlId, deepDiveContent, isLoadingDeepDive,
    loadDeepDive,
    chatHistory, askQuestion,
    clearAnalysis,
    getDatasetInfo, datasetInfo
  } = useAIStore();

  // Assessment Store
  const { assessments, getAssessment } = useAssessmentsStore();
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);

  // Controls Store
  const { controls } = useControlsStore();

  // Check Ollama and get dataset info on mount
  useEffect(() => {
    checkOllama();
    getDatasetInfo();
  }, []);

  // Auto-select first assessment
  useEffect(() => {
    if (assessments.length > 0 && !selectedAssessmentId) {
      setSelectedAssessmentId(assessments[0].id);
    }
  }, [assessments]);

  const selectedAssessment = selectedAssessmentId ? getAssessment(selectedAssessmentId) : null;

  // Handle analysis
  const handleAnalyze = async () => {
    if (!selectedAssessment) return;
    try {
      await analyzeAssessmentGaps(selectedAssessment, controls);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  // Handle deep dive
  const handleDeepDive = async (controlId) => {
    const control = controls.find(c => c.id === controlId);
    const observation = selectedAssessment?.observations?.[controlId];
    await loadDeepDive(controlId, control, observation);
    setActiveTab('guidance');
  };

  // Handle question
  const handleAskQuestion = async () => {
    if (!questionInput.trim()) return;
    const context = analysisResult ? `Current analysis:\n${analysisResult.text?.substring(0, 1000)}` : '';
    await askQuestion(questionInput, context);
    setQuestionInput('');
  };

  // Extract gaps from analysis result
  const gaps = analysisResult?.gaps || [];
  const criticalGaps = gaps.filter(g => g.severity === 'critical');
  const highGaps = gaps.filter(g => g.severity === 'high');
  const mediumGaps = gaps.filter(g => g.severity === 'medium');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          {llmProvider === 'ollama' ? '🦙' : '🤖'} AI Assistant
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          AI-powered gap analysis and implementation guidance using the NIST cybersecurity training dataset
        </p>
      </div>

      {/* Experimental Notice */}
      <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-amber-600 dark:text-amber-400 text-xl">⚠️</span>
          <div>
            <p className="text-amber-800 dark:text-amber-200 font-medium">Experimental Feature</p>
            <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
              These AI-powered features are experimental and still under development.
              Results may vary and should be reviewed by qualified personnel.
              Feedback welcome from the community!
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Assessment Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Assessment
            </label>
            <select
              value={selectedAssessmentId || ''}
              onChange={(e) => setSelectedAssessmentId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              {assessments.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* AI Provider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              AI Provider
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setLlmProvider('ollama')}
                className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                  llmProvider === 'ollama'
                    ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                🦙 Ollama
                {ollamaStatus.hasModel && (
                  <span className="ml-1 text-xs bg-green-100 text-green-700 px-1 rounded">Ready</span>
                )}
              </button>
              <button
                onClick={() => setLlmProvider('claude')}
                className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                  llmProvider === 'claude'
                    ? 'bg-purple-100 border-purple-500 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                🤖 Claude
              </button>
            </div>
          </div>

          {/* Data Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data Mode
            </label>
            <select
              value={dataMode}
              onChange={(e) => setDataMode(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="lightweight">Lightweight (LLM only)</option>
              <option value="hybrid">Hybrid (Recommended)</option>
              <option value="full">Full (Max HF queries)</option>
            </select>
          </div>
        </div>

        {/* Claude API Key (if selected) */}
        {llmProvider === 'claude' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Claude API Key
            </label>
            <input
              type="password"
              value={claudeApiKey}
              onChange={(e) => setClaudeApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        )}

        {/* Ollama Setup Instructions */}
        {llmProvider === 'ollama' && !ollamaStatus.available && !ollamaStatus.checking && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Ollama not detected</p>
            <ol className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 list-decimal ml-4">
              <li>Install Ollama: <code className="bg-white dark:bg-gray-800 px-1 rounded">brew install ollama</code></li>
              <li>Pull NIST model: <code className="bg-white dark:bg-gray-800 px-1 rounded">ollama pull etgohome/hackidle-nist-coder</code></li>
              <li>Start Ollama: <code className="bg-white dark:bg-gray-800 px-1 rounded">ollama serve</code></li>
            </ol>
          </div>
        )}

        {/* Dataset Info */}
        {datasetInfo && dataMode !== 'lightweight' && (
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            🤗 Connected to ethanolivertroy/nist-cybersecurity-training (530K+ NIST examples)
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        {['analysis', 'guidance', 'chat'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'analysis' && '📊 '}
            {tab === 'guidance' && '📚 '}
            {tab === 'chat' && '💬 '}
            {tab}
          </button>
        ))}
      </div>

      {/* Analysis Tab */}
      {activeTab === 'analysis' && (
        <div>
          {/* Analyze Button */}
          <div className="mb-6">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !selectedAssessment}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isAnalyzing || !selectedAssessment
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <span className="animate-pulse">🔍</span> Analyzing {selectedAssessment?.name}...
                </>
              ) : (
                <>Analyze Assessment Gaps</>
              )}
            </button>
            {analysisResult && (
              <button
                onClick={clearAnalysis}
                className="ml-2 px-4 py-3 text-gray-600 hover:text-gray-800"
              >
                Clear
              </button>
            )}
          </div>

          {/* Error Display */}
          {analysisError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-300">
              {analysisError}
            </div>
          )}

          {/* Gap Summary Cards */}
          {analysisResult && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-red-600">{criticalGaps.length}</div>
                <div className="text-sm text-red-700 dark:text-red-300">Critical Gaps</div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-orange-600">{highGaps.length}</div>
                <div className="text-sm text-orange-700 dark:text-orange-300">High Priority</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-yellow-600">{mediumGaps.length}</div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">Medium Priority</div>
              </div>
            </div>
          )}

          {/* Analysis Result */}
          {analysisResult?.text && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">{llmProvider === 'ollama' ? '🦙' : '🤖'}</span>
                <h2 className="text-lg font-semibold">AI Analysis</h2>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  {llmProvider === 'ollama' ? 'hackidle-nist-coder' : 'Claude Sonnet'}
                </span>
                {dataMode !== 'lightweight' && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                    🤗 HF Enhanced
                  </span>
                )}
              </div>
              <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
                {analysisResult.text}
              </div>
            </div>
          )}

          {/* Gap List */}
          {gaps.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-4 border-b dark:border-gray-700">
                <h3 className="font-semibold">Identified Gaps ({gaps.length})</h3>
                <p className="text-sm text-gray-500">Click any gap for detailed implementation guidance</p>
              </div>
              <div className="divide-y dark:divide-gray-700">
                {gaps.map(gap => (
                  <div
                    key={gap.id}
                    onClick={() => handleDeepDive(gap.id)}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          gap.severity === 'critical' ? 'bg-red-100 text-red-700' :
                          gap.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {gap.severity}
                        </span>
                        <span className="font-medium">{gap.id}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {gap.actualScore} → {gap.targetScore} (gap: {gap.gap})
                      </div>
                    </div>
                    {gap.observations && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                        {gap.observations}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Guidance Tab */}
      {activeTab === 'guidance' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          {isLoadingDeepDive ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4 animate-pulse">{llmProvider === 'ollama' ? '🦙' : '🔍'}</div>
              <p className="text-gray-600">Generating implementation guidance for {selectedControlId}...</p>
              <p className="text-xs text-gray-400 mt-2">
                {llmProvider === 'ollama' ? 'Using local NIST-trained model' : 'Using Claude API'}
              </p>
            </div>
          ) : deepDiveContent ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold">Implementation Guidance: {selectedControlId}</h2>
              </div>
              <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
                {deepDiveContent}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>Select a gap from the Analysis tab to view implementation guidance</p>
            </div>
          )}
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {/* Chat History */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {chatHistory.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <p className="text-lg mb-2">💬 Ask questions about your assessment</p>
                <p className="text-sm">Examples:</p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>"What SP 800-53 controls address our detection gaps?"</li>
                  <li>"How should we prioritize remediation for supply chain controls?"</li>
                  <li>"What metrics should we track for GV.OV-01?"</li>
                </ul>
              </div>
            ) : (
              chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-50 dark:bg-blue-900/20 ml-12'
                      : 'bg-gray-50 dark:bg-gray-700 mr-12'
                  }`}
                >
                  <div className="text-xs text-gray-500 mb-1">
                    {msg.role === 'user' ? 'You' : '🦙 AI Assistant'}
                  </div>
                  <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="border-t dark:border-gray-700 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                placeholder="Ask a question about NIST CSF, your assessment, or implementation..."
                className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
              <button
                onClick={handleAskQuestion}
                disabled={!questionInput.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-gray-400">
        {llmProvider === 'ollama' ? (
          '🔒 Fully private - all processing stays on your machine'
        ) : (
          '🔒 Assessment data stays local. AI queries sent to Claude API.'
        )}
        {dataMode !== 'lightweight' && ' • 🤗 Enhanced with 530K NIST examples'}
      </div>
    </div>
  );
};

export default AIAssistant;
