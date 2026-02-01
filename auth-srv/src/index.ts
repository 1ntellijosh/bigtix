import express from "express";
import { json } from "body-parser";
import { usersRouter } from './routes/users'

const PORT = process.env.PORT || 3000;
const app = express();
app.use(json());

app.use('/api/users', usersRouter);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
