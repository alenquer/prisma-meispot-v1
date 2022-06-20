declare namespace NodeJS {
  export interface ProcessEnv {
    DB_CONNECTION: string;
    NODE_ENV: "development" | "production";
    PORT?: string;
    SECRET: string;
  }
}
