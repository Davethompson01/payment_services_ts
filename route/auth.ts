import AdminAuthController from "../assets/controller/AdminAuth";
import { Router } from "express";
// import testDB
import loginAdminController from "../assets/controller/login";
import apiKey from "../assets/middleware/apiMiddlewares";

const router = Router();
const controller = new AdminAuthController();
const login = new loginAdminController();

router.post(
  "/createadmin",
  apiKey,
  async (req, res) => await controller.createAccountAdmin(req, res)
);

router.post(
  "/loginadmin",
  apiKey,
  async (req, res) => await login.loginAdminController(req, res)
);
export default router;
