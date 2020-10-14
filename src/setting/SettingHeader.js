import React from 'react';
import iconLogout from '../assets/icon_logout.png';
import iconBack from '../assets/icon_back.png';
import iconUser from '../assets/icon_user_white.png';
import {Link} from 'react-router-dom';
import {ToastsContainer, ToastsStore, ToastsContainerPosition} from 'react-toasts';
import URL from '../constans/URL';
import Dialog from '../compoenents/Dialog';

import iconDropdown from '../assets/icon_dropdown.png';
import iconResetFilter from '../assets/icon_reset_filter.png';
import DatePicker from 'react-datepicker';
import moment from 'moment';

class SettingHeader extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            profile:{},
            kasir:{},
            outlet:{},
            products:[],
            kategoris:[],
            transaksi:[],
            banks:[],
            vouchers:[],
            gudangs:[],
            isSync:false,
            styles:{contentHeight:0,marginTop:0},
            filters:[
                {
                    title:"Tanggal",
                    from:"",
                    to:"",
                    tipe:"date",
                    filtered:false
                },
                {
                    title:"Nama Produk",
                    tipe:"search",
                    value:"",
                    filtered:false
                },{
                    title:"Kategori",
                    tipe:"search",
                    value:"",
                    filtered:false
                },
            ],
        }
    }

    componentDidMount(){

        let styles = this.state.styles;
        let winHeight = window.innerHeight;
        let headerHeight = document.getElementsByClassName("setting-header")[0].clientHeight;
        let contentHeight = winHeight - headerHeight;

        styles.contentHeight = contentHeight;
        styles.marginTop = headerHeight+5;

        this.setState({
            kasir:JSON.parse(localStorage.getItem("kasir")),
            outlet:JSON.parse(localStorage.getItem("profile")),
            styles:styles
        })


    }

    _resetFilter=(tipe)=>{
        let filters = this.state.filters;
        if(tipe=="nama"){
            this.props.filter("nama","")
            filters[1].title = "Nama Produk";
            filters[1].filtered = false;
            filters[1].value = "";
        }else if(tipe=="date"){
            this.props.filter(tipe,{from:"",to:""})
            filters[0].title = "Tanggal";
            filters[0].from = "";
            filters[0].to = "";
        }else if(tipe=="kategori"){
            this.props.filter("kategori","")
            filters[2].title = "Kategori";
            filters[2].filtered = false;
            filters[2].value = "";
        }

        this.setState({filters:filters},()=>{
            this.props.filter(this.state.filters)
        })
    }

    _setFilter=(val,tipe)=>{ 
        let filters = this.state.filters;  
        if(tipe=="tgl_mulai"){
            let date = moment(val).format("MM/DD/YYYY");
            filters[0].from = date;
        }else if(tipe=="tgl_akhir"){
            let date = moment(val).format("MM/DD/YYYY");
            filters[0].to = date;
        }else if(tipe=="nama"){
            filters[1].value = val;
        }else if(tipe=="kategori"){
            filters[2].value = val;
        }   
        this.setState({filters:filters})
    }

    _doFilter=(tipe)=>{
        let filters = this.state.filters;
        if(tipe=="kategori"){
            this.props.filter(this.state.filters)
            filters[2].title = "Kategori :" + this.state.filters[2].value;
            filters[2].filtered = true;
        }else if(tipe=="date"){
            this.props.filter(this.state.filters)
            filters[0].title = "Tanggal :" + this.state.filters[0].from + " - " + this.state.filters[0].to;
            filters[0].filtered = true;
        }else if(tipe=="nama"){
            this.props.filter(this.state.filters)
            filters[1].title = "Nama :" + this.state.filters[1].value;
            filters[1].filtered = true;
        }
        
        this.setState({filterActive:"",filters:filters},()=>{
            console.log(this.state.filters)
        })
    }

    _renderFilters=()=>{
        let filters = this.state.filters;
        let items = [];let idx=0;
        filters.map(f=>{
            items.push(<div key={f.title}>

                { f.title.toLowerCase().includes("tanggal") ? 
                    <div className="filter" >
                        <div className="filter-title" onClick={ ()=>{ this.setState({filterActive:this.state.filterActive=="date"?"":"date"}) }}>{f.title}</div>
                        <img src={iconDropdown} height="10"/>
                        {
                            this.state.filterActive=="date" ? 
                            <div className="filter-value">
                                <DatePicker dateFormat="dd/MM/yyyy" placeholderText="Tgl Mulai" selected={Date.parse(this.state.filters[0].from)}  onChange={ (date)=>{ this._setFilter(date,"tgl_mulai") } } />
                                <DatePicker dateFormat="dd/MM/yyyy" placeholderText="Tgl Akhir" selected={Date.parse(this.state.filters[0].to)} onChange={ (date)=>{ this._setFilter(date,"tgl_akhir") } } />
                                <div className="btn" onClick={ ()=>{ this._doFilter("date") } } >Filter</div>
                            </div>
                            : null
                        }
                        {
                            f.from != "" && f.to != "" && f.filtered? 
                                <img onClick={()=>{ this._resetFilter("date") }} className="reset" src={iconResetFilter} height="15"/>
                            : null
                        }
                        
                    </div>
                : null }

                { f.title.toLowerCase().includes("nama") ? 
                    <div className="filter" >
                        <div className="filter-title" onClick={ ()=>{ this.setState({filterActive: this.state.filterActive ==  "nama" ? "" : "nama"})}}>{f.title}</div>
                        <img src={iconDropdown} height="10"/>
                        {
                            this.state.filterActive=="nama" ? 
                            <div className="filter-value">
                                <input  value={this.state.filters[1].value} className="search" onChange={ (e)=>{ this._setFilter(e.target.value,"nama") } } />
                                <div className="btn" onClick={ ()=>{ this._doFilter("nama") } } >Filter</div>
                            </div>
                            : null
                        }
                        {
                            f.value != "" && f.filtered ? 
                                <img onClick={()=>{ this._resetFilter("nama") }} className="reset" src={iconResetFilter} height="15"/>
                            : null
                        }
                    </div>
                : null }

                { f.title.toLowerCase().includes("kategori") ? 
                    <div className="filter" >
                        <div className="filter-title" onClick={ ()=>{ this.setState({filterActive: this.state.filterActive ==  "kategori" ? "" : "kategori"})}}>{f.title}</div>
                        <img src={iconDropdown} height="10"/>
                        {
                            this.state.filterActive=="kategori" ? 
                            <div className="filter-value">
                                <input  value={this.state.filters[2].value} className="search" onChange={ (e)=>{ this._setFilter(e.target.value,"kategori") } } />
                                <div className="btn" onClick={ ()=>{ this._doFilter("kategori") } } >Filter</div>
                            </div>
                            : null
                        }
                        {
                            f.value != "" && f.filtered ? 
                                <img onClick={()=>{ this._resetFilter("kategori") }} className="reset" src={iconResetFilter} height="15"/>
                            : null
                        }
                    </div>
                : null }

            </div>)
            idx++;
        })

        return items;
    }

    _logout=()=>{
        let _this = this;
        this.refs.dialog.setMessage("Keluar dari akun cabang ? ");
        this.refs.dialog.setButtonPositive({
            txt:"Keluar & Simpan berkas ke server",
            submit:()=>{ 
                this.refs.dialog.hide();
                this.setState({isSync:true})
                const requestOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
                    body: JSON.stringify({
                    products:JSON.parse( localStorage.getItem("produks") ),
                    kategoris:JSON.parse( localStorage.getItem("kategoris") ),
                    outlet:JSON.parse( localStorage.getItem("profile") ),
                    transaksi:JSON.parse( localStorage.getItem("transaksi") ),
                    banks:JSON.parse( localStorage.getItem("banks") ),
                    vouchers:JSON.parse( localStorage.getItem("vouchers") ),
                    gudangs:JSON.parse( localStorage.getItem("gudangs") ),
                    })
                }

                fetch(URL.base + "sync",requestOptions)
                .then(res=>res.json())
                .then(res=>{
                    _this.setState({isSync:false},()=>{
                        ToastsStore.success("Upload data berhasil")
                        this.refs.dialog.hide()
                        localStorage.removeItem("transaksi");
                        localStorage.removeItem("produks");
                        localStorage.removeItem("banks");
                        localStorage.removeItem("kategoris");
                        localStorage.removeItem("vouchers");
                        localStorage.removeItem("kasirs");
                        localStorage.removeItem("profile");
                        localStorage.removeItem("gudangs");
                        window.location.href = window.location.href.replace("/setting","")+"/"
                    })
                })
             }
        })

        this.refs.dialog.setButtonNegative({
            txt:"Hanya Keluar",
            submit:()=>{ 
                this.refs.dialog.hide()
                localStorage.removeItem("transaksi");
                localStorage.removeItem("produks");
                localStorage.removeItem("banks");
                localStorage.removeItem("kategoris");
                localStorage.removeItem("vouchers");
                localStorage.removeItem("kasirs");
                localStorage.removeItem("profile");
                localStorage.removeItem("gudangs");
                window.location.href = window.location.href.replace("/setting","")+"/"
             }
        })

        this.refs.dialog.setButtonNetral({
            txt:"Batal",
            submit:()=>{ this.refs.dialog.hide() }
        })

        this.refs.dialog.show();
        
    }


    _doSync=()=>{
        let _this = this;
        this.refs.dialog.setMessage("Simpan berkas ke server ?");
        this.refs.dialog.setButtonPositive({
            txt:"Simpan",
            submit:()=>{ 
                this.refs.dialog.hide()
                this.setState({isSync:true})
                const requestOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
                    body: JSON.stringify({
                        products:JSON.parse( localStorage.getItem("produks") ),
                        kategoris:JSON.parse( localStorage.getItem("kategoris") ),
                        outlet:JSON.parse( localStorage.getItem("profile") ),
                        transaksi:JSON.parse( localStorage.getItem("transaksi") ),
                        banks:JSON.parse( localStorage.getItem("banks") ),
                        vouchers:JSON.parse( localStorage.getItem("vouchers") ),
                        gudangs:JSON.parse( localStorage.getItem("gudangs") ),
                        deletes:JSON.parse( localStorage.getItem("deletes") ),
                    })
                }
        
                fetch(URL.base + "sync",requestOptions)
                .then(res=>res.json())
                .then(res=>{
                    _this.setState({isSync:false},()=>{
                        localStorage.setItem("deletes",JSON.stringify( {kategoris:[],produks:[],banks:[],vouchers:[]}));
                    ToastsStore.success("Upload data berhasil")
                    })
                })
             }
        })

        this.refs.dialog.setButtonNetral({
            txt:"Batal",
            submit:()=>{ this.refs.dialog.hide() }
        })

        this.refs.dialog.show();

       
    }

    render(){
        const addProduk = this.props.addProduk;
        return (
            <div>
            <div className="setting-header" >
                <ToastsContainer store={ToastsStore} position={ToastsContainerPosition.TOP_RIGHT} />
                <Link to="/transaksi">
                    <img src={iconBack} height={20}  className="icon-back"  />
                </Link>
                
                <div className="title"> {this.props.title} </div>

                {
                    this.props.page == "produk" ? 
                    <div className="filters">
                        {this._renderFilters()}
                    </div>
                    : null
                }

                <div className={this.props.page=="produk"?"cabang h-sync cabang-produk":"cabang h-sync"} onClick={ ()=>{ this._doSync() } } > {this.state.outlet.nama} </div>
                {
                    this.props.page == "profile" ?
                        <div className="p-header">
                            <div className="pp">
                                <img src={iconUser} height="20" /> <span>{this.state.kasir.nama}</span>
                            </div>
                            <div className="pp" onClick={ ()=>{ this._logout() } } style={{cursor:"pointer"}}>
                                <img src={iconLogout} height="20" /> <span>Keluar</span>
                            </div>
                        </div>
                    : null
                }
                {
                    this.props.page == "produk" ? 
                        <div className="btn-tambah" onClick={ ()=>{ addProduk() } } > Tambah Produk</div>
                    : null
                }
                
            </div>
            {
            this.state.isSync ? 
                <div className="doing-sync" style={{top:this.state.styles.marginTop}} >Sedang melakukan upload data, jangan melakukan transaksi apapun ...</div>
            : null
            }
            <Dialog ref="dialog" />
            </div>
        );
    }
}

export default SettingHeader;