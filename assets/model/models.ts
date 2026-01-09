import utilis from "../controller/utils";
import dbOPS from "./dbOPS";

export default class userModels {
  public utils = new utilis();
  public dbops = new dbOPS();

  public async checkMailAdmin(email: string) {
    const result = await this.dbops.select("admin", ["email"], "email = ?", [
      email,
    ]);

    if (!result.success) {
      return this.utils.returnData(false, "DB error", []);
    }

    if (result.data.length > 0) {
      // email already exists
      return this.utils.returnData(false, "Email already exists", []);
    }

    return this.utils.returnData(true, "Email available", []);
  }

  public async getAdminByEmail(email: string) {
    const result = await this.dbops.select(
      "admin",
      ["admin_id", "email", "password"],
      "email = ?",
      [email]
    );

    if (!result.success) {
      return this.utils.returnData(false, "DB error", []);
    }

    if (result.data.length === 0) {
      // email does not exist
      return this.utils.returnData(false, "Invalid credentials", []);
    }

    // return the admin row
    return this.utils.returnData(true, "Admin found", result.data[0]);
  }

  public async checkMailUsers(email: string) {
    const column = ["email"];
    const condition = "email = ?";
    const params = [email];
    const checkMail = await this.dbops.select(
      "users",
      column,
      condition,
      params
    );
    if (!checkMail.success) {
      return this.utils.returnData(false, checkMail.message, checkMail.data);
    }
    return this.utils.returnData(true, checkMail.message, checkMail.message);
  }
}
