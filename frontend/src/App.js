import React from 'react';

import { BrowserRouter as Router, Route } from 'react-router-dom';

import AppNavbar from './components/AppNavbar';
import ContactList from './components/ContactList';
import ItemModal from './components/ItemModal';
import SearchBar from './components/SearchBar';
import { Container } from 'reactstrap';

// Redux dependencies
import { Provider } from 'react-redux';
import store from './store';

// ReactStrap dependencies
import 'bootstrap/dist/css/bootstrap.min.css';

import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css';

import Navbar from './components/layout/MainNavbar'
import Landing from './components/view/Landing';
import LoginPage from './components/auth/LoginPage'
import RegisterPage from './components/auth/RegisterPage'

import Contact from './components/view/Contact'

function App() {
  return (
    <Provider store={store}>
    <Router>
    <div className="App">
      <Route exact path = '/' component={Landing} />
      <Route exact path = '/login' component={LoginPage} />
      <Route exact path = '/register' component={RegisterPage} />

      <Route path = '/contact' component={Contact} />
      <Route exact path = '/contacts' component={itemModal} />

    </div>
    </Router>
    </Provider>
  );
}

export default App;
