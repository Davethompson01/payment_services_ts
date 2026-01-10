import axios from "axios";
import utilis from "../../controller/utils";

export default class ApiCallPaystack {
  public utils = new utilis();
  public PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY as string;

  public async callPaystack(email: string, amount: string) {
    try {
      const response = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
          email,
          amount: Number(amount) * 100,
        },
        {
          headers: {
            Authorization: `Bearer ${this.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      //   return this.utils.returnData(true, response.statusText,
      return response.data;
      // );
    } catch (error: any) {
      return {
        status: false,
        message: error.response?.data?.message || error.message,
      };
    }
  }

  public async verifyTransaction(reference: string) {
    try {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.PAYSTACK_SECRET_KEY}`,
          },
        }
      );
      console.log(response.data);
      return response.data;
    } catch (error: any) {
      return this.utils.returnData(false, error.message, error.data);
    }
  }
}
