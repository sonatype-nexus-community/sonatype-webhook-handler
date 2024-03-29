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

import { IqWebhookEvent } from "../constants"
import { UnknownWebHookEventType } from "../error"
import { IqWebhookPayloadApplicationEvaluation } from "../types"

export function getIqUrlForApplicationEvaluation(iqServerUrl: string, payload: IqWebhookPayloadApplicationEvaluation): string {
    return `${iqServerUrl}/assets/index.html#/applicationReport/${payload.applicationEvaluation.application.publicId}/${payload.applicationEvaluation.reportId}/policy`
}

export function validateWebHookEventType(eventType: string): IqWebhookEvent {
    for (let et of Object.keys(IqWebhookEvent)) {
        if (IqWebhookEvent[et] === eventType) {
            return eventType as IqWebhookEvent
        }
    }

    throw new UnknownWebHookEventType(`${eventType} is not a supported Webhook Event Type`)
}