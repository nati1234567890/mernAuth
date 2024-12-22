import mongoose from "mongoose";

export const connectdb = () => {
  mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => console.log("connected"))
    .catch(() => console.log("error connecting"));
};
