"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("./db/prisma");
const dotenv_1 = __importDefault(require("dotenv"));
const tokenCheck_1 = __importDefault(require("./middleware/tokenCheck"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.post("/webhook/:provider", tokenCheck_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    console.log(typeof body.amount);
    const token = req.headers["token"];
    const { amount, userid } = req.body;
    const provider = req.params.provider;
    try {
        console.log(body);
        const transaction = yield prisma_1.prisma.onRampTransactions.create({
            data: {
                user_id: userid,
                provider,
                amount,
                startTime: new Date(),
                token,
                state: "Processings",
            },
        });
        yield new Promise((r) => setTimeout(r, 3000));
        console.log(2);
        if (transaction) {
            yield prisma_1.prisma.$transaction([
                prisma_1.prisma.balance.update({
                    where: {
                        userId: transaction.user_id,
                    },
                    data: {
                        amount: {
                            increment: transaction.amount,
                        },
                    },
                }),
                prisma_1.prisma.onRampTransactions.update({
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
        }
        else {
            console.log(3);
            yield prisma_1.prisma.$transaction([
                prisma_1.prisma.onRampTransactions.create({
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
    }
    catch (E) {
        console.log("ERROR: trnx error");
        res.status(411).json({
            msg: "Failure",
        });
    }
}));
app.listen(3001, () => {
    console.log("Backend listening on 3001");
});
