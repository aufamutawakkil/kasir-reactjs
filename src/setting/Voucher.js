import React from 'react';
import '../style/profile.css';
import '../style/table.css';
import {ToastsContainer, ToastsStore, ToastsContainerPosition} from 'react-toasts';
import iconDelClose from '../assets/icon_del_kategori.png';
import iconEdit from '../assets/icon_edit_kategori.png';
import Helper from '../helper/Helper';
import Dialog from '../compoenents/Dialog';

class Voucher extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            kode:"",
            maxPenggunaan:"",
            nominal:0,
            tipe:"",
            minimalBelanja:0,
            id:0,
            styles:{marginTop:0,contentHeight:0},
            vouchers:[],
            txtBtn:"Simpan",
            isEdit:false,
            kodeEdit:""
        }
    }

   
    componentDidMount(){
        let styles = this.state.styles;
         let winHeight = window.innerHeight;
         let headerHeight = document.getElementsByClassName("setting-header")[0].clientHeight;
         let contentHeight = winHeight - headerHeight;
         styles.contentHeight = contentHeight;
         styles.marginTop = headerHeight;
         this.setState({styles:styles})

        if( localStorage.getItem("vouchers") != null ){
            let vouchers = JSON.parse(localStorage.getItem("vouchers"));
            this.setState({vouchers:vouchers})
        }

        this.refs.dialog.setTitle("Alert !")
        this.refs.dialog.setButtonPositive({
            txt:"OK",
            submit:()=>{ this.refs.dialog.hide() }
        })
    }

    _add=()=>{
        if( this._checkIsSame(this.state.kode) ){
            this.refs.dialog.setMessage("Kode tidak boleh sama")
            this.refs.dialog.show();
            return;
        }

        if( this.state.kode == ""){
            this.refs.dialog.setMessage("Kode tidak boleh kosong")
            this.refs.dialog.show();
            return;
        }

        if( this.state.maxPenggunaan == ""){
            this.refs.dialog.setMessage("Max. Penggunaan tidak boleh kosong")
            this.refs.dialog.show();
            return;
        }

        if( this.state.nominal == "" || this.state.nominal == "0"){
            this.refs.dialog.setMessage("Nominal tidak boleh kosong / 0")
            this.refs.dialog.show();
            return;
        }

        if( this.state.tipe == ""){
            this.refs.dialog.setMessage("Tipe tidak boleh kosong")
            this.refs.dialog.show();
            return;
        }

        if( this.state.minimalBelanja == ""){
            this.refs.dialog.setMessage("Min. Belanja  tidak boleh kosong")
            this.refs.dialog.show();
            return;
        }

        let vouchers = this.state.vouchers;
        let voucher = {
            kode:this.state.kode,
            maxPenggunaan:this.state.maxPenggunaan,
            nominal:this.state.nominal,
            tipe:this.state.tipe,
            minimalBelanja:this.state.minimalBelanja,
            id:Helper.uniqID()
        }

        vouchers.push(voucher)
        localStorage.setItem("vouchers",JSON.stringify(vouchers))
        this.setState({
            kode:"",
            maxPenggunaan:"",
            nominal:0,
            minimalBelanja:0,
            tipe:""
        })

        ToastsStore.success("Berhasil")
    }

    _edit=()=>{
        if( this.state.kode != this.state.kodeEdit && this._checkIsSame(this.state.kode) ){
            this.refs.dialog.setMessage("Kode tidak boleh sama")
            this.refs.dialog.show();
            return;
        }

        if( this.state.kode == ""){
            this.refs.dialog.setMessage("Kode tidak boleh kosong")
            this.refs.dialog.show();
            return;
        }

        if( this.state.maxPenggunaan == ""){
            this.refs.dialog.setMessage("Max. Penggunaan tidak boleh kosong")
            this.refs.dialog.show();
            return;
        }

        if( this.state.nominal == "" || this.state.nominal == "0"){
            this.refs.dialog.setMessage("Nominal tidak boleh kosong / 0")
            this.refs.dialog.show();
            return;
        }

        if( this.state.tipe == ""){
            this.refs.dialog.setMessage("Tipe tidak boleh kosong")
            this.refs.dialog.show();
            return;
        }

        if( this.state.minimalBelanja == ""){
            this.refs.dialog.setMessage("Min. Belanja  tidak boleh kosong")
            this.refs.dialog.show();
            return;
        }

        let vouchers = this.state.vouchers;
        let newVouchers=[];
        vouchers.map(v=>{
            if(v.id == this.state.id){
                v={
                    kode:this.state.kode,
                    maxPenggunaan:this.state.maxPenggunaan,
                    nominal:this.state.nominal,
                    tipe:this.state.tipe,
                    minimalBelanja:this.state.minimalBelanja,
                    id:this.state.id
                }
            }
            newVouchers.push(v);
        })
        localStorage.setItem("vouchers",JSON.stringify(newVouchers))
        this.setState({
            kode:"",
            maxPenggunaan:"",
            nominal:0,
            minimalBelanja:0,
            tipe:"",
            txtBtn:"Simpan",
            isEdit:false,
            kodeEdit:"",
            id:0,
            vouchers:newVouchers
        })

        ToastsStore.success("Berhasil Update")
    }

    _checkIsSame=(kode)=>{
        let isSame=false
        this.state.vouchers.map(v=>{
            if( v.kode == kode ) isSame=true
        })

        return isSame;
    }

    _delVoucher=(item)=>{
        let deletes = JSON.parse(localStorage.getItem("deletes"))
        deletes.vouchers.push(item.id)
        localStorage.setItem("deletes",JSON.stringify(deletes))

        let newV=[];
        this.state.vouchers.map(v=>{
            if( v.id != item.id ){
                newV.push(v)
            }
        })

        this.setState({vouchers:newV},()=>{
            localStorage.setItem("vouchers",JSON.stringify(newV))
            ToastsStore.success("Berhasill di hapus")
        })
    }

    _editVoucher=(v)=>{
        this.setState({
            kode:v.kode,
            maxPenggunaan:v.maxPenggunaan,
            nominal:v.nominal,
            tipe:v.tipe,
            minimalBelanja:v.minimalBelanja,
            id:v.id,
            txtBtn:"Update",
            isEdit:true,
            kodeEdit:v.kode
        })
    }

    _cancel=(v)=>{
        this.setState({
            kode:"",
            maxPenggunaan:"",
            nominal:0,
            tipe:"",
            minimalBelanja:0,
            id:0,
            txtBtn:"Simpan",
            isEdit:false,
            kodeEdit:""
        })
    }

    _renderVouchers=()=>{
        var items = [];
        this.state.vouchers.map(b=>{
        items.push(
            <tr>
                <td>{b.kode}</td>
                <td style={{textAlign:"center"}}>{b.maxPenggunaan}</td>
                <td>{b.tipe}</td>
                <td style={{textAlign:"right"}}>{ b.tipe=="Prosentase" ? b.nominal + "%" : Helper.formatCurrency(b.nominal,"") }</td>
                <td style={{textAlign:"right"}}>{Helper.formatCurrency(b.minimalBelanja,"")}</td>
                <td> 
                    <div className="voucher-action">
                        <img  onClick={ ()=>{ this._editVoucher(b) } } src={iconEdit} height="27" style={{cursor:"pointer"}} />
                        <img  onClick={ ()=>{ this._delVoucher(b) } } src={iconDelClose} height="27" style={{cursor:"pointer"}} />
                    </div>
                </td>
            </tr>
            )
        })
        return items;
    }

    


    render(){
        const h = window.innerHeight - document.getElementsByClassName("setting-header")[0].clientHeight;
        return (
            <div className="profil" style={{height:this.state.styles.contentHeight,marginTop:this.state.styles.marginTop}}>
                <ToastsContainer store={ToastsStore} position={ToastsContainerPosition.TOP_RIGHT} />
              
                <div className="voucher side1">
                    <label>Kode Voucher</label>
                    <input onChange={ (e)=>{ this.setState({kode:e.target.value}) }}  value={this.state.kode} />
                    <label>Jumlah Lembar (Maksimal Penggunaan)</label>
                    <input onChange={ (e)=>{ this.setState({maxPenggunaan:e.target.value}) }} value={this.state.maxPenggunaan} />   
                    <label>Tipe Diskon</label>
                    <select onChange={ (e)=>{ this.setState({ tipe:e.target.value }) } }>
                        <option value=''></option>
                        <option value='Prosentase' selected={this.state.tipe=="Prosentase"} >Prosentase</option>
                        <option value='Amount' selected={this.state.tipe=="Amount"}>Amount</option>
                    </select>   
                    <label>Nominal Diskon</label>
                    <input onChange={ (e)=>{ this.setState({nominal:e.target.value}) }} value={this.state.nominal} />   
                    <label>Minimal Belanja</label>
                    <input onChange={ (e)=>{ this.setState({minimalBelanja:e.target.value}) }} value={this.state.minimalBelanja} />   

                    <div onClick={ ()=>{ !this.state.isEdit ? this._add() : this._edit() } }  className="btn btn-simpan">{this.state.txtBtn}</div>
                    <div onClick={ ()=>{ this._cancel() } }  className="btn btn-batal">Cancel</div>
                </div>

                <div className="voucher side2">
                    <label style={{fontWeight:"bold",color:"#023962"}}>Stok Voucher</label>
                    <table className="table" border="1">
                        <tr>
                            <th>Kode Voucher</th>
                            <th>Lembar</th>
                            <th>Tipe Diskon</th>
                            <th>Diskon</th>
                            <th>Min. Belanja</th>
                            <th>#</th>
                        </tr>
                        {this._renderVouchers()}
                    </table>
                    
                    
                </div>
                <Dialog ref="dialog" />
            </div>
        );
    }
}

export default Voucher;