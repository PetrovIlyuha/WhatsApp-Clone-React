import { Button } from '@material-ui/core';
import { auth, googleAuthProvider } from '../firebase';
import './Login.css';

export default function Login() {
  function login() {
    auth.signInWithRedirect(googleAuthProvider);
  }
  return (
    <div className='app'>
      <div className='login'>
        <div className='login__container'>
          <img src='./login-logo.png' alt='Logo' />
          <div className='login__text'>
            <h1>Sign in to WhatsApp</h1>
          </div>
          <Button onClick={login}>Sign In With Google</Button>
        </div>
      </div>
    </div>
  );
}
