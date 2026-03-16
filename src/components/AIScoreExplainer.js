import React, { useState } from 'react';
import useAIStore from '../stores/aiStore';

/**
 * AIScoreExplainer Component
 *
 * Inline AI feature for the Reference/Scoring tab.
 * Explains what each score level means for a specific control with examples.
 *
 * Usage in ScoringReference.js:
 * <AIScoreExplainer
 *   controlId="DE.AE-02"
 *   controlTitle="Potentially adverse events are analyzed..."
 *   scoreLevel={7}
 *   onClose={() => setShowExplainer(false)}
 * />
 */

const SCORE_LEVELS = {
  0: { label: 'Not Implemented', color: 'red', description: 'No evidence of implementation' },
  1: { label: 'Not Implemented', color: 'red', description: 'Minimal awareness, no action' },
  2: { label: 'Initial', color: 'orange', description: 'Ad-hoc, undocumented, reactive' },
  3: { label: 'Initial', color: 'orange', description: 'Some awareness, inconsistent' },
  4: { label: 'Developing', color: 'yellow', description: 'Partially implemented, gaps remain' },
  5: { label: 'Developing', color: 'yellow', description: 'Documented but not fully followed' },
  6: { label: 'Defined', color: 'blue', description: 'Implemented, minor gaps' },
  7: { label: 'Defined', color: 'blue', description: 'Consistently implemented' },
  8: { label: 'Managed', color: 'green', description: 'Measured and monitored' },
  9: { label: 'Managed', color: 'green', description: 'Proactively improved' },
  10: { label: 'Optimized', color: 'purple', description: 'Best-in-class, continuous improvement' }
};

const AIScoreExplainer = ({
  controlId,
  controlTitle,
  scoreLevel = 5,
  onClose
}) => {
  const [explanation, setExplanation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedScore, setSelectedScore] = useState(scoreLevel);

  const { llmProvider, generateWithOllama, generateWithClaude, ollamaStatus } = useAIStore();

  const generateExplanation = async (score) => {
    setIsLoading(true);
    setError(null);
    setSelectedScore(score);

    const level = SCORE_LEVELS[score];

    const prompt = `You are a NIST CSF assessment expert. Explain what a score of ${score}/10 (${level.label}) means for this specific control.

CONTROL: ${controlId}
TITLE: ${controlTitle || 'Not specified'}
SCORE: ${score}/10 - ${level.label}
GENERAL MEANING: ${level.description}

Provide a control-specific explanation:

## What Score ${score} Means for ${controlId}

### Characteristics at This Level
- Bullet point describing what an organization at this level typically has
- Bullet point describing typical processes/tools
- Bullet point describing common documentation state

### Evidence You'd Expect to See
- Specific artifact or evidence type
- Specific artifact or evidence type
- Specific artifact or evidence type

### What's Missing to Reach ${Math.min(score + 2, 10)}
- Gap that needs to be addressed
- Gap that needs to be addressed

### Real-World Example
Describe a brief scenario of an organization operating at this level for this control.

Be specific to ${controlId}. Keep each section concise (2-4 bullets or sentences).`;

    try {
      let response;
      if (llmProvider === 'ollama') {
        response = await generateWithOllama(prompt, 1200);
      } else {
        response = await generateWithClaude(prompt, 1200);
      }

      setExplanation({
        text: response,
        score,
        level: level.label,
        provider: llmProvider
      });
    } catch (err) {
      console.error('AI score explanation error:', err);
      setError('Failed to generate score explanation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-generate on mount
  React.useEffect(() => {
    generateExplanation(selectedScore);
  }, []);

  const getScoreColor = (score) => {
    const level = SCORE_LEVELS[score];
    const colors = {
      red: 'bg-red-500',
      orange: 'bg-orange-500',
      yellow: 'bg-yellow-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500'
    };
    return colors[level.color] || 'bg-gray-500';
  };

  const getScoreBorderColor = (score, isSelected) => {
    if (!isSelected) return 'border-gray-200 dark:border-gray-600';
    const level = SCORE_LEVELS[score];
    const colors = {
      red: 'border-red-500',
      orange: 'border-orange-500',
      yellow: 'border-yellow-500',
      blue: 'border-blue-500',
      green: 'border-green-500',
      purple: 'border-purple-500'
    };
    return colors[level.color] || 'border-gray-500';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-purple-200 dark:border-purple-800 p-4 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{llmProvider === 'ollama' ? '🦙' : '🤖'}</span>
          <h3 className="font-semibold text-gray-800 dark:text-white">Score Explainer</h3>
          {ollamaStatus?.hasModel && llmProvider === 'ollama' && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">NIST-trained</span>
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
      </div>

      {/* Score Selector */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-2">Click a score to see what it means for this control:</div>
        <div className="flex gap-1 flex-wrap">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
            <button
              key={score}
              onClick={() => generateExplanation(score)}
              disabled={isLoading}
              className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-all ${getScoreBorderColor(score, selectedScore === score)
                } ${selectedScore === score
                  ? `${getScoreColor(score)} text-white`
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {score}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
          <span>Not Implemented</span>
          <span>Initial</span>
          <span>Developing</span>
          <span>Defined</span>
          <span>Managed</span>
          <span>Optimized</span>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-6">
          <div className="text-3xl animate-pulse mb-2">{llmProvider === 'ollama' ? '🦙' : '📖'}</div>
          <p className="text-sm text-gray-500">Explaining score {selectedScore}...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded p-3 mb-3">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={() => generateExplanation(selectedScore)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Try again
          </button>
        </div>
      )}

      {/* Explanation Result */}
      {explanation && !isLoading && (
        <>
          {/* Score Badge */}
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className={`w-12 h-12 rounded-lg ${getScoreColor(explanation.score)} flex items-center justify-center text-white text-xl font-bold`}>
              {explanation.score}
            </div>
            <div>
              <div className="font-semibold text-gray-800 dark:text-white">{explanation.level}</div>
              <div className="text-sm text-gray-500">{SCORE_LEVELS[explanation.score].description}</div>
            </div>
          </div>

          {/* Full Explanation */}
          <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-72 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-700 rounded">
            {explanation.text}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4 pt-3 border-t dark:border-gray-700">
            <button
              onClick={() => generateExplanation(selectedScore)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              Regenerate
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(explanation.text);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              Copy
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

export default AIScoreExplainer;
