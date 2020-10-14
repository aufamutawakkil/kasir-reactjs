import React from 'react';
import '../style/profile.css';
import {ToastsContainer, ToastsStore, ToastsContainerPosition} from 'react-toasts';
import Helper from '../helper/Helper';
import Dialog from '../compoenents/Dialog';

class Profile extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            nama:"",
            logo:"",
            alamat:"",
            no_telp:"",
            noteStruk:"",
            password:"",
            oldPassword:"",
            passNew1:"",
            passNew2:"",
            banks:[],
            bank:"",
            bankIcon:"",
            bankId:"",
            updateBankActive:"",
            txtSubmit:"Tambah",
            id:0,
            styles:{contentHeight:0,marginTop:0}
        }
    }

    _simpan=()=>{

        if( this.state.nama == "" ){
            this.refs.dialog.setMessage("Nama Cabang tidak boleh kosong")
            this.refs.dialog.show();
            return;
        }

        if( this.state.alamat == "" ){
            this.refs.dialog.setMessage("Alamat Cabang tidak boleh kosong")
            this.refs.dialog.show();
            return;
        }

        if( this.state.no_telp == "" ){
            this.refs.dialog.setMessage("No. Telp Cabang tidak boleh kosong")
            this.refs.dialog.show();
            return;
        }

        if( this.state.noteStruk == "" ){
            this.refs.dialog.setMessage("Note Struk tidak boleh kosong")
            this.refs.dialog.show();
            return;
        }

        let profile = {};

        //jika ada perubahan pass
        if(this.state.oldPassword!=""){
            if( this.state.password != this.state.oldPassword ){
                this.refs.dialog.setMessage("Password sekarang tidak sesuai");
                this.refs.dialog.show();
                return;
            }

            if( this.state.passNew1 != this.state.passNew2 ){
                this.refs.dialog.setMessage("Password Konfirmasi tidak sesuai");
                this.refs.dialog.show();
                return;
            }

            profile.password = this.state.passNew1;

        }


       
        profile.nama = this.state.nama;
        profile.logo = this.state.logo;
        profile.alamat = this.state.alamat;
        profile.no_telp = this.state.no_telp;
        profile.noteStruk = this.state.noteStruk;
        profile.id = this.state.id;
        localStorage.setItem("profile",JSON.stringify(profile))
        ToastsStore.success("Berhasil")
    }

    componentDidMount(){
        //get UI setting
        let styles = this.state.styles;
        let winHeight = window.innerHeight;
        let headerHeight = document.getElementsByClassName("setting-header")[0].clientHeight;
        let contentHeight = winHeight - headerHeight;
        styles.contentHeight = contentHeight;
        styles.marginTop = headerHeight+7;

        if( localStorage.getItem("profile") != null ){
            let p = JSON.parse(localStorage.getItem("profile"));
            this.setState({
                nama:p.nama,
                logo:p.logo,
                alamat:p.alamat,
                no_telp:p.no_telp,
                noteStruk:p.noteStruk,
                password:p.password,
                id:p.id,
                styles:styles
            })
        }

        if( localStorage.getItem("banks") !== null && localStorage.getItem("banks") !== undefined ){
            let banks = JSON.parse(localStorage.getItem("banks"));
            this.setState({banks:banks})
        }

        this.refs.dialog.setTitle("Alert !")
        this.refs.dialog.setButtonPositive({
            txt:"OK",
            submit:()=>{ this.refs.dialog.hide() }
        })
    }

    _onUploadLogo=(e)=>{
        let file = e.target.files[0];
        this._getBase64(file,(res)=>{
            this.setState({logo:res},()=>{
                this.props.updateLogo(res)
            })
        })
    }

    _getBase64(file, cb) {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            cb(reader.result)
        };
        reader.onerror = function (error) {
            console.log('Error: ', error);
        };
    }

    _startUpdateBank=(b)=>{
        //console.log(b)
        this.setState({
            updateBankActive:b.bank,
            txtSubmit:"Update",
            bank:b.bank,
            bankIcon:b.icon,
            bankId:b.id
        })
    }

    _renderBank=()=>{
        var items = [];
        this.state.banks.map(b=>{
        items.push(
            <div className="bank" onClick={ ()=>{ this._startUpdateBank(b) } } >
                <img  src={b.icon}  height="40" className="icon" />
                <div className="name">{b.bank}</div> 
            </div>
            )
        })
        return items;
    }

    _delBank=()=>{

        let deletes = JSON.parse(localStorage.getItem("deletes"))
        deletes.banks.push(this.state.bankId)
        localStorage.setItem("deletes",JSON.stringify(deletes))
        

        let banks = this.state.banks;let newBanks=[];
        banks.map(b=>{
            if(b.id != this.state.bankId){ //jika bank sama
                newBanks.push(b)
            }
        })
        this.setState({banks:newBanks},()=>{
            localStorage.setItem("banks",JSON.stringify(newBanks))
            this.setState({bank:"",bankIcon:"",bankId:"",updateBankActive:""})
            ToastsStore.success("Berhasil hapus")
        })
    }

    _addBank=()=>{
        let banks = this.state.banks;let newBanks=[];
        if(this.state.bank=="" || this.state.bankIcon==""){
            this.refs.dialog.setMessage("Nama Bank/Icon tidak boleh kosong")
            this.refs.dialog.show();
            return;
        }
        if( this.state.txtSubmit=="Update" ){
            banks.map(b=>{
                if(b.id == this.state.bankId){ //jika bank sama
                    b.id = this.state.bankId
                    b.bank = this.state.bank
                    b.icon = this.state.bankIcon
                }
                newBanks.push(b)
            })
            this.setState({banks:newBanks},()=>{
                localStorage.setItem("banks",JSON.stringify(newBanks))
                this.setState({bank:"",bankIcon:"",bankId:"",updateBankActive:""})
                ToastsStore.success("Berhasil Update")
            })
        }else{
            let bank = {
                bank:this.state.bank,
                icon:this.state.bankIcon,
                id:Helper.uniqID()
            }

            banks.push(bank)
            localStorage.setItem("banks",JSON.stringify(banks))
            this.setState({banks:banks,bank:"",bankIcon:""})
            ToastsStore.success("Berhasil")
        }
    }

    _onUploadIconBank=(e)=>{
        let _this  = this;
        let file = e.target.files[0];
        this._getBase64(file,(res)=>{
            _this.setState({bankIcon:res})
        })
        
    }


    render(){
        return (
            <div className="profil" style={{height:this.state.styles.contentHeight,marginTop:this.state.styles.marginTop}}>
                <ToastsContainer store={ToastsStore} position={ToastsContainerPosition.TOP_RIGHT} />
                <div className="side1">
                    <label>Nama Cabang</label>
                    <input onChange={ (e)=>{ this.setState({nama:e.target.value}) }}  value={this.state.nama} />
                    <label>Logo</label>
                    <input type="file" onChange={this._onUploadLogo}  />
                    <label>Alamat Toko</label>
                    <input onChange={ (e)=>{ this.setState({alamat:e.target.value}) }} value={this.state.alamat} />   
                    <label>No Telp Toko</label>
                    <input onChange={ (e)=>{ this.setState({no_telp:e.target.value}) }} value={this.state.no_telp} />   
                    <label>Note Struk</label>
                    <input onChange={ (e)=>{ this.setState({noteStruk:e.target.value}) }} value={this.state.noteStruk} />   


                    <div style={{marginTop:20,marginBottom:10,fontSize:16,fontWeight:"bold",color:"#023962"}} >Ganti Password</div>
                    <label>Password Sekarang <i>(Kosongkan jika tidak ada perubahan)</i> </label>
                    <input type="password" onChange={ (e)=>{ this.setState({oldPassword:e.target.value}) }} value={this.state.oldPassword} />   
                    <label>Password Baru <i>(Kosongkan jika tidak ada perubahan)</i> </label>
                    <input type="password" onChange={ (e)=>{ this.setState({passNew1:e.target.value}) }} value={this.state.passNew1} />   
                    <label>Ulangi Password Baru <i>(Kosongkan jika tidak ada perubahan)</i></label>
                    <input type="password" onChange={ (e)=>{ this.setState({passNew2:e.target.value}) }} value={this.state.passNew2} />   

                    <div onClick={ ()=>{ this._simpan() } }  className="btn btn-simpan">Simpan</div>
                </div>

                <div className="side2" style={{height:this.state.styles.contentHeight}}>
                    <label style={{fontWeight:"bold",color:"#023962"}}>Pengaturan Transfer Bank</label>
                    {this._renderBank()}
                    <div className="cont-add-bank">
                        <div style={{float:"left"}} className="bank-add">
                            <label>Nama Bank:</label>
                            <input onChange={ (e)=>{ this.setState({bank:e.target.value}) }} value={this.state.bank}  />
                            <label>Logo Bank:</label>
                            <input type="file" onChange={this._onUploadIconBank} />
                        </div>
                        <div className="cont-btn">
                            {
                                this.state.updateBankActive!="" ? 
                                    <div  onClick={ ()=>{this._delBank()} } className="btn btn-batal">Hapus</div>
                                : null
                            }
                            
                        <div className="btn btn-addd" onClick={ ()=>{ this._addBank() } } >{this.state.txtSubmit}</div>
                        </div>
                    </div>
                </div>

                <Dialog ref="dialog" />

            </div>
        );
    }
}

export default Profile;