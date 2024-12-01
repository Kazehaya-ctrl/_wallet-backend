"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = tokenAuthentication;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const tokenShared = process.env.TOKEN;
function tokenAuthentication(req, res, next) {
    const { token } = req.body;
    try {
        if (!tokenShared) {
            throw new Error("Shared token is not defined");
        }
        if (token === tokenShared) {
            req.headers.token = token;
            next();
        }
        else {
            res.status(411).json({
                msg: "TOKEN DIDN'T matched",
            });
        }
    }
    catch (E) {
        console.log("Error: " + E);
        res.status(500).json({
            msg: "Internal Error",
            error: E,
            tokenShared,
        });
    }
}
