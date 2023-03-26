import { IsDateString, IsOptional, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOperationDto {
  @ApiProperty({ example: 1, description: 'Order id' })
  @IsOptional()
  @IsNumber()
  order_id: number;
  @ApiProperty({ example: 1, description: 'status id' })
  @IsOptional()
  @IsNumber()
  status_id: number;
  @ApiProperty({ example: '12-12-2012', description: 'Order updated date' })
  @IsOptional()
  @IsDateString()
  operation_date: Date;
  @ApiProperty({ example: 2, description: 'Admin id' })
  @IsOptional()
  @IsNumber()
  admin_id: number;
  @ApiProperty({
    example: 'about update',
    description: 'Operation description',
  })
  @IsOptional()
  @IsString()
  description: string;
  @ApiProperty({ example: '10a103aa', description: 'Truck symbol' })
  @IsOptional()
  @IsString()
  truck: string;
}
