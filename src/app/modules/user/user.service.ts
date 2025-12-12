import { Prisma, User, UserStatus, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../../utils/prisma";
import config from "../../../config";
import AppError from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";
import { deleteImageFromCloudinary } from "../../../config/cloudinary.config";
import { paginationHelper } from "../../helpers/paginationHelper";
import { userSearchableFields } from "./user.constant";

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


const getAllUsers = async (query: Record<string, any>) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(query);

  const { searchTerm, sortBy: _sb, sortOrder: _so, ...filterData} = query;

  const andConditions: any[] = [];

  // search
  if (searchTerm) {
    andConditions.push({
      OR: userSearchableFields.map((field) => ({
        [field]: { contains: searchTerm, mode: "insensitive" },
      })),
    });
  }

  // filters
  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: { equals: filterData[key] },
    }));

    andConditions.push(...filterConditions);
  }

  const whereConditions =
    andConditions.length > 0 ? { AND: andConditions } : {};

  
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereConditions,
      orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: true,
        phone: true,
        bio: true,
        languages: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),

    prisma.user.count({ where: whereConditions }),
  ]);

  return {
    data: users,
    meta: { total, page, totalPage:Math.ceil(total/limit), limit },
  };
};



// user.service.ts - Should look like this:
const getUserById = async (id: string): Promise<any> => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      profilePic: true,
      bio: true,
      languages: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      guide: {
        select: {
          id: true,
          expertise: true,
          dailyRate: true,
          rating: true,
          totalTours: true,
        },
      },
    },
  });

  return user;
};


const getGuideById = async (guideId: string): Promise<any> => {
  const guide = await prisma.guide.findUnique({
    where: { id: guideId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profilePic: true,
          bio: true,
          languages: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!guide) {
    return null;
  }

  return {
    ...guide.user,
    guide: {
      id: guide.id,
      expertise: guide.expertise,
      dailyRate: guide.dailyRate,
      rating: guide.rating,
      totalTours: guide.totalTours,
      balance: guide.balance,
      createdAt: guide.createdAt,
      updatedAt: guide.updatedAt,
    },
  };
};



const getMe = async (
  userId: string
): Promise<
  | Prisma.UserGetPayload<{
      select: {
        id: true;
        name: true;
        email: true;
        phone: true;
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
      phone: true,
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
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User not found");

    if (data.email) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Email cannot be updated!");
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, Number(config.salt_round));
    }

    const fieldsToUpdate: any = {};
    const allowedFields = ["name", "password", "bio", "languages", "profilePic", "phone"];
    allowedFields.forEach((f) => {
      if (data[f] !== undefined) fieldsToUpdate[f] = data[f];
    });

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: fieldsToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: true,
        bio: true,
        languages: true,
        phone: true,
        role: true,
        status: true,
      },
    });

    let roleData = {};

    
    //GUIDE-specific update
    if (user.role === UserRole.GUIDE) {
      const guideUpdate: any = {};
      if (data.expertise !== undefined) guideUpdate.expertise = data.expertise;
      if (data.dailyRate !== undefined) guideUpdate.dailyRate = data.dailyRate;

      if (Object.keys(guideUpdate).length > 0) {
        const updatedGuide = await tx.guide.update({
          where: { userId },
          data: guideUpdate,
          select: { expertise: true, dailyRate: true, rating: true, totalTours: true },
        });
        roleData = { guide: updatedGuide };
      }
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
  getGuideById
};
