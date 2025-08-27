const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(__dirname));

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'music-notes-trainer.html'));
});

app.listen(PORT, () => {
  console.log(`Music Notes Trainer is running on port ${PORT}`);
});