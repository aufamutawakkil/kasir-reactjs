import React from 'react';
import iconLogout from '../assets/icon_logout.png';
import iconBack from '../assets/icon_back.png';
import iconSearchInvoice from '../assets/icon_search_invoice.png';
import '../style/laporan.css';
import Helper from '../helper/Helper';

class LaporanSide extends React.Component{
    
    constructor(props){
        super(props);
        this.state = {
            profile:{},
            kasir:{},
            icon:"",
            transaksi:[],
            totalTransaksi:0,
            totalOmzet:0,
            totalDP:0,
            totalSisa:0,
            status:"dp",
            styles:{marginTop:0,contentHeight:0}
        }
    }



    _getTotalOmzet=()=>{
        let total = 0;
        if(this.state.transaksi !== null)
            this.state.transaksi.map(t=>{
                
                let totalBelanja = 0;
                if( t.voucher.kode != "" ){
                    let discount = 0;
                    if( t.voucher.tipe == "Pronsentase" ){
                        discount =  (t.subtotal*t.voucher.nominal)/100;
                    }else if( t.voucher.tipe == "Amount" ){
                        discount =  t.voucher.nominal;
                    }
                    totalBelanja = Number(t.subtotal) - discount;
                }else totalBelanja = t.subtotal

                if(this.props.page=="lunas" && t.statusBayar=="Lunas")
                    total = Number(total) + Number(t.total);
                else if(this.props.page=="dp" && t.statusBayar=="DP"){
                    if(this.state.status=="dp" && !t.isLunas)
                        total = Number(total) + Number(totalBelanja);
                    else if(this.state.status=="lunas" && t.isLunas)
                        total = Number(total) + Number(t.subtotal);
                }
                    
                
            })
        console.log("total " + total)
        this.setState({totalOmzet:total})
    }

    _getTotalTransaksi=()=>{
        let total = 0;
        if(this.state.transaksi !== null)
        this.state.transaksi.map(t=>{
            if(this.props.page=="lunas" && t.statusBayar=="Lunas")
                total = Number(total) + 1 
            else if(this.props.page=="dp" && t.statusBayar=="DP"){
                if( this.state.status == "dp" && !t.isLunas)
                    total = Number(total) + 1 
                else if( this.state.status == "lunas" && t.isLunas)
                    total = Number(total) + 1 
            }
                
        })

        this.setState({totalTransaksi:total})
    }

    _getDP=()=>{
        let total = 0;
        if(this.state.transaksi !== null)
        this.state.transaksi.map(t=>{
            if( t.dp > 0 && !t.isLunas)
                total = Number(total) + Number(t.dp)
        })

        this.setState({totalDP:total})
    }

    _getSisa=()=>{ //sisa / lunas
        let total = 0;
        if(this.state.transaksi !== null)
        this.state.transaksi.map(t=>{
            if( this.state.status == "dp" && !t.isLunas && t.dp > 0  && (t.isCancel === undefined || !t.isCancel) )
                total = Number(total) + Number(t.sisa)
            if( this.state.status == "lunas" && t.isLunas && t.dp > 0  && (t.isCancel === undefined) )
                total = Number(t.subtotal)
        })

        this.setState({totalSisa:total})
    }

    refresh=()=>{
        this.setState({
            transaksi:JSON.parse(localStorage.getItem("transaksi"))
        },()=>{
            this._getTotalOmzet();
            this._getTotalTransaksi();
            this._getDP();
            this._getSisa();
        })
        
    }

    componentDidMount(){

        let styles = this.state.styles;
        let winHeight = window.innerHeight;
        let headerHeight = document.getElementsByClassName("laporan-header")[0].clientHeight;
        let contentHeight = winHeight - headerHeight;
        styles.contentHeight = contentHeight;
        styles.marginTop = headerHeight;
        this.setState({styles:styles})

        this.setState({
            transaksi:JSON.parse(localStorage.getItem("transaksi"))
        },()=>{
            this._getTotalOmzet();
            this._getTotalTransaksi();
            if(this.props.page=="dp"){
                this._getDP();
                this._getSisa();
            }
        })
    }

    _changeStatus=(status)=>{
        this.setState({status:status},()=>{
            this.props.changeStatusDP(status);
            this.refresh()
        })
    }

    render(){
        const downloadExcel = this.props.downloadExcel
        const onSearchInvoice = this.props.onSearchInvoice
        return (
            <div className="laporan-side" style={{marginTop:this.state.styles.marginTop,height:this.state.styles.contentHeight}} >
                {
                this.props.page == "lunas" || this.props.page == "dp" ? 
                <div className="item">
                    <div className="header">Total Omzet</div>
                    <div className="value">{Helper.formatCurrency(this.state.totalOmzet)}</div>
                </div>
                : null 
                }
              
                {
                    this.props.page == "dp"  && this.state.status == "dp"  ? 
                        <div>
                            <div className="item">
                                <div className="header">DP</div>
                                <div className="value">{Helper.formatCurrency(this.state.totalDP)}</div>
                            </div>
                        </div>
                    : null
                }

                {
                    this.props.page == "dp" && this.state.status == "dp" ? 
                        <div>
                            <div className="item">
                                <div className="header">Sisa</div>
                                <div className="value">{Helper.formatCurrency(this.state.totalSisa)}</div>
                            </div>
                        </div>
                    : null
                }

            
                {
                    this.props.page == "lunas" || this.props.page == "dp" ? 
                    <div className="item">
                        <div className="header">Transaksi</div>
                        <div className="value">{this.state.totalTransaksi} x</div>
                    </div>
                    : null
                }
                
                
                {
                    this.props.page=="dp" ? 
                    <div className="item-3">
                        <div onClick={()=>{this._changeStatus("dp")}} className={this.state.status == "dp" ? "toggle active" : "toggle"}>DP</div>
                        <div onClick={()=>{this._changeStatus("lunas")}} className={this.state.status == "lunas" ? "toggle active" : "toggle"}>Lunas</div>
                    </div>
                    : null
                }

                <div className="btn-item-produk">
                {
                    this.props.page=="dp" || this.props.page == "lunas" ? 
                        <div className="item-2">
                            <img src={iconSearchInvoice} height="20" /> <input placeholder="Cari Invoice"  onChange={ (e)=>{ onSearchInvoice(e.target.value) } } />
                        </div>
                    : null
                }
                {
                    this.props.page != "pending" ? 
                    <div className="item-2" onClick={ ()=>{ downloadExcel() } }>
                        <span>Download Excel</span>
                    </div>
                    : null
                }
                </div>
                
              


            </div>
        );
    }
}

export default LaporanSide;