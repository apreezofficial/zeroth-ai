export type ZerothErrorCode =
  | "ENGINE_UNAVAILABLE"
  | "NOT_LOADED"
  | "INVALID_JSON"
  | "SCHEMA_MISMATCH"
  | "ABORTED"
  | "MODEL_UNAVAILABLE"
  | "INSUFFICIENT_MEMORY"
  | "DOWNLOAD_FAILED"
  | "CHECKSUM_MISMATCH";

export class ZerothError extends Error {
  readonly code: ZerothErrorCode;

  constructor(code: ZerothErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "ZerothError";
    this.code = code;
  }
}
