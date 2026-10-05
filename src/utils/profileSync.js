/**
 * Profile ⇄ server sync helpers (PATCH /api/auth/me).
 *
 * The server keeps `fullName`, `phone` and `profileData` (resume / company info, ≤64KB).
 * Local-only data never leaves the device: saved items, the device referral id, auth ids.
 */
const LOCAL_ONLY = new Set([
  'savedItems', 'userId', 'accountId', 'id', 'companyId', 'role',
  'password', 'token', 'accessToken', 'refreshToken',
]);

/** profileData payload for the server (local-only keys and empty values removed). */
export function buildServerProfile(profile = {}) {
  const out = {};
  Object.keys(profile || {}).forEach((k) => {
    if (LOCAL_ONLY.has(k)) return;
    const v = profile[k];
    if (v === undefined || typeof v === 'function') return;
    out[k] = v;
  });
  return out;
}

/** Full PATCH body. fullName is omitted when blank/guest (the server rejects an empty name). */
export function buildProfilePatch(profile = {}) {
  const patch = { profileData: buildServerProfile(profile) };
  const name = String(profile.fullName || '').trim();
  if (name && name !== 'Mehmon') patch.fullName = name;
  if (profile.phone !== undefined) patch.phone = String(profile.phone || '');
  return patch;
}

/** Stable fingerprint to skip saves when nothing server-relevant changed. */
export function profileFingerprint(profile = {}) {
  return JSON.stringify(buildProfilePatch(profile));
}
