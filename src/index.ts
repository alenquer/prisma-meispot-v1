import express from "express";
import authController from "./controllers/auth";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/auth", authController);

app.listen(process.env.PORT || 5000, function () {
  console.log("now listening for requests");
});
