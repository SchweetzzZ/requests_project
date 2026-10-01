import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './modules/db/db.module';
import { AuthModule } from './modules/auth/auth.module';
import { SolicitacoesModule } from './modules/solicitacoes/solicitacoes.module';

@Module({
  imports: [DbModule, AuthModule, SolicitacoesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
