const { send, methodNotAllowed, readBody, clean, saveRow, handleError } = require("./_lib");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  try {
    const body = readBody(req);
    // Honeypot field: silently accept automated submissions without storing them.
    if (clean(body.website, 200)) return send(res, 200, { ok: true, message: "Thank you. Your message has been received." });

    const name = clean(body.name, 100);
    const email = clean(body.email, 254).toLowerCase();
    const phone = clean(body.phone, 40);
    const message = clean(body.message, 3000);
    if (name.length < 2) return send(res, 400, { error: "Please enter your name." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return send(res, 400, { error: "Please enter a valid email address." });
    if (message.length < 5) return send(res, 400, { error: "Please enter a message of at least 5 characters." });

    await saveRow("contact_messages", { name, email, phone: phone || null, message });
    return send(res, 201, { ok: true, message: "Thank you. Your message has been received." });
  } catch (error) {
    return handleError(res, error);
  }
};
