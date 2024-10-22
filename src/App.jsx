import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Para from './components/para';
import Bg from './components/bg';
import Calc from './components/Calc';
import Results from './components/Results';
import Widgets from './components/widgets';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={
          <>
            <Widgets />
            <Bg />
            <Para />
            <Calc />
          </>
        } />
        <Route path="/results" element={<Results />} />
      </Routes>
    </Router>
  );
}

export default App;
