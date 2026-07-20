import React from 'react';
import { BookOpen } from 'lucide-react';
import { procedureBadge } from '../utils/procedureBank';

/**
 * Provenance badge for a test procedure — pure presentation over
 * procedureBadge(). Community renders green, org-tailored amber, and a
 * bank this build does not recognize renders neutral blue: visible rather
 * than silently badge-less, so records shared from a newer build keep
 * their provenance on screen (plan §7 R-10).
 */
const BADGE_STYLES = {
  community: 'flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  bank: 'flex items-center gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  tailored: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
};

const ProcedureSourceBadge = ({ source }) => {
  const badge = procedureBadge(source);
  if (!badge) return null;
  return (
    <span className={`px-1.5 py-0.5 rounded text-xs ${BADGE_STYLES[badge.kind]}`}>
      {badge.kind !== 'tailored' && <BookOpen size={11} />}
      {badge.label}
    </span>
  );
};

export default ProcedureSourceBadge;
