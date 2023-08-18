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

import { WebhookTarget } from "../WebHookTarget"
import { getIqUrlForApplicationEvaluation } from "../helpers/iq"
import { IqWebhookPayloadApplicationEvaluation, IqWebhookPayloadWaiverRequest } from "../types"
import { BaseHandler } from "./base"


export class JiraHandler extends BaseHandler {

    public handleApplicationEvaluation(payload: IqWebhookPayloadApplicationEvaluation, target: WebhookTarget): void {
        throw new Error("Method not implemented.")
    }
    
    public handleWaiverRequest(payload: IqWebhookPayloadWaiverRequest, target: WebhookTarget): void {
        // var old = payload
        // var examplePayload = {
        //     timestamp: '2023-08-16T17:32:06.147+00:00',
        //     initiator: 'admin',
        //     comment: '',
        //     policyViolationId: '69e917987e1b4b3b8ea8c2930e0bdce3',
        //     policyViolationLink: 'http://localhost:8070/assets/#/violation/69e917987e1b4b3b8ea8c2930e0bdce3',
        //     addWaiverLink: 'http://localhost:8070/assets/#/addWaiver/69e917987e1b4b3b8ea8c2930e0bdce3'
        // }

        //Create Issue with API Docs: https://blog.developer.atlassian.com/creating-a-jira-cloud-issue-in-a-single-rest-call/
        //Jira Markdown Docs: https://developer.atlassian.com/cloud/jira/platform/apis/document/nodes/blockquote/
        const message = {
            "fields": {
                "summary": "New Sonatype Policy Waiver Request",
                "issuetype": {
                    "name": "Task" //ISSUE TYPE
                },
                "project": {
                    "key": "WH" //KEY
                },
                "description": {
                    "type": "doc",
                    "version": 1,
                    "content": [
                        {
                            "type": "paragraph",
                            "content": [
                                {
                                    "type": "text",
                                    "text": payload.initiator,
                                    "marks": [
                                        {
                                            "type": "strong"
                                        }
                                    ]
                                },
                                {
                                    "type": "text",
                                    "text": " has requested a policy violation waiver in Sonatype IQ Server. \nRead more about this issue here: "
                                },
                                {
                                    "type": "text",
                                    "text": "Violation Details",
                                    "marks": [
                                        {
                                            "type": "link",
                                            "attrs": {
                                                "href": payload.policyViolationLink,
                                                "title": payload.policyViolationLink
                                            }
                                        }
                                    ]
                                },
                                {
                                    "type": "text",
                                    "text": "\nRequest note:\n\t"
                                },
                                {
                                    "type": "text",
                                    "text": "\""+payload.comment+"\"",
                                    "marks": [
                                        {
                                            "type": "em"
                                        }
                                    ]
                                },
                                {
                                    "type": "text",
                                    "text": "\n\n Go here to approve and create the waiver: "
                                },
                                {
                                    "type": "text",
                                    "text": "Add Waiver",
                                    "marks": [
                                        {
                                            "type": "link",
                                            "attrs": {
                                                "href": payload.addWaiverLink,
                                                "title": payload.addWaiverLink
                                            }
                                        }
                                    ]
                                }
        
        
                            ]
                        }
                    ]
                }
            }
        }
        target.sendMessage(message).catch(err => console.error(`JIRA Error ${err}: ${err.response.data}`))
    }
}