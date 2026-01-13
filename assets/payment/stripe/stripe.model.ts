import dbOPS from "../../model/dbOPS";
import utilis from "../../controller/utils";

export default class stripeModel {
  public dbops = new dbOPS();
  public utils = new utilis();

  public async createTrasactionIntentModel(
    user_id: number,
    stripe_id: string,
    amount: number,
    currency: string,
    status: boolean,
    client_secret: string,
    // created_at_stripe: new Date,
    livemode: string
  ) {
    const insert = await this.dbops.insert("payment_stripe", {
      stripe_id,
      amount,
      currency,
      status,
      client_secret,
      // created_at_stripe,
      livemode,
    });

    if (!insert.success) {
      return this.utils.returnData(false, insert.message, insert.data);
    }
    return this.utils.returnData(true, insert.message, insert.data);
  }

  public async updateTransactionStatus(
    paymentIntentID: string,
    status: string
  ) {
    const update = await this.dbops.update(
      "payment_stripe",
      {
        status: status,
      },
      "id=?",
      [paymentIntentID]
    );

    if (!update.success) {
      return this.utils.returnData(false, update.message, []);
    }
    return this.utils.returnData(true, update.message, update.data);
  }

  public async retrievePaymentIntent(stripe_id: string) {
    const select = await this.dbops.select(
      "payment_stripe",
      ["payment_stripe_id", "stripe_id", "amount", "status", "currency"],
      "stripe_id=?",
      [stripe_id]
    );
    if (!select.success) {
      return this.utils.returnData(false, select.message, []);
    }

    if (select.data < 1) {
      return this.utils.returnData(false, "No data found", select.data);
    }

    return this.utils.returnData(true, select.message, select.data);
  }

  public async retrievePaymentByUser(user_id: string) {
    const select = await this.dbops.select(
      "payment_stripe",
      ["payment_stripe_id", "stripe_id", "amount", "status", "currency"],
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
}
