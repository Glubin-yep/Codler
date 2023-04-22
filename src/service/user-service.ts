import { Request } from 'express';
import User from '../models/user-model';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
//import mailService from './mail-service';
import tokenService from '../service/token-service';
import  UserDTO  from '../dtos/user-dtos';
import ApiError from '../exceptions/api-error';

class UserService {
  async registration(mobilePhone: string, email: string, password: string): Promise<{ user: UserDTO, accessToken: string, refreshToken: string }> {
    const candidate = await User.findOne({ mobilePhone });

    if (candidate) {
      throw ApiError.BadRequest(`A user with the following mobile number ${mobilePhone} already exists`);
    }

    const hashPassword = await bcrypt.hash(password, 3);
    const activationLink = uuidv4();

    const user = await User.create({mobilePhone, email, password: hashPassword, activationLink });
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
      throw ApiError.BadRequest('Incorrect activation link');
    }

    user.isActivated = true;
    await user.save();
  }

  async login(mobilePhone: string, password: string): Promise<{ user: UserDTO, accessToken: string, refreshToken: string }> {
    const user = await User.findOne({ mobilePhone });

    if (!user) {
      throw ApiError.BadRequest('User with this mobile number does not exist');
    }

    const isPassEquals = await bcrypt.compare(password, user.password);

    if (!isPassEquals) {
      throw ApiError.BadRequest('Invalid password');
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
