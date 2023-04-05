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
 }
