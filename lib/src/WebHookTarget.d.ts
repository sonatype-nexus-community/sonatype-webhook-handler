export declare class WebhookTarget {
    /**
     * The bound incoming webhook URL.
     */
    readonly webhook: URL;
    /**
     * Constructor.
     *
     * @param webhook - the incoming webhook URL.
     */
    constructor(webhook: URL);
    /**
     * Send a plain text message.
     *
     * @param text - the plain text message.
     * @returns A `Promise` representing the asynchronous operation.
     */
    sendMessage(text: string): Promise<void>;
    /**
     * Send an adaptive card message.
     *
     * @param card - the adaptive card raw JSON.
     * @returns A `Promise` representing the asynchronous operation.
     */
    sendAdaptiveCard(card: unknown): Promise<void>;
}
