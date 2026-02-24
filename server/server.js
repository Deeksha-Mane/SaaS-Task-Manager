import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();

//Middleware
app.use(express.json());
app.use(cors());

//Test Route
app.route('/', (req, res) => {
    res.send('API is running successfully...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 