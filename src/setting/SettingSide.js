import React from 'react';
import iconLogout from '../assets/icon_logout.png';
import iconBack from '../assets/icon_back.png';
import iconUser from '../assets/icon_user_white.png';
import '../style/setting.css';

class SettingSide extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            profile:{},
            kasir:{},
            logo:"",
            styles:{
                contentHeight:0,
                headerHeight:0
            }
        }
    }

    componentDidMount(){

        //get UI setting
        let styles = this.state.styles;
        let winHeight = window.innerHeight;
        let headerHeight = document.getElementsByClassName("setting-header")[0].clientHeight;
        let contentHeight = winHeight - headerHeight;
        styles.contentHeight = contentHeight;
        styles.marginTop=headerHeight+7;

        let profile = JSON.parse(localStorage.getItem("profile"));
        this.setState({logo:profile.logo,styles:styles})
    }

    updateLogo=(logo)=>{
        this.setState({logo:logo})
    }


    render(){
        var changeNav = this.props.changeNav;
        var downloadExcel = this.props.downloadExcel;
        var toUploadExcel = this.props.toUploadExcel;

        return (
            <div className="setting-side" style={{height:this.state.styles.contentHeight,marginTop:this.state.styles.marginTop}}>
                <img  className="icon"  src={this.state.logo} />
                <div onClick={ ()=>{ changeNav("profile") } } className={this.props.page=="profile" ? "menu menu-active" : "menu" }>Profil</div>
                <div onClick={ ()=>{ changeNav("kategori") } } className={this.props.page=="kategori" ? "menu menu-active" : "menu" }>Kategori</div>
                <div onClick={ ()=>{ changeNav("produk") } } className={this.props.page=="produk" ? "menu menu-active" : "menu" }>Produk</div>
                <div onClick={ ()=>{ changeNav("voucher") } } className={this.props.page=="voucher" ? "menu menu-active" : "menu" }>Voucher</div>

                {
                    this.props.page == "produk" ? 
                    <div className="btn-item-produk">
                        <div className="item-2" onClick={ ()=>{ toUploadExcel() } }>
                            <span>Upload Excel</span>
                        </div>
                        <div className="item-2" onClick={ ()=>{ downloadExcel() } }>
                            <span>Download Excel</span>
                        </div>
                    </div>
                    
                    : null
                }

            </div>
        );
    }
}

export default SettingSide;