// add express server code and start the server
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import llmRoutes from './routes/llmRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
    // tslint:disable-next-line:no-console
    console.log('Server is running', req);
    res.send('Server is running');
});


// Routes middleware
app.use('/api/llm', llmRoutes);


// Start server
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`Server is running on port ${port}`);
});
