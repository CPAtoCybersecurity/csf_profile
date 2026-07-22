import React, { useMemo, useState } from 'react';
import { Pencil, Plus, Search, Server, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useInventoryStore, {
  ACCESS_REVIEW_CADENCES,
  AUTH_METHODS,
  BCDR_TIERS,
  COMPLIANCE_SCOPES,
  DATA_CLASSIFICATIONS,
  DATA_RESIDENCIES,
  DEPLOYMENT_TYPES,
  DEPROVISIONING_TRIGGERS,
  DISCOVERY_SOURCES,
  EXPOSURE_LEVELS,
  INVENTORY_STAGES,
  PATCHING_RESPONSIBILITIES,
  PROVISIONING_METHODS,
  REGULATED_DATA_TYPES,
  SECURITY_TIERS,
  SYSTEM_FIELD_DEFAULTS,
  TPRM_ARTIFACTS,
  TRI_STATE
} from '../stores/inventoryStore';
import useUserStore from '../stores/userStore';
import { sanitizeExternalUrl } from '../utils/externalLinks';

/**
 * Inventory — the org's system/application register. One record per system:
 * identification, ownership, data profile, access & identity, security
 * posture, resilience (BCDR), and record hygiene. Field groups carry their
 * CSF 2.0 anchors — a populated inventory IS ID.AM evidence.
 *
 * Records stay in this browser (csf-inventory-storage) like everything else;
 * share exports exclude the whole inventory by default (see shareRegistry.js).
 */

const fieldId = (name) => `inventory-field-${name}`;

const Label = ({ name, children }) => (
  <label htmlFor={fieldId(name)} className="block text-xs font-medium text-gray-500 dark:text-gray-400">
    {children}
  </label>
);

const inputClasses =
  'mt-1 w-full py-1.5 px-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100';

const TextField = ({ name, label, value, onChange, textarea = false }) => (
  <div>
    <Label name={name}>{label}</Label>
    {textarea ? (
      <textarea
        id={fieldId(name)}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        rows={3}
        className={inputClasses}
      />
    ) : (
      <input
        id={fieldId(name)}
        type="text"
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className={inputClasses}
      />
    )}
  </div>
);

/**
 * Single-select over a picklist. '' renders as an em-dash "unset" option —
 * blank is a real state (never coerced to a value). A current value that is
 * not in the list (foreign import) is rendered as an extra option rather than
 * silently blanking — honest UI over vocabulary policing.
 */
const SelectField = ({ name, label, value, onChange, options }) => (
  <div>
    <Label name={name}>{label}</Label>
    <select
      id={fieldId(name)}
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
      className={inputClasses}
    >
      <option value="">—</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
      {value && !options.includes(value) && (
        <option value={value}>{value} (imported value)</option>
      )}
    </select>
  </div>
);

const TriField = (props) => <SelectField {...props} options={TRI_STATE} />;

const DateField = ({ name, label, value, onChange }) => (
  <div>
    <Label name={name}>{label}</Label>
    <input
      id={fieldId(name)}
      type="date"
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
      className={inputClasses}
    />
  </div>
);

const NumberField = ({ name, label, value, onChange }) => (
  <div>
    <Label name={name}>{label}</Label>
    <input
      id={fieldId(name)}
      type="number"
      min="0"
      value={value}
      onChange={(e) => onChange(name, e.target.value === '' ? '' : Number(e.target.value))}
      className={inputClasses}
    />
  </div>
);

const MultiField = ({ name, label, value, onChange, options }) => {
  const toggle = (opt) =>
    onChange(name, value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  return (
    <div>
      <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
      <div className="mt-1 flex flex-wrap gap-2">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-1 text-sm text-gray-800 dark:text-gray-200">
            <input
              type="checkbox"
              checked={value.includes(opt)}
              onChange={() => toggle(opt)}
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
};

/** Owner/contact selects hold opaque user ids — names resolve at render. */
const UserField = ({ name, label, value, onChange, users }) => (
  <div>
    <Label name={name}>{label}</Label>
    <select
      id={fieldId(name)}
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
      className={inputClasses}
    >
      <option value="">—</option>
      {users.map((u) => (
        <option key={u.id} value={u.id}>{u.name}</option>
      ))}
      {value && !users.some((u) => u.id === value) && (
        <option value={value}>(unknown user)</option>
      )}
    </select>
  </div>
);

const FormGroup = ({ title, csf, children }) => (
  <fieldset className="border border-gray-200 dark:border-gray-600 rounded p-4">
    <legend className="px-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
      {title}
      {csf && <span className="ml-2 text-xs font-mono font-normal text-gray-400 dark:text-gray-500">{csf}</span>}
    </legend>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">{children}</div>
  </fieldset>
);

const ExternalUrlText = ({ url }) => {
  if (!url) return null;
  const safe = sanitizeExternalUrl(url);
  // Unsafe schemes render as plain text — never an anchor.
  if (!safe) return <span className="text-sm text-gray-500 dark:text-gray-400 break-all">{url}</span>;
  return (
    <a
      href={safe}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
    >
      {url}
    </a>
  );
};

const SystemForm = ({ initial, users, onSave, onCancel, saveLabel }) => {
  const [draft, setDraft] = useState(initial);
  const setField = (name, value) => setDraft((d) => ({ ...d, [name]: value }));

  const handleSave = () => {
    if (!draft.name.trim()) {
      toast.error('System name is required');
      return;
    }
    onSave(draft);
  };

  return (
    <div className="space-y-4">
      <FormGroup title="Identification" csf="ID.AM-01/02/04/08">
        <TextField name="name" label="System name" value={draft.name} onChange={setField} />
        <TextField name="vendor" label="Vendor" value={draft.vendor} onChange={setField} />
        <SelectField name="deploymentType" label="Deployment type" value={draft.deploymentType} onChange={setField} options={DEPLOYMENT_TYPES} />
        <SelectField name="stage" label="Stage" value={draft.stage} onChange={setField} options={INVENTORY_STAGES} />
        <TextField name="applicationUrl" label="Application URL" value={draft.applicationUrl} onChange={setField} />
        <DateField name="vendorEolDate" label="Vendor EOL date" value={draft.vendorEolDate} onChange={setField} />
        <div className="md:col-span-3">
          <TextField name="description" label="Description" value={draft.description} onChange={setField} textarea />
        </div>
      </FormGroup>

      <FormGroup title="Ownership & contacts" csf="GV.RR-02, GV.SC-04">
        <UserField name="businessOwnerId" label="Business owner" value={draft.businessOwnerId} onChange={setField} users={users} />
        <UserField name="technologyOwnerId" label="Technology owner" value={draft.technologyOwnerId} onChange={setField} users={users} />
        <UserField name="primaryContactId" label="Primary contact" value={draft.primaryContactId} onChange={setField} users={users} />
        <TextField name="vendorContact" label="Vendor contact (name / email)" value={draft.vendorContact} onChange={setField} />
      </FormGroup>

      <FormGroup title="Data profile" csf="ID.AM-05, GV.OC-03">
        <SelectField name="dataClassification" label="Highest data classification" value={draft.dataClassification} onChange={setField} options={DATA_CLASSIFICATIONS} />
        <TriField name="pii" label="PII" value={draft.pii} onChange={setField} />
        <SelectField name="dataResidency" label="Data residency" value={draft.dataResidency} onChange={setField} options={DATA_RESIDENCIES} />
        <MultiField name="regulatedDataTypes" label="Regulated data types" value={draft.regulatedDataTypes} onChange={setField} options={REGULATED_DATA_TYPES} />
        <MultiField name="complianceScope" label="Compliance scope" value={draft.complianceScope} onChange={setField} options={COMPLIANCE_SCOPES} />
      </FormGroup>

      <FormGroup title="Access & identity" csf="PR.AA-01/03/05">
        <TriField name="ssoMfa" label="SSO with corporate IdP + MFA" value={draft.ssoMfa} onChange={setField} />
        <SelectField name="authMethod" label="Authentication method" value={draft.authMethod} onChange={setField} options={AUTH_METHODS} />
        <TriField name="localAccounts" label="Local accounts exist" value={draft.localAccounts} onChange={setField} />
        <NumberField name="adminCount" label="Privileged / admin count" value={draft.adminCount} onChange={setField} />
        <TriField name="secretsInVault" label="API keys / secrets in password vault" value={draft.secretsInVault} onChange={setField} />
        <SelectField name="provisioningMethod" label="Provisioning method" value={draft.provisioningMethod} onChange={setField} options={PROVISIONING_METHODS} />
        <SelectField name="deprovisioningTrigger" label="Deprovisioning trigger" value={draft.deprovisioningTrigger} onChange={setField} options={DEPROVISIONING_TRIGGERS} />
        <SelectField name="accessReviewCadence" label="Access review cadence" value={draft.accessReviewCadence} onChange={setField} options={ACCESS_REVIEW_CADENCES} />
        <DateField name="lastAccessReviewDate" label="Last access review" value={draft.lastAccessReviewDate} onChange={setField} />
      </FormGroup>

      <FormGroup title="Security posture" csf="ID.AM-05, PR.PS, DE.CM, GV.SC">
        <SelectField name="securityTier" label="Security tier" value={draft.securityTier} onChange={setField} options={SECURITY_TIERS} />
        <SelectField name="internetExposure" label="Internet exposure" value={draft.internetExposure} onChange={setField} options={EXPOSURE_LEVELS} />
        <TriField name="siemLogging" label="Logs to SIEM / monitored" value={draft.siemLogging} onChange={setField} />
        <TriField name="customCode" label="Custom code / scripts" value={draft.customCode} onChange={setField} />
        <TriField name="segregatedEnvironments" label="Segregated dev / test / prod" value={draft.segregatedEnvironments} onChange={setField} />
        <SelectField name="patchingResponsibility" label="Patching responsibility" value={draft.patchingResponsibility} onChange={setField} options={PATCHING_RESPONSIBILITIES} />
        <DateField name="tprmDueDiligenceDate" label="TPRM due diligence completed" value={draft.tprmDueDiligenceDate} onChange={setField} />
        <MultiField name="tprmArtifacts" label="TPRM artifacts on file" value={draft.tprmArtifacts} onChange={setField} options={TPRM_ARTIFACTS} />
        <DateField name="contractRenewalDate" label="Contract renewal date" value={draft.contractRenewalDate} onChange={setField} />
        <TriField name="aiFeatures" label="AI features process org data" value={draft.aiFeatures} onChange={setField} />
      </FormGroup>

      <FormGroup title="Resilience (BCDR)" csf="ID.IM-04, PR.DS-11, RC.RP">
        <SelectField name="bcdrTier" label="BCDR tier" value={draft.bcdrTier} onChange={setField} options={BCDR_TIERS} />
        <NumberField name="rtoHours" label="RTO (hours)" value={draft.rtoHours} onChange={setField} />
        <NumberField name="rpoHours" label="RPO (hours)" value={draft.rpoHours} onChange={setField} />
        <NumberField name="mtoHours" label="MTO / MTPD (hours)" value={draft.mtoHours} onChange={setField} />
        <TriField name="backupsInPlace" label="Backups in place" value={draft.backupsInPlace} onChange={setField} />
        <DateField name="backupsLastTestedDate" label="Backups last tested" value={draft.backupsLastTestedDate} onChange={setField} />
      </FormGroup>

      <FormGroup title="Record hygiene" csf="ID.AM-01/08">
        <SelectField name="discoverySource" label="Discovery source" value={draft.discoverySource} onChange={setField} options={DISCOVERY_SOURCES} />
        <DateField name="onboardedDate" label="Onboarded" value={draft.onboardedDate} onChange={setField} />
        <DateField name="retiredDate" label="Retired" value={draft.retiredDate} onChange={setField} />
        <DateField name="lastReviewedDate" label="Last reviewed" value={draft.lastReviewedDate} onChange={setField} />
        <UserField name="attestedById" label="Attested by" value={draft.attestedById} onChange={setField} users={users} />
        <div className="md:col-span-3">
          <TextField name="notes" label="Notes" value={draft.notes} onChange={setField} textarea />
        </div>
      </FormGroup>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSave}
          className="text-sm px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          {saveLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const Inventory = () => {
  const systems = useInventoryStore((s) => s.systems);
  const addSystem = useInventoryStore((s) => s.addSystem);
  const updateSystem = useInventoryStore((s) => s.updateSystem);
  const deleteSystem = useInventoryStore((s) => s.deleteSystem);
  const users = useUserStore((s) => s.users);

  const [editing, setEditing] = useState(null); // null | 'new' | system id
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');

  const userName = (id) => {
    if (!id) return '';
    const user = users.find((u) => u.id === id);
    return user ? user.name : '(unknown user)';
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return systems.filter((s) => {
      if (stageFilter !== 'all' && s.stage !== stageFilter) return false;
      if (classFilter !== 'all' && s.dataClassification !== classFilter) return false;
      if (!q) return true;
      return [s.id, s.name, s.vendor, s.description].join(' ').toLowerCase().includes(q);
    });
  }, [systems, search, stageFilter, classFilter]);

  const handleDelete = (system) => {
    if (window.confirm(`Delete ${system.id} (${system.name || 'unnamed system'})?`)) {
      deleteSystem(system.id);
      toast.success(`${system.id} deleted`);
    }
  };

  if (editing) {
    const record = editing === 'new' ? null : systems.find((s) => s.id === editing);
    return (
      <div className="p-6 max-w-5xl mx-auto overflow-auto h-full">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Server size={20} />
          {record ? `Edit ${record.id} — ${record.name}` : 'Add system'}
        </h1>
        <div className="mt-4">
          <SystemForm
            initial={record ? { ...SYSTEM_FIELD_DEFAULTS, ...record } : { ...SYSTEM_FIELD_DEFAULTS }}
            users={users}
            saveLabel={record ? 'Save changes' : 'Add system'}
            onCancel={() => setEditing(null)}
            onSave={(draft) => {
              if (record) {
                updateSystem(record.id, draft);
                toast.success(`${record.id} updated`);
              } else {
                const created = addSystem(draft);
                toast.success(`${created.id} added to inventory`);
              }
              setEditing(null);
            }}
          />
        </div>
      </div>
    );
  }

  if (systems.length === 0) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <Server size={40} className="mx-auto text-gray-400 dark:text-gray-500" />
        <h1 className="text-xl font-bold mt-4 text-gray-900 dark:text-gray-100">Inventory</h1>
        <p className="mt-3 text-gray-600 dark:text-gray-300">
          No systems yet. The inventory is your org's system register — one record per
          application or platform, covering ownership, data classification, access posture,
          third-party risk, and recovery objectives. A populated inventory is ID.AM evidence.
        </p>
        <p className="mt-3 text-gray-600 dark:text-gray-300">
          Records stay in this browser and are excluded from share exports by default.
        </p>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="inline-flex items-center gap-2 mt-4 text-sm px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          <Plus size={16} />
          Add your first system
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto overflow-auto h-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Server size={20} />
          Inventory
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search systems…"
              className="pl-7 pr-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="py-1.5 px-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            aria-label="Filter by stage"
          >
            <option value="all">All stages</option>
            {INVENTORY_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="py-1.5 px-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            aria-label="Filter by classification"
          >
            <option value="all">All classifications</option>
            {DATA_CLASSIFICATIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus size={14} />
            Add system
          </button>
        </div>
      </div>

      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        {filtered.length} of {systems.length} systems shown. Inventory records are excluded
        from share exports by default; complete backups include them.
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 dark:border-gray-600">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900 text-left text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <th className="px-3 py-2 font-semibold">ID</th>
              <th className="px-3 py-2 font-semibold">Name</th>
              <th className="px-3 py-2 font-semibold">Deployment</th>
              <th className="px-3 py-2 font-semibold">Stage</th>
              <th className="px-3 py-2 font-semibold">Classification</th>
              <th className="px-3 py-2 font-semibold">Tier</th>
              <th className="px-3 py-2 font-semibold">Business owner</th>
              <th className="px-3 py-2 font-semibold">URL</th>
              <th className="px-3 py-2 font-semibold" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((system) => (
              <tr
                key={system.id}
                className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              >
                <td className="px-3 py-2 font-mono text-xs text-gray-500 dark:text-gray-400">{system.id}</td>
                <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{system.name}</td>
                <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{system.deploymentType}</td>
                <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{system.stage}</td>
                <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{system.dataClassification}</td>
                <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{system.securityTier}</td>
                <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{userName(system.businessOwnerId)}</td>
                <td className="px-3 py-2"><ExternalUrlText url={system.applicationUrl} /></td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setEditing(system.id)}
                      aria-label={`Edit ${system.id}`}
                      className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(system)}
                      aria-label={`Delete ${system.id}`}
                      className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
