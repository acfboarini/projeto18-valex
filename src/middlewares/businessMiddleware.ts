import { NextFunction, Request, Response } from "express";
import * as businessRepository from "../repositories/businessRepository.js";

// valida se o comercio esta registrado e se o tipo do cartao é mesmo tipo do comercio
export async function validateBusiness(req: Request, res: Response, next: NextFunction) {
    
    const { businessId } = req.body;
    const { card } = res.locals;
    
    try {
        const business = await businessRepository.findById(businessId);
        if(!business) return res.status(404).send("Comercio não existe");

        if (card.type !== business.type) {
            return res.status(404).send("O cartão não é valido para este tipo de comercio");
        }

        res.locals.business = business;
        next();

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}