export class ExpressSwaggerAutogenValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExpressSwaggerAutogenValidationError";
  }
}
