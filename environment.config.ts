// config/environment.config.ts
import * as dotenv from 'dotenv';
import path from 'path';

export type Environment = 'staging' | 'uat' | 'production';

export class EnvironmentConfig {
  private static instance: EnvironmentConfig;
  private currentEnv: Environment;

  private constructor() {
    this.currentEnv = (process.env.ENV as Environment) || 'staging';
    const envFile = `.env.${this.currentEnv}`;
    
    dotenv.config({
      path: path.resolve(process.cwd(), envFile)
    });
  }

  static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }

  getCredentials() {
    return {
      username: process.env.TEST_USERNAME || '',
      password: process.env.TEST_PASSWORD || '',
      baseUrl: process.env.BASE_URL || ''
    };
  }

  getEnvironment(): Environment {
    return this.currentEnv;
  }
}
