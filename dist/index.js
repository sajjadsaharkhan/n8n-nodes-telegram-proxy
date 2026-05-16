"use Object.defineProperty";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeClasses = exports.credentialClasses = void 0;
const Telegram_node_1 = require("./nodes/Telegram.node");
const TelegramTrigger_node_1 = require("./nodes/TelegramTrigger.node");
const TelegramApiProxy_credentials_1 = require("./credentials/TelegramApiProxy.credentials");
exports.nodeClasses = [new Telegram_node_1.Telegram(), new TelegramTrigger_node_1.TelegramTrigger()];
exports.credentialClasses = [new TelegramApiProxy_credentials_1.TelegramApiProxy()];
