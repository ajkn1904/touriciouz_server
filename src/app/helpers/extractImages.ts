import { Request } from "express";


export const extractImages = (req: Request) => {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    return { thumbnailImage: undefined, images: [] };
  }

  return {
    thumbnailImage: files[0].path,
    images: files.slice(1).map((f) => f.path),
  };
};
