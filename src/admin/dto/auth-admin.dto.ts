import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthBody {
  @ApiProperty({ example: 'MyLogin', description: 'Admin username' })
  @IsNotEmpty()
  @IsString()
  user_name: string;
  @ApiProperty({ example: 'MyPassword', description: 'Admin password' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
