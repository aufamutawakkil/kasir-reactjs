import React from 'react';
import iconLogout from '../assets/icon_logout.png';
import iconBack from '../assets/icon_back.png';
import iconDropdown from '../assets/icon_dropdown.png';
import iconResetFilter from '../assets/icon_reset_filter.png';
import iconClose from '../assets/icon_close_popup.png';
import iconLunas from '../assets/icon_llunas.png';
import iconDP from '../assets/icon_paper_dp.png';
import iconGudang from '../assets/icon_gudang.png';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import {Link} from 'react-router-dom';

import "../../node_modules/react-datepicker/dist/react-datepicker.css";

class LaporanHeader extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            profile:{},
            kasir:{},
            outlet:"",
            filters:[
                {
                    title:"Tanggal Transaksi",
                    from:"",
                    to:"",
                    tipe:"date",
                    filtered:false
                },
                {
                    title:"Status",
                    tipe:"dropdown",
                    dropdown:[
                        {value:'Success',name:"Success"},
                        {value:'Cancel',name:"Cancel"},
                    ],
                    value:"",
                    filtered:false
                },
                {
                    title:"Pembeli",
                    tipe:"search",
                    value:"",
                    filtered:false
                },
                {
                    title:"Metode Bayar",
                    tipe:"dropdown",
                    dropdown:[
                        {value:'Tunai',name:"Tunai"},
                        {value:'Transfer',name:"Transfer"},
                    ],
                    value:"",
                    filtered:false
                },
                {
                    title:"Bank",
                    tipe:"dropdown",
                    dropdown:[],
                    value:"",
                    filtered:false
                }
            ],
            filtersGudang:[
                {
                    title:"Tgl",
                    from:"",
                    to:"",
                    tipe:"date",
                    filtered:false
                },
                {
                    title:"Nama",
                    tipe:"search",
                    value:"",
                    filtered:false
                },
                {
                    title:"Kategori",
                    tipe:"search",
                    value:"",
                    filtered:false
                },
                {
                    title:"Stok",
                    tipe:"search",
                    value:"",
                    filtered:false
                },
            ],
            filterActive:""
        }
    }


    _setFilter=(val,tipe)=>{ 
        let filters = this.state.filters;  
        if(tipe=="tgl_mulai"){
            let date = moment(val).format("MM/DD/YYYY");
            filters[0].from = date;
        }else if(tipe=="tgl_akhir"){
            let date = moment(val).format("MM/DD/YYYY");
            filters[0].to = date;
        }else if(tipe=="status"){
            filters[1].value = val;
        }else if(tipe=="pembeli"){
            filters[2].value = val;
        }else if(tipe=="metode"){
            filters[3].value = val;
        }else if(tipe=="bank"){
            filters[4].value = val;
        }
        
        this.setState({filters:filters})
    }

    _doFilter=(tipe)=>{
        let filters = this.state.filters;
        if(tipe=="pembeli"){
            this.props.filter(this.state.filters)
            filters[2].title = "Pembeli :" + this.state.filters[2].value;
            filters[2].filtered = true;
        }else if(tipe=="date"){
            this.props.filter(this.state.filters)
            filters[0].title = "Tanggal :" + this.state.filters[0].from + " - " + this.state.filters[0].to;
            filters[0].filtered = true;
        }else if(tipe=="status"){
            this.props.filter(this.state.filters)
            filters[1].title = "Status :" + this.state.filters[1].value;
            filters[1].filtered = true;
        }else if(tipe=="metode"){
            this.props.filter(this.state.filters)
            filters[3].title = "Metode Bayar :" + this.state.filters[3].value;
            filters[3].filtered = true;
        }else if(tipe=="bank"){
            this.props.filter(this.state.filters)
            filters[4].title = "Bank :" + this.state.filters[4].value;
            filters[4].filtered = true;
            console.log(tipe)
            console.log(filters[4]);
        }
        
        this.setState({filterActive:"",filters:filters},()=>{
            console.log(this.state.filters)
        })
    }

    componentDidMount(){
        let filters = this.state.filters;
        let banks = JSON.parse(localStorage.getItem("banks"));
        let newBanks = [];
        if( banks !== undefined && banks !== null){
            banks.map(b=>{
                newBanks.push({value:b.bank,name:b.bank})
            })
            filters[4]['dropdown'] = newBanks
        }
        this.setState({
            filters:filters    
        })
    }

    _renderOptFilters=(opts,valSelected)=>{
        let items = [];
        if(opts !== undefined && opts !== null){
            items.push(<option value="" selected={true}>--select--</option>)
            opts.map(p=>{
                console.log(valSelected)
                
                items.push(
                    <option value={p.value} selected={p.value == valSelected} >{p.name}</option>
                )
            })
        }
        return items;
    }

    _resetFilter=(tipe)=>{
        let filters = this.state.filters;
        if(tipe=="pembeli"){
            this.props.filter("pembeli","")
            filters[2].title = "Pembeli";
            filters[2].filtered = false;
            filters[2].value = "";
        }else if(tipe=="date"){
            this.props.filter(tipe,{from:"",to:""})
            filters[0].title = "Tanggal Transaksi";
            filters[0].from = "";
            filters[0].to = "";
        }else if(tipe=="status"){
            this.props.filter("status","")
            filters[1].title = "Status";
            filters[1].filtered = false;
            filters[1].value = "";
        }else if(tipe=="metode"){
            this.props.filter("metode","")
            filters[3].title = "Metode Bayar";
            filters[3].filtered = false;
            filters[3].value = "";
        }else if(tipe=="bank"){
            this.props.filter("bank","")
            filters[4].title = "Bank";
            filters[4].filtered = false;
            filters[4].value = "";
        }

        console.log("reset filter")
        console.log(this.state.filters)

        this.setState({filters:filters},()=>{
            this.props.filter(this.state.filters)
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

                { f.title.toLowerCase().includes("status") ? 
                    <div className="filter">
                        <div className="filter-title" onClick={ ()=>{ this.setState({filterActive: this.state.filterActive == "status" ? "" : "status"}) }}>{f.title}</div>
                        <img src={iconDropdown} height="10"  />
                        {
                            this.state.filterActive=="status" ? 
                                <div className="filter-value">
                                    <select onChange={ (e)=>{ this._setFilter(e.target.value,"status") } } >
                                        {this._renderOptFilters(f.dropdown,this.state.filters[1].value)}
                                    </select>
                                    <div className="btn" onClick={ ()=>{ this._doFilter("status") } } >Filter</div>
                                </div>
                            : null
                        }
                        {
                            f.value != "" && f.filtered ? 
                                <img onClick={()=>{ this._resetFilter("status") }} className="reset" src={iconResetFilter} height="15"/>
                            : null
                        }
                    </div>
                : null }

                { f.title.toLowerCase().includes("pembeli") ? 
                    <div className="filter" >
                        <div className="filter-title" onClick={ ()=>{ this.setState({filterActive: this.state.filterActive ==  "pembeli" ? "" : "pembeli"})}}>{f.title}</div>
                        <img src={iconDropdown} height="10"/>
                        {
                            this.state.filterActive=="pembeli" ? 
                            <div className="filter-value">
                                <input  value={this.state.filters[2].value} className="search" onChange={ (e)=>{ this._setFilter(e.target.value,"pembeli") } } />
                                <div className="btn" onClick={ ()=>{ this._doFilter("pembeli") } } >Filter</div>
                            </div>
                            : null
                        }
                        {
                            f.value != "" && f.filtered ? 
                                <img onClick={()=>{ this._resetFilter("pembeli") }} className="reset" src={iconResetFilter} height="15"/>
                            : null
                        }
                    </div>
                : null }

                { f.title.toLowerCase().includes("metode") ? 
                    <div className="filter">
                        <div className="filter-title" onClick={ ()=>{ this.setState({filterActive:this.state.filterActive == "metode" ? "" : "metode"}) }}>{f.title}</div>
                        <img src={iconDropdown} height="10"  />
                        {
                            this.state.filterActive=="metode" ? 
                                <div className="filter-value">
                                    <select onChange={ (e)=>{ this._setFilter(e.target.value,"metode") } } >
                                        {this._renderOptFilters(f.dropdown,this.state.filters[3].value)}
                                    </select>
                                    <div className="btn" onClick={ ()=>{ this._doFilter("metode") } } >Filter</div>
                                </div>
                            : null
                        }
                        {
                            f.value != "" && f.filtered ? 
                                <img onClick={()=>{ this._resetFilter("metode") }} className="reset" src={iconResetFilter} height="15"/>
                            : null
                        }
                    </div>
                : null }

                { f.title.toLowerCase().includes("bank") ? 
                    <div className="filter">
                        <div className="filter-title" onClick={ ()=>{ this.setState({filterActive: this.state.filterActive == "bank" ? "" : "bank"}) }}>{f.title}</div>
                        <img src={iconDropdown} height="10"  />
                        {
                            this.state.filterActive=="bank" ? 
                                <div className="filter-value">
                                    <select onChange={ (e)=>{ this._setFilter(e.target.value,"bank") } } >
                                        {this._renderOptFilters(f.dropdown,this.state.filters[4].value)}
                                    </select>
                                    <div className="btn" onClick={ ()=>{ this._doFilter("bank") } } >Filter</div>
                                </div>
                            : null
                        }
                        {
                            f.value != "" && f.filtered ? 
                                <img onClick={()=>{ this._resetFilter("bank") }} className="reset" src={iconResetFilter} height="15"/>
                            : null
                        }
                    </div>
                : null }
            </div>)
            idx++;
        })

        return items;
    }

    _setFilterGudang=(val,tipe)=>{ 
        let filters = this.state.filtersGudang;  
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
        }else if(tipe=="stok"){
            filters[3].value = val;
        }
        
        this.setState({filtersGudang:filters})
    }

    _resetFilterGudang=(tipe)=>{
        let filters = this.state.filtersGudang;
        if(tipe=="nama"){
            filters[1].title = "Nama";
            filters[1].filtered = false;
            filters[1].value = "";
            this.props.filter(filters)
        }else if(tipe=="date"){
            filters[0].title = "Tanggal";
            filters[0].from = "";
            filters[0].to = "";
            this.props.filter(filters)
        }else if(tipe=="kategori"){
            filters[2].title = "Kategori";
            filters[2].filtered = false;
            filters[2].value = "";
            this.props.filter(filters)
        }else if(tipe=="stok"){
            filters[3].title = "Stok";
            filters[3].filtered = false;
            filters[3].value = "";
            this.props.filter(filters)
        }

        this.setState({filtersGudang:filters})
    }

    _doFilterGudang=(tipe)=>{
        let filters = this.state.filtersGudang;
        if(tipe=="nama"){
            this.props.filter(this.state.filtersGudang)
            filters[1].title = "Nama :" + this.state.filtersGudang[1].value;
            filters[1].filtered = true;
        }else if(tipe=="date"){
            this.props.filter(this.state.filtersGudang)
            filters[0].title = "Tanggal :" + this.state.filtersGudang[0].from + " - " + this.state.filtersGudang[0].to;
            filters[0].filtered = true;
        }else if(tipe=="kategori"){
            this.props.filter(this.state.filtersGudang)
            filters[2].title = "Kategori :" + this.state.filtersGudang[2].value;
            filters[2].filtered = true;
        }
        else if(tipe=="stok"){
            this.props.filter(this.state.filtersGudang)
            filters[3].title = "Stok <= " + this.state.filtersGudang[3].value;
            filters[3].filtered = true;
        }
        
        this.setState({filterActive:"",filtersGudang:filters})
    }

    _renderFiltersGudang=()=>{
        let filters = this.state.filtersGudang;
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
                                <DatePicker dateFormat="dd/MM/yyyy" placeholderText="Tgl Mulai" selected={Date.parse(this.state.filtersGudang[0].from)}  onChange={ (date)=>{ this._setFilterGudang(date,"tgl_mulai") } } />
                                <DatePicker dateFormat="dd/MM/yyyy" placeholderText="Tgl Akhir" selected={Date.parse(this.state.filtersGudang[0].to)} onChange={ (date)=>{ this._setFilterGudang(date,"tgl_akhir") } } />
                                <div className="btn" onClick={ ()=>{ this._doFilterGudang("date") } } >Filter</div>
                            </div>
                            : null
                        }
                        {
                            f.from != "" && f.to != "" && f.filtered? 
                                <img onClick={()=>{ this._resetFilterGudang("date") }} className="reset" src={iconResetFilter} height="15"/>
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
                                <input  value={this.state.filtersGudang[1].value} className="search" onChange={ (e)=>{ this._setFilterGudang(e.target.value,"nama") } } />
                                <div className="btn" onClick={ ()=>{ this._doFilterGudang("nama") } } >Filter</div>
                            </div>
                            : null
                        }
                        {
                            f.value != "" && f.filtered ? 
                                <img onClick={()=>{ this._resetFilterGudang("nama") }} className="reset" src={iconResetFilter} height="15"/>
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
                                <input  value={this.state.filtersGudang[2].value} className="search" onChange={ (e)=>{ this._setFilterGudang(e.target.value,"kategori") } } />
                                <div className="btn" onClick={ ()=>{ this._doFilterGudang("kategori") } } >Filter</div>
                            </div>
                            : null
                        }
                        {
                            f.value != "" && f.filtered ? 
                                <img onClick={()=>{ this._resetFilterGudang("kategori") }} className="reset" src={iconResetFilter} height="15"/>
                            : null
                        }
                    </div>
                : null }

                { f.title.toLowerCase().includes("stok") ? 
                    <div className="filter" >
                        <div className="filter-title" onClick={ ()=>{ this.setState({filterActive: this.state.filterActive ==  "stok" ? "" : "stok"})}}>{f.title}</div>
                        <img src={iconDropdown} height="10"/>
                        {
                            this.state.filterActive=="stok" ? 
                            <div className="filter-value">
                                <input  value={this.state.filtersGudang[3].value} className="search" onChange={ (e)=>{ this._setFilterGudang(e.target.value,"stok") } } />
                                <div className="btn" onClick={ ()=>{ this._doFilterGudang("stok") } } >Filter</div>
                            </div>
                            : null
                        }
                        {
                            f.value != "" && f.filtered ? 
                                <img onClick={()=>{ this._resetFilterGudang("stok") }} className="reset" src={iconResetFilter} height="15"/>
                            : null
                        }
                    </div>
                : null }
                
            </div>)
            idx++;
        })

        return items;
    }


    render(){
        
        return (
            <div className="laporan-header">
                <div className="back">
                    <Link to="/transaksi">
                        <img src={iconBack} height={20}  className="icon-back" />
                    </Link>
                    <div className="title"> {this.props.title} </div>
                </div>
                
                {
                    this.props.page == "lunas" || this.props.page == "dp" ? 
                        <div className="filters">
                            {this._renderFilters()}
                        </div>
                    : null
                }

                {
                    this.props.page == "gudang"? 
                        <div className="filters">
                            {this._renderFiltersGudang()}
                        </div>
                    : null
                }

                {
                    this.props.page == "lunas" ? 
                    <div className="icon-laporan">
                        <img src={iconLunas} height={20} />
                        <span style={{color:"#023962"}}>Transaksi Lunas</span>
                    </div> : null
                }

                {
                    this.props.page == "dp" ? 
                    <div className="icon-laporan">
                        <img src={iconDP} height={20} />
                        <span style={{color:"#FED460"}}>Transaksi DP</span>
                    </div> : null
                }

                {
                    this.props.page == "gudang" ? 
                    <div className="icon-laporan">
                        <img src={iconGudang} height={20} />
                        <span style={{color:"white"}}>Laporan Gudang</span>
                    </div> : null
                }
                
            </div>
        );
    }
}

export default LaporanHeader;