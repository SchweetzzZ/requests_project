import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards, } from "@nestjs/common";
import { SolicitacoesService } from "./solicitacoes.service";
import { CriarSolicitacaoDto, AtualizarSolicitacaoDto, AlterarStatusSolicitacaoDto, FiltroSolicitacaoDto, } from "./dto/solicitacao.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { currentUser } from "../common/decorator/current-user.decorator";
import type { AuthenticatedUser } from "../auth/auth.controller";

@UseGuards(JwtAuthGuard)
@Controller('solicitacoes')
export class SolicitacoesController {
    constructor(private readonly solicitacoesService: SolicitacoesService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CriarSolicitacaoDto, @currentUser() user: AuthenticatedUser,) {
        return this.solicitacoesService.create(dto, user.userId);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Query() filtros: FiltroSolicitacaoDto) {
        return this.solicitacoesService.findAll(filtros);
    }

    @Get('dashboard')
    @HttpCode(HttpStatus.OK)
    async getDashboard() {
        return this.solicitacoesService.getDashboard();
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getById(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.solicitacoesService.getById(id);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: AtualizarSolicitacaoDto, @currentUser() user: AuthenticatedUser,) {
        return this.solicitacoesService.update(id, dto, user.userId);
    }

    @Patch(':id/status')
    @HttpCode(HttpStatus.OK)
    async updateStatus(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: AlterarStatusSolicitacaoDto,) {
        return this.solicitacoesService.updateStatus(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async delete(@Param('id', new ParseUUIDPipe()) id: string, @currentUser() user: AuthenticatedUser,) {
        return this.solicitacoesService.delete(id, user.userId);
    }
}
