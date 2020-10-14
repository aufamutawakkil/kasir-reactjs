import React from 'react';
import './style/setting.css';
import Header from './setting/SettingHeader';
import Side from './setting/SettingSide';
import Profile from './setting/Profile';
import Voucher from './setting/Voucher';
import {ToastsContainer, ToastsStore, ToastsContainerPosition} from 'react-toasts';
import Kategori from './setting/Kategori';
import Produk from './setting/Produk';
import UploadExcel from './setting/UploadExcel';

class Setting extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            title:"Profile",
            page:"profile"
        }
    }

    componentDidMount(){
        console.log(this.state.page)
    }

    _changeNav=(nav)=>{
        //console.log(nav)
        this.setState({page:nav});
    }

    

    _addProduk=()=>{
        let kategoris = JSON.parse( localStorage.getItem("kategoris") )
        if( kategoris==null || kategoris.length <= 0 ) ToastsStore.warning("Tambahkan kategori dulu")
        else this.refs.produk._showPopupAdd();
    }

    _updateLogo=(icon)=>{
        this.refs.side.updateLogo(icon)
    }

    toUploadExcel=()=>{
        this.setState({page:"upload"})
    }

    downloadExcel=()=>{
        this.refs.produk.export("products")
    }


    _filter=(filters)=>{
        console.log(filters)
        this.refs.produk.filter(filters);
    }


    render(){
        return (
            <div className="setting">
                <Header title={this.state.title} filter={ this._filter } page={this.state.page} addProduk={this._addProduk}  />
                <Side page={this.state.page} 
                        changeNav={ this._changeNav } 
                        ref="side"
                        toUploadExcel={this.toUploadExcel}
                        downloadExcel={this.downloadExcel}
                        />
                {
                    this.state.page == "profile" ? <Profile ref="profile" updateLogo={this._updateLogo}  /> : null
                }
                {
                    this.state.page == "voucher" ? <Voucher/> : null
                }
                {
                    this.state.page == "kategori" ? <Kategori/> : null
                }
                {
                    this.state.page == "produk" ? <Produk ref="produk"  /> : null
                }
                {
                    this.state.page == "upload" ? <UploadExcel ref="upload" /> : null
                }
            </div>
        );
    }
}

export default Setting;