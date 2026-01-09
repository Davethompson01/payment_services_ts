import utilis from "../../../controller/utils";
import dbOPS from "../../dbOPS";
import userModels from "../../models";
import crypto, { randomUUID } from "crypto";
// import
import jwtService from "../../../services/jwt";
import Database from "../../../../config/database_connect";
// import

export default class loginAdmin {
  public utils = new utilis();
  public dbops = new dbOPS();
  public jwt = new jwtService();
  public userModels = new userModels();
  public database = new Database();

  public async loginAdmin(email: string, password: string) {
    const adminResult = await this.userModels.getAdminByEmail(email);
    if (!adminResult.success) {
      return this.utils.returnData(
        false,
        adminResult.message,
        adminResult.data
      );
    }

    console.log(adminResult.data);

    const admin = adminResult.data;
    console.log(admin, "correct");

    const isValid = await this.utils.passwordVerify(admin.password, password);
    if (!isValid) {
      return this.utils.returnData(false, "in-correct", isValid);
    }

    const connection = await this.database.connect();

    try {
      await connection.beginTransaction();

      // Generate access token
      const accessToken = await this.jwt.generateToken({
        admin_id: admin.admin_id,
        usertype: "admin",
        email: admin.email,
      });

      // Generate refresh token
      const refreshToken = await this.jwt.generateRefreshToken({
        user_id: admin.admin_id.toString(),
        user_type: "admin",
        token_id: crypto.randomUUID(),
      });

      const refreshHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

      const refreshTokenRow = await this.dbops.select(
        "refresh_tokens",
        ["refresh_token_id"],
        "admin_id = ?",
        [admin.admin_id]
      );

      if (!refreshTokenRow.success || refreshTokenRow.data.length === 0) {
        throw new Error("No existing refresh token found for admin");
      }

      const refresh_token_id = refreshTokenRow.data[0].refresh_token_id;
      console.log(refresh_token_id);

      const updateResult = await this.updateRefreshToken(
        refresh_token_id,
        refreshHash
      );
      if (!updateResult.success) {
        return this.utils.returnData(
          false,
          updateResult.message,
          updateResult.data
        );
      }

      await connection.commit();

      return this.utils.returnData(true, "Login successful", {
        accessToken,
        refreshToken,
        admin: {
          id: admin.admin_id,
          email: admin.email,
        },
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    }
  }

  public async updateRefreshToken(
    refresh_token_id: number,
    token_hash: string
  ) {
    const update = await this.dbops.update(
      "refresh_tokens",
      { token_hash },
      "refresh_token_id = ?",
      [refresh_token_id]
    );

    if (!update.success) {
      return this.utils.returnData(false, update.message, update.data);
    }

    return this.utils.returnData(true, update.message, update.data);
  }
}
