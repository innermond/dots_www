import './LoginForm.scss';
import type { Component } from 'solid-js';

const LoginForm: Component = () => {
  return (
     <form action="#" method="post">

  <div class="container">
    <label for="uname">Username</label>
    <input type="text" placeholder="Enter Username" name="uname" required />

    <label for="psw">Password</label>
    <input type="password" placeholder="Enter Password" name="psw" required />

    <button type="submit">Login</button>
    <label><input type="checkbox" name="remember">Remember me</input></label>
  </div>

  <div class="container">
    <button type="button" class="cancelbtn">Cancel</button>
    <span class="psw">Forgot <a href="#">password?</a></span>
  </div>
</form>
  )
};

export default LoginForm;
