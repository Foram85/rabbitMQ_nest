import { Inject, Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { CreateUser } from './dtos/create-user.dto';
import { LoginUser } from './dtos/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject('EMAIL_SERVICE') private emailClient: ClientProxy,
    private jwtService: JwtService,
  ) {}

  async findByEmail(email: string) {
    return this.userModel.findOne({email});
  }

  async register(dto: CreateUser): Promise<User> {
    const existingUser = await this.userModel.findOne({ email: dto.email }).exec();
    if (existingUser) throw new ConflictException('User already exists');
    const user = new this.userModel({ ...dto, password: await bcrypt.hash(dto.password, 10) });
    await user.save();
    const token = this.jwtService.sign({ sub: user._id, email: user.email });
    this.emailClient.emit('user_registered', { email: dto.email, name: user.name, token })
    return user;
  }

  async login(dto: LoginUser): Promise<{ token: string }> {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = this.jwtService.sign({ sub: user._id, email: user.email });
    this.emailClient.emit('user_logged_in', { email: dto.email });
    return { token };
  }
}