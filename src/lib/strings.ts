export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function withUniqueSuffix(slug: string): string {
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${slug}-${suffix}`;
}
