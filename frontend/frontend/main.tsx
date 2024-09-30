import React from "react"
import ReactDOM from "react-dom"
import "./styles/index.css"
import { Parent } from "./Parent"
import { ActorProvider } from "./actors"

ReactDOM.render(
  <React.StrictMode>
    <ActorProvider>
    <Parent />
    </ActorProvider>
  </React.StrictMode>,
  document.getElementById("root"),
)