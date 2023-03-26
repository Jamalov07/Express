import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({ example: "Jamalov No'monjon", description: 'Admin full name' })
  @IsNotEmpty()
  @IsString()
  full_name: string;
  @ApiProperty({ example: 'Jamalov07', description: 'Admin user name' })
  @IsNotEmpty()
  @IsString()
  user_name: string;
  @ApiProperty({ example: '******', description: 'Admin hashed password' })
  @IsNotEmpty()
  @IsString()
  hashed_password: string;
  @ApiProperty({
    example: '+998 94 917 41 27',
    description: 'Admin phone number',
  })
  @IsNotEmpty()
  @IsString()
  phone_number: string;
  @ApiProperty({ example: 'JamalovN07@gmail.com', description: 'Admin email' })
  @IsNotEmpty()
  @IsString()
  email: string;
  @ApiProperty({
    example: '@New_Prime_Minister_of_Uzbekistan',
    description: 'telegram username',
  })
  @IsNotEmpty()
  @IsString()
  tg_link: string;
  @ApiProperty({ example: 'about me', description: 'descprition' })
  @IsNotEmpty()
  @IsString()
  description: string;
}
