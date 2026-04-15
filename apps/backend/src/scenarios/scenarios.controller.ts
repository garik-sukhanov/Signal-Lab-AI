import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RunScenarioDto } from './dto/run-scenario.dto';
import { ScenariosService } from './scenarios.service';

@ApiTags('scenarios')
@Controller('api/scenarios')
export class ScenariosController {
  constructor(private readonly scenariosService: ScenariosService) {}

  @Post('run')
  @ApiOkResponse({
    description: 'Creates a new scenario run record',
  })
  async run(@Body() body: RunScenarioDto) {
    return this.scenariosService.runScenario(body);
  }
}
