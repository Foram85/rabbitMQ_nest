import { Body, Controller, Post, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUser } from './dtos/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { User } from './schemas/user.schema';
import { Request } from 'express';
import { CreateUser } from './dtos/create-user.dto';

export interface RequestWithUser extends Request {
  user: User;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Get('me')
  getMe(@Req() req: RequestWithUser): Promise<User> {
    return Promise.resolve(req.user);
  }

  @Post('register')
  @ApiBody({ type: CreateUser })
  async register(@Body() dto: CreateUser) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiBody({ type: LoginUser })
  async login(@Body() dto: LoginUser) {
    return this.authService.login(dto);
  }
}