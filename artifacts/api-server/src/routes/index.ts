import { Router, type IRouter } from "express";
import healthRouter from "./health";
import mlRouter from "./ml";
import weatherRouter from "./weather";

const router: IRouter = Router();

router.use(healthRouter);
router.use(mlRouter);
router.use(weatherRouter);

export default router;
