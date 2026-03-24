const BASE_URL = "https://api.jolpi.ca/ergast/f1";

export async function fetchF1<T>(
  path: string,
  revalidate: number = 3600
): Promise<T> {
  const url = `${BASE_URL}/${path}`;
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) {
    throw new Error(`F1 API error ${res.status}: ${url}`);
  }
  return res.json() as Promise<T>;
}
