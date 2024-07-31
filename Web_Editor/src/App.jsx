import React from "react";
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import CustomEditor from "./components/editor";
import Output from "./components/output";

const App = () => {
  return (
      <Router>
                      <Routes>
                          <Route path="/editor" element={<CustomEditor/>} />
                          <Route path="/output" element={<Output/>} />
                      </Routes>
                 
      </Router>
  );
};

export default App;