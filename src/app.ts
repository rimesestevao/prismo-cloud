import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      mongodb: 'not connected',
      postgresql: 'not connected',
    },
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
