import { IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RunScenarioDto {
  @ApiProperty({
    description: 'Scenario type identifier',
    example: 'observability_demo',
  })
  @IsString()
  type!: string;

  @ApiPropertyOptional({
    description: 'Arbitrary payload passed to the runner',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}
