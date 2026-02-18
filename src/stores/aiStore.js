import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * AI Assistant Store
 *
 * Manages state for the AI-powered gap analysis and implementation guidance features.
 * Integrates with Ollama (local) and HuggingFace (NIST dataset) for intelligent recommendations.
 */

const OLLAMA_BASE = "http://localhost:11434";
const NIST_MODEL = "etgohome/hackidle-nist-coder";
const HF_API_BASE = "https://datasets-server.huggingface.co";
const HF_DATASET = "ethanolivertroy/nist-cybersecurity-training";

const useAIStore = create(
  persist(
    (set, get) => ({
      // Provider configuration
      llmProvider: 'ollama', // 'ollama' or 'claude'
      claudeApiKey: '',
      dataMode: 'hybrid', // 'lightweight', 'hybrid', 'full'

      // Ollama status
      ollamaStatus: {
        checking: true,
        available: false,
        hasModel: false,
        models: []
      },

      // Analysis state
      isAnalyzing: false,
      analysisResult: null,
      analysisError: null,

      // Deep dive state
      selectedControlId: null,
      deepDiveContent: null,
      isLoadingDeepDive: false,

      // HuggingFace search results
      hfSearchResults: [],
      isSearchingHF: false,
      datasetInfo: null,

      // Chat history for follow-up questions
      chatHistory: [],

      // Actions
      setLlmProvider: (provider) => set({ llmProvider: provider }),
      setClaudeApiKey: (key) => set({ claudeApiKey: key }),
      setDataMode: (mode) => set({ dataMode: mode }),

      // Check Ollama availability
      checkOllama: async () => {
        set({ ollamaStatus: { ...get().ollamaStatus, checking: true } });

        try {
          const response = await fetch(`${OLLAMA_BASE}/api/tags`, {
            method: 'GET',
            signal: AbortSignal.timeout(3000)
          });

          if (!response.ok) {
            set({ ollamaStatus: { checking: false, available: false, hasModel: false, models: [] } });
            return;
          }

          const data = await response.json();
          const models = (data.models || []).map(m => m.name);
          const hasNistModel = models.some(name =>
            name.includes('hackidle-nist-coder') || name.includes('nist-coder')
          );

          set({
            ollamaStatus: {
              checking: false,
              available: true,
              hasModel: hasNistModel,
              models
            }
          });
        } catch (error) {
          set({ ollamaStatus: { checking: false, available: false, hasModel: false, models: [] } });
        }
      },

      // Generate with Ollama
      generateWithOllama: async (prompt, maxTokens = 2500) => {
        const response = await fetch(`${OLLAMA_BASE}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: NIST_MODEL,
            prompt,
            stream: false,
            options: { temperature: 0.7, num_predict: maxTokens }
          })
        });

        if (!response.ok) throw new Error(`Ollama error: ${response.status}`);
        const data = await response.json();
        return data.response || '';
      },

      // Generate with Claude
      generateWithClaude: async (prompt, maxTokens = 2500) => {
        const { claudeApiKey } = get();
        if (!claudeApiKey) throw new Error('Claude API key not configured');

        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": claudeApiKey,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true"
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: maxTokens,
            messages: [{ role: "user", content: prompt }]
          })
        });

        const data = await response.json();
        return data.content?.[0]?.text || data.error?.message || 'Analysis failed';
      },

      // Search HuggingFace dataset
      searchHF: async (query, limit = 10) => {
        set({ isSearchingHF: true });
        try {
          const url = new URL(`${HF_API_BASE}/search`);
          url.searchParams.set('dataset', HF_DATASET);
          url.searchParams.set('config', 'default');
          url.searchParams.set('split', 'train');
          url.searchParams.set('query', query);
          url.searchParams.set('length', Math.min(limit, 100));

          const response = await fetch(url.toString());
          if (!response.ok) throw new Error(`HF API error: ${response.status}`);

          const data = await response.json();
          set({ hfSearchResults: data.rows || [], isSearchingHF: false });
          return data.rows || [];
        } catch (error) {
          console.error('HF search error:', error);
          set({ hfSearchResults: [], isSearchingHF: false });
          return [];
        }
      },

      // Search for a specific CSF subcategory
      searchForSubcategory: async (subcategoryCode, keywords = [], controls = []) => {
        const results = [];
        const seenIds = new Set();
        const searchQueries = [subcategoryCode, ...controls.slice(0, 2), ...keywords.slice(0, 2)];

        for (const query of searchQueries) {
          if (!query) continue;
          const searchResults = await get().searchHF(query, 5);

          for (const result of searchResults) {
            const id = result.row?.id || result.row_idx;
            if (!seenIds.has(id)) {
              seenIds.add(id);
              results.push(result);
            }
          }
          if (results.length >= 10) break;
        }

        return results;
      },

      // Get dataset info
      getDatasetInfo: async () => {
        try {
          const url = `${HF_API_BASE}/info?dataset=${HF_DATASET}&config=default`;
          const response = await fetch(url);
          if (!response.ok) return null;

          const info = await response.json();
          set({ datasetInfo: info });
          return info;
        } catch (error) {
          console.error('HF info error:', error);
          return null;
        }
      },

      // Format HF results as context for prompts
      formatHFContext: (results, maxLength = 800) => {
        if (!results || results.length === 0) return '';

        return results.map(r => {
          const text = r.row?.text || '';
          const metadata = r.row?.metadata || 'NIST Document';
          const snippet = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
          return `---\nSource: ${metadata}\n${snippet}`;
        }).join('\n\n');
      },

      // Main analysis function - analyzes gaps from assessment data
      analyzeAssessmentGaps: async (assessmentData, controlsData) => {
        const { llmProvider, dataMode } = get();
        set({ isAnalyzing: true, analysisError: null });

        try {
          // Extract gaps (controls where actual < target)
          const gaps = [];
          for (const [controlId, observation] of Object.entries(assessmentData.observations || {})) {
            const q1 = observation.quarters?.Q1 || {};
            if (q1.actualScore < q1.targetScore) {
              const control = controlsData?.find(c => c.id === controlId);
              gaps.push({
                id: controlId,
                actualScore: q1.actualScore,
                targetScore: q1.targetScore,
                gap: q1.targetScore - q1.actualScore,
                observations: q1.observations,
                description: control?.description || '',
                function: controlId.split('.')[0],
                severity: (q1.targetScore - q1.actualScore) >= 3 ? 'critical' :
                  (q1.targetScore - q1.actualScore) >= 2 ? 'high' : 'medium'
              });
            }
          }

          // Sort by gap size
          gaps.sort((a, b) => b.gap - a.gap);

          // Build HF context if in hybrid or full mode
          let hfContext = '';
          if (dataMode !== 'lightweight' && gaps.length > 0) {
            const topGaps = gaps.slice(0, 5);
            for (const gap of topGaps) {
              const results = await get().searchHF(gap.id, 3);
              hfContext += get().formatHFContext(results);
            }
          }

          // Build analysis prompt
          const prompt = `You are a NIST cybersecurity expert analyzing a CSF 2.0 assessment for "${assessmentData.name}".

ASSESSMENT GAPS IDENTIFIED (${gaps.length} total):
${gaps.slice(0, 10).map(g => `- ${g.id} (${g.severity}): Actual ${g.actualScore} vs Target ${g.targetScore} (Gap: ${g.gap})
  Observations: ${g.observations || 'None documented'}`).join('\n\n')}

${hfContext ? `NIST GUIDANCE CONTEXT:\n${hfContext}\n` : ''}

Provide:
1. **Executive Summary** - Overall security posture assessment (2-3 sentences)
2. **Top 5 Priority Actions** with:
   - Control ID and why it matters (business impact)
   - Quick win (30-day action)
   - Relevant SP 800-53 controls
3. **90-Day Roadmap** - Phased remediation approach
4. **Resource Recommendations** - Staffing or tool suggestions based on gaps

Be specific, actionable, and reference NIST publications where applicable.`;

          // Generate analysis
          let result;
          if (llmProvider === 'ollama') {
            result = await get().generateWithOllama(prompt, 3000);
          } else {
            result = await get().generateWithClaude(prompt, 3000);
          }

          set({
            analysisResult: {
              text: result,
              gaps,
              timestamp: new Date().toISOString(),
              assessmentId: assessmentData.id,
              provider: llmProvider
            },
            isAnalyzing: false
          });

          return result;
        } catch (error) {
          console.error('Analysis error:', error);
          set({ analysisError: 'Analysis failed. Please try again.', isAnalyzing: false });
          throw error;
        }
      },

      // Deep dive into a specific control
      loadDeepDive: async (controlId, controlData, assessmentObservation) => {
        const { llmProvider, dataMode } = get();
        set({ selectedControlId: controlId, isLoadingDeepDive: true, deepDiveContent: null });

        try {
          // Search HF for context
          let hfContext = '';
          if (dataMode !== 'lightweight') {
            const results = await get().searchForSubcategory(
              controlId,
              controlData?.keywords || [],
              controlData?.sp80053 || []
            );
            hfContext = get().formatHFContext(results);
          }

          const prompt = `Provide comprehensive NIST implementation guidance for:

**CSF 2.0 Control:** ${controlId}
**Description:** ${controlData?.description || 'See NIST CSF 2.0'}
**Current Assessment:**
- Actual Score: ${assessmentObservation?.quarters?.Q1?.actualScore || 'Not assessed'}
- Target Score: ${assessmentObservation?.quarters?.Q1?.targetScore || 'Not set'}
- Observations: ${assessmentObservation?.quarters?.Q1?.observations || 'None'}

${hfContext ? `**NIST GUIDANCE:**\n${hfContext}\n` : ''}

Provide a comprehensive implementation guide with:

1. **SP 800-53 Control Mapping** - Specific controls that address this CSF outcome
2. **Implementation Steps** - Numbered, actionable steps to improve from current to target score
3. **Assessment Procedures** - How to verify implementation (from SP 800-53A)
4. **Common Pitfalls** - What organizations typically get wrong
5. **Recommended Tools** - Specific tools that can help
6. **Policy Template Outline** - Key sections a policy should include
7. **Metrics** - How to measure effectiveness
8. **Evidence Examples** - Documentation/artifacts that demonstrate compliance

Be specific and practical for GRC professionals.`;

          let result;
          if (llmProvider === 'ollama') {
            result = await get().generateWithOllama(prompt, 3500);
          } else {
            result = await get().generateWithClaude(prompt, 3500);
          }

          set({ deepDiveContent: result, isLoadingDeepDive: false });
          return result;
        } catch (error) {
          console.error('Deep dive error:', error);
          set({
            deepDiveContent: `Error generating guidance. Please try again.`,
            isLoadingDeepDive: false
          });
          throw error;
        }
      },

      // Ask a follow-up question
      askQuestion: async (question, context = '') => {
        const { llmProvider, chatHistory } = get();

        const prompt = `${context ? `Context:\n${context}\n\n` : ''}Previous conversation:
${chatHistory.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n')}

User question: ${question}

Provide a helpful, NIST-focused answer. Reference specific SP 800-53 controls, CSF outcomes, or NIST publications where relevant.`;

        try {
          let response;
          if (llmProvider === 'ollama') {
            response = await get().generateWithOllama(prompt, 2000);
          } else {
            response = await get().generateWithClaude(prompt, 2000);
          }

          const newHistory = [
            ...chatHistory,
            { role: 'user', content: question },
            { role: 'assistant', content: response }
          ].slice(-10); // Keep last 10 messages

          set({ chatHistory: newHistory });
          return response;
        } catch (error) {
          console.error('Question error:', error);
          throw error;
        }
      },

      // Clear analysis
      clearAnalysis: () => set({
        analysisResult: null,
        analysisError: null,
        deepDiveContent: null,
        selectedControlId: null,
        chatHistory: []
      }),

      // Generate remediation action plan for a control
      generateRemediationPlan: async (controlId, controlData, currentState) => {
        const { llmProvider } = get();

        const prompt = `Generate a detailed remediation action plan for:

**Control:** ${controlId}
**Current Score:** ${currentState.actualScore}/10
**Target Score:** ${currentState.targetScore}/10
**Current State:** ${currentState.observations || 'Not documented'}

Create a structured action plan with:
1. **Immediate Actions (0-30 days)** - Quick wins to show progress
2. **Short-term Actions (30-90 days)** - Core implementation tasks
3. **Long-term Actions (90-180 days)** - Maturation and optimization
4. **Resources Required** - Staff, tools, budget estimates
5. **Success Metrics** - How to measure completion
6. **Risk Mitigation** - What to watch for during implementation

Format as an actionable plan that can be imported into a remediation tracker.`;

        let result;
        if (llmProvider === 'ollama') {
          result = await get().generateWithOllama(prompt, 2500);
        } else {
          result = await get().generateWithClaude(prompt, 2500);
        }

        return result;
      }
    }),
    {
      name: 'csf-ai-storage',
      partialize: (state) => ({
        llmProvider: state.llmProvider,
        claudeApiKey: state.claudeApiKey,
        dataMode: state.dataMode,
        analysisResult: state.analysisResult,
        chatHistory: state.chatHistory
      }),
    }
  )
);

export default useAIStore;
