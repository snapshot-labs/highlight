import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';

dotenv.config();
import server from './graphql';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '8mb' }));
app.use(bodyParser.urlencoded({ limit: '8mb', extended: false }));

server.applyMiddleware({ app });

app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));
