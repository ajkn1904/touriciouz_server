import { JwtPayload } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import AppError from "../errors/AppError";
import { generateToken, verifyToken } from "./jwt";
import config from "../../config";
import { prisma } from "./prisma";

interface IUser {
  id: string;
  email: string;
  role: string;
}

export const createUserTokens = (user: Partial<IUser>) => {

  const jwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  const accessToken = generateToken(
    jwtPayload,
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string
  );

  const refreshToken = generateToken(
    jwtPayload,
    config.jwt.refresh_token_secret  as string,
    config.jwt.refresh_token_expires_in  as string
  );

  return { accessToken, refreshToken };
};

export const createNewAccessTokenWithRefreshToken = async (refreshToken: string) => {
  const verifiedRefreshToken = verifyToken(
    refreshToken,
    config.jwt.refresh_token_secret  as string
  ) as JwtPayload;

  const isUserExists = await prisma.user.findUnique({
    where: { email: verifiedRefreshToken.email }
  });

  if (!isUserExists) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User does not exist!");
  }
  if(isUserExists.status === "DELETED"){
        throw new AppError(StatusCodes.BAD_REQUEST, "User is deleted!")
    };


  const jwtPayload = {
    userId: isUserExists.id,
    email: isUserExists.email,
    role: isUserExists.role
  };

  const accessToken = generateToken(
    jwtPayload,
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string
  );

  return accessToken;
};
