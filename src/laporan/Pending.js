import React,{useRef} from 'react';
import '../style/produk.css';
import '../style/pending.css';
import '../style/table.css';
import '../style/common.css';
import {ToastsContainer, ToastsStore, ToastsContainerPosition} from 'react-toasts';
import Helper from '../helper/Helper';
import iconApprove from '../assets/icon_submit_note.png';
import iconDelete from '../assets/icon_del_kategori.png';
import Dialog from '../compoenents/Dialog';


class Pending extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            pendings:[],
            styles:{marginTop:0,contentHeight:0},
        }
    }
    componentDidMount(){
        
        let styles = this.state.styles;
        let winHeight = window.innerHeight;
        let headerHeight = document.getElementsByClassName("laporan-header")[0].clientHeight;
        let contentHeight = winHeight - headerHeight;
        styles.contentHeight = contentHeight;
        styles.marginTop = headerHeight;

        let pendings = JSON.parse(localStorage.getItem("pendings"));
        this.setState({pendings:pendings,styles:styles})   
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

    _lanjutkan=(b)=>{
        localStorage.setItem("transaksi_pending",JSON.stringify(b))
        window.location.href = window.location.href.replace("/laporan/pending","") + "/transaksi";
    }

    _hapus=(b)=>{
        this.refs.dialog.setMessage("Hapus transaksi ini ? ")
        this.refs.dialog.setButtonPositive({
            txt:"Hapus",
            submit:()=>{
                let pendings = this.state.pendings;
                let newPendings=[];
                for( var i in pendings ){
                    if( pendings[i].pendingId != b.pendingId ){
                        newPendings.push(pendings[i])
                    }
                }
                this.setState({pendings:newPendings},()=>{
                    localStorage.setItem("pendings",JSON.stringify(newPendings))
                })

                this.refs.dialog.hide()
            }
        })
        this.refs.dialog.setButtonNetral({
            txt:"Batal",
            submit:()=>{ this.refs.dialog.hide() }
        })

        this.refs.dialog.show()
    }

    _renderPendings=()=>{
        var items = [];
        this.state.pendings.map(b=>{
        items.push(
            <tr key={b.pendingId} >
                <td style={{textAlign:"center"}}>{b.date} {b.time}</td>
                <td> {b.item}</td>
                <td style={{textAlign:"center"}} className="action-pending">
                    <img src={iconApprove} height="30" onClick={ ()=>{ this._lanjutkan(b) } } />
                    <img src={iconDelete} height="30" onClick={ ()=>{ this._hapus(b) } } />
                </td>
                
            </tr>
            )
        })
        return items;
    }

   


    render(){
        return (
            <div className="laporanpending" style={{height:this.state.styles.contentHeight,marginTop:this.state.styles.marginTop}}>
                <ToastsContainer store={ToastsStore} position={ToastsContainerPosition.TOP_RIGHT} />
                <div style={{overflowY:"scroll",height:this.state.styles.contentHeight-30}}>
                <table className="table" border="1">
                    <tr>
                        <th style={{width:"18%"}} >Tanggal Transaksi</th>
                        <th style={{width:"30%"}}>Item</th>
                        <th style={{width:"10%"}}>#</th>
                    </tr>
                    {this._renderPendings()}
                </table>
                </div>

                <Dialog ref="dialog"  style={{position:"absolute"}} />
           
            </div>
        );
    }
}


export default Pending;