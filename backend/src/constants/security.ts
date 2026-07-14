// Shared bcrypt cost factor for every password hash in the app (register,
// employee/manager create) — one place to tune, instead of a copy in each.
export const SALT_ROUNDS = 10;
