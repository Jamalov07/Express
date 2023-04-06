import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  full_name?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  order_unique_id?: string;

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional()
  start_date?: Date;

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional()
  end_date?: Date;
}
