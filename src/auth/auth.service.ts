import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from "bcrypt";
import { LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ){}

  async create(createUserDto: CreateUserDto) {
    try {

      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });

      await this.userRepository.save(user);
      delete user.password;

      // TODO: Retornar el JWT de acceso
      return {
        ...user, 
        token: this.getJwtToken({id: user.id})
      };

    } catch (error) {
      this.handleDBError(error);
    }
  }

  async login(loginUserDto: LoginUserDto){
    
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true } // Para que me seleccione y me retorne esos campos
    });

    if(!user) throw new UnauthorizedException(`Credentials are not valit (email)`);

    if(!bcrypt.compareSync(password, user.password)) throw new UnauthorizedException(`Credentials are not valit (password)`);

    // TODO: Retornar el JWT de acceso
    return {
      ...user, 
      token: this.getJwtToken({id: user.id})
    };
  }

  async checkAuthStatus(user: User){

    return {
      ...user,
      token: this.getJwtToken({id: user.id}),
    };
    
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleDBError(error: any): never{
    if(error.code === '23505'){
      throw new BadRequestException(error.detail);
    }
    console.log(error);
    throw new InternalServerErrorException('Please check server logs')
  }

}
