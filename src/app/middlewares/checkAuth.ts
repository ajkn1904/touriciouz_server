import { NextFunction, Request, Response } from "express";
import AppError from "../errors/AppError";
import { StatusCodes } from "http-status-codes";
import { verifyToken } from "../utils/jwt";
import { prisma } from "../utils/prisma";
import { JwtPayload } from "jsonwebtoken";
import config from "../../config";


export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let accessToken = req.headers.authorization || req.cookies.accessToken;

      if (!accessToken) {
        throw new AppError(StatusCodes.FORBIDDEN, "No token received");
      }

      if (accessToken.startsWith("Bearer ")) {
        accessToken = accessToken.split(" ")[1];
      }

      const verifiedToken = verifyToken(
        accessToken,
        config.jwt.jwt_secret as string
      ) as JwtPayload;

      const isUserExists = await prisma.user.findUnique({
        where: { email: verifiedToken.email },
      });

      if (!isUserExists) {
        throw new AppError(StatusCodes.BAD_REQUEST, "User does not exist!");
      }

      if (!authRoles.includes(verifiedToken.role)) {
        throw new AppError(
          StatusCodes.FORBIDDEN,
          "You do not have permission to access this route!"
        );
      }

      req.user = verifiedToken;
      next();
    } catch (error) {
      next(error);
    }
  };

