export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message)
    this.name = 'AppError'
    // Maintains proper stack trace in V8
    Error.captureStackTrace(this, this.constructor)
  }
}
