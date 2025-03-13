import React from "react";

const Responders = React.lazy(() => import("./views/Responders"));

const routes = [
  { path: "/responders", name: "Responders", element: Responders, exact: true },
];

export default routes;
