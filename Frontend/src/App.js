import {
  Routes,
  Route,
} from "react-router-dom";
import LinkPage from "./components/LinkPage";
import Login from "./components/Login";
import Register from "./components/Register";
import Unauthorized from "./components/Unauthorized";
import Layout from "./components/Layout";
import Home from "./components/Home";
import Editor from "./components/Editor";
import Missing from "./components/Missing";
import RequireAuth from "./components/RequireAuth";
import Admin from "./components/Admin";
import Lounge from "./components/Lounge";

//! this is vulnerable as any one who digs into the javascript file can find that
const ROLES = {
  'User': 2001,
  'Editor': 1984,
  'Admin': 5150
}


function App() {
  return (
    <main className="App">
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* public routes */}
          <Route path='register' element={<Register/>} />
          <Route path='login' element={<Login/>} />
          <Route path="linkpage" element={<LinkPage />} />
          <Route path="unauthorized" element={<Unauthorized/>} /> 
          
          {/* we want to protect these routes */}
          
          <Route element={<RequireAuth allowedRoles={[ROLES.User]} />}>
            <Route path="/" element={<Home />} />
            {/* we can add all the routes under this protection */}
          </Route>
       
          <Route element={<RequireAuth allowedRoles={[ROLES.Editor]} />}>
            <Route path="editor" element={<Editor />} />
          </Route>

          <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}>
            <Route path="admin" element={<Admin />} />
          </Route>
    
          <Route element={<RequireAuth allowedRoles={[ROLES.Editor, ROLES.Admin]} />}>
            <Route path="lounge" element={<Lounge />} />
          </Route>
          
          {/* catch all */}
          <Route path="*" element={<Missing />} />
          
        </Route>
      </Routes>
    </main>
  );
}

export default App;
