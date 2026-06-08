import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserResponseDto } from './dto/create-user-response.dto';
import { CreateUserDto } from './dto/create-user.dto';

// Tempo de processamento necessário para gerar uma Hash, fazendo que os ataques de força bruta sejam extremamentes lentos
const SALT_ROUNDS = 10;


@Injectable()
export class UsersService {

  constructor( private readonly prisma : PrismaService) {}

    private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }


  async create(createUserDto: CreateUserDto) : Promise<CreateUserResponseDto> {
   const userExisting = await this.prisma.user.findFirst({
      where : {
       OR : [
        { email : createUserDto.email },
        { nickName : createUserDto.nickName }
       ]
      },
      select : {
        id : true,
      }
   });

   if(userExisting){
    throw new Error('Usuário com esse email ou nickname já existe');
   }

   const hashedPassword = this.hashPassword(createUserDto.password);
   const createUser = await this.prisma.user.create({
    data : {
      name : createUserDto.name,
      nickName : createUserDto.nickName,
      email : createUserDto.email,
      password : await hashedPassword,
      birthDate : new Date(createUserDto.birthDate)
    },
    select : {
      id : true,
      name : true,
      nickName : true,
      email : true
    }
   });

    return createUser;
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
