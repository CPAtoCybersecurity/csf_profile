// Generate a stable per-visitor ID scoped to this browser session.
// This prevents localStorage cross-contamination between demo visitors.
const VISITOR_KEY = 'csf-visitor-id';

function getVisitorId() {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = 'v-' + Math.random().toString(36).slice(2, 11);
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

export const visitorId = getVisitorId();
export const scopedKey = (name) => `${name}-${visitorId}`;
