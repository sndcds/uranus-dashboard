export interface UranusAPIResponse<T> {
    service: string;
    api_version: string;
    response_type: string;
    status: "ok" | "error";
    timestamp: string;
    metadata?: Record<string, any>;
    data?: T;
    error?: string;
}
