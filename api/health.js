const { send, methodNotAllowed } = require("./_lib");

module.exports = function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
  const configured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  return send(res, 200, {
    status: "ok",
    service: "groearnx-api",
    storage: configured ? "configured" : "not_configured",
    timestamp: new Date().toISOString()
  });
};
