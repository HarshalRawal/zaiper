import { Router } from "express";
import { getAllApps } from "../../controllers/get-all-apps";
import { getAppTriggers , checkIsConnectionRequired} from "../../controllers/triggers";
const router = Router();

router.route("/").get((req,res)=>{
    res.send("Hello World from v1");
});
router.route("/apps").get(getAllApps);
router.route("/triggers/:appId").get(getAppTriggers);
router.route("/triggers/connection-required/:key").get(checkIsConnectionRequired);
export default router;
