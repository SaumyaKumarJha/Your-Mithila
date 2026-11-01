export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizePhone(value?: string | null): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 ? digits : null;
}

export async function parseJsonBody(req: Request): Promise<any> {
  const rawBody = await req.text().catch(() => "");
  if (!rawBody.trim()) {
    throw new Error("Missing request body.");
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    throw new Error("Invalid JSON payload.");
  }
}
