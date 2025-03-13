import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import AppHeader from "./containers/AppHeader";
import AppFooter from "./containers/AppFooter";

import routes from "./routes";

function App() {
  return (
    <BrowserRouter>
      <div className="wrapper d-flex flex-column min-vh-100 bg-light">
        <AppHeader />
        <div className="body flex-grow-1 px-3">
          <Routes>
            {routes.map((route, idx) => {
              return (
                route.element && (
                  <Route
                    key={idx}
                    path={route.path}
                    exact={route.exact}
                    name={route.name}
                    element={<route.element />}
                  />
                )
              );
            })}
            <Route path="*" element={<Navigate to="responders" replace />} />
          </Routes>
        </div>
        <AppFooter />
      </div>
    </BrowserRouter>
  );
}

export default App;
