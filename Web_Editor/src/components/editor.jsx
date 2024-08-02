import React from 'react';
import { Editor } from '@monaco-editor/react';

const CodeEditor = ({ value, onChange, language }) => (
  <Editor
    height="90vh"
    language={language}
    value={value}
    onChange={(newValue) => onChange(newValue)}
    options={{
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
    }}
  />
);

export default CodeEditor;
