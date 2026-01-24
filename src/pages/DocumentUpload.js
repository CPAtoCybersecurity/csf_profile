import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import useAIStore from '../stores/aiStore';
import { Upload, FileText, Trash2, ArrowLeft, Loader2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

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

const DocumentUpload = ({ embedded = false }) => {
  const navigate = useNavigate();
  const { llmProvider, generateWithOllama, generateWithClaude, ollamaStatus, claudeApiKey, checkOllama } = useAIStore();
  const fileInputRef = useRef(null);

  // Check Ollama status on mount
  React.useEffect(() => {
    if (llmProvider === 'ollama') {
      checkOllama();
    }
  }, [llmProvider, checkOllama]);

  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [userNotes, setUserNotes] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [documentAnalysis, setDocumentAnalysis] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Extract text from uploaded file
  const extractTextFromFile = async (file) => {
    if (file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
      return await file.text();
    }
    // For PDF/DOCX, return placeholder (would need PDF.js or mammoth.js)
    return `[Content from ${file.name} - PDF/DOCX extraction requires additional setup. Please use TXT or MD files for now.]`;
  };

  // Handle file upload with validation
  const handleFileUpload = async (files) => {
    const newDocs = [];
    for (const file of files) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        alert(`File "${file.name}" exceeds 10MB limit and was not uploaded.`);
        continue;
      }

      // Validate file extension
      const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
      if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
        alert(`File "${file.name}" has an unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
        continue;
      }

      // Validate MIME type (additional check beyond extension)
      if (file.type && !ALLOWED_MIME_TYPES.includes(file.type) && file.type !== '') {
        // Allow empty MIME type as some browsers don't set it for .md files
        console.warn(`File "${file.name}" has unexpected MIME type: ${file.type}`);
      }

      // Sanitize filename
      const safeName = sanitizeFilename(file.name);

      const text = await extractTextFromFile(file);
      newDocs.push({
        id: uuidv4(),
        name: safeName,
        originalName: file.name, // Keep original for display
        type: file.type,
        size: file.size,
        text: text,
        status: 'ready'
      });
    }
    setUploadedDocuments(prev => [...prev, ...newDocs]);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    await handleFileUpload(files);
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    await handleFileUpload(files);
  };

  const removeDocument = (id) => {
    setUploadedDocuments(prev => prev.filter(d => d.id !== id));
  };

  // Analyze documents against CSF 2.0
  const analyzeDocuments = async () => {
    if (uploadedDocuments.length === 0 && !userNotes.trim()) {
      alert('Please upload documents or add notes first.');
      return;
    }

    setIsAnalyzing(true);
    setDocumentAnalysis(null);

    // Combine all document text
    const allText = uploadedDocuments.map(d =>
      `=== ${d.name} ===\n${d.text}`
    ).join('\n\n') + (userNotes ? `\n\n=== User Notes ===\n${userNotes}` : '');

    const prompt = `You are analyzing organizational documents to pre-populate a NIST CSF 2.0 assessment.

DOCUMENTS PROVIDED:
${allText.substring(0, 8000)}

Analyze these documents and identify evidence for CSF 2.0 controls. For each control where you find evidence, provide:

Respond in this exact JSON format:
{
  "findings": [
    {
      "controlId": "GV.PO-01",
      "score": "yes",
      "confidence": 0.85,
      "evidence": "Brief description of what was found",
      "quote": "Relevant quote from document"
    }
  ],
  "coverage": {
    "GOVERN": 45,
    "IDENTIFY": 30,
    "PROTECT": 60,
    "DETECT": 20,
    "RESPOND": 55,
    "RECOVER": 15
  },
  "gaps": ["List of major gaps identified"],
  "recommendations": ["Key recommendations based on analysis"]
}

Use these score values:
- "yes" = Clear, complete evidence exists
- "partial" = Some evidence but incomplete
- "planned" = Plans or intentions documented
- "no" = No evidence found

Be conservative with scores. Only mark "yes" if clear, complete evidence exists.`;

    try {
      let response;
      if (llmProvider === 'ollama') {
        response = await generateWithOllama(prompt, 3000);
      } else {
        response = await generateWithClaude(prompt, 3000);
      }

      // Try to parse JSON from response
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setDocumentAnalysis(parsed);
        } else {
          setDocumentAnalysis({ raw: response, error: 'Could not parse JSON response' });
        }
      } catch (e) {
        setDocumentAnalysis({ raw: response, error: e.message });
      }
    } catch (error) {
      setDocumentAnalysis({ error: error.message });
    }

    setIsAnalyzing(false);
  };

  // Apply analysis to assessment (navigate to assessments page with data)
  const applyToAssessment = () => {
    if (!documentAnalysis?.findings) return;
    // Store in localStorage for the assessments page to pick up
    localStorage.setItem('pendingAssessmentData', JSON.stringify({
      findings: documentAnalysis.findings,
      timestamp: new Date().toISOString(),
      source: 'document-upload'
    }));
    navigate('/assessments?import=true');
  };

  const isReady = llmProvider === 'ollama'
    ? ollamaStatus.available && ollamaStatus.hasModel
    : !!claudeApiKey;

  const getScoreIcon = (score) => {
    switch (score) {
      case 'yes': return <CheckCircle size={14} className="text-green-500" />;
      case 'partial': return <AlertCircle size={14} className="text-yellow-500" />;
      case 'planned': return <AlertCircle size={14} className="text-blue-500" />;
      default: return <AlertCircle size={14} className="text-red-500" />;
    }
  };

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
                  <h1 className="text-xl font-bold text-gray-800">Document Upload + Assessment</h1>
                  <p className="text-sm text-gray-500">Upload documents to auto-populate your CSF assessment</p>
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
          <p className="text-sm text-gray-600">Upload documents to auto-populate your CSF assessment</p>
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
          {/* Left: Upload Section */}
          <div className="space-y-6">
            {/* Drop Zone */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Upload Evidence Documents</h2>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
                  ${dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400'}`}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  hidden
                  onChange={handleFileSelect}
                  accept=".txt,.md,.pdf,.docx"
                />
                <Upload size={48} className="mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600">Drop files here or click to upload</p>
                <p className="text-xs text-gray-400 mt-1">TXT, MD supported (PDF/DOCX coming soon)</p>
              </div>

              {/* Uploaded Files */}
              {uploadedDocuments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedDocuments.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText size={20} className="text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">{doc.name}</p>
                          <p className="text-xs text-gray-400">{(doc.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeDocument(doc.id)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Additional Notes</h2>
              <textarea
                value={userNotes}
                onChange={e => setUserNotes(e.target.value)}
                placeholder="Add context about your security program, tools used, processes in place..."
                className="w-full h-32 px-3 py-2 border rounded-lg text-sm resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Analyze Button */}
            <button
              onClick={analyzeDocuments}
              disabled={isAnalyzing || (uploadedDocuments.length === 0 && !userNotes.trim()) || !isReady}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Analyzing Documents...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Analyze Documents
                </>
              )}
            </button>
          </div>

          {/* Right: Analysis Results */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Analysis Results</h2>

            {!documentAnalysis ? (
              <div className="text-center py-12 text-gray-500">
                <FileText size={48} className="mx-auto mb-3 opacity-30" />
                <p>Upload documents and click "Analyze" to see coverage</p>
              </div>
            ) : documentAnalysis.error && !documentAnalysis.findings ? (
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-red-700 text-sm font-medium">Error: {documentAnalysis.error}</p>
                {documentAnalysis.raw && (
                  <pre className="mt-2 text-xs whitespace-pre-wrap max-h-48 overflow-y-auto text-gray-600">
                    {documentAnalysis.raw}
                  </pre>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Coverage Bars */}
                {documentAnalysis.coverage && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-700">Coverage by Function</h3>
                    {Object.entries(documentAnalysis.coverage).map(([func, pct]) => (
                      <div key={func} className="flex items-center gap-3">
                        <span className="w-20 text-xs font-medium text-gray-600">{func}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-green-600 h-3 rounded-full transition-all"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="w-10 text-xs text-gray-500">{pct}%</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Findings */}
                {documentAnalysis.findings && documentAnalysis.findings.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Controls with Evidence ({documentAnalysis.findings.length})
                    </h3>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {documentAnalysis.findings.map((f, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs">
                          {getScoreIcon(f.score)}
                          <span className="font-medium">{f.controlId}</span>
                          <span className="text-gray-400 truncate flex-1">{f.evidence}</span>
                          <span className="text-gray-400">{Math.round((f.confidence || 0) * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gaps */}
                {documentAnalysis.gaps && documentAnalysis.gaps.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Major Gaps Identified</h3>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {documentAnalysis.gaps.map((gap, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <AlertCircle size={12} className="text-red-500 mt-0.5 shrink-0" />
                          {gap}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {documentAnalysis.recommendations && documentAnalysis.recommendations.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Recommendations</h3>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {documentAnalysis.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Apply Button */}
                {documentAnalysis.findings && documentAnalysis.findings.length > 0 && (
                  <button
                    onClick={applyToAssessment}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    Apply to Assessment
                    <ArrowRight size={18} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
