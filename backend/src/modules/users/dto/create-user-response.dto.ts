import {
    IsEmail,
    IsString
} from 'class-validator';

export class CreateUserResponseDto {

    @IsString()
    id: string;

    @IsString()
    name: string;

    @IsString()
    nickName: string;

    @IsEmail()
    email: string;
}