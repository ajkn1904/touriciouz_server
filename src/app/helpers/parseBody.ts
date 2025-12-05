import { Request } from "express";

export const parseBody = (req: Request) =>
  typeof req.body.data === "string" ? JSON.parse(req.body.data) : req.body;
