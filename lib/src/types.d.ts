interface IqApplication {
    id: string;
    publicId: string;
    name: string;
    organizationId: string;
}
interface IqApplicationEvaluation {
    application: IqApplication;
    policyEvaluationId: string;
    stage: string;
    ownerId: string;
    evaluationDate: string;
    affectedComponentCount: number;
    criticalComponentCount: number;
    severeComponentCount: number;
    moderateComponentCount: number;
    outcome: string;
    reportId: string;
}
export interface IqWebhookPayload {
    timestamp: string;
    initiator: string;
    id: string;
    applicationEvaluation: IqApplicationEvaluation;
}
export {};
