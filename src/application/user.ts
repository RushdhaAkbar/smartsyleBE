// Backend: src/application/user.ts (new)
import { UserDTO } from '../domain/dto/user';
import NotFoundError from '../domain/errors/not-found-error';
import ValidationError from '../domain/errors/validation-error';
import User from '../infrastructure/schemas/User';
import { Request, Response, NextFunction } from "express";

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = UserDTO.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError("Invalid user data");
    }
    const user = await User.create(result.data);
    res.status(201).json(user);
    return;
  } catch (error) {
    next(error);
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    res.status(200).json(user);
    return;
  } catch (error) {
    next(error);
  }
};

