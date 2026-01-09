import { CorsOptions } from "cors";

const allowedOrigin: string[] = [
  "http://localhost:4000",
  "http://localhost:5173",
];

export const corsOption: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigin.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
};
