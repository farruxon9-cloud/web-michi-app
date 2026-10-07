import { useCallback, useState } from 'react';
import { loadUserDraft, saveUserDraft } from '../utils/localDraftStore';

const MAX_HIDDEN = 1000;

function loadHidden(kind, userId) {
  const raw = loadUserDraft(kind, userId, []);
  if (!Array.isArray(raw)) return new Set();
  return new Set(raw.filter((k) => typeof k === 'string' && k.length > 0 && k.length <= 160).slice(0, MAX_HIDDEN));
}

/**
 * Per-user, locally persisted set of hidden item keys (e.g. applications the driver
 * no longer wants to see). This is a *view* preference only — nothing is deleted on
 * the server. Cleared on logout together with the other per-user drafts.
 *
 * @param {string} scope  e.g. 'apps' | 'shoukai'
 * @param {string} userId
 */
export default function useHiddenItems(scope, userId) {
  const kind = `hidden_${scope}`;
  const owner = `${kind}:${userId || 'anon'}`;
  const [state, setState] = useState(() => ({ owner, set: loadHidden(kind, userId) }));

  // Account switched → reload that user's list (render-phase sync, no effect needed)
  let current = state;
  if (state.owner !== owner) {
    current = { owner, set: loadHidden(kind, userId) };
    setState(current);
  }

  const update = useCallback((mutate) => {
    setState((prev) => {
      const next = new Set(prev.set);
      mutate(next);
      saveUserDraft(kind, userId, Array.from(next).slice(-MAX_HIDDEN));
      return { owner: prev.owner, set: next };
    });
  }, [kind, userId]);

  const hide = useCallback((keys) => {
    const list = (Array.isArray(keys) ? keys : [keys]).filter(Boolean);
    if (list.length === 0) return;
    update((s) => list.forEach((k) => s.add(k)));
  }, [update]);

  const unhide = useCallback((keys) => {
    const list = (Array.isArray(keys) ? keys : [keys]).filter(Boolean);
    if (list.length === 0) return;
    update((s) => list.forEach((k) => s.delete(k)));
  }, [update]);

  const unhideAll = useCallback(() => update((s) => s.clear()), [update]);

  return { hiddenSet: current.set, hide, unhide, unhideAll };
}
