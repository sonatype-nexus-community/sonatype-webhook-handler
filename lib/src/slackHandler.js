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


const webHookHandler = require("./webHookSender.js");
let IQ_URL = ""
let SLACK_URL = ""


// Do this for different webhook messages
function processIqDataforSlack(e, url, iq) {
    // console.log(JSON.stringify(e))
    // console.log("-------------------------------")
    SLACK_URL = url
    IQ_URL = iq


    // Application Evaluation (minimal data from app evaluation)
    if(e.hasOwnProperty("applicationEvaluation") && e.hasOwnProperty("policyAlerts")==false){
        formatAppEvaluationSlackNotification(e)
    }

    // Violation alert (detailed app data)
    if (e.hasOwnProperty("policyAlerts")) {
        formatViolationAlertSlackNotification(e)
    }

    // License Override Management
    if (e.hasOwnProperty("licenseOverride")) {
        formatLicenseManagementSlack(e)
    }

    // Policy Management
    if (e.hasOwnProperty("type") && e.type == "POLICY") {
        formatPolicyActionSlackNotification(e)
    }

    // TBD: Security Vulnerability Override Management
}

function formatAppEvaluationSlackNotification(e) {
    let scanURL = IQ_URL + "assets/index.html#/applicationReport/" + e.applicationEvaluation.application.publicId + "/" + e.applicationEvaluation.reportId + "/policy"
    // console.log(scanURL)

    let slackMsg = {
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
    sendSlackMessage(slackMsg)
}

function formatViolationAlertSlackNotification(e) {
    let scanURL = IQ_URL + "assets/index.html#/applicationReport/" + e.application.publicId + "/" + e.applicationEvaluation.reportId + "/policy"
    console.log(scanURL)

    // Reformat message
    let violationJSON = []
    e.policyAlerts = e.policyAlerts.reverse();
    for(let i in e.policyAlerts) {
        // console.log(e.policyAlerts[i])
        let p = e.policyAlerts[i]
        let violation = p.policyName+" ("+p.threatLevel+")"

        if (p.threatLevel >=9){
            violation = ":bangbang: "+violation
        }
        if (p.threatLevel <9 && p.threatLevel >=7){
            violation = ":warning: "+violation
        }
        
        for(let j in p.componentFacts){
            let pj = p.componentFacts[j]
            let displayName = pj.displayName.replaceAll(' ', '')

            let description = ""
            // for(let k in pj.constraintFacts){
            //     for(let l in pj.constraintFacts[k].satisfiedConditions){
            //         description+= ""+violation+" : "+pj.constraintFacts[k].satisfiedConditions[l].reason+"\n"
            //     }
            // }

            found = false
            for(let m in violationJSON){
                if (displayName == violationJSON[m].name){
                    // violationJSON[m].details += description
                    found = true
                    break;
                }
            }

            if (found==false){
                violationJSON.push({
                    name:displayName,
                    details:violation
                })
            }
        }
    }
    
    let violationDetails = ""
    for(let i in violationJSON){
        violationDetails+="\n• "+violationJSON[i].details+" | "+violationJSON[i].name
    }

    let slackMsg = {
        "channel": "iq",
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "New Security Violation(s) found for "+ e.application.name+" with Sonatype Continuous Monitoring",
                }
            }, {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": "*Application Evaluation Report*\n"+
                                "\t*• Affected Components:*\t"+e.applicationEvaluation.affectedComponentCount+"\n"+
                                "\t*• Critical Components:*\t"+e.applicationEvaluation.criticalComponentCount+" \n"+
                                "\t*• Severe Components:  *\t"+e.applicationEvaluation.severeComponentCount+" \n"+
                                "\t*• Moderate Components:*\t"+e.applicationEvaluation.moderateComponentCount+"\n"+
                                "*Stage:* "+e.applicationEvaluation.stage+"\n"+
                                "*Outcome:* "+e.applicationEvaluation.outcome+"\n"
                    },
                ]
            }, 
            {
                "type": "context",
                "elements": [
                    {
                        "type": "plain_text",
                        "text": violationDetails,
                        "emoji": true
                    }
                ]
            },
            {
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
    sendSlackMessage(slackMsg)
}

function formatPolicyActionSlackNotification(e) {
    policyName = ""
    for (let i in e.owner) {
        for (let j in e.owner[i]) {
            if (e.id == e.owner[i][j].id) { // console.log(e.owner[i][j].name)
                policyName = e.owner[i][j].name;
                break;
            }
        }
    }


    let slackMsg = {
        "channel": "iq",
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "Nexus IQ Administrative Action"
                }
            }, {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": e.type + " " + e.action + " for *" + policyName + "* in " + e.owner.name + " " + e.owner.type.toLowerCase() + "."
                    },
                ]
            }, {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "Visit Nexus IQ Server"
                        },
                        "style": "primary",
                        "url": IQ_URL
                    }
                ]
            }
        ]
    }
    sendSlackMessage(slackMsg)
}

function formatLicenseManagementSlack(e) {

    let comments = ""
    if (e.licenseOverride.comment.length > 1) {
        comments = "\n\nComments: \"" + e.licenseOverride.comment + "\""
    }

    let lics = e.licenseOverride.licenseIds.toString()
    lics = lics.replaceAll(",", ", ")


    let mainText = "component " + extractComponentName(e.licenseOverride.componentIdentifier)
    if (e.licenseOverride.licenseIds.length > 0) {
        mainText += " - license(s): " + lics
    }

    let slackMsg = {
        "channel": "iq",
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "Nexus IQ License Override"
                }
            }, {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": "License " + e.licenseOverride.status + " for " + mainText + ". " + comments
                    },
                ]
            }, {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "Visit Nexus IQ Server"
                        },
                        "style": "primary",
                        "url": IQ_URL
                    }
                ]
            }
        ]
    }

    sendSlackMessage(slackMsg)
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
function sendSlackMessage(e) {
    // console.log("URL: "+SLACK_URL)
    var sendData = JSON.stringify(e);

    let config = {
        method: 'post',
        url: SLACK_URL,
        headers: {
            'Content-Type': 'application/json'
        },
        data: sendData
    };
    
    // Send new slack message
    webHookHandler.sendWebHookMessage(config)
}


module.exports = {
    processIqDataforSlack:processIqDataforSlack
}