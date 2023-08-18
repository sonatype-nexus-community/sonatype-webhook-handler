# Sonatype Lifecycle Webhook Handler

This project contains an example (working) Web Hook handler for Sonatype Lifecycle that can publish messages to a Microsoft Teams Channel, Slack Channel, or open a Jira Issue.

Sonatype WebHook Documentation: https://help.sonatype.com/iqserver/automating/iq-server-webhooks


## Configuration


### Create a local config.json

Create a `config.json` file formatted like the provided `example.config.json`.

The `config.json` will allow you to configure multiple endpoints for a single message from Sonatype IQ. You can configure 1 or several message types.

*NOTE: Currently the "applications" key only allows for the value to be "DEFAULT". Currently the "events" array is only configured for "APPLICATION_EVALUATION" for Slack and Microsoft Teams and WAIVER_REQUEST for Jira.*



### Microsoft Teams

1. In Microsoft Teams head to the Channel where you wish messages to be posted
2. Open the Channel Menu (three dots top right) and select Connectors
3. Search for and add "Incoming Webhook"
4. Configure the Incoming Webhook:
   - Upload an Image of your choice
   - Note the Web Hook URL - you'll need that later!



### Slack

On Slack we need to create an app to listen for our Webhooks from IQ:
1. Go to the link to create the app: https://api.slack.com/apps?new_app=1
2. Name the app "Nexus IQ" and select the workspace where we want this to operate
3. Click "Add features and functionality"
4. Toggle "On" the Activate Incoming Webhooks then click "Add New Webhook to Workspace"
5. Select the channel or contact we want to forward the Webhook messages to
6. Copy that Webhook URL - you'll need it later!
7. You can also update the display information at the bottom of the *Basic Information* page with the Sonatype logo (The icon is in attached in the "images" directory)



### Jira

Configuring the Jira API to create issues is depended on what version of Jira you have in use (Cloud, Data-Center, etc.). This blog will be helpful for more detailed setup steps: https://blog.developer.atlassian.com/creating-a-jira-cloud-issue-in-a-single-rest-call/

1. Create a user API token
2. Make a string of yourEMAILaddress:yourAPItoken
3. Then base64 encode that string

Want to change the output? Here are the Jira Markdown Docs: https://developer.atlassian.com/cloud/jira/platform/apis/document/nodes/blockquote


### Running This Handler

#### Manually

You can run this on any Node 16 or Node 18 environment. 

1. Run `npm install` to obtain the required depnedencies
2. Create a `.env` file as follows:
   ```
    IQ_SERVER_URL=https://my-iq-server-url # Full URL to your Sonatype Lifecycle Server
    PORT=3000 # The port to run this handler on
    CONFIG_FILE_PATH=path/to/config.json
   ```
4. Start the handler by running `npm start` - the handler is now listening on http://localhost:3000/

#### As a Container

This webhook handler is published as a Docker Image to Docker Hub.

An example `docker-compose.yml` might be:

```
services:
   webhook-teams:
    image: sonatype-teams-app-integration:latest
    environment:
      - IQ_SERVER_URL=[YOUR_IQ_SERVER_URL_HERE]
      - PORT=3000
      - TEAMS_WEBHOOK_URL=[YOUR MS TEAMS WEBHOOK URL HERE]
    ports:
      - '30000:3000'
```

### Testing

You can quickly test the handler is able to post a message to Microsoft Teams by visiting http://localhost:3000/test:

![Installation Step 1](./images/example-ms-teeams-message.png)

### Connecting to Sonatype Lifecycle

Simply add http://localhost:3000/teams as a [WebHook to your Sonatype Lifecycle Server](https://help.sonatype.com/iqserver/automating/iq-server-webhooks).

Get your Sonatype Lifecycle Administrator to add a Webhook:
1. System Preferences -> Webhooks
2. + Add a Webhook
3. Complete the details, ensuring the Event Type **Application Evaluation** is selected

![Installation Step 1](./images/sonatype-iq-add-webhook.png)



## The Fine Print

Remember:

It is worth noting that this is **NOT SUPPORTED** by Sonatype, and is a contribution of ours to the open source
community (read: you!)

* Use this contribution at the risk tolerance that you have
* Do NOT file Sonatype support tickets related to `sonatype-teams-app-integfration`
* DO file issues here on GitHub, so that the community can pitch in

Phew, that was easier than I thought. Last but not least of all - have fun!
