// import './App.css';
import React from 'react';
import {BrowserRouter, Switch, Route} from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import Main from './components/Main';
import {AuthProvider} from './components/Auth';
import PrivateRoute from './components/PrivateRoute';
import ResetPassword from './components/ResetPassword';
import ManageUser from './components/ManageUser';

function App() {
  var images = document.querySelectorAll('img');
  images.forEach(image=>image.draggable = false);
  return (
    <AuthProvider>  
      <BrowserRouter>
        <div className="App">
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/login" component={Login} />
            <Route path="/signup" component={Signup} />
            <Route path="/manage-user" component={ManageUser} />
            <Route path="/reset-password" component={ResetPassword} />
            <PrivateRoute path="/main" component={Main} />
          </Switch>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;