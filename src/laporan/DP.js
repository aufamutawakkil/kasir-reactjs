import React,{useRef} from 'react';
import '../style/produk.css';
import '../style/dp.css';
import '../style/table.css';
import '../style/common.css';
import {ToastsContainer, ToastsStore, ToastsContainerPosition} from 'react-toasts';
import iconDetailProduk from '../assets/icon_produk_detail.png';
import iconPembeli from '../assets/icon_data_pembeli.png';
import iconSortNew from '../assets/icon_sort_new.png';

import iconPlus from '../assets/icon_stok_plus.png';
import iconMin from '../assets/icon_stok_min.png';
import iconClosePopup from '../assets/icon_close_popup.png';
import Helper from '../helper/Helper';
import moment from 'moment';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import ReactToPrint from 'react-to-print';
import Print from '../compoenents/Print';
import Dialog from '../compoenents/Dialog';


class DP extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            katId:0,
            katNama:"",
            produks:[],
            actionActive:"",
            produkActive:{},
            kats:[],
            popupDetailTransaksi:false,
            popupDetailPembeli:false,
            transaksi:[],
            transaksiOri:[],
            transaksiOriLunas:[],
            transaksiOriDP:[],
            transaksiActive:{},

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
            isEdit:false,
            id:-1,
            showPrint:false,
            statusLunas:"",

            outlet:{},
            kasir:{},

            sortTgl:"desc",
            
            trans:"oke",
            styles:{marginTop:0,contentHeight:0},
            filters:[],
            status:""
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

        let isChange=false;let isLunas=false;
        if( localStorage.getItem("transaksi") != null ){
            let p = JSON.parse(localStorage.getItem("transaksi"));
            let trans = [];
            let trxids=[];
            if(p!==undefined && p!== null){
                p.map(t=>{
                    if(t.statusBayar=="DP"){
                        trans.push(t)
                        if( t.history === undefined ){
                            t.history = [];
                            t.history.push(
                                {date:t.date,
                                time:t.time,
                                status:"DP",
                                nominal:t.dp,
                                admin:t.kasir}
                            );
                            trxids.push(t.trxid)
                            isChange=true;
                        }
                    } 
                })

                let newTransLunas=[]
                if( isChange ){
                    if(p!==undefined && p!== null){
                        p.map(t=>{
                            if(t.statusBayar=="Lunas"){
                                newTransLunas.push(t)
                            } 
                        })
                        trans.map(t=>{
                            newTransLunas.push(t)
                        })
                        
                        localStorage.setItem("transaksi",JSON.stringify(newTransLunas));
                    }
                }            
                console.log(trans)
                this.setState({
                    transaksi:trans,transaksiOri:trans,
                    outlet:JSON.parse(localStorage.getItem("profile")),
                    kasir:JSON.parse(localStorage.getItem("kasir")),
                    produks:JSON.parse(localStorage.getItem("produks"))
                },()=>{
                    this.changeStatusDP("dp")
                })
            }else{
                this.setState({transaksi:[],transaksiOri:[]},()=>{
                    console.log("change status dp")
                    this.changeStatusDP("dp")
                })
            }
        }
    }

    _checkIsSameKode=()=>{
        let isSame=false;
        if(this.state.produks != null && this.state.produks.length > 0)
            this.state.produks.map(v=>{
                if( v.kode == this.state.kode ) isSame=true
            })

        return isSame;
    }

    _checkIsSameBarcode=()=>{
        let isSame=false;
        if(this.state.produks != null && this.state.produks.length > 0)
            this.state.produks.map(v=>{
                if( v.barcode == this.state.barcode ) isSame=true
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
            transaksiActive:b,
            popupDetailTransaksi:true
        })
    }

    _pembeli=(b)=>{
        this.setState({
            transaksiActive:b,
            popupDetailPembeli:true
        })
    }

    _renderOrders=()=>{
        var items = [];
        if(this.state.transaksiActive.items !== undefined)
            this.state.transaksiActive.items.map(b=>{
            items.push(
                <tr>
                    <td>{b.nama}</td>
                    <td>{b.note}</td>
                    <td style={{textAlign:"center"}}>{b.qty}</td>
                    <td style={{textAlign:"right"}}>{Helper.formatCurrency(Number(b.hargaJual) * b.qty,"")}</td>
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
        let s = this.state.stokqty;
        s = Number(s) + 1;
        this.setState({stokqty:s})
    }

    _onMin=()=>{
        let s = this.state.stokqty;
        s = Number(s) - 1;
        if( s >= 0 )
            this.setState({stokqty:s})
    }

    _updateStok=(id,addStok)=>{
        let newItems=[];
        this.state.produks.map(p=>{
            if( p.id == id ){
                p.stok = Number(p.stok) + Number(addStok)
                console.log("new stok : " + p.stok)
                this._updateGudang(p,addStok)
            }
            newItems.push(p)
        })
        this.setState({produks:newItems},()=>{
            console.log(newItems)
            localStorage.setItem("produks",JSON.stringify(newItems))
            
        })
    }

    _updateGudang=(produk,stok)=>{
        //tambah laporan ke gudang
        let gudangs = JSON.parse( localStorage.getItem('gudangs') );
        if(gudangs==null) gudangs = [];
        let gudang = {
            produkId:produk.id,
            qty:stok,
            tipe:"Masuk",
            date:moment().format('DD/MM/YYYY'),
            time:moment().format('HH:mm'),
            catatan:"Pembatalan Transaksi",
            id:Helper.uniqID(),
            kategoriId:produk.kategori
        }
        gudangs.push(gudang)
        localStorage.setItem('gudangs',JSON.stringify(gudangs))
    }

    //kembalikan stok transaksi batal
    _stokComeback=(trxid)=>{
        this.state.transaksi.map(t=>{
            if(t.trxid == trxid){
                t.items.map(item=>{
                    this._updateStok(item.id,item.qty)
                })
            }
        })
    }

    _doCancel=()=>{
        let newTrans=[];let newTransDP=[];

        this.refs.dialog.setMessage("Ubah status menjadi Cancel ?");
        this.refs.dialog.setButtonPositive({
            txt:"Ubah",
            submit:()=>{ 
                this.refs.dialog.hide();
                let transaksi = JSON.parse(localStorage.getItem("transaksi"))
                transaksi.map(t=>{
                    if( t.trxid == this.state.transaksiActive.trxid ){
                        t.isCancel = true;
                        t.cancelKasir = this.state.kasir;
                        t.status="Cancel";
                        t.history.push(
                            {
                                date:moment().format("DD/MM/YYYY"),
                                time:moment().format("HH:mm"),
                                status:"Cancel",
                                nominal:0,
                                admin:t.kasir
                            }
                        );
                        this.setState({transaksiActive:t},()=>{
                            this._stokComeback(t.trxid)
                        })
                    }
                    newTrans.push(t)
                    if(t.statusBayar=="DP") newTransDP.push(t)
                })
    
                this.setState({transaksiOri:newTransDP,transaksi:newTransDP},()=>{
                    this.changeStatusDP(this.state.status)
                    localStorage.setItem("transaksi",JSON.stringify(newTrans))
                })
    
                ToastsStore.success("Perubahan Status Berhasil")
            }
        });

        this.refs.dialog.show();
        this.refs.dialog.setButtonNetral({
          txt:"Batal",
          submit:()=>{
            this.refs.dialog.hide();
          }
        })
        
    }

    _renderTransaksi=()=>{
        var items = [];
        this.state.transaksi.map(b=>{
            if(b.item.length > 10) b.item = b.item.substring(0,10) + "...";
        
            //hitung total belanja
            let totalBelanja = 0;let potongan=0;
            if( b.voucher.kode != "" ){
                let discount = 0;
                if( b.voucher.tipe == "Pronsentase" ){
                    discount =  (b.subtotal*b.voucher.nominal)/100;
                }else if( b.voucher.tipe == "Amount" ){
                    discount =  b.voucher.nominal;
                }
                totalBelanja = Number(b.subtotal) - discount;
                potongan = discount;
            }else totalBelanja = b.subtotal
            
        items.push(
            <tr key={b.trxid}>
                <td style={{textAlign:"center"}}>{b.date} {b.time}</td>
                <td><img style={{cursor:"pointer",float:"left"}} onClick={ ()=>{ this._pembeli(b) } } src={iconPembeli} height="20" /> <span style={{display:"table",float:"left",marginLeft:3,marginTop:2}}>{b.pembeli.nama}</span></td>
                <td style={{textAlign:"center"}}>{b.metodeBayar}</td>
                <td style={{textAlign:"center"}}>{b.bank == '-' || b.bank == -1 ? '-' : b.bank }</td>
                <td style={{textAlign:"center",color:b.status == "Cancel" ? "red" : ""}}>{b.status}</td>
                <td style={{textAlign:"right"}}>{Helper.formatCurrency( ( b.dp ) ,"")}</td>
                <td style={{textAlign:"right",color:b.status == "Cancel" ? "red" : ""}}>{Helper.formatCurrency(b.sisa,"")}</td>
                <td style={{textAlign:"right"}}>{Helper.formatCurrency(totalBelanja,"")}</td>
                <td style={{textAlign:"center"}}><img style={{cursor:"pointer",float:"left"}} onClick={ ()=>{ this._detail(b) } } src={iconDetailProduk} height="20" /> <span style={{padding:0,display:"block",float:"left",marginTop:2,marginLeft:3}}>{b.item}..</span></td>
            </tr>
            )
        })
        return items;
    }

    _renderHistory=()=>{
        var items = [];
        if(this.state.transaksiActive.history !== undefined)
        this.state.transaksiActive.history.map(b=>{
        items.push(
            <tr>
                <td style={{textAlign:"center"}}>{b.date} {b.time}</td>
                <td style={{textAlign:"center"}}>{b.status}</td>
                <td style={{textAlign:"right"}}>{Helper.formatCurrency(b.nominal,"")}</td>
                <td>  <span>{b.admin.kode}</span></td>
            </tr>
            )
        })
        return items;
    }

    _doBayar=()=>{

        this.refs.dialog.setMessage("Bayar Lunas ?");
        this.refs.dialog.setButtonPositive({
            txt:"Bayar",
            submit:()=>{ 
                this.refs.dialog.hide();
                let trans = this.state.transaksiActive;let newTrans=[];let newTransDP=[];

                //hitung total belanja
                let potongan=0;
                if( trans.voucher.kode != "" ){
                    if( trans.voucher.tipe == "Pronsentase" ){
                        potongan =  (trans.subtotal*trans.voucher.nominal)/100;
                    }else if( trans.voucher.tipe == "Amount" ){
                        potongan =  trans.voucher.nominal;
                    }
                }
                
                trans.history.push({
                    date:moment().format("DD/MM/YYYY"),
                    time:moment().format("HH:mm"),
                    status:"Lunas",
                    nominal:trans.sisa - potongan,
                    admin:trans.kasir
                })
                trans.sisa = 0;
                trans.isLunas=true;
                let transaksi = JSON.parse(localStorage.getItem("transaksi"))
                transaksi.map(t=>{
                    if( t.trxid == trans.trxid ){
                        t = trans;
                    }
                    newTrans.push(t)
                    if( t.statusBayar=="DP" ) newTransDP.push(t)
                })
                this.setState({transaksiOri:newTransDP,transaksi:newTransDP,popupDetailTransaksi:false},()=>{
                    this.changeStatusDP(this.state.status)
                })
                localStorage.setItem("transaksi",JSON.stringify(newTrans))
                this.props.refresh()
                ToastsStore.success("Pembayaran telah di lunasi");
            }
        })

        this.refs.dialog.show();
        this.refs.dialog.setButtonNetral({
          txt:"Batal",
          submit:()=>{
            this.refs.dialog.hide();
          }
        })

    }

    export=(fileName)=>{

        fileName +=this.state.status+"_"+moment().format("DD_MM_YYY_HH_mm")

        //format excel
        let excelsData = []
        this.state.transaksi.map(t=>{

            let totalBelanja = 0;let potongan=0;
            if( t.voucher.kode != "" ){
                let discount = 0;
                if( t.voucher.tipe == "Pronsentase" ){
                    discount =  (t.subtotal*t.voucher.nominal)/100;
                }else if( t.voucher.tipe == "Amount" ){
                    discount =  t.voucher.nominal;
                }
                totalBelanja = Number(t.subtotal) - discount;
                potongan = discount;
            }else totalBelanja = t.subtotal
            
            excelsData.push({
                "Tanggal Transaksi":t.date+" "+t.time,
                "Nama Pembeli":t.pembeli.nama,
                "Metode Bayar":t.metodeBayar,
                "Bank":t.bank == '-' || t.bank == -1 ? '-' : t.bank ,
                "Status":t.status,
                "DP":Helper.formatCurrency(t.dp,""),
                "Sisa":Helper.formatCurrency(t.sisa,""),
                "Total Belanja":Helper.formatCurrency( totalBelanja ,""),
                "Item":t.item
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

    filter=(filters)=>{
        let tt = this.state.status == "dp" ? this.state.transaksiOriDP : this.state.transaksiOriLunas
        this.setState({transaksi:tt},()=>{
            let transaksi = this.state.transaksi;
            let transaksiFiltered = transaksi;

            for( var i in filters ){

                if( filters[i].value===undefined && filters[i].to != "" ){
                    if(filters[i].tipe=="date"){
                        transaksiFiltered = this._filterByDate( {from:filters[i].from,to:filters[i].to},transaksiFiltered)
                    }
                }
    
                if(filters[i].value !== undefined && filters[i].value != "" ){
                    if(filters[i].title.toLowerCase().includes("status") ){
                        transaksiFiltered =  this._fitlerStatus(filters[i].value,transaksiFiltered)
                    }
                    if(filters[i].title.toLowerCase().includes("pembeli") ){
                        transaksiFiltered =  this._filterPembeli(filters[i].value,transaksiFiltered)
                    }
                    if(filters[i].title.toLowerCase().includes("metode") ){
                         transaksiFiltered =  this._filterMetode(filters[i].value,transaksiFiltered)
                    }
                    if(filters[i].title.toLowerCase().includes("bank") ){
                         transaksiFiltered =  this._filterBank(filters[i].value,transaksiFiltered)
                    }
                }
            }

            this.setState({transaksi:transaksiFiltered,filters:filters})
        })
    }

    _filterMetode=(status,trans)=>{
        let newTrans=[];
        trans.map(t=>{
            if( t.metodeBayar.toLowerCase().includes(status.toLowerCase()) ){
                newTrans.push(t)
            }
        })

        return newTrans;
    }

    _filterBank=(status,trans)=>{
        let newTrans=[];
        trans.map(t=>{
            let bank = t.bank == '-' || t.bank == -1 ? '-' : t.bank;
            if( bank !== undefined && bank.toLowerCase().includes(status.toLowerCase()) ){
                newTrans.push(t)
            }
        })
        return newTrans;
    }

    _fitlerStatus=(status,trans)=>{
        let newTrans=[];
        trans.map(t=>{
            if( t.status.toLowerCase().includes(status.toLowerCase()) ){
                newTrans.push(t)
            }
        })
        return newTrans;
    }

    _filterPembeli=(val,trans)=>{
        let newTrans=[];
        trans.map(t=>{
            if( t.pembeli.nama.toLowerCase().includes(val) ){
                newTrans.push(t)
            }
        })
        return newTrans;
    }

    _filterByDate=(date,trans)=>{
        let newTrans=[];
        trans.map(t=>{
            let from = moment(date.from).format("DD/MM/YYYY");
                from = moment( from,"DD/MM/YYYY").toDate();
            let to   = moment(date.to).format("DD/MM/YYYY");
                to = moment( to,"DD/MM/YYYY").toDate();
            let tgl = moment( t.date,"DD/MM/YYYY").toDate();

            if(Date.parse(tgl) >= Date.parse(from) && Date.parse(tgl) <= Date.parse(to) ){
                newTrans.push(t)
            }
        })

        return newTrans;
    }

    changeStatusDP=(status)=>{
        let trans = this.state.transaksiOri;
        let newTrans=[];
        trans.map(t=>{
            if( status=="dp" && (!t.isLunas) ) newTrans.push(t)
            else if( status=="lunas" && (t.isLunas) ) newTrans.push(t)
        })

        if(status=="dp")
            this.setState({transaksi:newTrans,transaksiOriDP:newTrans,status:status},()=>{
                this.filter(this.state.filters)
            })
        else if(status=="lunas")
            this.setState({transaksi:newTrans,transaksiOriLunas:newTrans,status:status},()=>{
                this.filter(this.state.filters)
            })
    }

    _onSearchInvoice=(val)=>{
        let trans = this.state.transaksiOri;
        let newTrans=[];
        trans.map(t=>{
            if( t.invoice.toLowerCase().includes(val) ){
                newTrans.push(t)
            }
        })
        this.setState({transaksi:newTrans})
    }

    _sortByTgl=()=>{
        let _this = this;
        this.state.transaksi.sort(function(a,b){
            var date1 = moment( a.date+" "+a.time,"DD/MM/YYYY HH:mm"  ).toDate()
            var date2 = moment( b.date+" "+b.time,"DD/MM/YYYY HH:mm"  ).toDate()
            if( _this.state.sortTgl == "desc" ){
                if (date1 > date2)
                    return -1
            }else{
                if (date1 < date2)
                    return -1
            }
            return 0;
          })
          this.setState({transaksi:this.state.transaksi,sortTgl:this.state.sortTgl == "asc" ? "desc" : "asc"})
    }


    _getTotalBelanja=()=>{
        let totalBelanja = 0;
        if( this.state.transaksiActive.trxid !== undefined &&  this.state.transaksiActive.voucher.kode != "" ){
            let discount = 0;
            if( this.state.transaksiActive.voucher.tipe == "Pronsentase" ){
                discount =  (this.state.transaksiActive.subtotal*this.state.transaksiActive.voucher.nominal)/100;
            }else if( this.state.transaksiActive.voucher.tipe == "Amount" ){
                discount =  this.state.transaksiActive.voucher.nominal;
            }
            totalBelanja = Number(this.state.transaksiActive.subtotal) - discount;
        }else totalBelanja = this.state.transaksiActive.subtotal

        return totalBelanja
    }

    _getPotongan=()=>{
        let potongan = 0;
        if( this.state.transaksiActive.trxid !== undefined &&  this.state.transaksiActive.voucher.kode != "" ){
            if( this.state.transaksiActive.voucher.tipe == "Pronsentase" ){
                potongan =  (this.state.transaksiActive.subtotal*this.state.transaksiActive.voucher.nominal)/100;
            }else if( this.state.transaksiActive.voucher.tipe == "Amount" ){
                potongan =  this.state.transaksiActive.voucher.nominal;
            }
        }
        console.log("potongnan " + potongan)

        return potongan
    }


    render(){
        return (
            <div className="laporanlunas" style={{height:this.state.styles.contentHeight,marginTop:this.state.styles.marginTop}}>
                <ToastsContainer store={ToastsStore} position={ToastsContainerPosition.TOP_RIGHT} />
                <div style={{overflowY:"scroll",height:this.state.styles.contentHeight-30}}>
                <table className="table" border="1">
                    <tr>
                        <th style={{width:"15%",cursor:"pointer"}} onClick={ ()=>{this._sortByTgl()} } >Tanggal Transaksi</th>
                        <th style={{width:"25%"}}>Nama Pembeli</th>
                        <th style={{width:"13%"}}>Metode Bayar</th>
                        <th style={{width:"5%"}}>Bank</th>
                        <th style={{width:"5%"}}>Status</th>
                        <th style={{width:"6%"}}>DP</th>
                        <th style={{width:"6%"}}>Sisa</th>
                        <th style={{width:"6%"}}>Total Belanja</th>
                        <th style={{width:"30%"}} >Detail Items</th>
                    </tr>
                    {this._renderTransaksi()}
                </table>
                </div>

                <div className={this.state.popupDetailTransaksi ? 'popup show' : 'popup'}>
                    <div className="toolbar">
                        <span style={{marginTop:5,marginLeft:15,display:"block"}}>Invoice : {this.state.transaksiActive.invoice}</span>
                        <img src={iconClosePopup} height="20" onClick={ ()=>{ this.setState({popupDetailTransaksi:false,showPrint:false}) } } />
                    </div>
                    {
                        !this.state.showPrint ? 
                        <div className="content" style={{height:this.state.styles.contentHeight-90}}>
                    
                        <div className="c-header">
                            <div className="c-h">
                                <div className="c-hh">Tanggal</div>
                                <div> : </div>
                                <div> {this.state.transaksiActive.date} {this.state.transaksiActive.time} </div>
                            </div>
                            {
                                this.state.transaksiActive.pembeli !== undefined && this.state.transaksiActive.pembeli.nama!="-" ? 
                                <div>
                                    <div className="c-h">
                                        <div className="c-hh">Pembeli</div>
                                        <div> : </div>
                                        <div> {this.state.transaksiActive.pembeli !== undefined ? this.state.transaksiActive.pembeli.nama : "-"} ({  this.state.transaksiActive.pembeli !== undefined ?  this.state.transaksiActive.pembeli.notelp : "-"}) </div>
                                    </div>
                                    <div className="c-h">
                                        <div className="c-hh">Lokasi</div>
                                        <div> : </div>
                                        <div> {this.state.transaksiActive.pembeli !== undefined ? this.state.transaksiActive.pembeli.lokasi : "-"} </div>
                                    </div>
                                    <div className="c-h">
                                        <div className="c-hh">Catatan</div>
                                        <div> : </div>
                                        <div> {this.state.transaksiActive.pembeli !== undefined ? this.state.transaksiActive.pembeli.catatan : "-"} </div>
                                    </div>
                                </div>
                                : null
                            }
                            
                            
                        </div>

                        <div className="lp">
                            
                        {
                            this.state.transaksiActive.isLunas  ?
                            <div className="status">
                                <div className="s-status">Transaksi Sukses</div>
                                <div className="s-kasir">Kasir: {this.state.transaksiActive.kasir.kode}</div>
                            </div>
                            : null 
                        }
                        
                        
                        {
                            this.state.transaksiActive.isCancel ? 
                            <div className="status">
                                <div className="s-status batal">Transaksi Batal</div>
                                <div className="s-kasir">Admin: {this.state.transaksiActive.cancelKasir.kode}</div>
                            </div>
                            : null
                        }
                        
                        <table border="1">
                            <tr>
                                <th style={{width:"20%"}} >Tanggal</th>
                                <th style={{width:"10%"}}>Status</th>
                                <th style={{width:"5%"}}>Nominal</th>
                                <th style={{width:"5%"}}>Admin</th>
                            </tr>
                            {this._renderHistory()}
                        </table>
                        </div>

                        <div className="lp">
                            <table border="1">
                                <tr>
                                    <th>Nama Produk</th>
                                    <th>Note</th>
                                    <th>Qty</th>
                                    <th>Total</th>
                                </tr>
                                {this._renderOrders()}
                                <tr className="footer">
                                    <td colSpan={2}>Subtotal</td>
                                    <td colSpan={2}>{Helper.formatCurrency(this.state.transaksiActive.subtotal,"")}</td>
                                </tr>
                                {
                                      this.state.popupDetailTransaksi && this.state.transaksiActive.voucher.kode != "" ? 
                                    <tr className="footer">
                                        <td colSpan={2}>Voucher ({this.state.transaksiActive.voucher.kode})</td>
                                        <td colSpan={2}>-{this.state.transaksiActive.voucher.tipe=="Prosentase" ? this.state.transaksiActive.voucher.nominal+"%" : Helper.formatCurrency(this.state.transaksiActive.voucher.nominal,"")}</td>
                                    </tr>
                                    : null
                                }
                                {
                                    this.state.popupDetailTransaksi  ? 
                                    <tr className="footer">
                                        <td colSpan={2}>DP</td>
                                        <td colSpan={2}>{Helper.formatCurrency(this.state.transaksiActive.dp,"")}</td>
                                    </tr>
                                    : null
                                }
                                {
                                    this.state.transaksiActive.sisa > 0 ? 
                                    <tr className="footer">
                                        <td colSpan={2} style={{color:this.state.transaksiActive.isCancel===undefined || !this.state.transaksiActive.isCancel ? null : "red"}} >Sisa</td>
                                        <td colSpan={2} style={{color:this.state.transaksiActive.isCancel===undefined || !this.state.transaksiActive.isCancel ? null : "red"}}>{Helper.formatCurrency( this.state.transaksiActive.sisa - this._getPotongan(),"")}</td>
                                    </tr>
                                    : null
                                }

                                {
                                    this.state.transaksiActive.sisa <= 0 ? 
                                    <tr className="footer">
                                        <td colSpan={2} >Pelunasan</td>
                                        <td colSpan={2} style={{color:this.state.transaksiActive.isCancel===undefined || !this.state.transaksiActive.isCancel ? null : "red"}}>{Helper.formatCurrency( (this.state.transaksiActive.subtotal - this.state.transaksiActive.dp) - this._getPotongan(),"")}</td>
                                    </tr>
                                    : null
                                }
                               
                                {/*<tr className="footer ttl">
                                    <td colSpan={2}>TOTAL BAYAR</td>
                                    <td colSpan={2}>{Helper.formatCurrency(this.state.transaksiActive.total,"")}</td>
                                </tr>*/}
                                
                                
                                {
                                    this.state.transaksiActive.metodeBayar=="Tunai" && this.state.transaksiActive.dp <= 0 ?
                                    <tr className="footer">
                                        <td colSpan={2}>Uang</td>
                                        <td colSpan={2}>{Helper.formatCurrency(this.state.transaksiActive.uang,"")}</td>
                                    </tr>
                                     : null
                                }

                                 {
                                    this.state.transaksiActive.metodeBayar=="Tunai" && this.state.transaksiActive.dp <= 0 ?
                                    <tr className="footer">
                                        <td colSpan={2}>Kembalian</td>
                                        <td colSpan={2}>{Helper.formatCurrency(this.state.transaksiActive.kembalian,"")}</td>
                                    </tr>
                                    : null
                                }
                                
                                
                            </table>
                           
                           
                        </div>

                        <div  className="visible">

                            <div style={{marginTop:10,clear:'both'}}>
                                {
                                    !this.state.transaksiActive.isLunas? 
                                        <div>
                                            {
                                                this.state.transaksiActive.isCancel === undefined || !this.state.transaksiActive.isCancel ? 
                                                <div>
                                                    <div  onClick={ ()=>{ this._doCancel() } } className="btn btn-batal">Batalkan</div>
                                                    <div  onClick={ ()=>{ this._doBayar() } } className="btn btn-bayar-sisa">Bayar Sisa</div>
                                                </div>
                                                : null
                                            }
                                            
                                        </div>
                                    : null
                                }
                                
                                <div onClick={()=>{ this.setState({showPrint:true}) }} className="btn btn-simpan">Print</div>
                            </div>
                        </div>
                    </div>

                        : null
                    }
                   
                   {
                        this.state.showPrint ? 
                            <div style={{height:this.state.styles.contentHeight-70,overflowY:"auto"}}>
                                <PrintWithBtn order={this.state.transaksiActive} outlet={this.state.outlet}  />
                            </div>
                        : null
                    }
                    
                    
                </div>


                <div className={this.state.popupDetailPembeli ? 'popup show' : 'popup'}>
                    <div className="toolbar">
                        <img src={iconClosePopup} height="20" onClick={ ()=>{ this.setState({popupDetailPembeli:false}) } } />
                    </div>
                    <div className="content">
                        <div className="col-2">
                            <label>Nama Pembeli</label>
                            <span>{this.state.transaksiActive.pembeli !== undefined ? this.state.transaksiActive.pembeli.nama : null}</span>
                        </div>
                        <div className="col-2">
                          <label>No. HP</label>
                          <span>{this.state.transaksiActive.pembeli !== undefined ? this.state.transaksiActive.pembeli.notelp : null}</span>
                        </div>
                        <label>Lokasi</label>
                        <span>{this.state.transaksiActive.pembeli !== undefined ? this.state.transaksiActive.pembeli.lokasi : null}</span>
                        <label>Catatan</label>
                        <span>{this.state.transaksiActive.pembeli !== undefined ? this.state.transaksiActive.pembeli.catatan : null}</span>
                    </div>

                </div>

                <Dialog ref="dialog" />
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

export default DP;