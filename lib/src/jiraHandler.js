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

// Jira WebHook Docs: https://developer.atlassian.com/server/jira/platform/webhooks/


const webHookHandler = require("./webHookSender.js");
let IQ_URL = ""
let JIRA_URL = ""


// Do this for different webhook messages
function processIqDataforJira(e, url, iq) {
    console.log(JSON.stringify(e))
    console.log("-------------------------------")
    JIRA_URL = url
    IQ_URL = iq


    // Request waiver 
    if(e.hasOwnProperty("applicationEvaluation")){
        formatAppEvaluationJiraNotification(e)
    }

    
}

function formatAppEvaluationJiraNotification(e) {
    let scanURL = IQ_URL + "assets/index.html#/applicationReport/" + e.applicationEvaluation.application.publicId + "/" + e.applicationEvaluation.reportId + "/policy"
    // console.log(scanURL)

    let jiraMsg = {
        "channel": "iq",
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "Nexus IQ Evaluation for " + e.applicationEvaluation.application.name,
                    // "emoji": true
                }
            }, {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": "*Application Evaluation Report*\n\n" + "\t*- Affected Components:*\t" + e.applicationEvaluation.affectedComponentCount + "\n" + "\t*- Critical Components:*\t" + e.applicationEvaluation.criticalComponentCount + "\n" + "\t*- Severe Components:*\t" + e.applicationEvaluation.severeComponentCount + "\n" + "\t*- Moderate Components:*\t" + e.applicationEvaluation.moderateComponentCount + "\n" + "\n\n*Evaluation Date*: \n\t" + e.applicationEvaluation.evaluationDate + "\n" + "*Stage:* " + e.applicationEvaluation.stage + "\n" + "*Outcome:* " + e.applicationEvaluation.outcome + "\n"
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
                        "url": scanURL
                    }
                ]
            }
        ]
    }
    sendJiraMessage(jiraMsg)
}



function extractComponentName(e) { // Pass in componentIdentifier
    let name = "";
    if (e.format == "maven") {
        name = e.coordinates.groupId + " : " + e.coordinates.artifactId + " : " + e.coordinates.version
        name += " (" + e.format + ")"

    } else {
        name = e.coordinates.packageId + " : " + e.coordinates.version + " (" + e.format + ")"
    }
    return name;
}


/*****************/
// Sender
/*****************/
function sendJiraMessage(e) {
    // console.log("URL: "+JIRA_URL)
    var sendData = JSON.stringify(e);

    let config = {
        method: 'post',
        url: JIRA_URL,
        headers: {
            'Content-Type': 'application/json'
        },
        data: sendData
    };
    
    // Send new Jira message
    webHookHandler.sendWebHookMessage(config)
}


module.exports = {
    processIqDataforJira:processIqDataforJira
}