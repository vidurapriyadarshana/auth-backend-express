export class ApiResponse {
  public readonly statusCode: number;
  public readonly data: any;
  public readonly message: string;
  public readonly success: boolean;

  constructor(
    statusCode: number,
    data: any,
    message: string = 'Success'
  ) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = true;
  }
}