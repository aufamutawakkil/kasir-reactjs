import React from 'react';
import '../style/produk.css';
import '../style/table.css';
import '../style/common.css';
import {ToastsContainer, ToastsStore, ToastsContainerPosition} from 'react-toasts';
import iconDetailProduk from '../assets/icon_produk_detail.png';
import iconSortA from '../assets/icon_sort_a.png';
import iconSortNew from '../assets/icon_sort_new.png';

import iconPlus from '../assets/icon_stok_plus.png';
import iconMin from '../assets/icon_stok_min.png';
import iconClosePopup from '../assets/icon_close_popup.png';
import Helper from '../helper/Helper';
import moment from 'moment';

import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import Dialog from '../compoenents/Dialog';

class Produk extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            katId:0,
            katNama:"",
            produks:[],
            produksOri:[],
            produksFiltered:[],
            actionActive:"",
            produkActive:{},
            kats:[],
            popupAdd:false,

            gudangs:[],

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
            stokNow:0,
            stokNew:0,
            catatan:"",
            visible:"yes",
            isEdit:false,
            id:-1,
            styles:{marginTop:0,contentHeight:0},
            filters:[]
        }
    }

    closePopup(){
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
            stokNow:0,
            stokNew:0,
            catatan:"",
            visible:"yes",
            isEdit:false,
            id:-1,
            popupAdd:false
        })
    }

   
    componentDidMount(){
         //get UI setting
         let styles = this.state.styles;
         let winHeight = window.innerHeight;
         let headerHeight = document.getElementsByClassName("setting-header")[0].clientHeight;
         let contentHeight = winHeight - headerHeight;
         styles.contentHeight = contentHeight;
         styles.marginTop = headerHeight;
         this.setState({styles:styles})
         
        if( localStorage.getItem("kategoris") != null ){
            let k = JSON.parse(localStorage.getItem("kategoris"));
            this.setState({kats:k})
        }

        if( localStorage.getItem("produks") != null ){
            let p = JSON.parse(localStorage.getItem("produks"));
            this.setState({produks:p,produksOri:p})
        }

        if( localStorage.getItem("gudangs") != null ){
            let p = JSON.parse(localStorage.getItem("gudangs"));
            this.setState({gudangs:p})
        }

        this.refs.dialog.setTitle("Alert !")
        this.refs.dialog.setButtonPositive({
            txt:"OK",
            submit:()=>{ this.refs.dialog.hide() }
        })
       

    }

    _add=()=>{

        if(this.state.nama == ""){
            this.refs.dialog.setMessage("Nama tidak boleh kosong")
            this.refs.dialog.show();
            return;
        }

        if(this.state.kode == ""){
            this.refs.dialog.setMessage("Kode tidak boleh kosong")
            this.refs.dialog.show();
            return;
        }


        if(this.state.kategori == ""){
            this.refs.dialog.setMessage("Kategori tidak boleh kosong")
            this.refs.dialog.show();
            return;
        }

        if(this.state.hargaJual == ""){
            this.refs.dialog.setMessage("Harga Jual tidak boleh kosong")
            this.refs.dialog.show();
            return;
        }

        if(this.state.hargaBeli == ""){
            this.refs.dialog.setMessage("Harga Beli tidak boleh kosong, minimal 0")
            this.refs.dialog.show();
            return;
        }

        if(this.state.stokqty == "" || this.state.stokqty == "0"){
            this.refs.dialog.setMessage("Stok tidak boleh kosong dan tidak boleh 0")
            this.refs.dialog.show();
            return;
        }

       


        let produks = this.state.produks == null ? [] : this.state.produks;
        if(produks.length > 0){
            if( this._checkIsSameKode() ){
                this.refs.dialog.setMessage("Kode tidak boleh sama")
                this.refs.dialog.show();
                return;
            }
            if( this._checkIsSameBarcode() ){
                this.refs.dialog.setMessage("Barcode tidak boleh sama")
                this.refs.dialog.show();
                return;
            }
        }
        let id = Helper.uniqID()
        let p = {
            id:id,
            nama:this.state.nama,
            kode:this.state.kode,
            barcode:this.state.barcode,
            kategori:this.state.kategori,
            hargaJual:this.state.hargaJual,
            hargaBeli:this.state.hargaBeli,
            discountPros:this.state.discountPros,
            discountAmount:this.state.discountAmount,
            minBeli:this.state.minBeli,
            stok:this.state.stokqty,
            visible:this.state.visible,
            date:moment().format('DD/MM/YYYY'),
            time:moment().format('HH:mm')
        }
        produks.push(p)
        localStorage.setItem("produks",JSON.stringify(produks))

        //tambah laporan ke gudang
        let gudangs = JSON.parse( localStorage.getItem('gudangs') );
        if(gudangs==null) gudangs = [];
        let gudang = {
            produkId:id,
            qty:this.state.stokqty,
            tipe:"Masuk",
            date:moment().format('DD/MM/YYYY'),
            time:moment().format('HH:mm'),
            catatan:"Stok Baru",
            id:Helper.uniqID(),
            kategoriId:this.state.kategori
        }
        gudangs.push(gudang)
        localStorage.setItem('gudangs',JSON.stringify(gudangs))

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
            popupAdd:false
        })

        ToastsStore.success("Berhasil")
    }

    _edit=()=>{


        //tambah stok ke laporan gudang
        if( this.state.stokNew > 0 ){
            if( this.state.catatan == "" ){
                this.refs.dialog.setMessage("Catatan tidak boleh kosong")
                this.refs.dialog.show();
                return;
            }
            let gudangs = JSON.parse( localStorage.getItem('gudangs') );
            if(gudangs==null) gudangs = [];
            let gudang = {
                produkId:this.state.id,
                qty:this.state.stokNew,
                tipe:"Masuk",
                date:moment().format('DD/MM/YYYY'),
                time:moment().format('HH:mm'),
                catatan:this.state.catatan,
                id:Helper.uniqID(),
                kategoriId:this.state.kategori,
                sisaStok:Number(this.state.stokqty) + Number(this.state.stokNew)
            }
            gudangs.push(gudang)
            localStorage.setItem('gudangs',JSON.stringify(gudangs))
        }

        let produks = this.state.produksOri;let newPoduk=[];
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
                p.stok=Number(this.state.stokqty) + Number(this.state.stokNew)
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
            isEdit:false,
            stokNew:0,
            stokNow:0
        })

        ToastsStore.success("Berhasil")
    }

    _checkIsSameKode=()=>{
        let isSame=false;
        if(this.state.produks != null && this.state.produks.length > 0)
            this.state.produks.map(v=>{
                if(  v.kode == this.state.kode ) isSame=true
            })

        return isSame;
    }

    _checkIsSameBarcode=()=>{
        let isSame=false;
        if(this.state.produks != null && this.state.produks.length > 0)
            this.state.produks.map(v=>{
                if(  (v.barcode!="" &&  this.state.barcode != "") && v.barcode == this.state.barcode ) isSame=true
            })

        return isSame;
    }

    _getLastId=()=>{
        if( this.state.produks == null || this.state.produks.length <= 0 ) return 1;
        else{
            let lastId = this.state.produks[ this.state.produks.length - 1 ].id
            return Number(lastId) + 1;
        }
    }

    _isActionActive=()=>{
        if(this.state.actionActive == "edit" 
            || this.state.actionActive == "del" 
            || this.state.actionActive == "visible")
            return true;
        else return false;
    }

    _detail=(b)=>{
        this.setState({
            nama:b.nama,
            kode:b.kode,
            barcode:b.barcode,
            kategori:b.kategori,
            hargaJual:b.hargaJual,
            hargaBeli:b.hargaBeli,
            discountPros:b.discountPros,
            discountAmount:b.discountAmount,
            minBeli:b.minBeli,
            stokqty:b.stok,
            stokNow:b.stok,
            catatan:"",
            visible:b.visible,
            popupAdd:true,
            isEdit:true,
            id:b.id
        })
    }

    _renderProduks=()=>{
        var items = [];
        this.state.produks.map(b=>{
        items.push(
            <tr>
                <td> <img  style={{cursor:"pointer"}} onClick={ ()=>{ this._detail(b) } } src={iconDetailProduk} height="20" /> {b.nama}</td>
                <td style={{textAlign:"center"}}>{b.kode}</td>
                <td>{b.barcode}</td>
                <td>{this._getKaNametById(b)}</td>
                <td style={{textAlign:"center"}}>{b.discountPros == 0 ? b.discountAmount == 0 ? "-" : b.discountAmount == 0  : b.discountPros + '%' }</td>
                <td style={{textAlign:"center",color:b.stok <= 10 ? "red" : ""}}>{b.stok}</td>
                <td style={{textAlign:"right"}}>{Helper.formatCurrency(b.hargaBeli,"")}</td>
                <td style={{textAlign:"right"}}>{Helper.formatCurrency(b.hargaJual,"")}</td>
                <td style={{textAlign:"center"}}>{b.minBeli}</td>
                <td style={{textAlign:"center"}}>{b.visible}</td>
            </tr>
            )
        })
        return items;
    }

    _activateAction=(action)=>{
        this.setState({
            actionActive: this.state.actionActive == "" ? action : "",
            kategoriActiveId: this.state.actionActive=="" ? "" : this.state.kategoriActiveId
         })
    }

    _del=()=>{
        let deletes = JSON.parse(localStorage.getItem("deletes"))
        deletes.produks.push(this.state.id)
        localStorage.setItem("deletes",JSON.stringify(deletes))

        let newV=[];
        this.state.produksOri.map(v=>{
            if( v.id != this.state.id ){
                newV.push(v)
            }
        })

        this.setState({produks:newV,popupAdd:false},()=>{
            localStorage.setItem("produks",JSON.stringify(newV))
            ToastsStore.success("Hapus berhasil")
        })
    }

    _visible=()=>{
        let newV=[];
        this.state.kategoris.map(v=>{
            if( v.id == this.state.kategoriActiveId ){
                v.visible="no";
            }
            newV.push(v)
        })

        this.setState({kategoris:newV,actionActive:""},()=>{
            localStorage.setItem("kategoris",JSON.stringify(newV))
            ToastsStore.success("Visible berhasil")
        })
    }


    _renderKats=()=>{
        let items=[];
        this.state.kats.map(k=>{
            items.push( <option value={k.id} selected={this.state.kategori == k.id}  >{k.nama}</option> )
        })

        if(this.state.kategori==""){
            let kats = JSON.parse( localStorage.getItem("kategoris") )
            if( kats.length > 0 )
                this.setState({kategori:kats[0].id})
        }

        return items;
    }

    _getKaNametById=(b)=>{
        let kat = "";
        this.state.kats.map(k=>{
            if(k.id == b.kategori) kat = k.nama
        })

        return kat;
    }

    _onPlus=()=>{
        let s = this.state.stokNew;
        s = Number(s) + 1;
        this.setState({stokNew:s})
    }

    _onMin=()=>{
        let s = this.state.stokNew;
        s = Number(s) - 1;
        if( s >= 0 )
            this.setState({stokNew:s})
    }

    _showPopupAdd=()=>{
        this.setState({popupAdd:true})
    }

    export=(fileName)=>{

        //format excel
        let excelsData = []
        this.state.produks.map(t=>{
            excelsData.push({
                "Nama":t.nama,
                "Kode":t.kode,
                "Barcode":t.barcode,
                "Kategori":this._getKaNametById(t) ,
                "Diskon":t.discountPros == 0 ? t.discountAmount == 0 ? "-" : t.discountAmount == 0  : t.discountPros + '%',
                "Stok":t.stok,
                "Harga Beli":t.hargaBeli,
                "Harga Jual":t.hargaJual,
                "Min. Beli":t.minBeli,
                "Visible":t.visible
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

    _filterNamaProduk=(val,produks)=>{
        let newProduks=[];
        produks.map(t=>{
            if( t.nama.toLowerCase().includes(val) ){
                newProduks.push(t)
            }
        })
        return newProduks;
    }

    _filterKaetegori=(val,produks)=>{
        let newProduks=[];
        produks.map(t=>{
            if(this._getKaNametById(t).toLowerCase().includes(val) ){
                newProduks.push(t)
            }
        })
        return newProduks;
    }

    _filterByDate=(date,produks)=>{
        let newProduks=[];
        produks.map(t=>{
            let from = moment(date.from).format("DD/MM/YYYY");
                from = moment( from,"DD/MM/YYYY").toDate();
            let to   = moment(date.to).format("DD/MM/YYYY");
                to = moment( to,"DD/MM/YYYY").toDate();
            let tgl = moment( t.date,"DD/MM/YYYY").toDate();

            console.log( from + " " + to + "  " + tgl )

            if(Date.parse(tgl) >= Date.parse(from) && Date.parse(tgl) <= Date.parse(to) ){
                newProduks.push(t)
            }
        })
        return newProduks;
    }

    filter=(filters)=>{
        this.setState({produks:this.state.produksOri},()=>{
            let produksFiltered = this.state.produks;
            for( var i in filters ){
                if( filters[i].value===undefined && filters[i].to != "" ){
                    if(filters[i].tipe=="date"){
                        produksFiltered = this._filterByDate( {from:filters[i].from,to:filters[i].to},produksFiltered)
                    }
                }
    
                if(filters[i].value !== undefined && filters[i].value != "" ){
                    if(filters[i].title.toLowerCase().includes("kategori") ){
                        produksFiltered =  this._filterKaetegori(filters[i].value,produksFiltered)
                    }
                    if(filters[i].title.toLowerCase().includes("nama") ){
                        produksFiltered =  this._filterNamaProduk(filters[i].value,produksFiltered)
                    }
                }
            }

            this.setState({produks:produksFiltered,filters:filters})
        })
    }


    render(){
        return (
            <div className="produk" style={{height:this.state.styles.contentHeight,marginTop:this.state.styles.marginTop}}>
                <ToastsContainer store={ToastsStore} position={ToastsContainerPosition.TOP_RIGHT} />
                <div style={{overflowY:"scroll",height:this.state.styles.contentHeight-30}}>
                <table className="table" border="1"  >
                    <tr>
                        <th>Nama</th>
                        <th>Kode</th>
                        <th>Barcode</th>
                        <th>Kategori</th>
                        <th>Diskon</th>
                        <th>Stok</th>
                        <th>Harga Beli</th>
                        <th>Harga Jual</th>
                        <th>Min. Beli</th>
                        <th>Visble</th>
                    </tr>
                    {this._renderProduks()}
                </table>
                </div>

                <div className={this.state.popupAdd ? 'popup show' : 'popup'}>
                    <div className="toolbar">
                        <img src={iconClosePopup} height="20" onClick={ ()=>{ this.closePopup()} } />
                    </div>
                    <div className="content">
                        <label>Nama Produk</label>
                        <input value={this.state.nama} onChange={ (e)=>{ this.setState({nama:e.target.value}) } } />
                        <div className="col-1">
                            <div className="col-2">
                                <label>Kode Produk</label>
                                <input value={this.state.kode} onChange={ (e)=>{ this.setState({kode:e.target.value}) } } />
                            </div>
                            <div className="col-2">
                                <label>Barcode</label>
                                <input value={this.state.barcode} onChange={ (e)=>{ this.setState({barcode:e.target.value}) } } />
                            </div>
                        </div>
                        <div className="col-2">
                            <label>Kategori</label>
                            <select onChange={ (e)=>{ this.setState({kategori:e.target.value}) } }>
                                {this._renderKats()}
                            </select>
                        </div>
                        <div className="col-1">
                            <div className="col-2">
                                <label>Harga Jual</label>
                                <input value={this.state.hargaJual} onChange={ (e)=>{ this.setState({hargaJual:e.target.value}) } } />
                            </div>
                            <div className="col-2">
                                <label>Harga Beli</label>
                                <input value={this.state.hargaBeli} onChange={ (e)=>{ this.setState({hargaBeli:e.target.value}) } }/>
                            </div>
                        </div>

                        <div className="col-1">
                            <label>Diskon : </label>
                            <div className="col-2">
                                <div>
                                    <div style={{position:"relative"}}>
                                        <div className="prefix %">%</div>
                                        <input style={{textAlign:"center"}} value={this.state.discountPros} onChange={ (e)=>{ this.setState({discountPros:e.target.value}) } } />
                                    </div>
                                    <div style={{position:"relative",marginTop:5}}>
                                        <div className="prefix rp">Rp</div>
                                        <input style={{textAlign:"center"}} value={this.state.discountAmount} onChange={ (e)=>{ this.setState({discountAmount:e.target.value}) } } />
                                    </div>
                                </div>
                                
                            </div>

                            <div className="col-2">
                                <label>Minimal Beli</label>
                                <input value={this.state.minBeli} onChange={ (e)=>{ this.setState({minBeli:e.target.value}) } } />
                            </div>

                        </div>

                        {
                            this.state.isEdit ? 
                            <div className="col-1" style={{marginTop:10}}>
                                <div className='btn-stok'>Stok <br/> {this.state.stokNow}</div>
                                <div className="cont-stok">
                                    <div className="cont-stok-trans"> 
                                        <span className="txt-tambah-stok">Tambah Stok</span>
                                        <img src={iconMin} height="20" onClick={ ()=>{ this._onMin() } } /> 
                                        <input style={{textAlign:"center"}} className="input-qty" value={this.state.stokNew} onChange={ (e)=>{ this.setState({stokNew:e.target.value}) } } /> 
                                        <img src={iconPlus} height="20" onClick={ ()=>{ this._onPlus() } }/> 
                                    </div>
                                    <textarea placeholder="catatan" value={this.state.catatan} onChange={ (e)=>{ this.setState({catatan:e.target.value}) } } ></textarea>
                                </div>
                            </div>
                            :
                            <div>
                                <label>Stok</label>
                                <input value={this.state.stokqty} onChange={ (e)=>{ this.setState({stokqty:e.target.value}) } } />
                            </div>
                        }
                        
                        

                        <div  className="visible">
                            <div>
                                <input value="yes" checked={ this.state.visible=="yes" ? true : false } className="radio" type="radio" name="visible"  onChange={ (e)=>{ this.setState({visible:e.target.value}) } } />
                                <label>Tampilkan</label>
                                <input checked={ this.state.visible=="no" ? true : false }  value="no" className="radio" type="radio" name="visible" onChange={ (e)=>{ this.setState({visible:e.target.value}) } } />
                                <label>Sembunyikan</label>
                            </div>

                            <div style={{marginTop:10,clear:'both'}}>
                                {
                                    this.state.isEdit ? 
                                        <div  onClick={ ()=>{ this._del() } } className="btn btn-batal">Hapus</div>
                                    : null
                                }
                                
                                <div onClick={ ()=>{ this.state.isEdit ? this._edit() : this._add() } } className="btn btn-simpan">Simpan</div>
                            </div>
                        </div>
                    </div>

                   
                

                </div>

                <Dialog ref="dialog" />
            </div>
        );
    }
}

export default Produk;