import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import EditorPage from './components/EditorPage';
import Output from './components/output';
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/output" element={<Output />} />
      </Routes>
    </Router>
  );
};

export default App;
