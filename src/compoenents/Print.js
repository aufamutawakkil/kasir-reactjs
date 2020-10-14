import React, { useRef } from 'react';
import iconDP from '../assets/icon_dp.png';
import Helper from '../helper/Helper';

class Print extends React.Component {
    
    constructor(props){
        super(props);
        this.state = {
            outlet:{}
        }
    }

    _getDiscount=(cart)=>{
        let discount=0;let tipe="";
        if(cart.discountPros > 0){
          discount=cart.discountPros;
          tipe='pros';
        }
        if(cart.discountAmount > 0){
          discount=cart.discountAmount;
          tipe="amount"
        }
        return {discount:discount,tipe:tipe};
     }

     _getHargaAfterDiscById=(cart)=>{
        let discount=0;let hargaDiscount=0;
        if(cart.discountPros > 0 && Number(cart.qty) >= Number(cart.minBeli) ){
          discount=cart.discountPros;
          hargaDiscount = (cart.hargaJual * discount)/100
        }else if(cart.discountAmount > 0 && Number(cart.qty) >= Number(cart.minBeli) ){
          discount=cart.discountAmount;
          hargaDiscount = cart.hargaJual - discount; 
        }
        let h =  (cart.hargaJual - hargaDiscount);
        return h * cart.qty;
      }

    _renderPrintItems=()=>{
        var items = [];let idx=0;
        this.props.order.items.map(d=>{
          idx++;
          items.push(
            <table style={{width:"100%",fontSize:13}}>
              <tr>
                  <td class='td-num'></td>
                  <td colspan="4" style={{fontWeight:"bold"}}>{d.nama}</td>
              </tr>
              <tr>
                  <td class='td-num'></td>
                  <td>{d.qty}</td>
                  <td>x</td>
                  <td>{Helper.formatCurrency(d.hargaJual,"")}</td>
                  <td><span class='span-diskon'> {this._getDiscount(d).tipe == "pros" && Number(d.qty) >= Number(d.minBeli)  ?  "(Disc  "+this._getDiscount(d).discount+"%)"  : ""} {this._getDiscount(d).tipe == "amount" && Number(d.qty) >= Number(d.minBeli)? "(Disc  "+Helper.formatCurrency(this._getDiscount(d).discount,"")+")" : ""} </span> <span class='span-total'> {Helper.formatCurrency(this._getHargaAfterDiscById(d),"")} </span> </td>
              </tr>
              <tr>
                <td class='td-num'></td>
                <td colspan="4" style={{paddingRight:"10px"}}> {d.note} </td>
              </tr>
          </table>  
          )        
        })

        return items;
    }

    componentDidMount(){
        this.setState({outlet:JSON.parse(localStorage.getItem("profile"))})
    }

    _getPotongan=()=>{
        let potongan = 0;
        if( this.props.order.trxid !== undefined &&  this.props.order.voucher.kode != "" ){
            if( this.props.order.voucher.tipe == "Pronsentase" ){
                potongan =  (this.props.order.subtotal*this.props.order.voucher.nominal)/100;
            }else if( this.props.order.voucher.tipe == "Amount" ){
                potongan =  this.props.order.voucher.nominal;
            }
        }
        console.log("potongnan " + potongan)

        return potongan
    }

    render() {
      return (
        <div className={this.props.isShow ? "paper show" : "paper"}>
            <img src={this.state.outlet.logo} alt="" width='55px'  style={{marginBottom:10,marginTop:10}}/>
            <p class="main-date" style={{fontSize:15}}>{this.props.outlet.nama}</p>
            <p class="main-date" style={{fontSize:13}}>{this.props.order.invoice}</p>
            <p class="main-date" style={{fontSize:10}}>{this.props.order.date} {this.props.order.time}</p>

            <table class='header'>
                <tr>
                    <td><p class="phead">Pembeli</p> <p  class="pcon">{this.props.order.pembeli.nama}</p> </td>
                </tr>
                <tr>
                    <td><p class="phead">No. Hp</p> <p  class="pcon">{this.props.order.pembeli.notelp}</p> </td>
                </tr>
                <tr>
                    <td><p class="phead">Lokasi</p> <p  class="pcon">{this.props.order.pembeli.lokasi}</p> </td>
                </tr>
                <tr>
                    <td><p class="phead">Catatan</p> <p  class="pcon">{this.props.order.pembeli.catatan}</p> </td>
                </tr>
            </table>  

            <p className="line-dash">----------------------------------------</p>
                

            {this._renderPrintItems()}

            <br/> 
            <div class="row" style={{fontSize:13}}>
                <div class="col-no">
                    
                </div>

                <div  className="footer-title" >
                    <b> Subtotal</b>
                </div>
                <div class="col-total-low">
                    <b>{Helper.formatCurrency(this.props.order.subtotal,"")}   </b> 
                </div>
                { 
                    this.props.order.voucher.kode!="" ? 
                    <div>
                        <div  className="footer-title">
                            <b> Voucher ({this.props.order.voucher.kode}) </b>
                        </div>
                        <div class="col-total-low" >
                        <b>-{this.props.order.voucher.tipe=="Prosentase" ? this.props.order.voucher.nominal+"%" : Helper.formatCurrency(this.props.order.voucher.nominal,"")}</b> 
                        </div>
                    </div>
                    : null
                }
                
                {
                    this.props.order.dp > 0 ? 
                        <div>
                            <div className="footer-title">
                                <b> DP </b>
                            </div>
                            <div class="col-total-low">
                                <b>{Helper.formatCurrency(this.props.order.dp,"")}</b> 
                            </div>

                            {
                                this.props.order.sisa == 0 ? 
                                    <div>
                                        <div className="footer-title">
                                            <b> Pelunasan </b>
                                        </div>
                                        <div class="col-total-low">
                                            <b>{Helper.formatCurrency((this.props.order.subtotal -  this.props.order.dp) - this._getPotongan(),"")}</b> 
                                        </div>
                                    </div>
                                : null
                            }

{
                                this.props.order.sisa > 0 ? 
                                    <div>
                                        <div className="footer-title">
                                            <b> Sisa </b>
                                        </div>
                                        <div class="col-total-low">
                                            <b>{Helper.formatCurrency(this.props.order.sisa,"")}</b> 
                                        </div>
                                    </div>
                                : null
                            }

                        
                            
                        </div>
                    : null
                }

                {
                    ((this.props.order.dp > 0 && this.props.order.sisa > 0) || this.props.order.dp == 0) && this.props.order.metodeBayar=="Tunai"
                    ? 
                    <div>
                        <div className="footer-title">
                            <b> Uang </b>
                        </div>
                        <div class="col-total-low">
                            <b>{Helper.formatCurrency(this.props.order.uang,"")}</b> 
                        </div>
                        <div className="footer-title">
                            <b> Kembalian </b>
                        </div>
                        <div class="col-total-low">
                            <b>{Helper.formatCurrency(this.props.order.kembalian,"")}</b> 
                        </div>

                    </div>
                    : null 
                }
            
           
          

              
                <p className="line-dash">--------------------------------------------</p>
                <div className="footer-title" style={{width:"30%"}}>
                    <b className="metodeBayar">{this.props.order.metodeBayar=="Transfer" ? this.props.order.bank.toUpperCase() : "TUNAI"}</b>
                </div>
                <div class="col-total-low" style={{width:"60%",marginTop:5}}>
                    {
                        this.props.order.dp > 0 && this.props.order.sisa <= 0 ? 
                        <b> Total Bayar &nbsp; &nbsp; &nbsp;{Helper.formatCurrency((this.props.order.subtotal - this.props.order.dp)-this._getPotongan(),"")} </b> 
                        : <b> Total Bayar &nbsp; &nbsp; &nbsp;{Helper.formatCurrency(this.props.order.total,"")} </b> 
                    }
                    
                </div>
                
            </div>
            <br/> 
            <p style={{textAlign:"center"}}>{this.props.outlet.alamat}</p>
            <p style={{textAlign:"center"}}>{this.props.outlet.notelp}</p>
            <p style={{textAlign:"center"}}><b> {this.props.outlet.noteStruk} </b></p>
        
        </div>
      );
    }
  }

  export default Print;