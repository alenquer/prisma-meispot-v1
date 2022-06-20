import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { prismaClient } from "../database";

const authController = express.Router();

function _token(params = {}) {
  return jwt.sign(params, process.env.SECRET, {
    expiresIn: 86400,
  });
}

authController.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).send({ error: "data error" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await prismaClient.user.create({
      data: {
        id: uuidv4(),
        email,
        password: hash,
        username,
        groups: {
          create: {
            id: uuidv4(),
            name: "default",
          },
        },
      },
      include: {
        groups: true,
      },
    });

    function sanitizeUser() {
      const { password, ...rest } = user as User;
      return rest;
    }

    return res.send({ user: sanitizeUser(), token: _token({ id: user.id }) });
  } catch (e) {
    return res.status(400).send({ error: "Create account error" });
  }
});

authController.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({ error: "data error" });
    }

    const user = await prismaClient.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive", // Default value: default
        },
      },
      include: {
        groups: true,
      },
    });

    if (!user) return res.status(400).send({ error: "User not found" });

    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword)
      return res.status(403).send({ error: "Invalid password" });

    function sanitizeUser() {
      const { password, ...rest } = user as User;
      return rest;
    }

    return res
      .status(200)
      .send({ user: { ...sanitizeUser() }, token: _token({ id: user.id }) });
  } catch (e) {
    return res.status(400).send({ error: "Login error" });
  }
});

export default authController;
