import utilis from "./utils";
import { Request, Response } from "express";
import userModels from "../model/models";
import jwtService from "../services/jwt";
import Database from "../../config/database_connect";
import crypto, { randomUUID } from "crypto";
// import
import createAdminAccount from "../model/admin/Auth/createAccount";
import { log } from "console";

export default class AdminAuthController {
  public jwt = new jwtService();
  public utilis = new utilis();
  public dbOPS = new Database();
  public createAccount = new createAdminAccount();
  public userModels = new userModels();

  public async createAccountAdmin(req: Request, res: Response) {
    const { admin_name, email, profile, password } = req.body;
    const usernamePattern = /^[a-zA-Z][a-zA-Z0-9_]{4,20}$/;

    if (!usernamePattern.test(admin_name)) {
      return this.utilis.sendResponse(
        res,
        400,
        false,
        "Invalid username format",
        null
      );
    }

    const checkMailAdmin = await this.userModels.checkMailAdmin(email);
    if (!checkMailAdmin.success) {
      return this.utilis.sendResponse(
        res,
        409,
        false,
        "Email already exists",
        null
      );
    }

    const admin_token = (await this.utilis.generateAlphaNumeric(10)).data;
    const passHash = await this.utilis.passwordHash(password);

    const connection = await this.dbOPS.connect();

    try {
      // START TRANSACTION
      await connection.beginTransaction();

      const adminResult = await this.createAccount.createAccount(
        admin_token,
        admin_name,
        email,
        "admin",
        profile,
        passHash
      );

      const user_id = adminResult.data.insertId;

      const refreshToken = await this.jwt.generateRefreshToken({
        user_id,
        user_type: "admin",
        token_id: crypto.randomUUID(),
      });

      const refreshHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

      await this.createAccount.createRefresh(user_id, refreshHash);

      await connection.commit();

      const token = await this.jwt.generateToken({
        user_id,
        email,
        name: admin_name,
        avatar: profile,
        usertype: "admin",
      });

      return this.utilis.sendResponse(res, 201, true, "Account created", {
        jwt: token,
        accessToken: refreshToken,
      });
    } catch (error) {
      await connection.rollback();
      console.error(error);

      return this.utilis.sendResponse(
        res,
        500,
        false,
        "Account creation failed",
        null
      );
    }
  }


  
}
