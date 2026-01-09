import { log } from "console";
// import utilis from "../controller/utilis.ts";
import utilis from "../controller/utils.ts";
import jwtService from "../services/jwt.ts";
import { Request, Response, NextFunction } from "express";

const utils = new utilis();
const jwt = new jwtService();

interface AuthRequest extends Request {
  user?: any;
}

export default async function authenicate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeaderRaw =
    req.headers["authorization"] || req.headers["Authorization"];

  const authHeader = Array.isArray(authHeaderRaw)
    ? authHeaderRaw[0]
    : authHeaderRaw;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return utils.sendResponse(res, 401, false, "Missing token");
  }

  const token = authHeader.split(" ")[1];

  console.log("RAW TOKEN:", token);
  console.log("TOKEN PARTS:", token.split(".").length);

  const decoded = await jwt.verifyToken(token);

  if (!decoded.success) {
    return utils.sendResponse(res, 401, false, decoded.message);
  }

  req.user = decoded.data;
  next();
}
