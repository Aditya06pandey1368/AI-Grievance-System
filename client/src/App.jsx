import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";

// Placeholder for Home
const Home = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-dark-bg pt-24 text-center">
    <h1 className="text-3xl dark:text-white">Home Page Placeholder</h1>
    <a href="/login" className="text-primary-500 underline">Go to Login</a>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        {/* We will add Register and Dashboard later */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;