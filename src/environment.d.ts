declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SAVE_DIR: string;
      CLIENT_ID: string;
      REDIRECT_URI: string;
      ACCESS_TOKEN: string;
    }
  }
}

export {};
