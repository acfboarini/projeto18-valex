import { Request, Response } from "express";
import { insert, TransactionTypes, update } from "../repositories/cardRepository.js";
import * as cardService from "../services/cardService.js";
import * as rechargeRepository from "./../repositories/rechargeRepository.js";
import * as paymentRepository from "./../repositories/paymentRepository.js";

export async function createCard(req: Request, res: Response) {
    
    const { employeeId, type } : {employeeId: number, type: TransactionTypes} = req.body;
    const { employee } = res.locals;
    
    try {
        const cardData = cardService.createCardData(employeeId, employee, type);
        await insert(cardData);
        return res.sendStatus(201);

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}

export async function activationCard(req: Request, res: Response) {

    const { card } = res.locals;
    const { password } = req.body;

    try {
        const updateCard = cardService.updateCard(card, password);
        await update(card.id, updateCard);
        return res.sendStatus(201);

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    } 
}

export async function getInfosCard(req: Request, res: Response) {

    const { card } = res.locals;

    try {
        const cardInfos = await cardService.getInfos(card.id);
        return res.status(201).send(cardInfos);

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    } 
}

export async function blockCard(req: Request, res: Response) {

    const { card } = res.locals;

    try {
        if (card.isBlocked) return res.status(404).send("Cartão ja esta bloqueado");

        const updateCard = await cardService.updateStatusCard(card, card.isBlocked);
        await update(card.id, updateCard);
        return res.status(201).send("Cartao bloqueado com sucesso");

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    } 
}

export async function unblockCard(req: Request, res: Response) {

    const { card } = res.locals;

    try {
        if (!card.isBlocked) return res.status(404).send("Cartão ja esta desbloqueado");

        const updateCard = await cardService.updateStatusCard(card, card.isBlocked);
        await update(card.id, updateCard);
        return res.status(201).send("cartao desbloqueado com sucesso");

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    } 
}

export async function recharge(req: Request, res: Response) {

    const { card, value } = res.locals;

    try {
        await rechargeRepository.insert({
            cardId: card.id, 
            amount: parseInt(value)
        });
        return res.status(201).send("Recarga concluida com sucesso");

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    } 
}

export async function transation(req: Request, res: Response) {

    const { card, business, value } = res.locals;

    try {
        await paymentRepository.insert({
            cardId: card.id,
            businessId: business.id,
            amount: value
        });
        return res.status(201).send("Compra realizada com sucesso");

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    } 
}