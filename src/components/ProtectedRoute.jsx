import { Navigate } from "react-router-dom";

const ProtectedRoute = ({children})=>{
    const token = localStorage.getItem('token');


    // Si no hay token, lo rebotamos al login de inmediato
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default ProtectedRoute;