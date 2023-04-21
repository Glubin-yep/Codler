import { Request } from 'express';
import User from '../models/user-model';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
//import mailService from './mail-service';
import tokenService from '../service/token-service';
import  UserDTO  from '../dtos/user-dtos';
import ApiError from '../exceptions/api-error';

class UserService {
  async registration(email: string, password: string): Promise<{ user: UserDTO, accessToken: string, refreshToken: string }> {
    const candidate = await User.findOne({ email });

    if (candidate) {
      throw ApiError.BadRequest(`Користувач з електроною почтою ${email} вже існує`);
    }

    const hashPassword = await bcrypt.hash(password, 3);
    const activationLink = uuidv4();

    const user = await User.create({ email, password: hashPassword, activationLink });
    //await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

    const userDto = new UserDTO(user);
    console.log(userDto)
    const { accessToken, refreshToken } = await tokenService.generateTokens(userDto.userId, userDto.email);

    await tokenService.saveToken(userDto.userId, refreshToken);

    return {
      user: userDto,
      accessToken,
      refreshToken
    };
  }

  async activate(activationLink: string): Promise<void> {
    const user = await User.findOne({ activationLink });

    if (!user) {
      throw ApiError.BadRequest('Некоректна силка активації');
    }

    user.isActivated = true;
    await user.save();
  }

  async login(email: string, password: string): Promise<{ user: UserDTO, accessToken: string, refreshToken: string }> {
    const user = await User.findOne({ email });

    if (!user) {
      throw ApiError.BadRequest('Користувача з таким email не існує');
    }

    const isPassEquals = await bcrypt.compare(password, user.password);

    if (!isPassEquals) {
      throw ApiError.BadRequest('Невірний пароль');
    }

    const userDto = new UserDTO(user);
    const { accessToken, refreshToken } = await tokenService.generateTokens(userDto.userId, userDto.email);

    await tokenService.saveToken(userDto.userId, refreshToken);

    return {
      user: userDto,
      accessToken,
      refreshToken
    };
  }

  async logout(refreshToken: string) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }
  

  async refresh(refreshToken: string): Promise<{ user: UserDTO, accessToken: string, refreshToken: string }> {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }

    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDB = await tokenService.findToken(refreshToken);

    if (!userData || !tokenFromDB) {
      throw ApiError.UnauthorizedError();
    }

    const user = await User.findById(userData.id);

    if(user === null){
        throw ApiError.BadRequest(`User not found`);
    }

    const userDto = new UserDTO(user);
    const { accessToken, refreshToken: newRefreshToken } = await tokenService.generateTokens(userDto.userId, userDto.email);

    await tokenService.saveToken(userDto.userId, newRefreshToken);

    return {
      user: userDto,
      accessToken,
      refreshToken: newRefreshToken
    };
  }

}

export default new UserService
