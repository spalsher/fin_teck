declare module 'mssql' {
  export interface IResult<T = unknown> {
    recordset: T[];
  }
  export interface ConnectionPool {
    request(): Request;
    close(): Promise<void>;
  }
  export interface Request {
    query(command: string): Promise<IResult>;
  }
  export function connect(connectionString: string): Promise<ConnectionPool>;
}
