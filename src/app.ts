import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import config from './config';
import notFound from './app/middlewares/notFound';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import cookieParser from 'cookie-parser';
import router from './app/routes';



const app: Application = express();


app.use(cors({
    origin: [config.frontend_url as string, 'http://localhost:3000'],
    credentials: true
}));

//parser
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


app.use("/api", router)

app.get('/', (req: Request, res: Response) => {
    res.send({
        message: "Touriciouz Server is running..",
        environment: config.node_env,
        uptime: process.uptime().toFixed(2) + " sec",
        timeStamp: new Date().toISOString()
    })
});

app.use(globalErrorHandler);

app.use(notFound);

export default app;