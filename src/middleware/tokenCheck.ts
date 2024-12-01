import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();

const tokenShared = process.env.TOKEN;

export default function tokenAuthentication(
	req: Request,
	res: Response,
	next: NextFunction
) {
	const { token } = req.body;
	try {
		if (!tokenShared) {
			throw new Error("Shared token is not defined");
		}
		if (token === tokenShared) {
			req.headers.token = token;
			next();
		} else {
			res.status(411).json({
				msg: "TOKEN DIDN'T matched",
			});
		}
	} catch (E) {
		console.log("Error: " + E);
		res.status(500).json({
			msg: "Internal Error",
			error: E,
			tokenShared,
		});
	}
}
