import { Router } from "express";
import { getAllApps } from "../../controllers/get-all-apps";
import { getAppTriggers , checkIsConnectionRequired} from "../../controllers/triggers";
import { googleAuth,googleAuthCallback} from "../../controllers/google-auth";
import { createWorkflow } from "../../controllers/create-workFlow";
const router = Router();

router.route("/").get((req,res)=>{
    res.send("Hello World from v1");
});
router.route("/apps").get(getAllApps);
router.route("/triggers/:appId").get(getAppTriggers);
router.route("/triggers/connection-required/:key").get(checkIsConnectionRequired);
router.route("/auth/google").get(googleAuth);
router.route("/auth/google/callback").get(googleAuthCallback);
router.route("/workflow").post(createWorkflow);
export default router;
