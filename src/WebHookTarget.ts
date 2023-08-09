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

import axios from "axios";

export class WebhookTarget {
    /**
     * The bound incoming webhook URL.
     */
    public readonly webhook: URL;
  
    /**
     * Constructor.
     * 
     * @param webhook - the incoming webhook URL.
     */
    constructor(webhook: URL) {
      this.webhook = webhook;
    }
  
    /**
     * Send a plain text message.
     *
     * @param text - the plain text message.
     * @returns A `Promise` representing the asynchronous operation.
     */
    public sendMessage(data): Promise<void> {
      return axios.post(
        this.webhook.toString(), data,
        {
          headers: { "content-type": "application/json" },
        }
      )
    }
  
    /**
     * Send an adaptive card message.
     *
     * @param card - the adaptive card raw JSON.
     * @returns A `Promise` representing the asynchronous operation.
     */
    public sendAdaptiveCard(card: unknown): Promise<void> {
      return axios.post(
        this.webhook.toString(),
        {
          type: "message",
          attachments: [
            {
              contentType: "application/vnd.microsoft.card.adaptive",
              contentUrl: null,
              content: card,
            },
          ],
        },
        {
          headers: { "content-type": "application/json" },
        }
      );
    }
}