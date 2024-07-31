import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import apiHost from '../utils/api';

const MonacoEditor = () => {
  const [code, setCode] = useState({});
  const [activeFile, setActiveFile] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [folderName, setFolderName] = useState(localStorage.getItem('folderName') || '');
  const navigate = useNavigate();

  useEffect(() => {
    if (folderName) {
      axios.get(`${apiHost}/get-folder-contents/${folderName}`)
        .then((response) => {
          const files = response.data.reduce((acc, file) => {
            acc[file.fileName] = file.content;
            return acc;
          }, {});
          setCode(files);
          setActiveFile(Object.keys(files)[0]);
        })
        .catch(() => {
          setCode({});
          setActiveFile('');
        });
    }
  }, [folderName]);

  const handleEditorChange = (value) => {
    setCode((prev) => ({
      ...prev,
      [activeFile]: value,
    }));
  };

  const handleAddFile = () => {
    if (newFileName.trim() && !code[newFileName]) {
      setCode((prev) => ({
        ...prev,
        [newFileName]: '',
      }));
      setActiveFile(newFileName);
      setNewFileName('');
    }
  };

  const handleDeleteFile = (file) => {
    if (Object.keys(code).length > 1) {
      const newCode = { ...code };
      delete newCode[file];
      setCode(newCode);
      setActiveFile(Object.keys(newCode)[0]);
    }
  };

  const saveFiles = async () => {
    try {
      const promises = Object.keys(code).map((fileName) =>
        axios.post(`${apiHost}/save-file`, { folderName, fileName, content: code[fileName] })
      );
      await Promise.all(promises);
      alert('Files saved successfully');
    } catch (error) {
      alert('Error saving files');
    }
  };

  const runCode = () => {
    const htmlFile = Object.keys(code).find(file => file.endsWith('.html'));
    if (!htmlFile) {
      alert('No HTML file found');
      return;
    }

    const cssLinks = Object.keys(code).filter(fileName => fileName.endsWith('.css')).map(cssFile => `<link rel="stylesheet" href="${cssFile}">`).join('\n');
    const jsLinks = Object.keys(code).filter(fileName => fileName.endsWith('.js')).map(jsFile => `<script src="${jsFile}"></script>`).join('\n');

    const htmlContent = code[htmlFile]
      .replace(/<\/head>/, `${cssLinks}</head>`)
      .replace(/<\/body>/, `${jsLinks}</body>`);

    navigate('/output', { state: { code: htmlContent, files: code } });
  };

  const createFolder = async () => {
    try {
      await axios.post(`${apiHost}/create-folder`, { folderName });
      alert('Folder created successfully');
      localStorage.setItem('folderName', folderName);
    } catch (error) {
      alert('Error creating folder');
    }
  };

  const handleFolderNameChange = (e) => {
    setFolderName(e.target.value);
    localStorage.setItem('folderName', e.target.value);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'row' }}>
      <div style={{ width: '250px', borderRight: '1px solid #ccc', padding: '10px', overflowY: 'auto' }}>
        <input
          type="text"
          value={folderName}
          onChange={handleFolderNameChange}
          placeholder="Folder name"
        />
        <button onClick={createFolder} style={{ display: 'block', marginTop: '10px' }}>Create Folder</button>
        <input
          type="text"
          value={newFileName}
          onChange={(e) => setNewFileName(e.target.value)}
          placeholder="New file name"
          disabled={!folderName}
        />
        <button onClick={handleAddFile} style={{ display: 'block', marginTop: '10px' }} disabled={!folderName}>Add File</button>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {Object.keys(code).map((file) => (
            <li key={file} style={{ marginBottom: '5px' }}>
              <button onClick={() => setActiveFile(file)}>{file}</button>
              <button onClick={() => handleDeleteFile(file)} style={{ marginLeft: '10px' }}>Delete</button>
            </li>
          ))}
        </ul>
        <button onClick={saveFiles} style={{ marginTop: '10px' }} disabled={!folderName}>Save Files</button>
      </div>
      <div style={{ flex: 1 }}>
        {activeFile && (
          <Editor
            height="100%"
            language={
              activeFile.endsWith('.js') ? 'javascript' :
              activeFile.endsWith('.html') ? 'html' :
              activeFile.endsWith('.css') ? 'css' :
              'text'
            }
            value={code[activeFile]}
            theme="vs-dark"
            onChange={handleEditorChange}
          />
        )}
        <button onClick={runCode} style={{ marginTop: '10px' }} disabled={!folderName || !activeFile}>Run Code</button>
      </div>
    </div>
  );
};

export default MonacoEditor;
