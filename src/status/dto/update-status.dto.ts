import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateStatusDto {
  @ApiProperty({ example: 'BLOCK', description: 'status name' })
  @IsOptional()
  @IsString()
  name: string;
  @ApiProperty({ example: 'About Status', description: 'status description' })
  @IsOptional()
  @IsString()
  description: string;
}
