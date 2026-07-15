// Tour progress lives CLIENT-SIDE only, keyed per account — so two accounts on
// the same browser each get their own onboarding, and clearing browser data
// re-shows the tours on the next visit (intended: a fresh browser = a fresh
// welcome). Signatures mirror the old server API so callers didn't change:
//   getTours()    → { [tourId]: { completedChapters: number[], done: bool } }
//   updateTours({ tourId, completedChapters, done }) → merged progress map

function accountKey() {
  try {
    const u = JSON.parse(localStorage.getItem('user') || 'null')
    const id = u?._id || u?.id || u?.email
    if (id) return `tourProgress:${id}`
  } catch { /* corrupt user blob — fall through */ }
  return 'tourProgress:anon'
}

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(accountKey()) || 'null') || {}
  } catch {
    return {}
  }
}

export async function getTours() {
  return readAll()
}

export async function updateTours({ tourId, completedChapters, done }) {
  const all = readAll()
  const prev = all[tourId] || { completedChapters: [], done: false }
  all[tourId] = {
    completedChapters: [...new Set([...(prev.completedChapters || []), ...(completedChapters || [])])],
    done: done ?? prev.done ?? false,
  }
  try { localStorage.setItem(accountKey(), JSON.stringify(all)) } catch { /* storage blocked — tour just re-offers next visit */ }
  return all
}
