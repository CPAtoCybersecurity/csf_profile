import "./env.js";
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import confluenceRoutes from "./routes/confluence.js";




const app = express();
const PORT = process.env.PORT || 4000;  

app.use(cors());
app.use(bodyParser.json());


app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Express server!' });
});

app.use("/api/confluence", confluenceRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});