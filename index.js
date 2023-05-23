import express from 'express';
import Connection from './database/db.js'
const app = express();
const port = 8000;
import dotenv from 'dotenv'
import Router from './routes/route.js'

dotenv.config()

app.use('/',Router)

app.listen(port , ()=>{
    console.log(`Server listening on port: ${port}`);
});

Connection();