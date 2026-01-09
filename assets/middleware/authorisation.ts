import utilis from "../controller/utils.ts";
import { NextFunction, Request, Response } from "express";

const utils = new utilis();

export default function authorisationMiddleWare(...authorizedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.user_type;

    if (!userRole) {
      return utils.sendResponse(res, 401, false, "Role not found");
    }

    if (!authorizedRoles.includes(userRole)) {
      return utils.sendResponse(res, 403, false, "Insufficient perms");
    }

    next();
  };
}
