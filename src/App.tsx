import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './components/HomePage';
import PostDetail from './components/PostDetail';
import PostEditor from './components/PostEditor';
import LoginPage from './components/LoginPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/new" element={<PostEditor />} />
          <Route path="/edit/:id" element={<PostEditor />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
