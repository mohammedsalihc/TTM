const PALETTE = ['#6366F1', '#F59E0B', '#10B981', '#EF4444', '#0EA5E9', '#8B5CF6', '#EC4899', '#14B8A6'];

// Deterministic so the same person always gets the same color across
// renders/sessions, without storing a color field anywhere.
export const colorFromString = (value: string): string => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
};
