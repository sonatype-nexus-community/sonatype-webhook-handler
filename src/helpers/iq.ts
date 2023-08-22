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

import { IqWebhookPayloadApplicationEvaluation } from "../types";
import { IQ_SERVER_URL } from '..';

export function getIqUrlForApplicationEvaluation(payload: IqWebhookPayloadApplicationEvaluation): string {
    let last = IQ_SERVER_URL.slice(-1);
    if (last != "/"){
        last = "/"
    }else{
        last = ""
    }

    return `${IQ_SERVER_URL}${last}assets/index.html#/applicationReport/${payload.applicationEvaluation.application.publicId}/${payload.applicationEvaluation.reportId}/policy`;
}
