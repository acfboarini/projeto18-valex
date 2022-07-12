import { NextFunction, Request, Response } from "express";
import { findById, findByTypeAndEmployeeId, TransactionTypes } from "../repositories/cardRepository.js";
import { findByApiKey } from "../repositories/companyRepository.js";
import { decryptCvvCard, getInfos, isExpired } from "../services/cardService.js";
import bcrypt from "bcrypt";

// valida se o API Key passado via header pertence a uma empresa registrada no sistema
export async function validateApiKey(req: Request, res: Response, next: NextFunction) {

    const { apikey } = req.headers;
    const apiKey = apikey.toString();

    try {
        if (!apiKey) return res.sendStatus(401);

        const company = await findByApiKey(apiKey);
        if(!company) return res.status(404).send("Empresa não apresenta registro de ApiKey");

        res.locals.company = company;
        next();

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}

// valida se o cartao ja existe para o tipo e o empregado solicitado
export async function verifyCard(req: Request, res: Response, next: NextFunction) { 

    const { employeeId, type } : {employeeId: number, type: TransactionTypes} = req.body;

    try {
        const existCard = await findByTypeAndEmployeeId(type, employeeId);
        if (existCard) return res.sendStatus(409);

        next();

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}

// valida se o cartao esta registrado baseado no id do cartao
export async function validateCardId(req: Request, res: Response, next: NextFunction) { 
    
    const { cardId } = req.body;
    
    try {
        const card = await findById(cardId);
        if (!card) return res.status(404).send("Cartão não registrado");

        res.locals.card = card;
        next();

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}

// valida se o cartao esta registrado, se não esta expirado e se ja esta ativado. Baseado no id do cartao
export async function validateCard(req: Request, res: Response, next: NextFunction) {
    
    const { cardId } = req.body;
    
    try {
        const card = await findById(cardId);
        if (!card) return res.status(404).send("Cartão não registrado");

        if (isExpired(card.expirationDate)) return res.status(400).send("Cartão esta expirado");

        if (card.password) return res.status(400).send("Cartão ja esta Ativado");

        res.locals.card = card;
        next();

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}

// valida se o cartao esta registrado e se não esta expirado. Baseado no id do cartao
export async function validateCardToSetStatus(req: Request, res: Response, next: NextFunction) {
    
    const { cardId } = req.body;
    
    try {
        const card = await findById(cardId);
        if (!card) return res.status(404).send("Cartão não registrado");

        if (isExpired(card.expirationDate)) return res.status(400).send("Cartão esta expirado");

        res.locals.card = card;
        next();

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}

// valida o codigo de seguranca(CVV ou CVC) verificando se ele foi enviado e se esta correto
export async function validateSecurityCode(req: Request, res: Response, next: NextFunction) {

    const { card } = res.locals;
    let { cvv } = req.headers;
    cvv = cvv.toString();

    try {
        if (!cvv) return res.status(404).send("Codigo de Segurança não enviado");

        const cvvDecrypted = decryptCvvCard(card.securityCode);
        if (cvvDecrypted !== cvv) return res.status(400).send("Codigo de segurança incorreto");

        next();

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}

// valida a senha na hora de ativar o cartao
export async function validatePassword(req: Request, res: Response, next: NextFunction) {

    const { password } = req.body;
    
    try {
        if (password.length !== 4) return res.status(400).send("A senha do cartao deve contar 4 caracteres");

        next();

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}

// valida a password enviada por body verificando se ela é correta para o cartao correspondente que sera recebido via header--> cardId
export async function validateIsCorrectPassword(req: Request, res: Response, next: NextFunction) {
    
    const { password } = req.body;
    const { card } = res.locals;

    try {
        const passwordValidation = bcrypt.compareSync(password, card.password);

        if (passwordValidation) next();
        else return res.status(401).send("Senha Incorreta");

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}

// valida se o valor da recarga/compra é maior que zero
export async function validateValue(req: Request, res: Response, next: NextFunction) {
    
    const { value } = req.body;

    try {
        if (parseInt(value) <= 0) return res.status(404).send("Insira valores maiores que zero"); 

        res.locals.value = value;
        next();

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}

// valida se o cartao esta registrado, não expirado e ativado para recargas
export async function validateCardToRecharge(req: Request, res: Response, next: NextFunction) {
    
    const { cardId } = req.body;
    
    try {
        const card = await findById(cardId);
        if (!card) return res.status(404).send("Cartão não registrado");

        if (isExpired(card.expirationDate)) return res.status(400).send("Cartão esta expirado");

        if (!card.password) return res.status(400).send("Cartão não esta Ativado");

        res.locals.card = card;
        next();

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}

// valida se o cartao esta registrado, não expirado, ativado e desbloqueado para compras
export async function validateCardToTransation(req: Request, res: Response, next: NextFunction) {
    
    const { cardId } = req.body;
    
    try {
        const card = await findById(cardId);
        if (!card) return res.status(404).send("Cartão não registrado");

        if (isExpired(card.expirationDate)) return res.status(400).send("Cartão esta expirado");

        if (!card.password) return res.status(400).send("Cartão não esta Ativado");

        if (card.isBlocked) return res.status(400).send("Cartão bloqueado");

        res.locals.card = card;
        next();

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}

// valida se o saldo é suficiente para fazera compra
export async function validateSaldo(req: Request, res: Response, next: NextFunction) {

    const { value } = req.body;
    const { card } = res.locals;
    
    try {
        const { balance } = await getInfos(card.id);
        if (balance < value) return res.status(404).send("Seu saldo é inferior ao valor da compra");

        next();

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}