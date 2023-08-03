"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookTarget = void 0;
const axios_1 = __importDefault(require("axios"));
class WebhookTarget {
    /**
     * Constructor.
     *
     * @param webhook - the incoming webhook URL.
     */
    constructor(webhook) {
        this.webhook = webhook;
    }
    /**
     * Send a plain text message.
     *
     * @param text - the plain text message.
     * @returns A `Promise` representing the asynchronous operation.
     */
    sendMessage(text) {
        return axios_1.default.post(this.webhook.toString(), {
            text: text,
        }, {
            headers: { "content-type": "application/json" },
        });
    }
    /**
     * Send an adaptive card message.
     *
     * @param card - the adaptive card raw JSON.
     * @returns A `Promise` representing the asynchronous operation.
     */
    sendAdaptiveCard(card) {
        return axios_1.default.post(this.webhook.toString(), {
            type: "message",
            attachments: [
                {
                    contentType: "application/vnd.microsoft.card.adaptive",
                    contentUrl: null,
                    content: card,
                },
            ],
        }, {
            headers: { "content-type": "application/json" },
        });
    }
}
exports.WebhookTarget = WebhookTarget;
//# sourceMappingURL=WebHookTarget.js.map