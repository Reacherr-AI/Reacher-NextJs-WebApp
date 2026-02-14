export interface BedrockJobMonitorWebhookRequestBody {
  jobId: string;
  status: string;
}

export type BedrockJobMonitorWebhookResponse = void;
