const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const basePath = path.join(__dirname, 'files');

const studentData = {
  rollNumber: '12345'
};

const studentFolderPath = path.join(basePath, studentData.rollNumber);
fs.ensureDirSync(studentFolderPath);

const getFileStructure = (dirPath) => {
  const files = fs.readdirSync(dirPath);
  return files.map(file => {
    const filePath = path.join(dirPath, file);
    const isDirectory = fs.lstatSync(filePath).isDirectory();
    return {
      name: file,
      path: filePath.replace(basePath, ''),
      type: isDirectory ? 'folder' : 'file',
      children: isDirectory ? getFileStructure(filePath) : [],
    };
  });
};

app.get('/api/structure', (req, res) => {
  res.json(getFileStructure(basePath));
});

app.get('/api/file', (req, res) => {
  const filePath = path.join(basePath, req.query.path);
  const content = fs.readFileSync(filePath, 'utf8');
  res.send(content);
});

app.post('/api/file', (req, res) => {
  const { path: filePath, content } = req.body;
  const fullPath = path.join(basePath, filePath);
  fs.writeFileSync(fullPath, content);
  res.send('File saved');
});

app.post('/api/create-folder', (req, res) => {
  const { path: folderPath } = req.body;
  const dirPath = path.join(basePath, folderPath);
  fs.ensureDirSync(dirPath);
  res.send('Folder created');
});

app.post('/api/create-file', (req, res) => {
  const { path: filePath } = req.body;
  const fullPath = path.join(basePath, filePath);
  fs.writeFileSync(fullPath, '');
  res.send('File created');
});

app.post('/api/delete-item', (req, res) => {
    const { path: itemPath } = req.body;
    const fullPath = path.join(basePath, itemPath);
    try {
      fs.removeSync(fullPath);
      res.send('Item deleted');
    } catch (error) {
      res.status(500).send('Error deleting item');
    }
  });
  
app.post('/api/student-login', (req, res) => {
  const { rollNumber } = req.body;
  const studentFolderPath = path.join(basePath, rollNumber);
  fs.ensureDirSync(studentFolderPath);
  res.json({ message: `Folder created for roll number: ${rollNumber}` });
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});