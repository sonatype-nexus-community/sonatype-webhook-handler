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

import express, { Express, Request, Response } from 'express';
import { AdaptiveCards } from "@microsoft/adaptivecards-tools";
import { WebhookTarget } from "./WebHookTarget";
import template from "./templates/adaptive-card-default.json";
import { IqWebhookPayload } from "./types";

require('dotenv').config()
const app: Express = express()
app.use(express.json());

/**
 * Fill in your incoming webhook url.
 */
const IQ_SERVER_URL: string = process.env.IQ_SERVER_URL
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000
const TEAMS_WEBHOOK_URL: string = process.env.TEAMS_WEBHOOK_URL
const webhookTarget = new WebhookTarget(new URL(TEAMS_WEBHOOK_URL));

const IQ_WEBHOOK_EVENT_APPLICATION_EVALUATION = 'iq:applicationEvaluation'

app.post('/teams', function (req: Request, res: Response) {
    const webhookId = req.get('X-Nexus-Webhook-Id')
    const webhookDelivery = req.get('X-Nexus-Webhook-Delivery')
    
    // Response Immediately!
    res.send({status: 200})
    if (webhookId !== undefined && webhookId == IQ_WEBHOOK_EVENT_APPLICATION_EVALUATION && webhookDelivery) {
        console.log(`${IQ_WEBHOOK_EVENT_APPLICATION_EVALUATION} WebHook Delivery ${webhookDelivery} received and being processed`)
        sendAdaptiveCardForApplicationEvaluation(req.body)
    }
})


app.get('/test', function (req: Request, res: Response) {
    console.log('Received request for test message')
    res.send({status: 200, message: "Success!"})
    let payload: IqWebhookPayload = {
        "timestamp": "2020-04-22T18:30:04.673+0000",
        "initiator": "admin",
        "id": "d5cc2e91d6454545841da5599d3c7156",
        "applicationEvaluation": {
            "application": {
                "id": "0f256982c80b4e13abef4917b93ac343",
                "publicId": "My-Application-ID",
                "name": "App Name",
                "organizationId": "f25acda2a413ab2c62b44917b93ac232"
            },
            "policyEvaluationId": "d5cc2e91d6454545841da5599d3c7156",
            "stage": "release",
            "ownerId": "0f256982c80b4e13abef4917b93ac343",
            "evaluationDate": "2020-04-22T18:30:04.404+0000",
            "affectedComponentCount": 999,
            "criticalComponentCount": 9,
            "severeComponentCount": 9,
            "moderateComponentCount": 9,
            "outcome": "fail",
            "reportId": "36f37cf776dd408bacd063450ab04f71"
        }
    }
    sendAdaptiveCardForApplicationEvaluation(payload)
});

/**
* Send adaptive cards.
*/
function sendAdaptiveCardForApplicationEvaluation(payload: IqWebhookPayload): void {
    webhookTarget.sendAdaptiveCard(
        AdaptiveCards.declare(template).render(
        {
            "title": `Sonatype Scan Result for ${payload.applicationEvaluation.application.name}`,
            "stage": payload.applicationEvaluation.stage,
            "application": payload.applicationEvaluation.application.name,
            "critical": payload.applicationEvaluation.criticalComponentCount,
            "severe": payload.applicationEvaluation.severeComponentCount,
            "reportUrl" : getIqUrlForApplicationEvaluation(payload)
        }))
    .then(() => console.log("Send adaptive card successfully."))
    .catch(e => console.log(`Failed to send adaptive card. ${e}`));
}


function getIqUrlForApplicationEvaluation(payload: IqWebhookPayload): string {
    return `${IQ_SERVER_URL}/assets/index.html#/applicationReport/${payload.applicationEvaluation.application.publicId}/${payload.applicationEvaluation.reportId}/policy`
}

app.listen(PORT);
console.log(`Running on http://localhost:${PORT}/`)
console.log(`   IQ SERVER at: ${IQ_SERVER_URL}`)
console.log(`   MS TEAMS at: ${TEAMS_WEBHOOK_URL.substring(0, 128)}...`)