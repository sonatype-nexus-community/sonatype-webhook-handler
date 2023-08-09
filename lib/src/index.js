"use strict";
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

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.use(express_1.default.json());


const CONFIGDATA = require('./dev.config.json');
// console.log(CONFIGDATA)

const IQ_SERVER_URL = CONFIGDATA.SonatypeIQURL;
const PORT = CONFIGDATA.NodePort ? parseInt(CONFIGDATA.NodePort) : 3000;
const IQ_WEBHOOK_EVENT_APPLICATION_EVALUATION = 'iq:applicationEvaluation';
const IQ_URL = CONFIGDATA.SonatypeIQURL


/**********************************/
// Microsoft Teams Configuration
/**********************************/
const msTeamsHandler = require("./msTeamsHandler.js");
app.post('/teams', function (req, res) {
    const webhookId = req.get('X-Nexus-Webhook-Id');
    const webhookDelivery = req.get('X-Nexus-Webhook-Delivery');
    // Response Immediately!
    res.send({ status: 200 });
    if (webhookId !== undefined && webhookId == IQ_WEBHOOK_EVENT_APPLICATION_EVALUATION && webhookDelivery) {
        console.log(`${IQ_WEBHOOK_EVENT_APPLICATION_EVALUATION} WebHook Delivery ${webhookDelivery} received and being processed`);

        let url = getForwardURL("teams", "DEFAULT" )
        msTeamsHandler.processIqDataForMsTeams(req.body, url, IQ_URL);
    }
});


app.get('/teamsTest', function (req, res) {
    console.log('Received request for MS Teams test message');
    res.send({ status: 200, message: "Success!" });
    let payload = {
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
    };

    let url = getForwardURL("teams", payload.applicationEvaluation.application.publicId)
    msTeamsHandler.processIqDataForMsTeams(payload, url, IQ_URL);
});


/**********************************/
// Slack Configuration
/**********************************/
const slackHandler = require("./slackHandler.js");
app.post('/slack', function (req, res) {
    var data = req.body;
    console.log("New Slack Message from IQ!");
    // console.log(data)

    res.send({status: 200})
    let url = getForwardURL("slack", "DEFAULT" )
    slackHandler.processIqDataforSlack(data, url, IQ_URL)
});

// Visit url in terminal /test to trigger test meesgae (ex. localhost:3000/test )
app.get('/slackTest', function (req, res) {
    res.send({status: 200, message: "Success!"})
    console.log('Received request for Slack test message');
    let payload = {
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

    let url = getForwardURL("slack", payload.applicationEvaluation.application.publicId )
    slackHandler.processIqDataforSlack(payload, url, IQ_URL)
});

app.get('/slackWaiverTest', function (req, res) {
    res.send({status: 200, message: "Success!"})
    console.log('Received request for Slack test message');
    // https://help.sonatype.com/iqserver/automating/iq-server-webhooks#IQServerWebhooks-YellowNEWINRELEASE165waiver_requestWaiverRequest
    let payload = {
        "timestamp": '2023-07-05T15:21:59.681+00:00',
        "initiator": 'admin',
        "comment": 'To accelerate release and time to investigate further',
        "policyViolationId": '79576f35da564bc38fbaa8e41882755f',
        "policyViolationLink": 'http://localhost:8070/assets/#/violation/79576f35da564bc38fbaa8e41882755f',
        "addWaiverLink": 'http://localhost:8070/assets/#/addWaiver/79576f35da564bc38fbaa8e41882755f?comments=toacceleratereleaseandtimetoinvestigatefurther'
    }
    let url = getForwardURL("slack", "DEFAULT")
    slackHandler.processIqDataforSlack(payload, url, IQ_URL)
});


/**********************************/
// Jira Configuration
/**********************************/
const jiraHandler = require("./jiraHandler.js");
app.post('/jira', function (req, res) {
    var data = req.body;
    console.log("New Jira Message from IQ!");
    // console.log(data)

    res.send({status: 200})
    let url = getForwardURL("jira", "DEFAULT" )
    jiraHandler.processIqDataforJira(data, url, IQ_URL)
});



/**********************************/
// Misc
/**********************************/
function getForwardURL(platform, app){
    let url = ""
    let defaultUrl = ""
    for(let i in CONFIGDATA.URLRouting){
        let item = CONFIGDATA.URLRouting[i]
        if(item.handler == platform){
            if(item.applications == "DEFAULT"){
                defaultUrl = item.channelURL

            }else if(item.applications.includes(app)){
                url = item.channelURL
            }
            
        }
    }
    if(url == ""){
        url = defaultUrl
        if(url == ""){
            console.log("/////////////////////////////////")
            console.log("///// ERROR NO DEFAULT URL //////")
            console.log("/////////////////////////////////")
        }
    }

    return url
}


app.listen(PORT);
console.log(`\nRunning on http://localhost:${PORT}/`);
console.log(`   IQ SERVER at: ${IQ_SERVER_URL}`);
//# sourceMappingURL=index.js.map