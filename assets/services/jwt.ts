import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Utils from "../controller/utils";
// import Utils from "../controller/utilis.ts";
dotenv.config();

export default class jwtService {
  public utilis = new Utils();
  public secret_key = process.env.SECRET_KEY!;
  public refresh_token = process.env.REFRESH_SECRET!;

  public async generateToken(payload: Record<string, any>): Promise<string> {
    // Convert to seconds
    // const issuedAt = Math.floor(Date.now() / 1000)
    // const expiresIn = issuedAt + 60 * 60 // 1 hour expiry

    const tokenPayload = {
      ...payload,
      // iat: issuedAt,
      // exp: expiresIn
    };

    const token = jwt.sign(tokenPayload, this.secret_key, { expiresIn: "1h" });
    return token;
  }

  // public async generateRefreshTokenAd(payload: {
  //   user_id: string;
  //   user_type: string;
  //   token_id: string;
  // }) {
  //   return jwt.sign(payload, this.secret_key, {
  //     expiresIn: "20d",
  //   });
  // }

  public async generateRefreshToken(payload: {
    user_id: string;
    user_type: string;
    token_id: string;
  }) {
    return jwt.sign(payload, this.secret_key, {
      expiresIn: "20d",
    });
  }

  public async verifyToken(token: string) {
    try {
      // console.log("RAW TOKEN:", token);
      // console.log("TOKEN TYPE:", typeof token);
      // console.log("TOKEN PARTS:", token.split(".").length);

      const decoded = jwt.verify(token, this.secret_key);
      if (!decoded) {
        return this.utilis.returnData(false, "Failed decoded", decoded);
      }
      return this.utilis.returnData(true, "Successfully decoded", decoded);
    } catch (err: any) {
      let message = "Error while decoding token";

      if (err.name === "TokenExpiredError") {
        message = "Token has expired";
      } else if (err.name === "JsonWebTokenError") {
        message = "Invalid token";
      }

      return this.utilis.returnData(false, message, err.message);
    }
  }
}
