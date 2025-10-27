
export async function callBackend(path: string, options: RequestInit = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_BE_URL;
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Backend error: ${res.status} ${errorText}`);
  }

  return res.json();
}


