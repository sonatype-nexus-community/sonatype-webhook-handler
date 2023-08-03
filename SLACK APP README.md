# Sonatype Slack Apps Integration

Steps for configuring a node.js service to forward Nexus Lifecycle Webhook notifications to a Slack App.

*Copyright Sonatype Inc. 2022*

Contributors:
- Alexander Plattel: aplattel@sonatype.com
- Maury Cupitt: mcupitt@sonatype.com


Sonatype WebHook Documentation: https://help.sonatype.com/iqserver/automating/iq-server-webhooks
    

## Project Prep
### Create the Slack App
On Slack we need to create an app to listen for our Webhooks from IQ:
1. Go to the link to create the app: https://api.slack.com/apps?new_app=1
2. Name the app "Nexus IQ" and select the workspace where we want this to operate
3. Click "Add features and functionality"
4. Toggle "On" the Activate Incoming Webhooks then click "Add New Webhook to Workspace"
5. We can then select the channel or contact we want to forward the Webhook messages to
6. We can then copy the new Webhook URL and paste that into the environment variables
7. You can also update the display information at the bottom of the *Basic Information* page (The logo icon is in attached in this directory)


### Create the Sonatype Nexus IQ Server Webhook
1. Sign in to IQ Server with appropriate permissions
2. Click the settings button (gear icon) in the top right of the screen
3. Click the "+ Add a Webhook" button
    - This node.js service we are creating will default run on *http://localhost:3000/* which is what you can use as the URL
    - You can ignore the optional fields for now 
    - check the boxes for Application Evaluation and Violation Alert
    - Click the "Create" button



## Run the project
If everything has been set up correctly, we will be able to run the service and watch notifications come through.

Configure the .env file to include:
```
- SLACK_URL=https://hooks.slack.com/services/...
- PORT=3000
- IQ_URL=http://localhost:8070/
```

In the terminal for this directory, run the service by typing:
```
- npm install
- npm start
```


All Done!


You can go to *http://localhost:3000/test* to trigger a test Slack message

Then you should scan an app with Lifecycle and watch the notifications go!




## The Fine Print

Remember:

It is worth noting that this is **NOT SUPPORTED** by Sonatype, and is a contribution of ours to the open source
community (read: you!)

* Use this contribution at the risk tolerance that you have
* Do NOT file Sonatype support tickets related to `ossindex-lib`
* DO file issues here on GitHub, so that the community can pitch in

Phew, that was easier than I thought. Last but not least of all - have fun!
