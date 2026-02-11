// HTTP helper utilities (e.g., wrappers around fetch/axios).

export async function httpGet(url: string): Promise<string> {
  // Use a realistic browser User-Agent because some sites return empty/blocked
  // content for unknown clients.
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP GET failed: ${res.status} ${res.statusText} (${url})`);
  }

  return await res.text();
}

