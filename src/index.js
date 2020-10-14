import React from 'react';
import ReactDOM from 'react-dom';
import './style/index.css';
import Transaksi from './Transaksi';
import Setting from './Setting';
import Laporan from './Laporan';
import Login from './Login';
import {Route,Switch,BrowserRouter, HashRouter} from 'react-router-dom';
import * as serviceWorker from './serviceWorker';

const Run =()=> (
    <HashRouter>
        <Switch>
            <Route  exact path="/" component={Login}/>
            <Route  exact path="/transaksi" component={Transaksi}/>
            <Route  exact path="/setting" component={Setting} />
            <Route  exact path="/laporan/:page" component={Laporan} />
        </Switch>
    </HashRouter>
);

ReactDOM.render(
  <Run/>, 
document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
