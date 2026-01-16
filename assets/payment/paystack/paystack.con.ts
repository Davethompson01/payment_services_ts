import dbOPS from "../../model/dbOPS";
import utilis from "../../controller/utils";
import Database from "../../../config/database_connect";
// import http from "https";
import paystackModel from "./paystack.model";
import ApiCallPaystack from "./api.paystack";
import { Request, Response } from "express";
import { json } from "stream/consumers";

export default class paystackController {
  public database = new Database();
  public dbops = new dbOPS();
  public utils = new utilis();
  public paystackModel = new paystackModel();
  public apiCallPaystack = new ApiCallPaystack();
  public PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

  public async createTrasaction(req: Request, res: Response) {
    const user_id = req.user.user_id;
    console.log(user_id);

    if (!user_id) {
      return this.utils.sendResponse(res, 401, false, "UserID is required", []);
    }

    const { email, amount } = req.body;

    console.log(req.body, "req body");

    if (!req.body) {
      return this.utils.sendResponse(
        res,
        401,
        false,
        "Invalid request missing body",
        []
      );
    }

    // if (!req.body.user_id) {
    //   return this.utils.sendResponse(res, 401, false, "UserID is required", []);
    // }
    if (!email || !amount) {
      return this.utils.sendResponse(
        res,
        400,
        false,
        "Email and amount required",
        []
      );
    }

    const result = await this.apiCallPaystack.callPaystack(email, amount);
    if (!result.status) {
      return this.utils.sendResponse(res, 400, false, result.message, []);
    }
    const insert = await this.paystackModel.createTrasaction(
      user_id,
      email,
      amount,
      result.data.reference,
      result.data.access_code,
      result.data.authorization_url
    );

    if (!insert.success) {
      return this.utils.returnData(false, insert.message, insert.data);
    }

    return this.utils.sendResponse(
      res,
      200,
      true,
      "Transaction initialized",
      result.data
    );
  }

  public async verifyTransaction(req: Request, res: Response) {
    const user_id = req.user.user_id;
    console.log(user_id);

    if (!user_id) {
      return this.utils.sendResponse(res, 401, false, "UserID is required", []);
    }

    const reference = req.query.reference as string;
    console.log(reference, "reference");

    if (!reference) {
      return this.utils.sendResponse(
        res,
        400,
        false,
        "Reference is required",
        []
      );
    }
    try {
      const verify = await this.apiCallPaystack.verifyTransaction(reference);
      console.log(verify, "verify");

      if (!verify) {
        return this.utils.sendResponse(
          res,
          401,
          false,
          verify.message,
          verify.data
        );
      }

      const update = await this.paystackModel.updateStatus(
        reference,
        verify.data.status
      );
      console.log(verify.data.status, "Status verify");

      if (!update.success) {
        return this.utils.sendResponse(
          res,
          401,
          false,
          update.message,
          update.data
        );
      }

      return this.utils.sendResponse(
        res,
        200,
        true,
        verify.message,
        verify.data
      );
    } catch (error: any) {}

    // const update = await this.dbops.update("")
    // cons
    // t createTrasaction = await this.createTrasaction();
  }

  public async getPaymentHistory(req: Request, res: Response) {
    const user_id = req.user.user_id;
    console.log(user_id);

    if (!user_id) {
      return this.utils.sendResponse(res, 401, false, "UserID is required", []);
    }

    try {
      const result = await this.paystackModel.getPaymentHistory(user_id);
      console.log(result);

      if (!result.success) {
        return this.utils.sendResponse(res, 401, false, result.message, []);
      }
      return this.utils.sendResponse(
        res,
        200,
        true,
        result.message,
        result.data
      );
    } catch (error: any) {
      return this.utils.sendResponse(
        res,
        401,
        false,
        error.message,
        error.data
      );
    }
  }

  public async getPaymentByID(req: Request, res: Response) {
    const user_id = req.user.user_id;
    console.log(user_id);

    if (!user_id) {
      return this.utils.sendResponse(res, 401, false, "UserID is required", []);
    }

    const payment_id = req.query.paymentID as string;
    if (!payment_id) {
      return this.utils.sendResponse(
        res,
        401,
        false,
        "payment_id required",
        []
      );
    }

    try {
      const select = await this.paystackModel.getPaymentByID(payment_id);
      if (!select.success) {
        return this.utils.sendResponse(res, 401, false, select.message, []);
      }

      return this.utils.sendResponse(
        res,
        200,
        true,
        select.message,
        select.data
      );
    } catch (error: any) {
      return this.utils.sendResponse(
        res,
        401,
        false,
        error.message,
        error.data
      );
    }
  }

  // public async getAllpayment(req: Request, res: Response) {
  //   const user_id = req.user.user_id;
  //   console.log(user_id);

  //   if (!user_id) {
  //     return this.utils.sendResponse(res, 401, false, "UserID is required", []);
  //   }

  //   try {

  //     const select = await this.paystackModel.getAllPayment()
  //   } catch (error: any) {
  //     return this.utils.sendResponse(
  //       res,
  //       401,
  //       false,
  //       error.message,
  //       error.data
  //     );
  //   }
  // }
}
