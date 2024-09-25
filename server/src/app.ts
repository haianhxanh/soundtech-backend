/*-----------Import Essential Packages-----------*/
import logger from "morgan";
import dotenv from "dotenv";
import all_routes from "./routes/all.route";
import { db } from "./database_connection/db_connect";

/*------Importing ExpressJs----------*/
import express from "express";
var cors = require("cors");
const app = express();

var corsOptions = {
  origin: ["https://soundtech.com.au"],
  optionsSuccessStatus: 200,
  methods: "GET, PUT, POST",
};

app.use(cors(corsOptions));
/*--------env setup-----------*/
dotenv.config();
const { PORT } = process.env;

/*----------Middlewares-------------*/
app.use(express.json());
app.use(logger("dev"));
app.use(express.urlencoded({ extended: false }));

app.use("/", all_routes);

/*----Checking Database Connection-------------*/
// db.sync({ alter: true })
//   .then(() => {
//     console.log("Database is connected SUCCESSFULLY");
//   })
//   .catch((error) => {
//     console.error("Unable to connect to the database:", error);
//   });

/*------------PORT SETUP--------------------*/
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
