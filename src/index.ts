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

import express, { Express, Request, Response } from 'express'
import { IqWebhookPayload, IqWebhookPayloadApplicationEvaluation, IqWebhookPayloadWaiverRequest } from "./types"
import { IqWebhookEvent } from './constants'
import { Configuration, HandlerRule, JiraConfiguration, UrlOnlyConfiguration } from './config'
import { BaseHandler, HandlerType } from './handlers/base'
import { JiraHandler } from './handlers/jira'
import { SlackHandler } from './handlers/slack'
import { TeamsHandler } from './handlers/teams'
import { JiraWebhookTarget, WebhookTarget } from './WebHookTarget'
import { HandlerNotImplementedError } from './error'

require('dotenv').config()
const app: Express = express()
app.use(express.json());

/**
 * Fill in your incoming webhook url.
 */
export const IQ_SERVER_URL: string = process.env.IQ_SERVER_URL
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000

let CONFIG_DATA: Configuration = { "rules": [] }
try {
    CONFIG_DATA = require(process.env.CONFIG_FILE_PATH)
} catch (err) {
    console.error(`Failed to load config - are you sure it's valid? ${err}`)
    process.exit(1)
}

const handlers = {
    [HandlerType.JIRA]: new JiraHandler(),
    [HandlerType.SLACK]: new SlackHandler(),
    [HandlerType.TEAMS]: new TeamsHandler()
}

app.post('/webhook', function (req: Request, res: Response) {
    const webhookId = req.get('X-Nexus-Webhook-Id')
    const webhookDelivery = req.get('X-Nexus-Webhook-Delivery')
    const eventType = Object.keys(IqWebhookEvent)[Object.values(IqWebhookEvent).indexOf(webhookId as unknown as IqWebhookEvent)] as IqWebhookEvent
    handleWebhookRequest(eventType, webhookDelivery, req.body, res)
   
    // Response Immediately!
    res.send({status: 200})
})

function handleWebhookRequest(eventType: IqWebhookEvent, eventId: string, payload: IqWebhookPayload, res: Response) {
    console.debug(`Processing WebHook Event ID ${eventId}...`)
    for (let i = 0; i < CONFIG_DATA.rules.length; i++) {
        const rule: HandlerRule = CONFIG_DATA.rules[i]
        let webhookTarget: WebhookTarget
        switch (Number(HandlerType[rule.handler])) {
            case HandlerType.JIRA:
                webhookTarget = new JiraWebhookTarget(
                    new URL((rule.handlerConfig as UrlOnlyConfiguration).url),
                    (rule.handlerConfig as JiraConfiguration).projectKey,
                    (rule.handlerConfig as JiraConfiguration).issueType,
                    (rule.handlerConfig.authorization !== undefined ? rule.handlerConfig.authorization : undefined)
                )
                break
            default:
                webhookTarget = new WebhookTarget(
                    new URL((rule.handlerConfig as UrlOnlyConfiguration).url),
                    (rule.handlerConfig.authorization !== undefined ? rule.handlerConfig.authorization : undefined)
                )
        }
        console.log(`   Rule: ${rule.events} vs ${eventType}`)
        for (var j in rule.events) {
            if (IqWebhookEvent[rule.events[j]] == eventType) {
                const handler = handlers[HandlerType[rule.handler]] as BaseHandler
                console.log(`Dealing with ${eventType} for ${rule.handler}`)
                try {
                    switch (eventType) {
                        case IqWebhookEvent.APPLICATION_EVALUATION:
                            handler.handleApplicationEvaluation(payload as IqWebhookPayloadApplicationEvaluation, webhookTarget)
                            break
                        case IqWebhookEvent.WAIVER_REQUEST:
                            handler.handleWaiverRequest(payload as IqWebhookPayloadWaiverRequest, webhookTarget)
                            break
                    }
                } catch (e) { 
                    if (e instanceof HandlerNotImplementedError) {
                        console.debug(`Handler for ${rule.handler} does not yet support the Webhook Event ${eventType}`)
                    } else {
                        throw e
                    }
                }
            }
        }
    }

    res.send({status: 200})
}

app.get('/test/applicaiton-evaluation', function (_req: Request, res: Response) {
    console.log('Received request for test Application Evaluation message')
    let payload: IqWebhookPayloadApplicationEvaluation = {
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
    handleWebhookRequest(IqWebhookEvent.APPLICATION_EVALUATION, 'TEST-EVENT', payload, res)
});

app.get('/test/waiver-request', function (_req: Request, res: Response) {
    console.log('Received request for test Waiver Request message')
    let payload: IqWebhookPayloadWaiverRequest = {
        timestamp: '2023-08-16T17:32:06.147+00:00',
        initiator: 'admin',
        comment: '',
        policyViolationId: '69e917987e1b4b3b8ea8c2930e0bdce3',
        policyViolationLink: 'http://localhost:8070/assets/#/violation/69e917987e1b4b3b8ea8c2930e0bdce3',
        addWaiverLink: 'http://localhost:8070/assets/#/addWaiver/69e917987e1b4b3b8ea8c2930e0bdce3'
    }
    handleWebhookRequest(IqWebhookEvent.WAIVER_REQUEST, 'TEST-EVENT', payload, res)
});

app.listen(PORT);
console.log(`Running on http://localhost:${PORT}/`)
console.log(`   IQ SERVER at: ${IQ_SERVER_URL}`)
console.log(`Loaded ${CONFIG_DATA.rules.length} Routing Rules from ${process.env.CONFIG_FILE_PATH}`)