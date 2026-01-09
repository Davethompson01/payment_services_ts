import { Request, Response, NextFunction } from "express";

export default function apiKey(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const key = req.headers["x-api-key"];
  if (!key) {
    return res.status(401).json({ error: "API key missing" });
  }

  if (key !== process.env.API_KEY) {
    return res.status(403).json({ error: "Invalid API key" });
  }

  next();
}
