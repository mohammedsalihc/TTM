// Replaces {{token}} placeholders in an email template string with real
// values. Deliberately simple (no loops/conditionals) — every template this
// app sends is a flat set of substitutions.
export function renderTemplate(template: string, variables: Record<string, string>): string {
  return Object.entries(variables).reduce(
    (html, [key, value]) => html.split(`{{${key}}}`).join(value),
    template,
  );
}
