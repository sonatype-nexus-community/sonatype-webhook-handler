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

// Docs and markdown: https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/connectors-using?tabs=cURL


import { AdaptiveCards } from "@microsoft/adaptivecards-tools";
import { WebhookTarget } from "../WebHookTarget";
import { IqWebhookPayloadApplicationEvaluation, IqWebhookPayloadWaiverRequest } from "../types";
import { BaseHandler } from "./base";
import template from "../templates/adaptive-teams-card-default.json";
import { getIqUrlForApplicationEvaluation } from "../helpers/iq";
import { COLOR_ORANGE } from "../constants";
import { HandlerNotImplementedError } from "../error"

export class TeamsHandler extends BaseHandler {
    
    public handleWaiverRequest(payload: IqWebhookPayloadWaiverRequest, target: WebhookTarget): void {
        const message = {
            "@type": "MessageCard",
            "@context": "http://schema.org/extensions",
            "themeColor": COLOR_ORANGE,
            "summary": "New Sonatype Platform Policy Waiver Request",
            "sections": [{
                "activityTitle": "New Sonatype Platform Policy Waiver Request",
                "activitySubtitle": `Requested By: ${payload.initiator}`,
                "facts": [ {
                    "name": "Read More Here: ",
                    "value": `[Violation Details](${payload.policyViolationLink})`
                },{
                    "name": "Request Note: ",
                    "value": `\"${payload.comment}\"`
                }],
                "markdown": true
            }],
            "potentialAction": [ {
                "@type": "OpenUri",
                "name": "Create Waiver in the Sonatype Platform",
                "targets": [{
                    "os": "default",
                    "uri": payload.addWaiverLink
                }]
            }]
        }

        target.sendMessage(message).catch(err => console.error(`Microsoft Teams Error ${err}: ${err.response.data}`))
    }
    
    public handleApplicationEvaluation(payload: IqWebhookPayloadApplicationEvaluation, target: WebhookTarget): void {
        target.sendAdaptiveCard(
            AdaptiveCards.declare(template).render(
            {
                "title": `Sonatype Platform Scan Result for ${payload.applicationEvaluation.application.name}`,
                "stage": payload.applicationEvaluation.stage,
                "application": payload.applicationEvaluation.application.name,
                "critical": payload.applicationEvaluation.criticalComponentCount,
                "severe": payload.applicationEvaluation.severeComponentCount,
                "reportUrl" : getIqUrlForApplicationEvaluation(payload)
            })
        ).then(() => console.log("Send adaptive card successfully.")).catch(e => console.log(`Failed to send adaptive card. ${e}`))
    }
}