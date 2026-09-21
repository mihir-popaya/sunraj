import { BrowserRouter } from "react-router-dom";

import AppRoutes from "./routes/AppRoutes";
import AuthInitializer from "./components/auth/AuthInitializer";

export default function App() {
  return (
    <BrowserRouter>
      <AuthInitializer>
        <AppRoutes />
      </AuthInitializer>
    </BrowserRouter>
  );
}