import LoginBtn from "./components/LoginBtn";
import { useAuth0 } from '@auth0/auth0-react';
import LogoutButton from "./components/LogoutBtn";
import User from "./components/User";

function App() {

  if(0){
  }

  return (
    <main className="column">
    <h1>Auth0 demo</h1>
      <LoginBtn/>
      <LogoutButton/>
      <User/>
    </main>
  );
}

export default App;
