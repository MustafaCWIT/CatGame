declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
  env: { get: (key: string) => string | undefined };
};

declare module "@aws-sdk/client-s3" {
  export class S3Client {
    constructor(config?: Record<string, unknown>);
  }
  export class PutObjectCommand {
    constructor(params?: Record<string, unknown>);
  }
}

declare module "@aws-sdk/s3-request-presigner" {
  export function getSignedUrl(
    client: unknown,
    command: unknown,
    options?: { expiresIn?: number }
  ): Promise<string>;
}
