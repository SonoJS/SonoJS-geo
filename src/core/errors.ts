export class GeoLoadError extends Error {
  readonly path: string;
  readonly cause?: unknown;

  constructor(path: string, message: string, cause?: unknown) {
    super(message);
    this.name = "GeoLoadError";
    this.path = path;
    this.cause = cause;
  }
}