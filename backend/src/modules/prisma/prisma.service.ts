import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../generated/prisma/client';
import "dotenv/config";


@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        // No seu client Prisma gerado, o construtor exige `adapter`.
        // Então criamos um adapter Postgres (@prisma/adapter-pg) com base no POSTGRES_*.
        const databaseUrl = process.env.DATABASE_URL;

        const adapter = new PrismaPg({ connectionString: databaseUrl });

        super({ adapter });
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async onModuleInit(): Promise<void> {
        const maxAttempts = 5;
        const delayMs = 3_000;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                await this.$connect();
                this.logger.log(
                    `Conectado ao banco de dados (tentativa ${attempt}/${maxAttempts})`,
                );
                return;
            } catch (err) {
                const errorObj = err as { message?: string; code?: string };
                const message = errorObj?.message ?? String(err);
                const code = errorObj?.code;

                this.logger.error(
                    `Falha ao conectar ao banco (tentativa ${attempt}/${maxAttempts}). code=${code ?? 'N/A'}; message=${message}`,
                    err instanceof Error ? err.stack : String(err),
                );

                if (attempt === maxAttempts) {
                    throw err;
                }

                await this.sleep(delayMs);
            }
        }
    }

    async onModuleDestroy(): Promise<void> {
        await this.$disconnect();
    }
}