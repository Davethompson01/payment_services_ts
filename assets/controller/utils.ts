import argon2 from "argon2";
import { Request, Response } from "express";
// import crypto
// import dbOPS from "../model/dbOPS.ts";
// import dbOPS from "../model/dbOPS.ts";

export default class utilis {
  //   protected sql = new dbOPS();
  public db?: any;

  constructor(db?: any) {
    if (db) this.db = db; // assign external dbOPS instance
  }

  public async accessToken() {
    const generate = crypto.randomUUID();
    if (!generate) {
      return this.returnData(false, "failed to create access token", generate);
    }

    return this.returnData(true, "Successfull created ", generate);
  }
  public returnData(success: boolean, message: string, data: any = null) {
    return {
      success,
      message,
      data,
    };
  }

  public sendResponse(
    res: Response,
    statusCode: number,
    success: boolean,
    message: string,
    data: any = null
  ) {
    return res.status(statusCode).json(this.returnData(success, message, data));
  }

  // generate random alphanumeric`
  public async generateAlphaNumeric(length: number = 16) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let results = "";

    for (let i = 0; i < length; i++) {
      const index = Math.floor(Math.random() * chars.length);
      results += chars[index];
    }

    return this.returnData(
      true,
      "Generated alphanumeric successfully",
      results
    );
  }

  // get OTP
  public getOTP() {
    return Math.floor(Math.random() * 999999).toString();
  }

  // pashsword hash
  public async passwordHash(password: string) {
    return argon2.hash(password, {
      type: argon2.argon2id,
      // memoryUsage: 2 ** 16,
      hashLength: 50,
      timeCost: 5,
      parallelism: 1,
    });
  }

  // password verify
  public async passwordVerify(
    hashedPassword: string,
    plainPassword: string
  ): Promise<boolean> {
    if (
      typeof hashedPassword !== "string" ||
      hashedPassword.length === 0 ||
      typeof plainPassword !== "string"
    ) {
      return false;
    }

    return await argon2.verify(hashedPassword, plainPassword);
  }

  public async requireData(...args: any[]) {
    // If no arguments were passed
    if (args.length === 0) {
      return this.returnData(false, "No data provided", []);
    }

    // Loop through all arguments
    for (const [index, value] of args.entries()) {
      if (
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "")
      ) {
        return this.returnData(false, `Field ${index + 1} is required`, args);
      }
    }

    // return success if all fields are valid
    return this.returnData(true, "All fields are valid", args);
  }

  public shuffle(arr: any) {
    for (let i = 0; i > arr.length; i++) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], (arr[j] = arr[j]), arr[i]];
    }
    return arr;
  }

  // public async uploadBase64Image(req: Request, res: Response) {
  //   try {
  //     const { image, patient_id } = req.body;

  //     // Validate input
  //     if (!image) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "No image found",
  //       });
  //     }

  //     // check if it's a base64string
  //     if (!image.startsWith("data:image")) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Invalid base64 image format",
  //       });
  //     }
  //     const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

  //     const updateData = {
  //       profile_image: base64Data,
  //       updated_at: new Date(),
  //     };

  //     const result = await this.sql.update(
  //       "patients",
  //       updateData,
  //       "patient_id = ?",
  //       [patient_id]
  //     );

  //     return this.sendResponse(
  //       res,
  //       201,
  //       true,
  //       "Image uploaded successfully",
  //       result
  //     );
  //   } catch (error: any) {
  //     console.error("Error uploading base64 image:", error);
  //     return res.status(500).json({
  //       success: false,
  //       message: "Internal server error",
  //     });
  //   }
  // }

  // public async
}

// }

// console.log(new utilis().getOTP());
