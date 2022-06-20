import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface IToken {
  id: string;
  iat: number;
  exp: number;
}

export default function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).send({ error: "No token provided" });
  }

  const parts = authorization.split(" ");

  const [scheme, token] = parts;

  if (parts.length !== 2) return res.send({ error: "Format error code 1" });

  if (!/^Bearer$/i.test(scheme))
    return res.send({ error: "Format error code 2" });

  try {
    const bypass = jwt.verify(token, process.env.SECRET);

    const { id } = bypass as IToken;

    req.userId = id;

    return next();
  } catch (e) {
    res.sendStatus(401);
  }
}
