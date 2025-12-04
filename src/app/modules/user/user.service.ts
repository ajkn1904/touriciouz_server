import { Prisma, User, UserStatus, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../../utils/prisma";
import config from "../../../config";
import AppError from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";

const createUser = async (payload: Prisma.UserCreateInput): Promise<User> => {
  if (payload.password) {
    payload.password = await bcrypt.hash(
      payload.password as string,
      Number(config.salt_round)
    );
  }

  return await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({ data: payload });

    if(payload.role === "ADMIN"){
        throw new AppError(StatusCodes.FORBIDDEN, "Only valid admin can create admin.")
    }

    switch (payload.role) {
      case UserRole.GUIDE:
        await tx.guide.create({
          data: {
            userId: newUser.id,
            expertise: [], 
            dailyRate: 0,  
          },
        });
        break;

      case UserRole.TOURIST:
      default:
        await tx.tourist.create({
          data: { userId: newUser.id },
        });
        break;
    }

    return newUser;
  });
};


const getAllUsers = async (): Promise<Omit<User, "password">[]> => {

  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      profilePic: true,
      bio: true,
      languages: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};


const getUserById = async (id: string): Promise<Omit<User, "password"> | null> => {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      profilePic: true,
      bio: true,
      languages: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};


const getMe = async (
  userId: string
): Promise<
  | Prisma.UserGetPayload<{
      select: {
        id: true;
        name: true;
        email: true;
        profilePic: true;
        bio: true;
        languages: true;
        role: true;
        status: true;
        createdAt: true;
        updatedAt: true;
        guide: {
          select: {
            expertise: true;
            dailyRate: true;
            rating: true;
            totalTours: true;
          };
        };
      };
    }>
  | null
> => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      profilePic: true,
      bio: true,
      languages: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,

      guide: {
        select: {
          expertise: true,
          dailyRate: true,
          rating: true,
          totalTours: true,
        },
      },
    },
  });
}


const updateMyProfile = async (userId: string, data: any) => {
  return await prisma.$transaction(async (tx) => {

    const user = await tx.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new Error("User not found");

    if (data.email) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Email cannot be updated!"
      );
    }

    if (data.password) {
      data.password = await bcrypt.hash(
        data.password,
        Number(config.salt_round)
      );
    }

    // guide-specific fields
    const { expertise, dailyRate, ...userCoreData } = data;

    // update core data
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: userCoreData,
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: true,
        bio: true,
        languages: true,
        role: true,
        status: true,
      },
    });

    let roleData = {};
    // GUIDE → update guide table + return guide data
    if (user.role === UserRole.GUIDE) {
      const updatedGuide = await tx.guide.update({
        where: { userId },
        data: {
          ...(expertise !== undefined ? { expertise } : {}),
          ...(dailyRate !== undefined ? { dailyRate } : {}),
        },
        select: {
          expertise: true,
          dailyRate: true,
          rating: true,
          totalTours: true,
        },
      });

      roleData = { focus: updatedGuide };
    }

    return {
      ...updatedUser,
      ...roleData,
    };
  });
};




const updateUserRoleOrStatus = async (
  userId: string,
  updates: { status?: UserStatus; role?: UserRole }
): Promise<User> => {
  return await prisma.$transaction(async (tx) => {

    const currentUser = await tx.user.findUnique({ where: { id: userId } });
    if (!currentUser) throw new Error("User not found");

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: updates,
    });

    
    // If role changed, update foreign tables
    if (updates.role && updates.role !== currentUser.role) {
      switch (currentUser.role) {
        case UserRole.ADMIN:
          await tx.admin.deleteMany({ where: { userId } });
          break;
        case UserRole.GUIDE:
          await tx.guide.deleteMany({ where: { userId } });
          break;
        case UserRole.TOURIST:
          await tx.tourist.deleteMany({ where: { userId } });
          break;
      }


      switch (updates.role) {
        case UserRole.ADMIN:
          await tx.admin.create({ data: { userId } });
          break;
        case UserRole.GUIDE:
          await tx.guide.create({ data: { userId, expertise: [], dailyRate: 0 } });
          break;
        case UserRole.TOURIST:
          await tx.tourist.create({ data: { userId } });
          break;
      }
    }

    return updatedUser;
  });
};




export const UserService = {
  createUser,
  getAllUsers,
  getUserById,
  getMe,
  updateUserRoleOrStatus,
  updateMyProfile,
};
