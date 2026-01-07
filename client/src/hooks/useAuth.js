import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; 
// Note: Ensure your AuthContext exports the Context object itself as 'AuthContext' 
// or just use the hook exported from that file directly.
// Since I exported 'useAuth' directly from AuthContext.jsx in the previous step,
// this file might be redundant, BUT if you want a separate file structure:

// Option A: If you already exported useAuth from AuthContext.jsx, DELETE this file.
// Option B: If you want to keep strict separation:

/* import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const useAuth = () => {
  return useContext(AuthContext);
};

export default useAuth;
*/