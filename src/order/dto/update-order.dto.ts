import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString } from 'class-validator';

export class UpdateOrderDto {
  @ApiProperty({ example: 'a10321', description: 'Order unique id' })
  @IsOptional()
  @IsString()
  order_unique_id: string;
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
  @ApiProperty({ example: 1, description: 'Currency type id' })
  @IsOptional()
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
  @IsOptional()
  @IsString()
  description: string;
}
