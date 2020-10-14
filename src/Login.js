import React from 'react';
import './style/login.css';
import URL from './constans/URL';
import {Link, Redirect} from 'react-router-dom';
import {ToastsContainer, ToastsStore, ToastsContainerPosition} from 'react-toasts';

class Login extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            title:"Profile",
            page:"profile",
            height:window.innerHeight,
            txtLogin:"LOGIN",
            username:"",
            password:"",
            redirect:false
        }
    }

    componentDidMount=()=>{

        let profile = localStorage.getItem("profile");
        if( profile !== null && profile !== undefined ){
           this.props.history.push("/transaksi")
        }
    }

    _doLogin=()=>{
        let _this = this;
        this.setState({txtLogin:"LOADING..."})
        
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
            body: JSON.stringify({username:this.state.username,password:this.state.password})
        }

        fetch(URL.base + "login",requestOptions)
        .then(res=>res.json())
        .then(res=>{
            if(!res.status){
                this.setState({txtLogin:"LOGIN"})
                ToastsStore.error(res.message)
                return;
            }
            let data = res.data;
    
            //reset all 
            localStorage.removeItem("transaksi");
            localStorage.removeItem("produks");
            localStorage.removeItem("banks");
            localStorage.removeItem("kategoris");
            localStorage.removeItem("vouchers");
            localStorage.removeItem("profile");
            localStorage.removeItem("kasirs");
            localStorage.removeItem("kasir");
            localStorage.removeItem("gudangs");
            localStorage.setItem("deletes",JSON.stringify( {kategoris:[],produks:[],banks:[],vouchers:[]}));

            localStorage.setItem("transaksi",JSON.stringify(data.transaksi)===undefined?"-":JSON.stringify(data.transaksi));
            localStorage.setItem("produks",JSON.stringify(data.products));
            localStorage.setItem("kategoris",JSON.stringify(data.kategoris));
            localStorage.setItem("vouchers",JSON.stringify(data.vouchers));
            localStorage.setItem("profile",JSON.stringify(data.profile));
            localStorage.setItem("banks",JSON.stringify(data.banks));
            localStorage.setItem("kasirs",JSON.stringify(data.kasirs));
            localStorage.setItem("gudangs",JSON.stringify(data.gudangs));

            //dummy kasir
            localStorage.setItem("kasir",JSON.stringify({nama:"-"}));


            this.props.history.push("/transaksi")
            

        })
    }

 
    render(){
        if (this.state.redirect) {
            return <Redirect to='/transaksi'/>;
        }
        return (
            <div className="login" style={{height:this.state.height}}>
                <ToastsContainer store={ToastsStore} position={ToastsContainerPosition.TOP_RIGHT} />
               <div className="l" style={{marginTop:this.state.height/2 - 150}}>
                   <label>Username : </label>
                   <input onChange={ (e)=>{ this.setState({username:e.target.value}) } }  />
                   <label>Password : </label>
                   <input type="password" onChange={ (e)=>{ this.setState({password:e.target.value}) } } />
                   <div  onClick={ ()=>{ this._doLogin() } } className="btn-login">{this.state.txtLogin}</div>
               </div>
            </div>
        );
    }
}

export default Login;