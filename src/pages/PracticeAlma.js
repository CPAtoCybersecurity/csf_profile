import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Download } from 'lucide-react';
import { COMPREHENSIVE_ASSESSMENT_ID } from '../stores/comprehensiveAssessmentData';
import { quotaSafeLocalStorage } from '../utils/safeStorage';
import './PracticeAlma.css';

const STORAGE_KEY = 'alma-practice-draft-v1';
const INITIAL_DRAFT = { step: 0, score: '', reason: '', gap: '', action: '' };
const STEP_NAMES = ['Start', 'Evidence', 'Score', 'Compare', 'Finding', 'Portfolio note'];
const SUGGESTED_SCORES = [4, 4.5, 5, 5.5, 6];
const CASE_STUDY_LINK = `/assessments?selected=${COMPREHENSIVE_ASSESSMENT_ID}&brief=1`;
const OBSERVATION_URL = 'https://github.com/CPAtoCybersecurity/csf_profile/blob/main/ASSESSMENT_CATALOG/4_Observations/ID/ID.AM-01-Q1.md';

const loadDraft = () => {
  try {
    const saved = JSON.parse(quotaSafeLocalStorage.getItem(STORAGE_KEY));
    if (saved && Number.isInteger(saved.step) && saved.step >= 0 && saved.step <= 5) {
      return { ...INITIAL_DRAFT, ...saved };
    }
  } catch (_) { /* An unreadable draft should not block the lesson. */ }
  return INITIAL_DRAFT;
};

export const buildPortfolioNote = ({ score, reason, gap, action }) => `# Alma Security — Hardware Inventory Practice Assessment

- **Framework outcome:** NIST CSF 2.0 ID.AM-01 — Inventories of hardware managed by the organization are maintained
- **Assessment period:** Q1 2026
**Type:** Educational practice based on the fictional Alma Security case study

## Evidence reviewed

- ServiceNow CMDB contains the hardware inventory, but three network-discovered devices were absent from it.
- 55 of 847 AWS resources lacked one or more required tags.
- One of five sampled physical assets could not be located; another had stale ownership data.
- Reconciliation of the CMDB, scans, and AWS Config was ad hoc rather than scheduled.

## My assessment

**Current score:** ${score}/10

**Rationale:** ${reason.trim()}

## Gap and recommended action

**Gap:** ${gap.trim()}

**Recommended action:** ${action.trim()}

## Learning comparison

The catalog's Q1 example scores this outcome **4.5/10**, against a **6.5/10 target**. A defined CMDB and tagging standard exist, but the unlocated asset, missing devices, tagging exceptions, and lack of scheduled reconciliation keep the inventory below the rubric's 5.0 minimum passing level. Different scores can be defensible when the evidence and rubric support them.

## Sources

- Alma Security, ID.AM-01 Q1 observation: ${OBSERVATION_URL}
- Alma Security case study and scoring rubric: https://github.com/CPAtoCybersecurity/csf_profile/tree/main/ASSESSMENT_CATALOG
`;

const PracticeAlma = () => {
  const [draft, setDraft] = useState(loadDraft);
  const update = (patch) => setDraft((current) => ({ ...current, ...patch }));
  const { step, score, reason, gap, action } = draft;

  useEffect(() => {
    quotaSafeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  const downloadNote = () => {
    const blob = new Blob([buildPortfolioNote(draft)], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Alma-ID.AM-01-Practice-Assessment.md';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="alma-practice">
      <header className="alma-practice__header">
        <h1>Practice with Alma</h1>
        <p>Work through one real case-study example at your own pace. Your practice draft saves in this browser and does not change the main assessment.</p>
      </header>

      <div className="alma-practice__progress" role="status" aria-live="polite">
        <span>Step {step + 1} of {STEP_NAMES.length} — {STEP_NAMES[step]}</span>
        <progress value={step + 1} max={STEP_NAMES.length} aria-label="Practice progress" />
      </div>

      <main className="alma-practice__panel">
        {step === 0 && (
          <>
            <h2>One requirement, one clear first win</h2>
            <p>You will assess <strong>ID.AM-01: hardware inventory</strong>. This means checking whether Alma knows which hardware and cloud resources it manages.</p>
            <p>First review the evidence, then pick a score and explain why. After you commit to an answer, you can compare it with the catalog example and write one useful recommendation.</p>
            <p className="alma-practice__note">This is practice. Your answer is saved separately from Alma's scored assessment.</p>
            <div className="alma-practice__actions">
              <Link to={CASE_STUDY_LINK} className="alma-practice__secondary"><BookOpen size={17} /> Read Alma's full case study</Link>
              <button type="button" className="alma-practice__primary" onClick={() => update({ step: 1 })}>Start practice <ArrowRight size={17} /></button>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2>Review the evidence</h2>
            <p><strong>Evidence</strong> is what the assessor examined or tested. Read these Q1 findings before deciding how well Alma maintains its inventory.</p>
            <div className="alma-practice__evidence">
              <section><h3>What works</h3><p>Alma uses ServiceNow CMDB for hardware inventory and has a cloud tagging standard.</p></section>
              <section><h3>What is missing</h3><p>A network scan found three devices missing from the CMDB. Two listed as active could not be reached. 55 of 847 AWS resources missed required tags, and reconciliation was ad hoc.</p></section>
              <section><h3>What was tested</h3><p>One of five sampled physical assets could not be located; another had an outdated owner.</p></section>
            </div>
            <p className="alma-practice__source">Source: Alma's Q1 ID.AM-01 observation. <a href={OBSERVATION_URL} target="_blank" rel="noopener noreferrer">Read the full observation</a>.</p>
            <div className="alma-practice__actions">
              <button type="button" className="alma-practice__secondary" onClick={() => update({ step: 0 })}><ArrowLeft size={17} /> Back</button>
              <button type="button" className="alma-practice__primary" onClick={() => update({ step: 2 })}>Continue to scoring <ArrowRight size={17} /></button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Choose a current score</h2>
            <p>A <strong>current score</strong> describes what the evidence shows now. Compare Alma's evidence with these nearby rubric levels.</p>
            <div className="alma-practice__rubric" aria-label="Nearby scoring rubric levels">
              <div><strong>4</strong><span>Regular process with material gaps</span></div>
              <div><strong>5</strong><span>Consistent across scope with only minor flaws</span></div>
              <div><strong>6</strong><span>Measured and tracked</span></div>
            </div>
            <p className="alma-practice__hint">Half points let you place Alma between two rubric levels.</p>
            <div className="alma-practice__field">
              <span className="alma-practice__field-label" id="practice-score-label">Choose your current score</span>
              <div className="alma-practice__score-options" role="group" aria-labelledby="practice-score-label">
                {SUGGESTED_SCORES.map((value) => <button key={value} type="button" aria-label={`Choose score ${value.toFixed(1)} out of 10`} aria-pressed={Number(score) === value} onClick={() => update({ score: String(value) })}>{value.toFixed(1)}</button>)}
              </div>
              <details className="alma-practice__score-more"><summary>Choose another score from the full 0–10 scale</summary>
                <label htmlFor="practice-score">Your current score</label>
                <select id="practice-score" value={score} onChange={(event) => update({ score: event.target.value })}>
                  <option value="">Choose a score</option>
                  {Array.from({ length: 21 }, (_, index) => index / 2).map((value) => <option key={value} value={value}>{value.toFixed(1)} / 10</option>)}
                </select>
              </details>
            </div>
            <div className="alma-practice__field">
              <label htmlFor="practice-reason">Why did you choose that score?</label>
              <p>Point to at least one strength and one gap from the evidence.</p>
              <textarea id="practice-reason" rows={5} value={reason} onChange={(event) => update({ reason: event.target.value })} placeholder="Alma has a CMDB, but the scan and physical sample show..." />
            </div>
            <details><summary>Show more of the scoring rubric</summary><p>0: nothing exists · 2: ad hoc · 3: defined but unreliable · 4: regular with material gaps · 5: consistent across scope · 6: measured · 7: improving over time · 8: highly effective and proportionate. Scores of 9–10 mean excessive burden.</p></details>
            <div className="alma-practice__actions">
              <button type="button" className="alma-practice__secondary" onClick={() => update({ step: 1 })}><ArrowLeft size={17} /> Back to evidence</button>
              <button type="button" className="alma-practice__primary" disabled={score === '' || !reason.trim()} onClick={() => update({ step: 3 })}>Compare with the example <ArrowRight size={17} /></button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2>Compare your reasoning</h2>
            <p className="alma-practice__score">Your score: <strong>{Number(score).toFixed(1)}</strong> · Catalog example: <strong>4.5</strong> · Target: <strong>6.5</strong></p>
            <p><strong>Your rationale:</strong> {reason}</p>
            <p>The catalog credits Alma for having a CMDB and tagging standard. It scores below 5 because missing devices, an unlocated sampled asset, tagging exceptions, and no scheduled reconciliation make the inventory unreliable.</p>
            <p className="alma-practice__note">The goal is evidence-based judgment. A different score can be reasonable if your explanation fits the rubric.</p>
            <div className="alma-practice__actions">
              <button type="button" className="alma-practice__secondary" onClick={() => update({ step: 2 })}><ArrowLeft size={17} /> Revise score</button>
              <button type="button" className="alma-practice__primary" onClick={() => update({ step: 4 })}>Continue to finding <ArrowRight size={17} /></button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2>Turn the gap into an action</h2>
            <p>A <strong>gap</strong> is the difference between what the evidence shows and the desired state. A <strong>recommendation</strong> tells the control owner what to change.</p>
            <div className="alma-practice__field">
              <label htmlFor="practice-gap">What gap did you find?</label>
              <textarea id="practice-gap" rows={3} value={gap} onChange={(event) => update({ gap: event.target.value })} placeholder="The inventory is incomplete because..." />
            </div>
            <div className="alma-practice__field">
              <label htmlFor="practice-action">What should Alma do?</label>
              <textarea id="practice-action" rows={3} value={action} onChange={(event) => update({ action: event.target.value })} placeholder="Assign an owner and reconcile the CMDB with..." />
            </div>
            <details><summary>Show the catalog's example action</summary><p>Implement monthly reconciliation between ServiceNow CMDB, network scans, and AWS Config. Identify owners for the 55 resources missing tags and locate the missing sampled asset.</p></details>
            <div className="alma-practice__actions">
              <button type="button" className="alma-practice__secondary" onClick={() => update({ step: 3 })}><ArrowLeft size={17} /> Back to comparison</button>
              <button type="button" className="alma-practice__primary" disabled={!gap.trim() || !action.trim()} onClick={() => update({ step: 5 })}>Review portfolio note <ArrowRight size={17} /></button>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <h2>Your portfolio note</h2>
            <p>You completed one small assessment. Download this Markdown note as a starting point for a portfolio write-up. Review and edit it before sharing it publicly.</p>
            <article className="alma-practice__report" aria-label="Portfolio note preview">
              <header><p>Educational practice · fictional case study</p><h3>Assessment summary</h3><span>NIST CSF 2.0 · ID.AM-01 · Q1 2026</span></header>
              <div className="alma-practice__report-score"><span>Current score</span><strong>{Number(score).toFixed(1)}<small> / 10</small></strong></div>
              <section><h4>Evidence reviewed</h4><ul><li>ServiceNow CMDB and a cloud tagging standard exist.</li><li>Three discovered devices were missing from the CMDB; 55 of 847 AWS resources lacked required tags.</li><li>One sampled asset could not be located, and reconciliation was ad hoc.</li></ul></section>
              <section><h4>My reasoning</h4><p>{reason}</p></section>
              <section><h4>Gap</h4><p>{gap}</p></section>
              <section><h4>Recommended action</h4><p>{action}</p></section>
              <p className="alma-practice__report-footnote">The catalog example scores this outcome 4.5/10 against a 6.5/10 target. The download includes full source links and comparison notes.</p>
            </article>
            <div className="alma-practice__actions">
              <button type="button" className="alma-practice__secondary" onClick={() => update({ step: 4 })}><ArrowLeft size={17} /> Edit finding</button>
              <button type="button" className="alma-practice__primary" onClick={downloadNote}><Download size={17} /> Download Markdown</button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default PracticeAlma;
