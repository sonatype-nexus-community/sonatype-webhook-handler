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

import { AdaptiveCards } from "@microsoft/adaptivecards-tools";
import { WebhookTarget } from "../WebHookTarget";
import { IqWebhookPayload } from "../types";
import { BaseHandler } from "./base";

import template from "../templates/adaptive-card-default.json";
import { getIqUrlForApplicationEvaluation } from "../helpers/iq";

export class TeamsHandler extends BaseHandler {
    
    public handleApplicationEvaluation(payload: IqWebhookPayload, target: WebhookTarget): void {
        target.sendAdaptiveCard(
            AdaptiveCards.declare(template).render(
            {
                "title": `Sonatype Scan Result for ${payload.applicationEvaluation.application.name}`,
                "stage": payload.applicationEvaluation.stage,
                "application": payload.applicationEvaluation.application.name,
                "critical": payload.applicationEvaluation.criticalComponentCount,
                "severe": payload.applicationEvaluation.severeComponentCount,
                "reportUrl" : getIqUrlForApplicationEvaluation(payload)
                })
        ).then(() => console.log("Send adaptive card successfully.")).catch(e => console.log(`Failed to send adaptive card. ${e}`))
    }
}