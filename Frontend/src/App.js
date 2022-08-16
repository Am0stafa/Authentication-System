import {
  Routes,
  Route,
} from "react-router-dom";
import Login from "./Login";
import Register from "./Register";

function App() {
  return (
    <main className="App">
    <Routes>
      <Route path='/signup' element={<Register/>} />
      <Route path='/' element={<Login/>} />
    </Routes>
    </main>
  );
}

export default App;
