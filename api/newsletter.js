const { send, methodNotAllowed, readBody, clean, saveRow, handleError } = require("./_lib");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  try {
    const body = readBody(req);
    if (clean(body.website, 200)) return send(res, 200, { ok: true, message: "Thanks for your interest." });

    const email = clean(body.email, 254).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return send(res, 400, { error: "Please enter a valid email address." });
    }

    await saveRow("newsletter_subscribers", { email });
    return send(res, 201, { ok: true, message: "You're on the list. Thanks for subscribing!" });
  } catch (error) {
    // Unique email constraints make repeat subscriptions safe and idempotent.
    if (error.status === 409) return send(res, 200, { ok: true, message: "You're already subscribed. Thank you!" });
    return handleError(res, error);
  }
};
