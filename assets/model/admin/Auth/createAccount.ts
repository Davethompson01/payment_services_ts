import utilis from "../../../controller/utils";
import dbOPS from "../../dbOPS";
import userModels from "../../models";

export default class createAdminAccount {
  public utils = new utilis();
  public dbops = new dbOPS();
  public userModels = new userModels();

  public async createAccount(
    admin_token: number,
    admin_name: string,
    email: string,
    usertype: string,
    profile: string,
    password: string
  ) {
    // const checkMail = await this.userModels.checkMailAdmin(email);
    // if (checkMail.success) {
    //   return this.utils.returnData(false, checkMail.message, checkMail.data);
    // }
    const create = await this.dbops.insert("admin", {
      admin_token,
      admin_name,
      email,
      usertype,
      profile,
      password,
    });

    // return this.utils.returnData(

    // )
    if (!create.success) {
      return this.utils.returnData(false, create.message, create.data);
    }
    return this.utils.returnData(true, create.message, create.data);
  }

  public async createRefresh(admin_id: number, token_hash: string) {
    const insert = await this.dbops.insert("refresh_tokens", {
      admin_id,
      token_hash,
      revoked: false,
      expires_at: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    });

    if (!insert.success) {
      console.log("Insert failed:", insert.data);
      return this.utils.returnData(false, "Failed to create account", []);
    }

    return this.utils.returnData(
      true,
      "refresh token created",
      insert.data.insertId
    );
  }
  //   public async deleteAccountAdmin(){

  //   }
}
