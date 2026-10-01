import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards, } from "@nestjs/common";
import { ApiCookieAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SolicitacoesService } from "./solicitacoes.service";
import {
    CriarSolicitacaoDto,
    AtualizarSolicitacaoDto,
    AlterarStatusSolicitacaoDto,
    FiltroSolicitacaoDto,
    SolicitacaoResponseDto,
    ListagemSolicitacoesResponseDto,
    DashboardResponseDto,
    ExcluirSolicitacaoResponseDto,
} from "./dto/solicitacao.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { currentUser } from "../common/decorator/current-user.decorator";
import type { AuthenticatedUser } from "../auth/auth.controller";

@ApiTags('Solicitações')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('solicitacoes')
export class SolicitacoesController {
    constructor(private readonly solicitacoesService: SolicitacoesService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Criar uma nova solicitação' })
    @ApiCreatedResponse({ type: SolicitacaoResponseDto })
    async create(@Body() dto: CriarSolicitacaoDto, @currentUser() user: AuthenticatedUser,) {
        return this.solicitacoesService.create(dto, user.userId);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Listar solicitações com paginação e filtros' })
    @ApiOkResponse({ type: ListagemSolicitacoesResponseDto })
    async findAll(@Query() filtros: FiltroSolicitacaoDto) {
        return this.solicitacoesService.findAll(filtros);
    }

    @Get('dashboard')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Obter métricas e estatísticas do dashboard' })
    @ApiOkResponse({ type: DashboardResponseDto })
    async getDashboard() {
        return this.solicitacoesService.getDashboard();
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Obter detalhes de uma solicitação por ID' })
    @ApiOkResponse({ type: SolicitacaoResponseDto })
    async getById(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.solicitacoesService.getById(id);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Atualizar dados de uma solicitação' })
    @ApiOkResponse({ type: SolicitacaoResponseDto })
    async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: AtualizarSolicitacaoDto, @currentUser() user: AuthenticatedUser,) {
        return this.solicitacoesService.update(id, dto, user.userId);
    }

    @Patch(':id/status')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Atualizar status de uma solicitação' })
    @ApiOkResponse({ type: SolicitacaoResponseDto })
    async updateStatus(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: AlterarStatusSolicitacaoDto,) {
        return this.solicitacoesService.updateStatus(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Excluir uma solicitação' })
    @ApiOkResponse({ type: ExcluirSolicitacaoResponseDto })
    async delete(@Param('id', new ParseUUIDPipe()) id: string, @currentUser() user: AuthenticatedUser,) {
        return this.solicitacoesService.delete(id, user.userId);
    }
}
