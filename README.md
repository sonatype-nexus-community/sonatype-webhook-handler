# Sonatype Lifecycle Microsoft Teams Integration

This project contains an example (working) Web Hook handler for Sonatype Lifecycle that can publish messages to a Microsoft Teams channel.

## Configuration

### Microsoft Teams

1. Head to the Channel where you wish messages to be posted
2. Open the Channel Menu (three dots top right) and select Connectors
3. Search for and add "Incoming Webhook"
4. Configure the Incoming Webhook:
   - Upload an Image of your choice
   - Note the Web Hook URL - you'll need that later!

### Running This Handler

#### Manually

You can run this on any Node 16 or Node 18 environment. 

1. Run `npm install` to obtain the required depnedencies
2. Create a `.env` file as follows:
   ```
    IQ_SERVER_URL=https://my-iq-server-url # Full URL to your Sonatype Lifecycle Server
    PORT=3000 # The port to run this handler on
    TEAMS_WEBHOOK_URL=https://sonatype.webhook.office.com/webhookb2/... # the URL from step 4 above
   ```
3. Start the handler by running `npm start` - the handler is now listening on http://localhost:3000/

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
