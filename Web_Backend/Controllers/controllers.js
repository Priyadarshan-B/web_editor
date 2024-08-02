const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const winston = require('winston');

// Logger setup
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
    ),
    transports: [
        new winston.transports.Console()
    ]
});

const userDirectory = path.join(__dirname, '..', 'user_data');
const rollNumber = '7376221CS269'; // Ensure this is dynamically fetched based on user authentication

router.post('/create-folder', (req, res) => {
    const { folderName } = req.body;
    const folderPath = path.join(userDirectory, rollNumber, folderName);
    logger.info(`Creating folder at path: ${folderPath}`);

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        logger.info(`Folder created successfully: ${folderPath}`);
        res.status(201).json({ message: 'Folder created successfully' });
    } else {
        logger.warn(`Folder already exists: ${folderPath}`);
        res.status(400).json({ message: 'Folder already exists' });
    }
});

router.post('/save-file', (req, res) => {
    const { folderPath, fileName, content } = req.body;
    const filePath = path.join(userDirectory, rollNumber, folderPath, fileName);
    logger.info(`Saving file to path: ${filePath}`);

    fs.writeFile(filePath, content, (err) => {
        if (err) {
            logger.error(`Error saving file: ${err.message}`);
            res.status(500).json({ message: 'Error saving file' });
        } else {
            logger.info(`File saved successfully: ${filePath}`);
            res.status(200).json({ message: 'File saved successfully' });
        }
    });
});

router.delete('/delete-item', (req, res) => {
    const { pathToDelete } = req.body;
    const fullPath = path.join(userDirectory, rollNumber, pathToDelete);
    logger.info(`Deleting item at path: ${fullPath}`);

    if (fs.existsSync(fullPath)) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        logger.info(`Item deleted successfully: ${fullPath}`);
        res.status(200).json({ message: 'Item deleted successfully' });
    } else {
        logger.warn(`Item not found: ${fullPath}`);
        res.status(404).json({ message: 'Item not found' });
    }
});

router.get('/get-folder-contents/:folderPath?', (req, res) => {
    const { folderPath } = req.params;
    const fullPath = path.join(userDirectory, rollNumber, folderPath || '');
    logger.info(`Fetching contents of folder: ${fullPath}`);

    if (fs.existsSync(fullPath)) {
        const items = fs.readdirSync(fullPath).map((item) => {
            const itemPath = path.join(fullPath, item);
            const itemType = fs.statSync(itemPath).isDirectory() ? 'folder' : 'file';
            return {
                name: item,
                type: itemType,
                contents: itemType === 'folder' ? fs.readdirSync(itemPath).map(nestedItem => {
                    const nestedItemPath = path.join(itemPath, nestedItem);
                    const nestedItemType = fs.statSync(nestedItemPath).isDirectory() ? 'folder' : 'file';
                    return {
                        name: nestedItem,
                        type: nestedItemType,
                        content: nestedItemType === 'file' ? fs.readFileSync(nestedItemPath, 'utf-8') : null
                    };
                }) : fs.readFileSync(itemPath, 'utf-8')
            };
        });
        logger.info(`Fetched contents successfully`);
        res.status(200).json(items);
    } else {
        logger.warn(`Folder not found: ${fullPath}`);
        res.status(404).json({ message: 'Folder not found' });
    }
});

module.exports = router;
