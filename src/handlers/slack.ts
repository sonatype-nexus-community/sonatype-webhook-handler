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

import { IQ_SERVER_URL } from ".."
import { WebhookTarget } from "../WebHookTarget";
import { HandlerNotImplementedError } from "../error"
import { getIqUrlForApplicationEvaluation } from "../helpers/iq";
import { IqWebhookPayloadApplicationEvaluation, IqWebhookPayloadWaiverRequest } from "../types";
import { BaseHandler } from "./base";

export class SlackHandler extends BaseHandler {
    
    public handleWaiverRequest(payload: IqWebhookPayloadWaiverRequest, target: WebhookTarget): void {
        const message = {
            "text": "New Sonatype Platform Policy Waiver Request",
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": `New Sonatype Platform Policy Waiver Request`
                    }
                }, {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": `*${payload.initiator}* has requested a policy violation waiver on the Sonatype Platform.\nRead more about this issue here: <${payload.policyViolationLink}|Violation Details> \nRequest note:\n\t_\"${payload.comment}\"_`
                        },
                    ]
                }, {
                    "type": "actions",
                    "elements": [
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "text": "Create Waiver in Sonatype"
                            },
                            "style": "primary",
                            "url": payload.addWaiverLink
                        }
                    ]
                }
                
            ]
        }

        target.sendMessage(message).catch(err => console.error(`Slack Error ${err}: ${err.response.data}`))
    }
    
    
    public handleApplicationEvaluation(payload: IqWebhookPayloadApplicationEvaluation, target: WebhookTarget): void {
        const message = {
            "text": "New Sonatype Platform Evaluation Results",
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": `Sonatype Platform Scan Result for ${payload.applicationEvaluation.application.name}`
                    }
                }, {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": "*Application Evaluation Report*\n\n" + "\t*- Affected Components:*\t" + payload.applicationEvaluation.affectedComponentCount + "\n" + "\t*- Critical Issues:*\t" + payload.applicationEvaluation.criticalComponentCount + "\n" + "\t*- Severe Issues:*\t" + payload.applicationEvaluation.severeComponentCount + "\n" + "\t*- Moderate Issues:*\t" + payload.applicationEvaluation.moderateComponentCount + "\n" + "\n\n*Evaluation Date*: \n\t" + payload.applicationEvaluation.evaluationDate + "\n" + "*Stage:* " + payload.applicationEvaluation.stage + "\n" + "*Outcome:* " + payload.applicationEvaluation.outcome + "\n"
                        },
                    ]
                }, {
                    "type": "actions",
                    "elements": [
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "text": "View Report"
                            },
                            "style": "primary",
                            "url": getIqUrlForApplicationEvaluation(IQ_SERVER_URL, payload)
                        }
                    ]
                }
                
            ]
        }

        target.sendMessage(message).catch(err => console.error(`Slack Error ${err}: ${err.response.data}`))
    }

}