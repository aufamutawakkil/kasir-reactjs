import React from 'react';
import './style/laporan.css';
import Header from './laporan/LaporanHeader';
import Side from './laporan/LaporanSide';
import {ToastsContainer, ToastsStore, ToastsContainerPosition} from 'react-toasts';
import Lunas from './laporan/Lunas';
import DP from './laporan/DP';
import Gudang from './laporan/Gudang';
import Pending from './laporan/Pending';


class Laporan extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            title:"Laporan",
            page:"",
            transaksi:[]
        }
    }

    componentDidMount(){
        let url = window.location.href
        let page = url.split("/")[ url.split("/").length - 1 ];
        this.setState({page:page})
    }

    _changeNav=(nav)=>{
        this.setState({page:nav});
    }

    _downloadExcel=()=>{
        if(this.state.page=="dp")
            this.refs.dp.export("Transaksi_DP_")
        else if(this.state.page=="lunas")
            this.refs.lunas.export("Transaksi_Lunas")
        else if(this.state.page=="gudang")
            this.refs.gudang.export("Gudang")
    }

    _filter=(filters)=>{
        if(this.state.page=="dp"){
            this.refs.dp.filter(filters);
        }else if(this.state.page=="lunas"){
            this.refs.lunas.filter(filters);
        }else if(this.state.page=="gudang"){
            this.refs.gudang.filter(filters);
        }
    }

    _changeStatusDP=(status)=>{
        this.refs.dp.changeStatusDP(status)
    }

    _onSearchInvoice=(key)=>{
        if(this.state.page=="dp")
            this.refs.dp._onSearchInvoice(key)
        if(this.state.page=="lunas")
            this.refs.lunas._onSearchInvoice(key)
    }

    refresh=()=>{
        this.refs.side.refresh();
    }

    render(){
        return (
            <div className="laporan">
                <Header title={this.state.title} page={this.state.page} filter={ this._filter } />
                <Side ref="side" onSearchInvoice={this._onSearchInvoice} changeStatusDP={this._changeStatusDP} transaksi={this.state.transaksi} page={this.state.page} downloadExcel={ this._downloadExcel }  />
                {
                    this.state.page == "lunas" ? <Lunas refresh={this.refresh}  ref="lunas" /> : null
                }
                {
                    this.state.page == "dp" ? <DP refresh={this.refresh}  ref="dp" /> : null
                }
                {
                    this.state.page == "gudang" ? <Gudang ref="gudang" /> : null
                }
                {
                    this.state.page == "pending" ? <Pending ref="pending" /> : null
                }
            </div>
        );
    }
}

export default Laporan;