import React, { useState } from 'react';
import useAIStore from '../stores/aiStore';

/**
 * AIScoreSuggestion Component
 *
 * Inline AI feature for the Assessments tab.
 * Analyzes observation text and suggests an appropriate score with rationale.
 *
 * Usage in AssessmentObservations.js:
 * <AIScoreSuggestion
 *   controlId="DE.AE-02 Ex1"
 *   observation="CloudTrail and GuardDuty in use. TTD currently 9 hours..."
 *   currentScore={5}
 *   targetScore={7}
 *   onAccept={(score, rationale) => updateScore(controlId, score)}
 * />
 */

const SCORING_REFERENCE = `
NIST CSF Assessment Scoring (0-10 scale):
0-1: Not implemented - No evidence of implementation
2-3: Initial - Ad-hoc, undocumented, reactive
4-5: Developing - Partially implemented, significant gaps remain
6-7: Defined - Documented, implemented, minor gaps
8-9: Managed - Consistently implemented, measured, improved
10: Optimized - Best-in-class, continuous improvement, integrated
`;

const AIScoreSuggestion = ({
  controlId,
  controlDescription,
  observation,
  currentScore,
  targetScore,
  testProcedures,
  onAccept,
  onClose
}) => {
  const [suggestion, setSuggestion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { llmProvider, generateWithOllama, generateWithClaude, ollamaStatus } = useAIStore();

  const generateSuggestion = async () => {
    setIsLoading(true);
    setError(null);

    const prompt = `You are a NIST CSF assessment expert. Analyze the following audit observation and suggest an appropriate score.

${SCORING_REFERENCE}

CONTROL: ${controlId}
${controlDescription ? `DESCRIPTION: ${controlDescription}` : ''}
${testProcedures ? `TEST PROCEDURES:\n${testProcedures}` : ''}

CURRENT OBSERVATION:
${observation || 'No observation documented'}

CURRENT SCORE: ${currentScore || 'Not yet scored'}
TARGET SCORE: ${targetScore || 'Not set'}

Based on the observation text and NIST CSF scoring criteria, provide:

1. **Suggested Score**: [0-10]
2. **Confidence**: [High/Medium/Low]
3. **Rationale**: 2-3 sentences explaining why this score is appropriate
4. **Gaps Identified**: Bullet points of what's preventing a higher score
5. **To Improve**: Specific actions to reach target score of ${targetScore || 8}

Be specific and reference the observation text in your rationale.`;

    try {
      let response;
      if (llmProvider === 'ollama') {
        response = await generateWithOllama(prompt, 1500);
      } else {
        response = await generateWithClaude(prompt, 1500);
      }

      // Parse the response to extract score
      const scoreMatch = response.match(/Suggested Score[:\s]*(\d+)/i);
      const suggestedScore = scoreMatch ? parseInt(scoreMatch[1]) : null;

      setSuggestion({
        text: response,
        score: suggestedScore,
        provider: llmProvider
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    if (suggestion?.score !== null && onAccept) {
      onAccept(suggestion.score, suggestion.text);
    }
    if (onClose) onClose();
  };

  // Auto-generate on mount if not already loading
  React.useEffect(() => {
    if (!suggestion && !isLoading && observation) {
      generateSuggestion();
    }
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-blue-200 dark:border-blue-800 p-4 max-w-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{llmProvider === 'ollama' ? '🦙' : '🤖'}</span>
          <h3 className="font-semibold text-gray-800 dark:text-white">Score Suggestion</h3>
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

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-6">
          <div className="text-3xl animate-pulse mb-2">{llmProvider === 'ollama' ? '🦙' : '🔍'}</div>
          <p className="text-sm text-gray-500">Analyzing observation...</p>
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
            onClick={generateSuggestion}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Try again
          </button>
        </div>
      )}

      {/* Suggestion Result */}
      {suggestion && !isLoading && (
        <>
          {/* Score Display */}
          {suggestion.score !== null && (
            <div className="flex items-center gap-4 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{suggestion.score}</div>
                <div className="text-xs text-gray-500">Suggested</div>
              </div>
              <div className="text-gray-400">→</div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-400">{currentScore || '?'}</div>
                <div className="text-xs text-gray-500">Current</div>
              </div>
              <div className="text-gray-400">→</div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-green-600">{targetScore || '?'}</div>
                <div className="text-xs text-gray-500">Target</div>
              </div>
            </div>
          )}

          {/* Full Analysis */}
          <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-64 overflow-y-auto">
            {suggestion.text}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4 pt-3 border-t dark:border-gray-700">
            {suggestion.score !== null && onAccept && (
              <button
                onClick={handleAccept}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Accept Score ({suggestion.score})
              </button>
            )}
            <button
              onClick={generateSuggestion}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Regenerate
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Cancel
              </button>
            )}
          </div>
        </>
      )}

      {/* No observation */}
      {!observation && !isLoading && (
        <div className="text-center py-4 text-gray-500">
          <p>No observation text to analyze.</p>
          <p className="text-sm mt-1">Add observations first, then request a score suggestion.</p>
        </div>
      )}
    </div>
  );
};

export default AIScoreSuggestion;
