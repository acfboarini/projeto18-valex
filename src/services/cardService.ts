import { faker } from "@faker-js/faker";
import { Card, TransactionTypes } from "../repositories/cardRepository";
import dayjs from "dayjs";
import Cryptr from 'cryptr';
import bcrypt from "bcrypt";
import * as paymentRepository from "../repositories/paymentRepository.js";
import * as rechargeRepository from "../repositories/rechargeRepository.js";

// funcao que cira dados de cartao para inserir no banco de dados
export function createCardData(employeeId: number, employee: any, type: TransactionTypes) {

    const number = faker.finance.creditCardNumber();
    const cardholderName = formatName(employee.fullName);
    const expirationDate = calculateExpirationDate();
    const securityCode = createSecurityCode();

    const cardData = {
        employeeId,
        number,
        cardholderName,
        securityCode,
        expirationDate,
        isVirtual: false,
        isBlocked: true,
        type,
    }
    return cardData;
}

//funcao que formata o nome para anexar no cartao
function formatName(fullName: string) {

    let holderName = "";
    const nameParts = fullName.split(" ");

    for (let i = 0; i < nameParts.length; i++) {
        const name = nameParts[i];

        if (name.length >= 3) {
            if (i === 0) holderName += `${name} `;
            else if (i === nameParts.length - 1) holderName += name;
            else holderName += `${name[0]} `;
        }
    }
    return holderName;
}

// funcao que calcula a data de expiracao do cartao logo apos sua criacao
function calculateExpirationDate() {

    const date = dayjs().format('DD/MM/YYYY');
    const dateParts = date.split("/");
    let expirationDate = "";

    for (let i = 0; i < dateParts.length; i++) {
        let n = dateParts[i];
        if (i === 1) expirationDate += `${n}/`;
        if (i === 2) {
            //const x = n.length;
            //n = n[x-1] + n[x-2];
            expirationDate += (+n+5);
        };
    }
    return expirationDate;
}

//funcao que cria o Codigo de Segurança(CVV ou CVC)
function createSecurityCode() {
    const cvv = faker.finance.creditCardCVV();
    console.log("cvv: ", cvv);

    const cryptr = new Cryptr('myTotallySecretKey');
    const encryptedCvv = cryptr.encrypt(cvv);

    return encryptedCvv;
}

// funcao usada no cardsMiddleware para verificar se o cartao ja passou da sua data de Expiração
export function isExpired(date: string) {
    let validar = true;

    date = "01/" + date;
    const isNotExpired = dayjs().isBefore(dayjs(date));
    if (isNotExpired) validar = false;

    return validar;
}

// funcao usada no cardsMiddleware para desciptografar o Codigo de Segurança do Cartão
export function decryptCvvCard(encryptedCvv: string) { 
    const cryptr = new Cryptr('myTotallySecretKey');

    const decryptedCvv = cryptr.decrypt(encryptedCvv);
    return decryptedCvv;
}

// funcao que atualiza o cartao fazendo sua ativacao por meio de uma criacao de senha
export function updateCard(card: Card, password: string) {
    const SALT = 10;
    const passwordHash = bcrypt.hashSync(password, SALT);
    return {...card, password: passwordHash};
}

// funcao que pega as informacoes do total, transacoes e recargas de um cartao
export async function getInfos(cardId: number) {
    const transations = await paymentRepository.findByCardId(cardId);
    const recharges = await rechargeRepository.findByCardId(cardId);
    const balance = calculateBalance(transations, recharges);

    return {
        balance,
        transations,
        recharges
    }
}

// funcao qual calcula o total da relacao recarga-compras e emite esse total 
function calculateBalance(transations: paymentRepository.PaymentWithBusinessName[], recharges: rechargeRepository.Recharge[]) {
    let total = 0;

    recharges.forEach(recharge => {
        total += recharge.amount;
    })

    transations.forEach(transation => {
        total -= transation.amount;
    })

    return total;
}

// funcao que atualiza o status do cartao: bloqueado ou desbloquado
export async function updateStatusCard(card: Card, isBlocked: boolean) {
    let status = null;

    if (isBlocked) {
        status = false;
    } else {
        status = true;
    }

    return {...card, isBlocked: status}
}