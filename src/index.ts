import express, { Request, Response } from "express";
import { prisma } from "./db/prisma";
import dotnev from "dotenv";
import tokenAuthentication from "./middleware/tokenCheck";
import cors from "cors";

dotnev.config();

const app = express();
app.use(express.json());
app.use(cors());

app.post(
	"/webhook/:provider",
	tokenAuthentication,
	async (req: Request, res: Response) => {
		const body = req.body;
		console.log(typeof body.amount);
		const token = req.headers["token"] as string;
		const { amount, userid }: { amount: number; userid: number } = req.body;
		const provider = req.params.provider as string;

		try {
			console.log(body);
			const transaction = await prisma.onRampTransactions.create({
				data: {
					user_id: userid,
					provider,
					amount,
					startTime: new Date(),
					token,
					state: "Processings",
				},
			});
			await new Promise((r) => setTimeout(r, 3000));
			console.log(2);
			if (transaction) {
				await prisma.$transaction([
					prisma.balance.update({
						where: {
							userId: transaction.user_id,
						},
						data: {
							amount: {
								increment: transaction.amount,
							},
						},
					}),
					prisma.onRampTransactions.update({
						where: {
							id: transaction.id,
						},
						data: {
							state: "Success",
						},
					}),
				]);
				res.status(200).json({
					msg: "SUCCESS",
				});
			} else {
				console.log(3);
				await prisma.$transaction([
					prisma.onRampTransactions.create({
						data: {
							user_id: userid,
							provider,
							amount,
							startTime: new Date(),
							token,
							state: "Failure",
						},
					}),
				]);
				res.json(400).json({
					msg: "FAILURE",
				});
			}
		} catch (E) {
			console.log("ERROR: trnx error");
			res.status(411).json({
				msg: "Failure",
			});
		}
	}
);

app.listen(3001, () => {
	console.log("Backend listening on 3001");
});
