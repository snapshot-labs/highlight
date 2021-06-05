import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';

dotenv.config();
import './node';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
