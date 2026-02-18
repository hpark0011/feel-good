export type CreateConversationRequest = {
  persona_id: string;
  replica_id?: string;
  conversation_name?: string;
  conversational_context?: string;
  custom_greeting?: string;
  properties?: {
    max_call_duration?: number;
    enable_recording?: boolean;
  };
};

export type CreateConversationResponse = {
  conversation_id: string;
  conversation_url: string;
  status: string;
};

export type TavusErrorBody = {
  message?: string;
  error?: string;
  detail?: string;
};
