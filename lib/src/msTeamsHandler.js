/*
 * Copyright (c) 2019-present Sonatype, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

require('dotenv').config();
// const TEAMS_WEBHOOK_URL = process.env.TEAMS_WEBHOOK_URL;
const IQ_SERVER_URL = process.env.IQ_SERVER_URL;
// const handlerConfig = require("./config.json");
// console.log(handlerConfig)

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adaptivecards_tools_1 = require("@microsoft/adaptivecards-tools");
const WebHookTarget_1 = require("./WebHookTarget");
const adaptive_card_default_json_1 = __importDefault(require("./templates/adaptive-card-default.json"));




function processIqDataForMsTeams(payload, url, iq) {
    const webhookTarget = new WebHookTarget_1.WebhookTarget(new URL(url));

    webhookTarget.sendAdaptiveCard(adaptivecards_tools_1.AdaptiveCards.declare(adaptive_card_default_json_1.default).render({
        "title": `Sonatype Scan Result for ${payload.applicationEvaluation.application.name}`,
        "stage": payload.applicationEvaluation.stage,
        "application": payload.applicationEvaluation.application.name,
        "critical": payload.applicationEvaluation.criticalComponentCount,
        "severe": payload.applicationEvaluation.severeComponentCount,
        "reportUrl": getIqUrlForApplicationEvaluation(payload, iq)
    }))
        .then(() => console.log("Send adaptive card successfully."))
        .catch(e => console.log(`Failed to send adaptive card. ${e}`));
}

function getIqUrlForApplicationEvaluation(payload, iq) {
    return `${iq}/assets/index.html#/applicationReport/${payload.applicationEvaluation.application.publicId}/${payload.applicationEvaluation.reportId}/policy`;
}

module.exports = {
    processIqDataForMsTeams:processIqDataForMsTeams
}