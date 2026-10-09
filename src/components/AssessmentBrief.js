import React, { useEffect, useState } from 'react';
import { BookOpen, ChevronLeft, ExternalLink, FileText, Pencil, Save, X } from 'lucide-react';
import { COMPREHENSIVE_ASSESSMENT_ID } from '../stores/comprehensiveAssessmentData';
import AlmaCaseStudyLibrary from './AlmaCaseStudyLibrary';
import './AssessmentBrief.css';

const ALMA_FACT_SHEET_URL = 'https://github.com/CPAtoCybersecurity/csf_profile/blob/main/ASSESSMENT_CATALOG/0_Methodology/Alma-Fact-Sheet.md';

const ALMA_RISKS = [
  ['R1', 'Security understaffing', 'Five senior staff left after the 2024 incidents.'],
  ['R2', 'Perimeter visibility', 'External attack-surface monitoring is incomplete.'],
  ['R3', 'Slow detection', 'The post-incident time-to-detect baseline was 81 hours.'],
  ['R4', 'Asset inventory', 'The full population of hosts, S3 buckets, and endpoints is not known.'],
  ['R5', 'Public trust', 'The two incidents damaged customer confidence.'],
  ['R6', 'Supplier risk', 'A critical supplier failure could affect the platform and its customers.']
];

export const isAlmaCaseStudy = (assessment) =>
  assessment?.id === COMPREHENSIVE_ASSESSMENT_ID || assessment?.caseStudyId === 'alma-security';

const AssessmentBrief = ({ assessment, onBack, onSaveDescription }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(assessment?.description || '');

  useEffect(() => {
    setEditing(false);
    setDraft(assessment?.description || '');
  }, [assessment?.id, assessment?.description]);

  if (!assessment) return null;

  const isAlma = isAlmaCaseStudy(assessment);
  const scopeCount = assessment.scopeIds?.length || 0;
  const scopeLabel = assessment.scopeType === 'controls' ? 'controls' : 'requirements';

  const saveBackground = () => {
    onSaveDescription(assessment.id, draft.trim());
    setEditing(false);
  };

  return (
    <section className="assessment-brief" aria-labelledby="assessment-brief-title">
      <div className="assessment-brief__header">
        <button type="button" className="assessment-brief__back" onClick={onBack}>
          <ChevronLeft size={18} aria-hidden="true" /> Back to assessment
        </button>
        <div className="assessment-brief__eyebrow"><BookOpen size={16} aria-hidden="true" /> Case study</div>
        <h1 id="assessment-brief-title">{assessment.name}</h1>
        <p>
          {isAlma
            ? 'The organization, incidents, risks, and assessment context in one place.'
            : 'Your assessment context, scope, and working background in one place.'}
        </p>
      </div>

      <div className="assessment-brief__content">
        <div className="assessment-brief__facts" aria-label="Assessment at a glance">
          <div><span>Year</span><strong>{assessment.year || 'Not set'}</strong></div>
          <div><span>Scope</span><strong>{scopeCount} {scopeLabel} in scope</strong></div>
          <div><span>Status</span><strong>{assessment.status || 'Not started'}</strong></div>
        </div>

        {isAlma && (
          <>
            <section className="assessment-brief__section" aria-labelledby="alma-overview-title">
              <h2 id="alma-overview-title">Organization at a glance</h2>
              <p>Alma Security is a fictional continuous-authentication SaaS company founded in 2021. It has 300 employees, $36.4M in annual recurring revenue as of Q1 2026, and a 15-person security team.</p>
              <p>Its platform runs primarily on AWS with Kubernetes/EKS, S3, and PostgreSQL. The security stack includes CloudTrail and GuardDuty for detection, SentinelOne for endpoints, CyberArk for privileged access, and ServiceNow for tickets and the risk register.</p>
            </section>

            <section className="assessment-brief__section" aria-labelledby="alma-incidents-title">
              <h2 id="alma-incidents-title">Why this assessment matters</h2>
              <div className="assessment-brief__event-list">
                <article>
                  <strong>INC-2024-01 · March 2024</strong>
                  <p>A public S3 bucket exposed about 18,400 customer configuration records. No biometric templates were exposed, but the event damaged public trust.</p>
                </article>
                <article>
                  <strong>INC-2024-02 · August 2024</strong>
                  <p>A stolen shared developer SSH key enabled access to a staging node. Detection took 81 hours; the actor was contained before production data access.</p>
                </article>
              </div>
              <p>Alma began its first annual NIST CSF 2.0 assessment cycle in 2026, with quarterly scoring by Internal Audit.</p>
            </section>

            <section className="assessment-brief__section" aria-labelledby="alma-risks-title">
              <h2 id="alma-risks-title">Strategic risks to keep in view</h2>
              <ul className="assessment-brief__risk-list">
                {ALMA_RISKS.map(([id, title, detail]) => (
                  <li key={id}><strong>{id} · {title}</strong><span>{detail}</span></li>
                ))}
              </ul>
            </section>

            <p className="assessment-brief__source">
              <FileText size={16} aria-hidden="true" /> Summary drawn from the Alma Fact Sheet in the Assessment Catalog.
              <a href={ALMA_FACT_SHEET_URL} target="_blank" rel="noopener noreferrer">
                Read the full source <ExternalLink size={14} aria-hidden="true" />
              </a>
            </p>
            <AlmaCaseStudyLibrary />
          </>
        )}

        <section className="assessment-brief__section" aria-labelledby="assessment-background-title">
          <div className="assessment-brief__section-heading">
            <h2 id="assessment-background-title">Assessment background</h2>
            {!editing && (
              <button type="button" className="assessment-brief__action" onClick={() => setEditing(true)}>
                <Pencil size={15} aria-hidden="true" /> Edit background
              </button>
            )}
          </div>
          {editing ? (
            <div className="assessment-brief__editor">
              <label htmlFor="assessment-background-input">Assessment background</label>
              <textarea
                id="assessment-background-input"
                rows={7}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Describe the organization, why this assessment is being done, key risks, stakeholders, and available evidence."
              />
              <div className="assessment-brief__editor-actions">
                <button type="button" className="assessment-brief__action" onClick={() => { setDraft(assessment.description || ''); setEditing(false); }}>
                  <X size={15} aria-hidden="true" /> Cancel
                </button>
                <button type="button" className="assessment-brief__action assessment-brief__action--primary" onClick={saveBackground}>
                  <Save size={15} aria-hidden="true" /> Save background
                </button>
              </div>
            </div>
          ) : assessment.description ? (
            <p className="assessment-brief__background">{assessment.description}</p>
          ) : (
            <p className="assessment-brief__empty">No background has been added yet. Describe the organization, purpose, key risks, and evidence so reviewers can understand your assessment.</p>
          )}
        </section>

        <section className="assessment-brief__section" aria-labelledby="assessment-workflow-title">
          <h2 id="assessment-workflow-title">How to work through this assessment</h2>
          <ol className="assessment-brief__steps">
            <li>Review the scoped controls or requirements and the organization context above.</li>
            <li>Examine evidence, interview the relevant people, and record the tests performed.</li>
            <li>Document observations, link artifacts and findings, then justify current and target scores.</li>
            <li>Export the workpapers and prepare a concise report with prioritized recommendations.</li>
          </ol>
        </section>
      </div>
    </section>
  );
};

export default AssessmentBrief;
