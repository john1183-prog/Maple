export default async function handler(req, res) {
  try {
    const response = await fetch("https://mlvoca.com/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const text = await response.text(); // get raw text

    // Try parsing as JSON
    try {
      const json = JSON.parse(text);

      // YOUR IMPROVEMENT: Handle JSON error messages from the API
      if (!response.ok) {
        return res.status(response.status).json({
          error: json.message || json.error || "API returned a JSON error",
          raw: text.slice(0, 200),
        });
      }

      // SUCCESS: Response is OK and is valid JSON
      return res.status(response.status).json(json);
    } catch {
      // MY ORIGINAL CATCH: Handles ANY invalid JSON (like <html>)
      // This is safer because it always reports an error if parse fails.
      return res.status(response.status).json({
        error: "Invalid JSON response from upstream API",
        raw: text.slice(0, 200),
      });
    }
  } catch (error) {
    // This catches network errors (e.g., API is offline)
    return res.status(500).json({
      error: error.message || "Proxy server error",
    });
  }
}
