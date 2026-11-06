import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";

@Controller()
export class AppController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get("health")
  async health(): Promise<{ status: string }> {
    try {
      if (this.connection.readyState !== 1 || !this.connection.db) {
        throw new Error("database disconnected");
      }
      await this.connection.db.admin().ping();
      return { status: "ok" };
    } catch {
      throw new ServiceUnavailableException("database unavailable");
    }
  }
}
