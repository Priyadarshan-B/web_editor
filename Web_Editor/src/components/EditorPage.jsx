import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileTree from './fileTree';
import CodeEditor from './editor';
import { useNavigate } from 'react-router-dom';

const EditorPage = () => {
  const [structure, setStructure] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [code, setCode] = useState('');
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [js, setJs] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchStructure();
  }, []);

  const fetchStructure = () => {
    axios.get('http://localhost:5000/api/structure').then(res => setStructure(res.data));
  };

  const createFolder = (basePath = '') => {
    const folderName = prompt('Enter folder name');
    if (folderName) {
      axios.post('http://localhost:5000/api/create-folder', { path: `${basePath}/${folderName}` }).then(fetchStructure);
    }
  };

  const createFile = (basePath = '') => {
    const fileName = prompt('Enter file name');
    if (fileName) {
      axios.post('http://localhost:5000/api/create-file', { path: `${basePath}/${fileName}` }).then(fetchStructure);
    }
  };

  const deleteItem = (path) => {
    axios.post('http://localhost:5000/api/delete-item', { path }).then(fetchStructure);
  };

  const openFile = (path) => {
    axios.get(`http://localhost:5000/api/file?path=${path}`).then(res => {
      setSelectedFile(path);
      setCode(res.data);
      if (path.endsWith('.html')) setHtml(res.data);
      if (path.endsWith('.css')) setCss(res.data);
      if (path.endsWith('.js')) setJs(res.data);
    });
  };

  const saveFile = () => {
    if (selectedFile) {
      axios.post('http://localhost:5000/api/file', { path: selectedFile, content: code }).then(() => {
        alert('File saved');
      });
    } else {
      alert('No file selected');
    }
  };

  const runCode = async () => {
    // Extract links and scripts from HTML
    const htmlContent = document.createElement('div');
    htmlContent.innerHTML = html;
    
    const links = Array.from(htmlContent.querySelectorAll('link[rel="stylesheet"]'));
    const scripts = Array.from(htmlContent.querySelectorAll('script[src]'));
  
    // Fetch CSS content
    const cssPromises = links.map(link => 
      fetch(link.getAttribute('href'))
        .then(response => response.text())
        .catch(() => '')
    );
  
    // Fetch JS content
    const jsPromises = scripts.map(script => 
      fetch(script.getAttribute('src'))
        .then(response => response.text())
        .catch(() => '')
    );
  
    try {
      const [cssResults, jsResults] = await Promise.all([
        Promise.all(cssPromises),
        Promise.all(jsPromises)
      ]);
  
      // Combine HTML, CSS, and JS
      const outputHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            ${links.map((_, index) => `<style>${cssResults[index]}</style>`).join('')}
          </head>
          <body>
            ${html}
            ${jsResults.map(js => `<script>${js}</script>`).join('')}
          </body>
        </html>
      `;
  console
      // Store combined code in localStorage
      localStorage.setItem('outputHtml', outputHtml);
      navigate('/output');
    } catch (error) {
      console.error('Error fetching CSS or JS:', error);
    }
  };
  

  const getLanguage = (filePath) => {
    if (filePath.endsWith('.html')) return 'html';
    if (filePath.endsWith('.css')) return 'css';
    if (filePath.endsWith('.js')) return 'javascript';
    return 'text';
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ width: '20%', height: '100vh', borderRight: '1px solid #ccc', padding: '10px' }}>
        <FileTree 
          structure={structure} 
          openFile={openFile} 
          createFolder={createFolder} 
          createFile={createFile} 
          deleteItem={deleteItem} 
        />
      </div>
      <div style={{ width: '60%', height: '100vh', padding: '10px' }}>
        {selectedFile && (
          <>
            <CodeEditor 
              value={code} 
              onChange={setCode} 
              language={getLanguage(selectedFile)} 
            />
            <button onClick={saveFile} style={{ marginTop: '10px' }}>Save</button>
            <button onClick={runCode} style={{ marginTop: '10px' }}>Run</button>
          </>
        )}
      </div>
    </div>
  );
};

export default EditorPage;
