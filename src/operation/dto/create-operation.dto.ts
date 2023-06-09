import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOperationDto {
  @ApiProperty({ example: 1, description: 'Order id' })
  @IsNotEmpty()
  @IsNumber()
  order_id: number;
  @ApiProperty({ example: 1, description: 'status id' })
  @IsNotEmpty()
  @IsNumber()
  status_id: number;
  @ApiProperty({ example: 2, description: 'Admin id' })
  @IsOptional()
  @IsNumber()
  admin_id: number;
  @ApiProperty({
    example: 'about update',
    description: 'Operation description',
  })
  @IsNotEmpty()
  @IsString()
  description: string;
  
}
