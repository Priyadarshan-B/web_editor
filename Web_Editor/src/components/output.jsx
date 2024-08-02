import React, { useEffect, useState } from 'react';

const Output = () => {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    const storedHtml = localStorage.getItem('outputHtml');
    if (storedHtml) {
      setHtmlContent(storedHtml);
    }
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <iframe
        title="Output"
        style={{ width: '100%', height: '100%' }}
        srcDoc={htmlContent}
      />
    </div>
  );
};

export default Output;
