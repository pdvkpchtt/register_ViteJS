/**
 * Читает JSON из Response без падения на пустом теле / HTML от прокси.
 */
export async function parseJsonResponse(res) {
  const text = await res.text();
  if (!text) {
    if (!res.ok) {
      throw new Error(
        `HTTP ${res.status}: пустой ответ (прокси, таймаут или падение сервера)`
      );
    }
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    const preview = text.trim().slice(0, 200);
    throw new Error(
      !res.ok
        ? `HTTP ${res.status}: ${preview}`
        : `Ответ не JSON: ${preview}`
    );
  }
}
