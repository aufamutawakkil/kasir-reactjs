import React from 'react';
import '../style/profile.css';
import {ToastsContainer, ToastsStore, ToastsContainerPosition} from 'react-toasts';
import Helper from '../helper/Helper';
import template from '../assets/template.xlsx';
import * as XLSX from 'xlsx';
import moment from 'moment';

class UploadExcel extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            kats:[],
            styles:{contentHeight:0},
            dataParse:[],
            message:"",
            produks:[]
        }
    }

    componentDidMount(){
        //get UI setting
        let styles = this.state.styles;
        let winHeight = window.innerHeight;
        let headerHeight = document.getElementsByClassName("setting-header")[0].clientHeight;
        let contentHeight = winHeight - headerHeight;
        styles.contentHeight = contentHeight;
        styles.marginTop = headerHeight;
        this.setState({
            styles:styles,
            kats:JSON.parse(localStorage.getItem("kategoris")),
            produks:JSON.parse(localStorage.getItem("produks")),
        })
    }

    _upload=(e)=>{
        let _this = this;
        e.preventDefault();

        var files = e.target.files, f = files[0];
        var reader = new FileReader();
        reader.onload = function (e) {
            var data = e.target.result;
            let readedData = XLSX.read(data, {type: 'binary'});
            const wsname = readedData.SheetNames[0];
            const ws = readedData.Sheets[wsname];

            /* Convert array to json*/
            const dataParse = XLSX.utils.sheet_to_json(ws, {header:1});
            //console.log(dataParse)
            _this.setState({dataParse:dataParse})
        };
        reader.readAsBinaryString(f)
    }

    _getKatIdByName=(nama)=>{
        console.log(this.state.kats)
        console.log(nama)
        
        let id = -1;
        this.state.kats.map(k=>{
            if( k.nama.toLowerCase() == nama.toLowerCase() ){
                id = k.id
            }
        })

        return id;
    }

    _checkIsSameKode=(kode)=>{
        let isSame=false;
        if(this.state.produks != null && this.state.produks.length > 0)
            this.state.produks.map(v=>{
                if( v.kode == kode ) isSame=true
            })

        return isSame;
    }

    _checkIsSameBarcode=(barcode)=>{
        let isSame=false;
        if(this.state.produks != null && this.state.produks.length > 0)
            this.state.produks.map(v=>{
                if( v.barcode == barcode ) isSame=true
            })

        return isSame;
    }

    _inputGudang=(produk)=>{
          //tambah laporan ke gudang
          let gudangs = JSON.parse( localStorage.getItem('gudangs') );
          if(gudangs==null) gudangs = [];
          let gudang = {
              produkId:produk.id,
              qty:produk.stok,
              tipe:"Masuk",
              date:moment().format('DD/MM/YYYY'),
              time:moment().format('HH:mm'),
              catatan:"Stok Baru",
              id:Helper.uniqID(),
              kategoriId:produk.kategori
          }
          gudangs.push(gudang)
          localStorage.setItem('gudangs',JSON.stringify(gudangs))
    }

    _startDump=()=>{
        if( this.state.dataParse.length <= 0 ){
            ToastsStore.warning("Belum memilih file")
        }else{
            let produks = [];
            if( localStorage.getItem("produks") !== null )
                produks = JSON.parse(localStorage.getItem("produks"))  
            
            this.state.dataParse.map((d,index)=>{
                console.log(d[3])
                if(d[0]!="nama produk" && d[3]!="kategori harus sesuai dengan nama kategori yang telah di buat di aplikasi, contoh : Phoenix, dan penulisan harus sama"){
                    
                    if(d[3]!==undefined) {
                        let kategori = this._getKatIdByName(d[3]);
                        
                        //cek barcode
                        if( this._checkIsSameBarcode(d[2]) ){
                            let msg = this.state.message;
                            msg += "\nBarcode " + d[2] + " sudah ada dalam database"
                            this.setState({message:msg})
                        }else if( this._checkIsSameKode(d[1]) ){
                            let msg = this.state.message;
                            msg += "\nKode " + d[1] + " sudah ada dalam database"
                            this.setState({message:msg})
                        }else if(kategori==-1){

                            //jika tidak di temukan maka insert kategori
                            let kats = localStorage.getItem("kategoris") == null ? [] : JSON.parse(localStorage.getItem("kategoris"))
                            let kat = {
                                id:Helper.uniqID(),
                                nama:d[3],
                                urutan:1,
                                visible:'yes',
                                date:moment().format("DD/MM/YYYY"),
                                time:moment().format("HH:mm")
                            }
                            if( kats !==  null && kats !== undefined ){
                                
                                kats.push(kat)
                                localStorage.setItem("kategoris",JSON.stringify(kats))

                                //insert produk
                                let id = Helper.uniqID()
                                let p = {
                                    id:id,
                                    nama:d[0],
                                    kode:d[1],
                                    barcode:d[2]===undefined?"":d[2],
                                    kategori:kategori,
                                    hargaJual:d[4],
                                    hargaBeli:d[5],
                                    discountPros:d[6],
                                    discountAmount:d[7],
                                    minBeli:d[8],
                                    stok:d[9],
                                    visible:d[10]
                                }
                                produks.push(p)
                                this._inputGudang(p);
                            }
                            
                            //

                            
                            
                        }else{
                            let id = Helper.uniqID()
                            let p = {
                                id:id,
                                nama:d[0],
                                kode:d[1],
                                barcode:d[2]===undefined?"":d[2],
                                kategori:kategori,
                                hargaJual:d[4],
                                hargaBeli:d[5],
                                discountPros:d[6],
                                discountAmount:d[7],
                                minBeli:d[8],
                                stok:d[9],
                                visible:d[10]
                            }
                            produks.push(p)
                            this._inputGudang(p);
                        }   
                    }

                    
                }
            })

            localStorage.setItem("produks",JSON.stringify(produks))

            ToastsStore.success("Berhasil")

        }
    }


   

    render(){
        return (
            <div className="profil" style={{height:this.state.styles.contentHeight,marginTop:this.state.styles.marginTop}}>
                <ToastsContainer store={ToastsStore} position={ToastsContainerPosition.TOP_RIGHT} />
                <div className="side1">
                    <a href={template}  download className="btn-download-template" > Download Template </a>
                    <label>Upload File Excel</label>
                    <input type="file" onChange={this._upload}  />
                    <div onClick={ ()=>{ this._startDump() } }  className="btn btn-simpan">Upload</div>
                </div>

                <div className="side1">
                    <label>Message</label>
                    <p style={{color:"red",fontWeight:"bold"}}>{this.state.message}</p>
                </div>



            

            </div>
        );
    }
}

export default UploadExcel;