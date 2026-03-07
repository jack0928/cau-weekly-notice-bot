// HTTP helper utilities (e.g., wrappers around fetch/axios).

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

export async function httpGet(url: string): Promise<string> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
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
        throw new Error(`HTTP GET failed: ${res.status} ${res.statusText}`);
      }

      return await res.text();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If this is the last attempt, throw the error
      if (attempt === MAX_RETRIES - 1) {
        throw new Error(`HTTP GET failed after ${MAX_RETRIES} attempts for ${url}: ${lastError.message}`);
      }

      // eslint-disable-next-line no-console
      console.log(`  [RETRY] Attempt ${attempt + 1}/${MAX_RETRIES} failed for ${url}, retrying in ${RETRY_DELAY_MS}ms...`);

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }

  // This should never be reached, but TypeScript requires it
  throw lastError ?? new Error(`HTTP GET failed for ${url}`);
}

