import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCurrencyTypeDto {
  @ApiProperty({ example: 'BLOCK', description: 'status name' })
  @IsNotEmpty()
  @IsString()
  name: string;
  @ApiProperty({ example: 'About Status', description: 'status description' })
  @IsNotEmpty()
  @IsString()
  description: string;
}
