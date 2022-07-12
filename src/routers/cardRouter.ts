import { Router } from "express";

import { 
    activationCard, createCard, getInfosCard, blockCard, unblockCard, recharge, transation 
} from "../controllers/cardController.js";

import { validateBusiness } from "../middlewares/businessMiddleware.js";
import { validateEmployee } from "../middlewares/employeesMiddleware.js";

import { 
    validateApiKey, validateCard, validateCardToSetStatus, validateCardId, validatePassword, validateSecurityCode, verifyCard, validateIsCorrectPassword, validateValue, validateCardToRecharge, validateCardToTransation, validateSaldo 
} from "../middlewares/cardMiddleware.js";


const cardsRouter = Router();

cardsRouter.post("/card", validateApiKey, verifyCard, validateEmployee, createCard);
cardsRouter.put("/activation", validateCard, validateSecurityCode, validatePassword, activationCard);
cardsRouter.get("/infosCard", validateCardId, getInfosCard);
cardsRouter.put("/block", validateCardToSetStatus, validateIsCorrectPassword, blockCard);
cardsRouter.put("/unblock", validateCardToSetStatus, validateIsCorrectPassword, unblockCard);
cardsRouter.post("/recharge", validateValue, validateApiKey, validateCardToRecharge, recharge);
cardsRouter.post("/transation", validateValue, validateCardToTransation, validateIsCorrectPassword, validateBusiness, validateSaldo, transation);

export default cardsRouter;