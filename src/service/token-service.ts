import jwt from "jsonwebtoken";
import tokenModel from "../models/token-model";
import { IUser } from "../models/user-model";
import  UserDTO  from '../dtos/user-dtos';

class TokenService {
  generateTokens(userId: string, email: string ): {
    accessToken: string;
    refreshToken: string;
  } 
  {
    const payload = {userId, email};
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: "30m",
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: "30d",
    });
    return {
      accessToken,
      refreshToken,
    };
  }
  async saveToken(userId: string, refreshToken: string) {
    const tokenData = await tokenModel.findOne({ user: userId });
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return tokenData.save();
    }
    const token = await tokenModel.create({ user: userId, refreshToken });
    return token;
  }

  async removeToken(refreshToken: string) {
    const tokenData = await tokenModel.deleteOne({ refreshToken });
    return tokenData;
  }

  validateAccessToken(token: string): IUser | null {
    try {
      const userData = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET!
      ) as IUser;
      return userData;
    } catch (e) {
      return null;
    }
  }

  validateRefreshToken(token: string): IUser | null {
    try {
      const userData = jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET!
      ) as IUser;
      return userData;
    } catch (e) {
      return null;
    }
  }

  async findToken(refreshToken: string) {
    const tokenData = await tokenModel.findOne({ refreshToken });
    return tokenData;
  }
}

export default new TokenService();
