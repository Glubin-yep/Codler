import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import router from './router/router';
//import errorMiddleware from './middlewares/error-middleware';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cors({
  credentials: true,
  origin: process.env.CLIENT_URL
}));
app.use('/api', router);
//app.use(errorMiddleware);

const start = async() => {
  try{
    await mongoose.connect(process.env.DB_URL!);
    app.listen(PORT, () => console.log(`Server started on PORT = ${PORT}`));
  }
  catch(e){
    console.log(e);
  }
};

start();
