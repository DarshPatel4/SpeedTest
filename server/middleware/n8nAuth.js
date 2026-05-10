export function protectN8n(req, res, next) {
  const expectedSecret = process.env.N8N_INTERNAL_SECRET;
  if (!expectedSecret) {
    return res.status(503).json({
      message: "Automation secret is not configured. Set N8N_INTERNAL_SECRET.",
    });
  }

  const token = req.headers["x-n8n-secret"];
  if (token !== expectedSecret) {
    return res.status(401).json({ message: "Invalid n8n secret" });
  }

  return next();
}
