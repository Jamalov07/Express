import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateAdminDto {
  @ApiProperty({ example: "Jamalov No'monjon", description: 'Admin full name' })
  @IsOptional()
  @IsString()
  full_name: string;
  @ApiProperty({ example: 'Jamalov07', description: 'Admin user name' })
  @IsOptional()
  @IsString()
  user_name: string;
  @ApiProperty({ example: '******', description: 'Admin hashed password' })
  @IsOptional()
  @IsString()
  hashed_password: string;
  @ApiProperty({
    example: '+998 94 917 41 27',
    description: 'Admin phone number',
  })
  @IsOptional()
  @IsString()
  phone_number: string;
  @ApiProperty({ example: 'JamalovN07@gmail.com', description: 'Admin email' })
  @IsOptional()
  @IsString()
  email: string;
  @ApiProperty({
    example: '@New_Prime_Minister_of_Uzbekistan',
    description: 'telegram username',
  })
  @IsOptional()
  @IsString()
  tg_link: string;
  @ApiProperty({ example: true, description: 'Admin status' })
  @IsOptional()
  @IsBoolean()
  is_active: boolean;
  @ApiProperty({ example: 'about me', description: 'descprition' })
  @IsOptional()
  @IsString()
  description: string;
}
