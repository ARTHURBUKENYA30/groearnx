const MAX_BODY_BYTES = 16 * 1024;

function send(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.json(payload);
}

function methodNotAllowed(res, allowed) {
  res.setHeader("Allow", allowed.join(", "));
  return send(res, 405, { error: "Method not allowed." });
}

function readBody(req) {
  let body = req.body;
  if (typeof body === "string") {
    if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) throw new Error("BODY_TOO_LARGE");
    body = JSON.parse(body);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("INVALID_BODY");
  if (Buffer.byteLength(JSON.stringify(body), "utf8") > MAX_BODY_BYTES) throw new Error("BODY_TOO_LARGE");
  return body;
}

function clean(value, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

async function saveRow(table, row) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    const error = new Error("Backend storage is not configured.");
    error.code = "BACKEND_NOT_CONFIGURED";
    throw error;
  }

  const response = await fetch(url.replace(/\/$/, "") + "/rest/v1/" + table, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: "Bearer " + key,
      "Content-Type": "application/json",
      Prefer: "return=minimal"
    },
    body: JSON.stringify(row)
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    const error = new Error("Database write failed.");
    error.code = "DATABASE_WRITE_FAILED";
    error.status = response.status;
    // Keep provider details in server logs only.
    console.error("Supabase insert failed", { table, status: response.status, detail: detail.slice(0, 300) });
    throw error;
  }
}

function handleError(res, error) {
  if (error.message === "BODY_TOO_LARGE") return send(res, 413, { error: "Request is too large." });
  if (error.message === "INVALID_BODY" || error instanceof SyntaxError) return send(res, 400, { error: "Send a valid JSON object." });
  if (error.code === "BACKEND_NOT_CONFIGURED") return send(res, 503, { error: "Submissions are temporarily unavailable. Please try again later." });
  if (error.code === "DATABASE_WRITE_FAILED") return send(res, 502, { error: "We could not save your submission. Please try again." });
  console.error("API request failed", error);
  return send(res, 500, { error: "An unexpected error occurred." });
}

module.exports = { send, methodNotAllowed, readBody, clean, saveRow, handleError };
