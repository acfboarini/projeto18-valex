import { NextFunction, Request, Response } from "express";
import { findById } from "../repositories/employeeRepository.js";

export async function validateEmployee(req: Request, res: Response, next: NextFunction) {

    const { employeeId } = req.body;

    try {
        const employee = await findById(employeeId);
        if (!employee) return res.status(404).send("Empregado não Registrado");

        res.locals.employee = employee;
        next();

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}