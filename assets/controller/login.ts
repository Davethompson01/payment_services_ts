import utilis from "./utils";
import { Response, Request } from "express";
import userModels from "../model/models";
import dbOPS from "../model/dbOPS";
import crypto, { randomUUID } from "crypto";

import jwtService from "../services/jwt";
import Database from "../../config/database_connect";
import loginAdmin from "../model/admin/Auth/login";

export default class loginAdminController {
  public utils = new utilis();
  public dbops = new dbOPS();
  public jwt = new jwtService();
  public login = new loginAdmin();
  public database = new Database();

  public userModels = new userModels();

  public async loginAdminController(req: Request, res: Response) {
    try {
      if (!req.body) {
        return this.utils.sendResponse(
          res,
          400,
          false,
          "Missing request body",
          []
        );
      }
      const { email, password } = req.body;

      if (!email || !password) {
        return this.utils.sendResponse(
          res,
          400,
          false,
          "Email and password required",
          []
        );
      }

      const result = await this.login.loginAdmin(email, password);

      if (!result.success) {
        return this.utils.sendResponse(res, 401, false, result.message, []);
      }

      return this.utils.sendResponse(
        res,
        200,
        true,
        "Login successful",
        result.data
      );
    } catch (err: any) {
      console.error("Admin login error:", err);
      return this.utils.sendResponse(
        res,
        500,
        false,
        "Internal server error",
        []
      );
    }
  }
}
