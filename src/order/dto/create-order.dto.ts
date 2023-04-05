import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 'Sobirov Komil', description: 'Client full name' })
  @IsNotEmpty()
  @IsString()
  full_name: string;
  @ApiProperty({
    example: '+998 99 919 19 19',
    description: 'Client phone number',
  })
  @IsNotEmpty()
  @IsString()
  phone_number: string;
  @ApiProperty({ example: 'https://tg.org.....', description: 'product link' })
  @IsNotEmpty()
  @IsString()
  product_link: string;
  @ApiProperty({ example: '120 000', description: 'Product summa' })
  @IsNotEmpty()
  @IsNumber()
  summa: number;
  @ApiProperty({ example: '20 000', description: 'Product summa' })
  @IsNotEmpty()
  @IsNumber()
  advance_payment: number;
 
}
