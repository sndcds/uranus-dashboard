export class ApiError extends Error {
  status: number
  error: string

  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.error = message
  }
}
