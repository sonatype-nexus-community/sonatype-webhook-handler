/*
Copyright 2019-Present Sonatype Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const express = require('express');
const app = express();
const axios = require('axios');
const dotenv = require('dotenv')
dotenv.config();
app.use(express.json());

/*  Welcome to the Microsoft Teams webhook integration for Sonatype Lifecycle.
    In this script we process a Sonatype Lifecycle message and send it to a 
    MS Teams webhook connector and channel. 

    Docs: https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/connectors-using?tabs=cURL

    Make sure to update the Environment Variables in the .env file.
*/

/*****************/
// ENVIRONMENT VARIABLES
const TEAMS_URL = process.env.TEAMS_URL // "https://sonatype.webhook.office.com/webhookb2/..."
const PORT = process.env.NODEPORT // 3000
var IQ_URL = process.env.IQ_URL   // "http://localhost:8070/""
/*****************/



// Check for trailing '/'
if(IQ_URL[IQ_URL.length-1] != '/'){
    IQ_URL = IQ_URL+'/'
}

/*****************/
// RECEIVER
/*****************/
app.post('/msteams', function (req, res) {
    var data = req.body;
    // console.log("New Microsoft Teams Message from IQ!");
    // console.log(data)

    res.send({status: 200})
    processIqData(data)
});


// Visit url in terminal /test to trigger test meesgae (ex. localhost:3000/test )
app.get('/test', function (req, res) {
    res.send({status: 200, message: "Success!"})
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
    processIqData(payload)
});


// Do this for different webhook messages
function processIqData(e) {
    console.log(JSON.stringify(e))
    // console.log("-------------------------------")

    // Application Evaluation (minimal data from app evaluation)
    if(e.hasOwnProperty("applicationEvaluation") && e.hasOwnProperty("policyAlerts")==false){
        formatAppEvaluationMSTeamsNotification(e)
    }

    // Violation alert (detailed app data)
    // if (e.hasOwnProperty("policyAlerts")) {
    //     formatViolationAlertMSTeamsNotification(e)
    // }

    // Policy Management
    // if (e.hasOwnProperty("type") && e.type == "POLICY") {
    //     formatPolicyActionMSTeamsNotification(e)
    // }

    // License Override Management
    // if (e.hasOwnProperty("licenseOverride")) {
    //     formatLicenseManagementMSTeams(e)
    // }

}

function formatAppEvaluationMSTeamsNotification(e) {
    let scanURL = IQ_URL + "assets/index.html#/applicationReport/" + e.applicationEvaluation.application.publicId + "/" + e.applicationEvaluation.reportId + "/policy"
    console.log(scanURL)

    // Adjust message color
    let color = "cc0029"
    if(e.applicationEvaluation.criticalComponentCount == 0 && e.applicationEvaluation.severeComponentCount == 0){
        color = "ff8400"
        if(e.applicationEvaluation.moderateComponentCount == 0){
            color = "4959b6"
        }
    }
        
    // Format message
    let msTeamsMsg = {
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "themeColor": color,
        "summary": "Sonatype IQ Evaluation for " + e.applicationEvaluation.application.name,
        "sections": [{
            "activityTitle": "Sonatype IQ Evaluation for " + e.applicationEvaluation.application.name,
            "activitySubtitle": capitalizeFirstLetter(e.applicationEvaluation.stage)+" Report",
            // "activityImage": "https://teamsnodesample.azurewebsites.net/static/img/image5.png",
            "facts": [ {
                "name": "Affected Components",
                "value": e.applicationEvaluation.affectedComponentCount
            },{
                "name": "Critical Issues",
                "value": e.applicationEvaluation.criticalComponentCount 
            }, {
                "name": "High Issues",
                "value": e.applicationEvaluation.severeComponentCount
            }, {
                "name": "Moderate Issues",
                "value": e.applicationEvaluation.moderateComponentCount
            }, {
                "name": "Evaluation Date",
                "value": e.applicationEvaluation.evaluationDate
            }, {
                "name": "Outcome",
                "value": e.applicationEvaluation.outcome.toUpperCase()
            }],
            "markdown": true
        }],
        "potentialAction": [ {
            "@type": "OpenUri",
            "name": "View Report",
            "targets": [{
                "os": "default",
                "uri": scanURL
            }]
        }]
    }

    sendMSTeamsMessage(msTeamsMsg)
}


function capitalizeFirstLetter(e){
    return e.charAt(0).toUpperCase()+ e.slice(1)
}


/*****************/
// Sender
/*****************/
function sendMSTeamsMessage(e) {
    var url = TEAMS_URL
    var sendData = JSON.stringify(e);

    var config = {
        method: 'post',
        url: url,
        headers: {
            'Content-Type': 'application/json'
        },
        data: sendData
    };

    // Send new MS Teams message
    axios(config).then(function (response) {
        console.log("MS Teams response: " + JSON.stringify(response.data));
    }).catch(function (error) {
        console.log(error);
    });
}


app.listen(PORT || 3000);
console.log("Running on http://localhost:" + PORT + "/")