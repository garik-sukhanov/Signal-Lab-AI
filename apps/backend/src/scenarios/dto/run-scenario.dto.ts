import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const scenarioTypes = [
  'success',
  'validation_error',
  'system_error',
  'slow_request',
  'teapot',
] as const;

export type ScenarioType = (typeof scenarioTypes)[number];

export class RunScenarioDto {
  @ApiProperty({
    description: 'Scenario type identifier',
    enum: scenarioTypes,
    example: 'success',
  })
  @IsIn(scenarioTypes)
  @IsString()
  type!: ScenarioType;

  @ApiPropertyOptional({
    description: 'Optional scenario run title',
    example: 'Morning smoke run',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;
}
