import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: false }));

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
