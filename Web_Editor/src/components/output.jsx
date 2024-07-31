import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const Output = () => {
  const iframeRef = useRef(null);
  const location = useLocation();
  const { code, files } = location.state || { code: '', files: {} };

  useEffect(() => {
    if (iframeRef.current) {
      const document = iframeRef.current.contentDocument;
      document.open();
      
      // Create a complete HTML document with external CSS and JS
      const completeHTML = code
        .replace(/<link rel="stylesheet" href="([^"]+)">/g, (match, fileName) => {
          const cssContent = files[fileName];
          return `<style>${cssContent}</style>`;
        })
        .replace(/<script src="([^"]+)"><\/script>/g, (match, fileName) => {
          const jsContent = files[fileName];
          return `<script>${jsContent}</script>`;
        });

      document.write(completeHTML);
      document.close();
    }
  }, [code, files]);

  return (
    <div style={{ height: '100vh' }}>
      <iframe ref={iframeRef} title="output" style={{ width: '100%', height: '100%', border: 'none' }} />
    </div>
  );
};

export default Output;
