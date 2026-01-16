import dbOPS from "../../model/dbOPS";
import utilis from "../../controller/utils";

export default class paystackModel {
  public dbops = new dbOPS();
  public utils = new utilis();

  public async createTrasaction(
    user_id: number,
    email: string,
    amount: string,
    reference: string,
    access_code: string,
    authorization_url: string
    // gateway_response: string,
    // paid_at: string,
    // created_at_paystack: string,
    // currency: string,
    // channel: string,
    //metadata: string,
    //ip_address: string,
    // authorization: string,
    //fees : number,
    //fees_split : number,
    //receipt_number: string,
    //customer_id : number ,
    // customer_email: string,
  ) {
    const create = await this.dbops.insert("payment_paystack", {
      user_id,
      email,
      amount,
      reference: reference,
      access_code: access_code,
      authorization_url: authorization_url,
      status: "pending",
    });

    if (!create.success) {
      return this.utils.returnData(false, create.message, create.data);
    }

    return this.utils.returnData(true, create.message, create.data);
  }

  public async updateStatus(reference: string, status: string) {
    const update = await this.dbops.update(
      "payment_paystack",
      { status: status },
      "reference = ?",
      [reference]
    );
    if (!update.success) {
      return this.utils.returnData(false, update.message, update.data);
    }
    return this.utils.returnData(true, update.message, update.data);
  }

  public async getPaymentHistory(user_id: number) {
    const select = await this.dbops.select(
      "payment_paystack",
      ["email", "amount", "status", "payment_paystack_id"],
      "user_id=?",
      [user_id]
    );

    if (!select.success) {
      return this.utils.returnData(false, select.message, []);
    }

    if (select.data < 1) {
      return this.utils.returnData(false, "No data found", select.data);
    }

    return this.utils.returnData(true, select.message, select.data);
  }

  public async getPaymentByID(payment_paystack_id: string) {
    const select = await this.dbops.select(
      "payment_paystack",
      ["email", "amount", "status", "currency", "gateway_response"],
      "payment_paystack_id=?",
      [payment_paystack_id]
    );

    if (!select.success) {
      return this.utils.returnData(false, select.message, []);
    }

    if (select.data < 1) {
      return this.utils.returnData(false, "No data found", select.data);
    }

    return this.utils.returnData(true, select.message, select.data);
  }

  public async getAllPayment(
    payment_paystack_id: number,
    page: number = 1,
    limit: number = 10
  ) {
    const offset = (page - 1) * limit;

    const select = await this.dbops.select(
      "payment_paystack",
      ["email", "amount", "status", "currency", "gateway_response"],
      "payment_paystack_id = ?",
      [payment_paystack_id],
      limit,
      offset
    );
    
    if (!select.success) {
      return this.utils.returnData(false, select.message, []);
    }

    if (select.data.length < 1) {
      return this.utils.returnData(false, "No data found", []);
    }

    return this.utils.returnData(true, "Payments fetched", {
      page,
      limit,
      count: select.data.length,
      data: select.data,
    });
  }
}
