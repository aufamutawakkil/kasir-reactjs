import React,{useRef} from 'react';
import '../style/produk.css';
import '../style/lunas.css';
import '../style/table.css';
import '../style/common.css';
import '../style/print.css';
import {ToastsContainer, ToastsStore, ToastsContainerPosition} from 'react-toasts';
import iconDetailProduk from '../assets/icon_produk_detail.png';
import iconPembeli from '../assets/icon_data_pembeli.png';
import iconDetailProdukActive from '../assets/icon_produk_detail_active.png';
import iconSortNew from '../assets/icon_sort_new.png';

import iconPlus from '../assets/icon_stok_plus.png';
import iconMin from '../assets/icon_stok_min.png';
import iconClosePopup from '../assets/icon_close_popup.png';
import Helper from '../helper/Helper';

import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import moment from 'moment';
import ReactToPrint from 'react-to-print';
import Print from '../compoenents/Print';
import {Link} from 'react-router-dom';


class Gudang extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            katId:0,
            katNama:"",
            kats:[],
            produks:[],
            actionActive:"",
            produkActive:{},
            popupDetail:false,
            gudangs:[],
            gudangsOri:[],
            laporans:[],
            laporansOri:[],
            laporansFilterd:[],
            laporanFiltered:[],
            detail:{},

            sortNama:"asc",
            sortKategori:"asc",
            
            stok:0,
            topPosition:0,
            catatan:"",
            styles:{marginTop:0,contentHeight:0}
            
        }
    }

   
    componentDidMount(){
         //get UI setting
         let styles = this.state.styles;
         let winHeight = window.innerHeight;
         let headerHeight = document.getElementsByClassName("laporan-header")[0].clientHeight;
         let contentHeight = winHeight - headerHeight;
         styles.contentHeight = contentHeight;
         styles.marginTop = headerHeight;
         this.setState({styles:styles})

        let gudangs = localStorage.getItem("gudangs") ;
        if( gudangs !== null ){
            let p = JSON.parse(localStorage.getItem("gudangs"));


            //sorting gudang ke yang paling baru
            console.log("start tp sorting...")
            p.sort(function(a,b){
                 //ganti format ke YMD
                let ad = a.date.split("/");
                let aDate = ad[2] + "/" + ad[1] + "/" + ad[0] + " " + a.time;
                aDate = Date.parse(aDate);

                let bd = b.date.split("/");
                let bDate = bd[2] + "/" + bd[1] + "/" + bd[0] + " " + b.time;
                bDate = Date.parse(bDate);

                return bDate - aDate;
            })            

            this.setState({gudangs:p,gudangsOri:p},()=>{
                if( localStorage.getItem("produks") != null ){
                    let produks = JSON.parse(localStorage.getItem("produks"))
                    this.setState({produks:produks},()=>{
                        if( localStorage.getItem("kategoris") != null ){
                            let kategoris = JSON.parse(localStorage.getItem("kategoris"))
                            this.setState({kats:kategoris},()=>{
                                this._olahLaporan()
                            })
                        }

                    })
                }
                
            })
        }else{
            this.setState({gudangsOri:[],gudangs:[]})
        }
    }

    //olah laporan
    _olahLaporan = ()=>{
        let laporans = [];
        this.state.gudangs.map(g=>{
            /*if(this._issetProdukId(g,laporans)){
                let idx = this._getIndexProdukId(g,laporans);
                if( g.tipe == "Masuk" )
                    laporans[idx].totalMasuk = Number(laporans[idx].totalMasuk) + Number(g.qty);
                if(g.tipe == "Keluar")
                    laporans[idx].totalKeluar = Number(laporans[idx].totalKeluar) + Number(g.qty);
            }else{*/
            laporans.push({
                produkId:g.produkId,
                totalMasuk:g.tipe=="Masuk" ? Number(g.qty) : 0,
                totalKeluar:g.tipe=="Keluar" ? Number(g.qty) : 0,
                kategoriId:g.kategoriId,
                updatedAt:g.date+" "+g.time,
                id:g.id,
                sisaStok:g.sisaStok===undefined?0:g.sisaStok
            })
            //}
        })

        this.setState({laporans:laporans,laporansOri:laporans})
        
    }

    _issetProdukId=(laporan,laporans)=>{
        let isExist = false;
        if( laporans.length > 0 )
            for( var i in laporans ){
                if( laporan.produkId == laporans[i].produkId ){
                    isExist=true;
                }
            }
        return isExist;
    }

    _getIndexProdukId=(laporan,laporans)=>{
        let index = -1;
        for( var i in laporans ){
            if( laporan.produkId == laporans[i].produkId ){
                index=i;
            }
        }
        return index;
    }

    _edit=()=>{
        let produks = this.state.produks;let newPoduk=[];
        produks.map(p=>{
            if( p.id == this.state.id ){
                p.nama=this.state.nama
                p.kode=this.state.kode
                p.barcode=this.state.barcode
                p.kategori=this.state.kategori
                p.hargaJual=this.state.hargaJual
                p.hargaBeli=this.state.hargaBeli
                p.discountPros=this.state.discountPros
                p.discountAmount=this.state.discountAmount
                p.minBeli=this.state.minBeli
                p.stok=this.state.stokqty
                p.catatan=this.state.catatan
                p.visible=this.state.visible
            }

            newPoduk.push(p);

        })
        
        localStorage.setItem("produks",JSON.stringify(newPoduk))
        this.setState({
            nama:"",
            kode:"",
            barcode:"",
            kategori:"",
            hargaJual:0,
            hargaBeli:0,
            discountPros:0,
            discountAmount:0,
            minBeli:0,
            stokqty:0,
            catatan:"",
            visible:"yes",
            popupAdd:false,
            id:-1,
            isEdit:false
        })

        ToastsStore.success("Berhasil")
    }


    _detail=(b)=>{
        var doc = document.documentElement;
        var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
        this.setState({
            detail:b,
            popupDetail:true,
            topPosition:top
        })
    }


    _activateAction=(action)=>{
        this.setState({
            actionActive: this.state.actionActive == "" ? action : "",
            kategoriActiveId: this.state.actionActive=="" ? "" : this.state.kategoriActiveId
         })
    }

    _del=()=>{
        let newV=[];
        this.state.produks.map(v=>{
            if( v.id != this.state.id ){
                newV.push(v)
            }
        })

        this.setState({produks:newV,popupAdd:false},()=>{
            localStorage.setItem("produks",JSON.stringify(newV))
            ToastsStore.success("Hapus berhasil")
        })
    }

    _getKaNametById=(b)=>{
        let kat = "";
        this.state.kats.map(k=>{
            if(k.id == b.kategoriId) kat = k.nama
        })

        return kat;
    }

 
    _getHargaNow=(b)=>{
        let harga = 0;
        this.state.produks.map(k=>{
            if(k.id == b.produkId) harga = k.hargaJual
        })

        return harga;
    }

    _getProdukName=(b)=>{
        let name = 0;
        this.state.produks.map(k=>{
            if(k.id == b.produkId) name = k.nama
        })

        return name;
    }

    _onPlus=()=>{
        let s = this.state.stok;
        s = Number(s) + 1;
        this.setState({stok:s})
    }

    _onMin=()=>{
        let s = this.state.stok;
        s = Number(s) - 1;
        if( s >= 0 )
            this.setState({stok:s})
    }

    _renderGudang=()=>{
        var items = [];
        this.state.laporans.map(b=>{
        items.push(
            <tr key={b.id} >
                <td style={{ textAlign: "center" }}>{b.updatedAt}</td>
                <td style={{textAlign:"left"}}> <img  style={{cursor:"pointer"}} onClick={ ()=>{ this._detail(b) } } src={ b.produkId == this.state.detail.produkId ? iconDetailProdukActive : iconDetailProduk} height="20" /> {this._getProdukName(b)}</td>
                <td style={{ textAlign: "center" }}>{this._getKaNametById(b)}</td>
                <td style={{textAlign:"center"}}>{b.totalMasuk}</td>
                <td style={{textAlign:"center"}}>{b.totalKeluar}</td>
                <td style={{textAlign:"center",color:b.sisaStok <= 10 ? "red" : ""}}>{b.sisaStok}</td>
                <td style={{textAlign:"right"}}> {Helper.formatCurrency(this._getHargaNow(b),"")}</td>
            </tr>
            )
        })
        return items;
    }

    export=(fileName)=>{

        //format excel
        let excelsData = []
        this.state.laporans.map(t=>{
            excelsData.push({
                "Nama Produk":this._getProdukName(t),
                "Kategori":this._getKaNametById(t),
                "Barang Masuk":t.totalMasuk,
                "Barang Keluar":t.totalKeluar,
                "Sisa Stok":t.sisaStok,
                "Harga saat ini":this._getHargaNow(t),
            });
        })

        const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const fileExtension = '.xlsx';

        const ws = XLSX.utils.json_to_sheet(excelsData);
        const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], {type: fileType});
        FileSaver.saveAs(data, fileName + fileExtension);
    }

    _filterNama=(val,laporans)=>{
        let newLaporans=[];
        laporans.map(t=>{
            let nama = this._getProdukName(t).toString();
            if( nama.toLowerCase().includes(val) ){
                newLaporans.push(t)
            }
        })
        return newLaporans;
    }

    _filterStok=(val,laporans)=>{
        let newLaporans=[];
        laporans.map(t=>{
            let stok = Number(t.sisaStok);
            if( stok <= val ){
                newLaporans.push(t)
            }
        })
        return newLaporans;
    }

    _filterKategori=(val,laporans)=>{
        let newLaporans=[];
        laporans.map(t=>{
            let katName = this._getKaNametById(t).toString();
            if( katName.toLowerCase().includes(val) ){
                newLaporans.push(t)
            }
        })
        return newLaporans;
    }

    _filterByDate=(date)=>{
        let trans = this.state.transaksiOri;
        let newTrans=[];
        trans.map(t=>{
            let from = moment(Date.parse(date.from)).format("DD/MM/YYYY");
            let to   = moment(Date.parse(date.to)).format("DD/MM/YYYY");
            if(Date.parse(t.date) >= Date.parse(from) && Date.parse(t.date) <= Date.parse(to) ){
                newTrans.push(t)
            }
        })

        

        this.setState({transaksi:newTrans})
    }

    _renderHistory=()=>{
        var items = [];
        if(this.state.gudangs !== undefined)
            this.state.gudangs.map(b=>{
            if( b.produkId == this.state.detail.produkId )
            items.push(
                <tr key={b.id}>
                    <td style={{textAlign:"center"}} >{b.date} {b.time}</td>
                    <td style={{textAlign:"center"}}>-</td>
                    <td style={{textAlign:"center"}}>{b.catatan}</td>
                    <td style={{textAlign:"center"}}>{b.tipe=="Masuk" ? b.qty : "-"}</td>
                    <td style={{textAlign:"center"}}>{ b.tipe == "Keluar" ? b.qty : "-"}</td>
                </tr>
                )
            })
        return items;
    }
    
    _updateStok=()=>{
        if(this.state.stok == "0" || this.state.stok == ""){
            ToastsStore.warning("Stok tidak boleh kosong / 0")
            return;
        }

        if(this.state.catatan == "0" || this.state.catatan == ""){
            ToastsStore.warning("Catatan tidak boleh kosong")
            return;
        }

        //tambah stok ke laporan gudang
        let gudangs = JSON.parse( localStorage.getItem('gudangs') );
        if(gudangs==null) gudangs = [];
        let gudang = {
            produkId:this.state.detail.produkId,
            qty:this.state.stok,
            tipe:"Masuk",
            date:moment().format('DD/MM/YYYY'),
            time:moment().format('HH:mm'),
            catatan:this.state.catatan,
            id:Helper.uniqID(),
            kategoriId:this.state.detail.kategoriId,
            sisaStok: Number(this.state.stok) + Number(this.state.detail.sisaStok)
        }
        gudangs.push(gudang)
        localStorage.setItem('gudangs',JSON.stringify(gudangs))
        

        //update stok produk nya
        let newProducts = [];
        this.state.produks.map(p=>{
            if( p.id == this.state.detail.produkId ){
                p.stok = Number(p.stok) + Number(this.state.stok)
            }
            newProducts.push(p)
        })
        localStorage.setItem('produks',JSON.stringify(newProducts))

        ToastsStore.success("Berhasil")

        //update state
        this.setState({gudangs:gudangs,produks:newProducts,catatan:"",stok:0})
    }

    filter=(filters)=>{
        this.setState({laporans:this.state.laporansOri},()=>{
            let laporans = this.state.laporans;
            let laporanFiltered = laporans;

            for( var i in filters ){

                if( filters[i].value===undefined && filters[i].to != "" ){
                    if(filters[i].tipe=="date"){
                        laporanFiltered = this._filterByDate( {from:filters[i].from,to:filters[i].to},laporanFiltered)
                    }
                }
    
                if(filters[i].value !== undefined && filters[i].value != "" ){
                    if(filters[i].title.toLowerCase().includes("nama") ){
                        laporanFiltered =  this._filterNama(filters[i].value,laporanFiltered)
                    }
                    if(filters[i].title.toLowerCase().includes("kategori") ){
                        laporanFiltered =  this._filterKategori(filters[i].value,laporanFiltered)
                    }
                    if(filters[i].title.toLowerCase().includes("stok") ){
                        laporanFiltered =  this._filterStok(filters[i].value,laporanFiltered)
                    }
                }
            }

            this.setState({laporans:laporanFiltered,filters:filters})
        })
    }

    _sortByNama=()=>{
        let _this = this;
        this.state.laporans.sort(function(a,b){
            if( _this.state.sortNama == "desc" ){
                if (_this._getProdukName(a).toString().toLowerCase() > _this._getProdukName(b).toString().toLowerCase())
                    return -1
            }else{
                if (_this._getProdukName(a).toString().toLowerCase() < _this._getProdukName(b).toString().toLowerCase()  )
                    return -1
            }
            return 0;
          })
          this.setState({laporans:this.state.laporans,sortNama:this.state.sortNama == "asc" ? "desc" : "asc"})
    }

    _sortByKat=()=>{
        let _this = this;
        this.state.laporans.sort(function(a,b){
            if( _this.state.sortKategori == "desc" ){
                if (_this._getKaNametById(a).toString().toLowerCase() > _this._getKaNametById(b).toString().toLowerCase())
                    return -1
            }else{
                if (_this._getKaNametById(a).toString().toLowerCase() < _this._getKaNametById(b).toString().toLowerCase()  )
                    return -1
            }
            return 0;
          })
          this.setState({laporans:this.state.laporans,sortKategori:this.state.sortKategori == "asc" ? "desc" : "asc"})
    }

    render(){
        return (
            <div className="laporanlunas" style={{height:this.state.styles.contentHeight,marginTop:this.state.styles.marginTop}} >
                <ToastsContainer store={ToastsStore} position={ToastsContainerPosition.TOP_RIGHT} />
                <div style={{overflowY:"scroll",height:this.state.styles.contentHeight-30}}>
                <table className="table" border="1">
                    <tr key={"xc"}>
                        <th style={{ width: "10%", cursor: "pointer" }} onClick={() => { this._sortByTgl() }} >Tanggal</th>
                        <th style={{width:"25%",cursor:"pointer"}}  onClick={ ()=>{ this._sortByNama() }} >Nama Produk</th>
                        <th style={{width:"18%",cursor:"pointer"}} onClick={ ()=>{ this._sortByKat() }}>Kategori</th>
                        <th style={{width:"5%"}}>Barang Masuk</th>
                        <th style={{width:"5%"}}>Barang Keluar</th>
                        <th style={{width:"10%"}}>Sisa Stok</th>
                        <th style={{width:"10%"}}>Harga saat ini</th>
                    </tr>
                    {this._renderGudang()}
                </table>
                </div>
                {
                    this.state.popupDetail ? 
                        <div className={ 'popup show'} style={{top:this.state.topPosition}}>
                        <div className="toolbar">
                        <span style={{marginTop:5,marginLeft:15,display:"block"}}>{this._getProdukName(this.state.detail)}</span>
                            <img src={iconClosePopup} height="20" onClick={ ()=>{ this.setState({popupDetail:false,detail:{}}) } } />
                        </div>
                        <div className="content" style={{height:this.state.styles.contentHeight-90}}>
                            <div className="col-1" style={{marginTop:10}}>
                                <span className="txt-tambah-stok" style={{color:"white"}}>Tambah Stok</span>
                                <div className='btn-stok'>Stok <br/> {this.state.detail.sisaStok}</div>
                                <div className="cont-stok">
                                    <div className="cont-stok-trans"> 
                                        <img src={iconMin} height="20" onClick={ ()=>{ this._onMin() } } /> 
                                        <input style={{textAlign:"center"}} className="input-qty" value={this.state.stok} onChange={ (e)=>{ this.setState({stok:e.target.value}) } } /> 
                                        <img src={iconPlus} height="20" onClick={ ()=>{ this._onPlus() } }/> 
                                    </div>
                                    <textarea  style={{height:"43px"}} placeholder="catatan" value={this.state.catatan} onChange={ (e)=>{ this.setState({catatan:e.target.value}) } } ></textarea>
                                </div>
                            </div>
                            <div onClick={ ()=>{ this._updateStok() }} className="btn btn-simpan">Simpan</div>
                            <div className="lp">
                                <span className="txt-tambah-stok" style={{color:"white"}}>History : </span>
                                <table border="1">
                                    <tr>
                                        <th>Tanggal</th>
                                        <th>Invoice</th>
                                        <th>Note</th>
                                        <th>In</th>
                                        <th>Out</th>
                                    </tr>
                                    {this._renderHistory()}
                                </table>
                                
                            
                            
                            </div>
                            
                        </div>
                    
                        

                    </div>

                    : null
                }


            </div>
        );
    }
}

const PrintWithBtn = (props) => {
    const componentRef = useRef();
   
    return (
      <div style={{position:"relative"}}>
        <ReactToPrint
          trigger={() => <button className="btn-cetak">CETAK</button>}
          content={() => componentRef.current}
        />
        <Print style={{marginLeft:"auto",marginRight:"auto"}} isShow={true} order={props.order} outlet={props.outlet} ref={componentRef} />
      </div>
    );
  };

export default Gudang;