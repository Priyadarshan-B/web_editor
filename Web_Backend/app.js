const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Ensure user_data directory exists
const userDataPath = path.join(__dirname, 'user_data');
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath);
}

app.post('/create-folder', (req, res) => {
  const folderName = req.body.folderName;
  const folderPath = path.join(userDataPath, folderName);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
    res.status(200).send('Folder created successfully');
  } else {
    res.status(400).send('Folder already exists');
  }
});

app.post('/save-file', (req, res) => {
  const { folderName, fileName, content } = req.body;
  const folderPath = path.join(userDataPath, folderName);
  if (fs.existsSync(folderPath)) {
    const filePath = path.join(folderPath, fileName);
    fs.writeFileSync(filePath, content, 'utf8');
    res.status(200).send('File saved successfully');
  } else {
    res.status(404).send('Folder not found');
  }
});

app.get('/get-folder-contents/:folderName', (req, res) => {
  const folderName = req.params.folderName;
  const folderPath = path.join(userDataPath, folderName);
  if (fs.existsSync(folderPath)) {
    const files = fs.readdirSync(folderPath).map(fileName => ({
      fileName,
      content: fs.readFileSync(path.join(folderPath, fileName), 'utf8')
    }));
    res.status(200).json(files);
  } else {
    res.status(404).send('Folder not found');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
