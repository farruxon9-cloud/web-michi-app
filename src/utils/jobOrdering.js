const ts = (j) => Date.parse(j?.publishedAt || j?.createdAt || '') || 0;

export function compareJobs(a, b) {
  const d = ts(b) - ts(a);
  return d !== 0 ? d : String(b?.id || '').localeCompare(String(a?.id || ''), 'en', { numeric: true });
}

export function mergeJobs(base = [], incoming = []) {
  const map = new Map(base.map((j) => [String(j.id), j]));
  for (const j of incoming) {
    if (j && j.id) {
      map.set(String(j.id), { ...map.get(String(j.id)), ...j });
    }
  }
  return [...map.values()].filter((j) => j.isActive !== false).sort(compareJobs);
}
