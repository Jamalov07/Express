import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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

}
