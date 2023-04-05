import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString } from 'class-validator';

export class UpdateOrderDto {
  @ApiProperty({ example: 'Sobirov Komil', description: 'Client full name' })
  @IsOptional()
  @IsString()
  full_name: string;
  @ApiProperty({
    example: '+998 99 919 19 19',
    description: 'Client phone number',
  })
  @IsOptional()
  @IsString()
  phone_number: string;
  @ApiProperty({ example: 'https://tg.org.....', description: 'product link' })
  @IsOptional()
  @IsString()
  product_link: string;
  @ApiProperty({ example: '120 000', description: 'Product summa' })
  @IsOptional()
  @IsNumber()
  summa: number;
  @ApiProperty({ example: '120 000', description: 'Product summa' })
  @IsOptional()
  @IsNumber()
  advance_payment: number;
}
