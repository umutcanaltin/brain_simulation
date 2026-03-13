import { useState } from "react";
import reactLogo from "./assets/react.svg";
import GraphScreen from "./screens/GraphScreen";
import ThreeDimGraphScreen from "./screens/ThreeDimGraphScreen";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import GraphScreenController from "./screens/GraphScreenController";
import BrainModel from "./components/BrainModel";
import FooterComponent from "./components/FooterComponent";
import Navbar from "./components/Navbar";

function App() {
  return (
    <BrowserRouter>
    <Navbar></Navbar>
      <Routes>
      <Route
          path="/"
          element={<GraphScreenController></GraphScreenController>}
        ></Route>
      
      </Routes>
      <FooterComponent></FooterComponent>
    </BrowserRouter>
  );
}

export default App;
