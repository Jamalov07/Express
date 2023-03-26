import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 'a10321', description: 'Order unique id' })
  @IsNotEmpty()
  @IsString()
  order_unique_id: string;
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
  @ApiProperty({ example: 1, description: 'Currency type id' })
  @IsNotEmpty()
  @IsNumber()
  currency_type_id: number;
  @ApiProperty({ example: '10a103aa', description: 'Truck symbol' })
  @IsOptional()
  @IsString()
  truck: string;
  @ApiProperty({
    example: 'about order',
    description: 'Order description',
  })
  @IsNotEmpty()
  @IsString()
  description: string;
}
