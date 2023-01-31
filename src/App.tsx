import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import "./App.css";

function App() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <input type="file" directory="" webkitdirectory="" />
        </Toolbar>
      </AppBar>
    </>
  );
}

export default App;
