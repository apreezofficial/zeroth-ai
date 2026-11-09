// Minimal typings for the native modules this package loads at runtime. They are peer
// dependencies of the app, so they are not installed when this package is built.
declare module "llama.rn" {
  export interface TokenData {
    token: string;
  }
  export interface ToolCall {
    id?: string;
    type?: string;
    function: { name: string; arguments: string };
  }
  export interface CompletionResult {
    text: string;
    tool_calls?: ToolCall[];
  }
  export interface LlamaContext {
    completion(params: Record<string, unknown>, callback?: (data: TokenData) => void): Promise<CompletionResult>;
    stopCompletion(): Promise<void>;
    release(): Promise<void>;
  }
  export function initLlama(params: Record<string, unknown>, onProgress?: (progress: number) => void): Promise<LlamaContext>;
}

declare module "react-native-fs" {
  export const CachesDirectoryPath: string;
  export const DocumentDirectoryPath: string;
  export function exists(path: string): Promise<boolean>;
  export function mkdir(path: string): Promise<void>;
  export function stat(path: string): Promise<{ size: number | string }>;
  export function hash(path: string, algorithm: string): Promise<string>;
  export function moveFile(from: string, to: string): Promise<void>;
  export function writeFile(path: string, contents: string, encoding?: string): Promise<void>;
  export function unlink(path: string): Promise<void>;
  export function stopDownload(jobId: number): void;
  export function downloadFile(options: {
    fromUrl: string;
    toFile: string;
    progressInterval?: number;
    progressDivider?: number;
    progress?: (res: { bytesWritten: number; contentLength: number }) => void;
  }): { jobId: number; promise: Promise<{ statusCode: number; bytesWritten: number }> };
}
