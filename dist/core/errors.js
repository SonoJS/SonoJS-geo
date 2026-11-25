export class GeoLoadError extends Error {
    path;
    cause;
    constructor(path, message, cause) {
        super(message);
        this.name = "GeoLoadError";
        this.path = path;
        this.cause = cause;
    }
}
//# sourceMappingURL=errors.js.map