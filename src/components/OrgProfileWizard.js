import React, { useState } from 'react';
import { X, Building2, Server, Shield, Gem, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import useOrgProfileStore, { EMPTY_PROFILE } from '../stores/orgProfileStore';
import { INFRA_PRESET_LABELS } from '../utils/infraPresets';

/**
 * Optional org-profile mini-wizard. Five questions, every one skippable,
 * "Skip all" always visible — this NEVER gates any other flow. Answers are
 * stored only in this browser and are excluded from share exports
 * unconditionally (see PRIVATE_DATA.md).
 */

const SIZE_BANDS = ['1–49', '50–249', '250–999', '1,000–4,999', '5,000+'];

// Cloud, email, and chat selections drive DETERMINISTIC procedure tailoring
// (canned substitutions, no AI) — see utils/stackTailorMaps.js. The preset
// list lives in utils/infraPresets.js so the assessment wizard's Environment
// step can read the same source of truth; the persisted token stays the label.

// Naming a specific EDR product here enables an exact SentinelOne→product
// swap in tailored procedures; the generic 'EDR' chip neutralizes instead.
const TOOL_PRESETS = [
  'EDR', 'SIEM', 'IdP / SSO', 'MFA', 'Vulnerability scanner', 'DLP', 'Backup / DR', 'Firewall / SASE',
  'CrowdStrike Falcon', 'Microsoft Defender for Endpoint', 'SentinelOne'
];

const ChipPicker = ({ presets, value, onChange, placeholder }) => {
  const [draft, setDraft] = useState('');
  const add = (chip) => {
    const c = chip.trim();
    if (c && !value.includes(c)) onChange([...value, c]);
    setDraft('');
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {presets.filter((p) => !value.includes(p)).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => add(p)}
            className="px-2 py-1 text-xs rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            + {p}
          </button>
        ))}
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((chip) => (
            <span key={chip} className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 flex items-center gap-1">
              {chip}
              <button type="button" onClick={() => onChange(value.filter((c) => c !== chip))} aria-label={`Remove ${chip}`}>
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            add(draft);
          }
        }}
        placeholder={placeholder}
        className="w-full p-2 text-sm border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
      />
    </div>
  );
};

const OrgProfileWizard = ({ onClose }) => {
  const savedProfile = useOrgProfileStore((s) => s.profile);
  const saveProfile = useOrgProfileStore((s) => s.saveProfile);
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState({ ...EMPTY_PROFILE, ...(savedProfile || {}) });

  const patch = (fields) => setDraft((d) => ({ ...d, ...fields }));

  const finish = () => {
    saveProfile(draft);
    toast.success('Organization profile saved (stored only in this browser)');
    onClose();
  };

  const steps = [
    {
      icon: Building2,
      title: 'What kind of business is it?',
      body: (
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">Organization name</label>
            <input
              type="text"
              value={draft.orgName}
              onChange={(e) => patch({ orgName: e.target.value })}
              placeholder="e.g. Northwind Insurance"
              className="w-full p-2 text-sm border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Used to substitute the case study's fictional "Alma Security" in attached procedures.
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">Industry / what the business does</label>
            <input
              type="text"
              value={draft.industry}
              onChange={(e) => patch({ industry: e.target.value })}
              placeholder="e.g. regional health insurer; B2B SaaS; manufacturing"
              className="w-full p-2 text-sm border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      )
    },
    {
      icon: Building2,
      title: 'How big is the organization?',
      body: (
        <div className="space-y-2">
          {SIZE_BANDS.map((band) => (
            <label key={band} className="flex items-center gap-3 p-2 border dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <input
                type="radio"
                name="sizeBand"
                checked={draft.sizeBand === band}
                onChange={() => patch({ sizeBand: band })}
              />
              <span className="text-sm dark:text-white">{band} people</span>
            </label>
          ))}
        </div>
      )
    },
    {
      icon: Server,
      title: 'Key IT infrastructure?',
      body: (
        <ChipPicker
          presets={INFRA_PRESET_LABELS}
          value={draft.infrastructure}
          onChange={(infrastructure) => patch({ infrastructure })}
          placeholder="Add your own and press Enter…"
        />
      )
    },
    {
      icon: Shield,
      title: 'Security tools in use?',
      body: (
        <ChipPicker
          presets={TOOL_PRESETS}
          value={draft.securityTools}
          onChange={(securityTools) => patch({ securityTools })}
          placeholder="e.g. CrowdStrike, Splunk, Okta — press Enter to add…"
        />
      )
    },
    {
      icon: Gem,
      title: 'Crown jewels — your highest-value assets?',
      body: (
        <div className="space-y-2">
          <ChipPicker
            presets={[]}
            value={draft.crownJewels}
            onChange={(crownJewels) => patch({ crownJewels })}
            placeholder="e.g. customer PII database, payment platform — press Enter to add…"
          />
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-300">
            This profile — especially crown jewels and tooling — is sensitive. It stays in this
            browser's local storage, is <strong>never included in share exports</strong> (tailored
            procedure text is swapped back to the community version), and rides complete backups
            only. Password-protect backups that carry it.
          </div>
        </div>
      )
    }
  ];

  const current = steps[step - 1];
  const Icon = current.icon;
  const isLast = step === steps.length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Icon size={18} className="text-amber-600" />
            Organization profile
          </h3>
          <button onClick={onClose} aria-label="Close">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-1 mb-4">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i < step ? 'bg-amber-500' : 'bg-gray-200 dark:bg-gray-600'}`} />
            ))}
          </div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            {step}. {current.title} <span className="text-xs font-normal text-gray-400">(optional)</span>
          </h4>
          {current.body}
        </div>

        <div className="flex items-center justify-between p-4 border-t dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
            title="Close without saving — you can set this up any time in Settings"
          >
            Skip all
          </button>
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-3 py-2 text-sm border dark:border-gray-600 rounded-lg flex items-center gap-1 dark:text-gray-300"
              >
                <ChevronLeft size={14} /> Back
              </button>
            )}
            {!isLast && (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-3 py-2 text-sm border dark:border-gray-600 rounded-lg dark:text-gray-300"
                title="Skip this question"
              >
                Skip
              </button>
            )}
            {isLast ? (
              <button
                type="button"
                onClick={finish}
                className="px-4 py-2 text-sm bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-medium"
              >
                Save profile
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-4 py-2 text-sm bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-medium flex items-center gap-1"
              >
                Next <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgProfileWizard;
