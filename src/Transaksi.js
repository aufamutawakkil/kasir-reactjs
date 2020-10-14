import React,{useRef} from 'react';
import './style/App.css';
import './style/transaksi.css';
import './style/header.css';
import './style/print.css';
import iconMin from './assets/icon_min.png';
import iconPlus from './assets/icon_plus.png';
import iconDollarKat from './assets/icon_dollar_kat.png';
import iconPembeli from './assets/icon_data_pembeli.png';
import iconDP from './assets/icon_dp.png';
import iconReset from './assets/icon_reset.png';
import iconTransfer from './assets/icon_transfer.png';
import iconTunai from './assets/icon_tunai.png';
import iconVoucher from './assets/icon_voucher.png';
import iconSearch from './assets/icon_search.png';
import iconMenu from './assets/icon_menu.png';
import iconList from './assets/icon_list_blue.png';
import iconListActive from './assets/icon_list_white.png';
import iconGridActive from './assets/icon_grid_white.png';
import iconGrid from './assets/icon_grid_blue.png';
import iconPaperDP from './assets/icon_paper_dp.png';
import iconGudang from './assets/icon_gudang.png';
import iconLunas from './assets/icon_llunas.png';
import iconNotifP from './assets/icon_notif_p.png';
import iconNotifS from './assets/icon_notif_s.png';
import iconTrashWhite from './assets/icon_trash_white.png';
import iconSubmitNote from './assets/icon_submit_note.png';
import iconCloseCircle from './assets/icon_close_popup.png';
import iconLogout from './assets/icon_logout.png'
import iconSortZ from './assets/icon_sort_z.png';
import iconSortA from './assets/icon_sort_a.png';
import iconSortUrutan from './assets/icon_sort_urutan_transaksi.png';
import Helper from './helper/Helper';
import {ToastsContainer, ToastsStore, ToastsContainerPosition} from 'react-toasts';
import * as moment from 'moment';
import ReactToPrint from 'react-to-print';
import Print from './compoenents/Print';
import {Link} from 'react-router-dom';
import URL from './constans/URL';
import Dialog from './compoenents/Dialog';
import equals from 'equals';

class Transaksi extends React.Component{
    constructor(props){
      super(props);
      this.state = {
        kats:[],
        pin:"",
        vouchers:[],
        kasirs:[],
        voucher:{
          nominal:"0",
          min_belanja:"0",
          kode:"",
        },
        voucherTmp:{
          nominal:"0",
          min_belanja:"0",
          kode:"",
        },
        showPrint:false,
        carts:[],
        products:[],
        productsOri:[],
        selectedKat:{},
        selectedProduct:{},
        kasir:{},
        banks:[],
        bank:{bank:'-'},
        showBank:false,
        showDataPembeli:false,
        showDP:false,
        txtFinish:"FINISH",
        profile:{},
        order:{
          total:0,
          subtotal:0,
          totalItem:0,
          uang:'',
          kembalian:0,
          bank:"-",
          pembeli:{nama:"",notelp:"",lokasi:"",catatan:""},
          metodeBayar:"-",
          sisa:0,
          dp:0,
          voucher:{}
        },
        setting:{
          sort:"A",
          mode:"grid",
          showVoucher:false,
          useVoucher:false,
          showNote:false,
          showCartOpt:false,
          showBayar:false
        },
        outlet:{},
        cartId:"-", //cart yg aktif
        isSync:false,
        isSearch:false,
        styles:{
          contentHeight:0,
          marginTop:0

        },
        cartOptHeight:0
      }


    }

    componentDidMount(){

        //get UI setting
        let styles = this.state.styles;
        let winHeight = window.innerHeight;
        let headerHeight = document.getElementsByClassName("h")[0].clientHeight;
        let contentHeight = winHeight - headerHeight;

        styles.contentHeight = contentHeight;
        styles.marginTop = headerHeight+5;

        //ambil yg visible aja
        let kats = JSON.parse( localStorage.getItem("kategoris") );
        let newKats=[];
        for( var i in kats ){
          if( kats[i].visible=='yes' ) newKats.push(kats[i])
        }        

        this.setState(
          {
            kasir:JSON.parse( localStorage.getItem("kasir") ),
            kasirs:JSON.parse( localStorage.getItem("kasirs") ),
            productsOri:JSON.parse( localStorage.getItem("produks") ),
            products:JSON.parse( localStorage.getItem("produks") ),
            kats:newKats,
            vouchers:JSON.parse( localStorage.getItem("vouchers") ),
            banks:JSON.parse( localStorage.getItem("banks") ),
            outlet:JSON.parse( localStorage.getItem("profile") ),
            styles:styles
          },()=>{
            if( this.state.kats !== undefined && this.state.kats !== null )
              this.setState({selectedKat:this.state.kats[0]})
              this._doSort("A")

              //jika ada transaksi pending yg telah di pilih
              if( localStorage.getItem("transaksi_pending") !== null ){
                let pendings = JSON.parse(localStorage.getItem("transaksi_pending"))
                this.setState({carts:pendings.carts},()=>{
                  this._getTotal();
                  this._getSubTotal();
                  this._getItems();
                })
              }
          })

          let self = this;
          let barcode = "";
  
          window.onkeypress = function(e) {
            let code = e.keyCode ? e.keyCode : e.which;
            barcode=barcode+String.fromCharCode(code);
      
            if (code == "13" ) {
              self._getProdukBarcode(barcode);
              barcode="";
            }
          }

        
    }

    _getProdukBarcode=(barcode)=>{
      let produk = null;
      if(this.state.products !== undefined && this.state.products!==null)
      this.state.productsOri.map(p=>{
        if( p.barcode.trim() == barcode.trim() ){
          produk = p;
        }
      })

      if( produk!=null )
        this._onPlus(produk)

    }


    _renderKategori=()=>{
      var items = [];
      if(this.state.kats !== undefined && this.state.kats !== null)
        this.state.kats.map((s)=>{
            items.push(
                    <div key={s.id} className={s.id == this.state.selectedKat.id ? "list-kat kat-active" : "list-kat"} onClick={this._onKatClick.bind(this,s)}>
                        <div>{s.nama}</div>
                    </div>
                );
        });

      return items;
    }

    _selectCart=()=>{

    }

    _showNote=()=>{
      let set = this.state.setting;
      set.showNote=true;
      this.setState({setting:set})
    }

    _closeNote=()=>{
      let set = this.state.setting;
      set.showNote=false;
      this.setState({setting:set})
    }

    _submitNote=()=>{
      let set = this.state.setting;
      set.showCartOpt=false;
      set.showNote=false;
      this.setState({setting:set})
    }

    _onNote=(val,s)=>{
        let newCarts=[]
        this.state.carts.map(c=>{
          if(c.id==s.id){
            c.note=val;
          }
          newCarts.push(c)
        })

        this.setState({carts:newCarts})
    }

    _showCartOpt=(cart)=>{
      if(this.state.showPrint) return;
     
      let set = this.state.setting;
      set.showCartOpt=true;
      this.setState({setting:set,cartId:cart.id},()=>{
        let cartOptHeight = document.getElementsByClassName("cart-btn-cont")[0].clientHeight
        this.setState({cartOptHeight:(cartOptHeight/2) - 20})
      })
    }

    _closeCartOpt=()=>{
      let set = this.state.setting;
      set.showCartOpt=false;
      this.setState({setting:set})
    }

    _delItemCart=(item)=>{
        let newCarts = [];
        this.state.carts.map(c=>{
          if( c.id != item.id ) newCarts.push(c);
        })

        this.setState({carts:newCarts},()=>{
          this._getTotal();
          this._getSubTotal();
        })
    }

    _renderCart=()=>{
      var items = [];
      this.state.carts.map((s)=>{
          items.push(
            <div key={s.id} className="list-cart"  >
                {
                  this.state.setting.showCartOpt && s.id == this.state.cartId ? 
                    <div className="cart-btn-cont" onClick={ ()=>{ this._closeCartOpt() } }>
                      <div onClick={ ()=>{ this._showNote(s) } } className="cart-btn cart-show-note">
                        <img  style={{marginTop:this.state.cartOptHeight}} src={iconGudang} height="20"/>
                      </div>
                      <div onClick={ ()=>{ this._delItemCart(s) } } className="cart-btn cart-del">
                        <img style={{marginTop:this.state.cartOptHeight}} src={iconTrashWhite} height="20"/>
                      </div>
                  </div>
                  : null
                }
                

                {
                  this.state.setting.showNote && s.id == this.state.cartId ? 
                    <div className="note-cont">
                      <div style={{fontWeight:"bold",color:"#023962"}}>{s.nama}</div>
                      <textarea onChange={ (e)=>{ this._onNote(e.target.value,s) } } value={s.note}  resize="disable" placeholder="tulis catatan disini..." className="note-input" ></textarea>
                      <div style={{float:"right"}}>
                        <img src={iconCloseCircle} height="30" style={{marginTop:5,marginRight:10}} onClick={ ()=>{ this._closeNote() } } />
                        <img src={iconSubmitNote} height="30" style={{marginTop:5}} onClick={ ()=>{ this._submitNote() } } />
                      </div>
                      
                  </div>
                  : null
                }
                
                <div style={{width:100,textAlign:"left"}} onClick={ ()=>{ this._showCartOpt(s) } }>{s.nama}</div>
                <div className="cart-trans">
                    <img onClick={ ()=>{ this._onMin(s) } } src={iconMin} height="25" style={{marginTop:8}}/>
                    <span className="cart-qty">{s.qty}</span>
                    <img  onClick={ ()=>{ this._onPlus(s) } } src={iconPlus} height="25" style={{marginTop:8}}/>
                </div>
                <div className="harga">{ Helper.formatCurrency(s.total_harga,"")}</div>

                <div className="cart-note-disc">
                  {
                    this._getDiscount(s) != 0  && Number(s.qty) >= Number(s.minBeli)? 
                      <div className="cart-disc">Disc {this._getDiscount(s)}</div>
                    : null
                  }
                  
                  {
                    s.note != "" && s.note !== null && s.note != undefined ? 
                      <div className="cart-note">Note: {s.note}</div>
                    : null
                  }
                  
                </div>
                
            </div>
        );
      });

      return items;
    }

    _onSearch=(key)=>{
        this.setState({products:this.state.productsOri},()=>{
          key=key.toLowerCase();
          if( key=="" ){
            this.setState({products:this.state.productsOri,isSearch:false})
          }else{
            let products = [];
            this.state.productsOri.map(p=>{
              if( p.nama.toLowerCase().includes(key) || p.kode.toLowerCase().includes(key) || p.barcode.toLowerCase().includes(key) ){
                products.push(p)
              }
            })
            this.setState({products:products,isSearch:true})
          }
        })
    }

    _getDiscount=(item)=>{
      if( item.discountPros != 0 ) return item.discountPros + "%";
      else if( item.discountAmount != 0 ) return Helper.formatCurrency(item.discountAmount);
      else return 0
    }

    _renderProductsList=()=>{
      var items = [];
      this.state.products.map((s)=>{
          if( (this.state.selectedKat.id == s.kategori) || this.state.isSearch)
              items.push(
                <div key={s.id} className={s.id == this.state.selectedKat.id ? "list-products product-active" : "list-products"}>
                    <div style={{float:"left",fontWeight:"bold"}}>{s.nama}</div>
                    <div className="product-detail">
                        <div className="product-detail-arrow"></div>
                        <div>{s.kode}</div>
                        <div>STOK:{s.stok}</div>
                        
                        {
                          s.discount != 0 ? 
                            <div style={{marginTop:10,color:"#FED460"}}>
                              <div>DISCOUNT: {this._getDiscount(s)}</div>
                              <div>MIN BELI: {s.minBeli}</div>
                            </div>
                          : null
                        }
                    </div>
                    
                    <div className="product-plus" onClick={ ()=>{ this._onPlus(s) } }>
                      +
                    </div>
                    <div style={{float:"right",color:"red",fontWeight:"bold",marginRight:10,marginTop:10}}>{Helper.formatCurrency(s.hargaJual,"")}</div>
                </div>
              );
      });

      return items;
    }

    _renderProductsGrid=()=>{
      var items = [];
      if( this.state.products !== undefined && this.state.products !== null )
      this.state.products.map((s)=>{
          if( (this.state.selectedKat.id == s.kategori)  || this.state.isSearch )
              items.push(
                <div key={s.id} className="list-products-grid" onClick={this._onPlus.bind(this,s)}>
                    <div className="nama">{s.nama}</div>
                    <hr style={{backgroundColor:"#eee",height:2,border:0,width:40,float:"left"}} />
                    {
                      this._getDiscount(s) != 0 ? 
                        <div className="discount-grid">Disc {this._getDiscount(s)}</div>
                      : null
                    }
                    <div className="stok">{s.stok}</div>
                    <div className="harga-grid">{Helper.formatCurrency(s.hargaJual,"")}</div>
                </div>
              );
      });

      return items;
    }

    _getSubTotal=()=>{
      let carts = this.state.carts;
      let total=0;
      for(var i in carts ){
        total = Number(total) + ( Number(carts[i].qty) * Number(this._getHargaAfterDiscById(carts[i]))  )
      }
      let order = this.state.order;
      order.subtotal = total;
      this.setState({order:order})
    }

    _getTotal=()=>{
      let carts = this.state.carts;
      let total=0;
      for(var i in carts ){
          total = Number(total) + ( Number(carts[i].qty) * Number(this._getHargaAfterDiscById(carts[i]))  )
      }
      let order = this.state.order;
      let potongan = "";
      if(this.state.voucher.kode != ""){
        let potonganVoucher = this.state.voucher.tipe == "Prosentase" ? (total*this.state.voucher.nominal)/100 : this.state.voucher.nominal;
        total = total-potonganVoucher;
        potongan = potonganVoucher;
      }
      order.total = total;

      //jika ebayaran DP, maka total menjadi DP tersebut
      if( this.state.order.dp > 0 ){
        order.total = this.state.order.dp;
      }

      this.setState({order:order})
    }

    _getItems=()=>{
      let carts = this.state.carts;
      let total=0;
      for(var i in carts ){
        total +=1;
      }
      let order = this.state.order;
      order.totalItem = total;
      this.setState({order:order})
    }

    _getHargaAfterDiscById=(cart)=>{
      let discount=0;let hargaDiscount=0;
      if(cart.discountPros > 0 && Number(cart.qty) >= cart.minBeli ){
        discount=cart.discountPros;
        hargaDiscount = (cart.hargaJual * discount)/100
      }else if(cart.discountAmount > 0 && Number(cart.qty) >= cart.minBeli ){
        discount=cart.discountAmount;
        hargaDiscount = cart.hargaJual - discount; 
      }
      return cart.hargaJual - hargaDiscount;
    }

    _onPlus=(item)=>{
        if(this.state.showPrint) return
        let carts = this.state.carts;
        let isExists=false;

        if( item.stok ==  0){
          return;
        }

        for(var i in carts ){
          if( carts[i].id == item.id ){
            isExists=true;
            carts[i].qty = Number(carts[i].qty) + 1;
            carts[i].stok = (carts[i].stok) - 1; 
            carts[i].total_harga = Number(this._getHargaAfterDiscById(carts[i])) * Number(carts[i].qty);
          }
        }
        
        if( isExists ){
          this.setState({carts:carts},()=>{
            this._getTotal();
            this._getSubTotal();
            this._getItems();
          })
        }else{
          item.qty=1;
          item.total_harga = this._getHargaAfterDiscById(item);
          item.stok = Number(item.stok) -1;
          if( carts.length <= 0 )
            this.setState({carts:[item]},()=>{
              this._getTotal();
              this._getSubTotal();
              this._getItems();
            })
          else{
            carts.push(item)
            this.setState({carts:carts},()=>{
              this._getTotal();
              this._getSubTotal();
              this._getItems();
            })
          } 
        }

       

    }

    _delCart=(itemId)=>{
      let carts = this.state.carts;
      let newCarts=[];
      for(var i in carts ){
        if( carts[i].id != itemId ){
          newCarts.push(carts[i])
        }
      }
      this.setState({carts:newCarts},()=>{
        this._getTotal();
        this._getSubTotal();
        this._getItems();
      })
    }

    _onMin=(item)=>{
      if(this.state.showPrint) return;

      let carts = this.state.carts;
      let isDel=false;let idxDel=-1;
      for(var i in carts ){
        if( carts[i].id == item.id ){
         
          
          if(Number(carts[i].qty-1) > 0  ){
            carts[i].qty = Number(carts[i].qty) - 1;
            carts[i].stok = Number(carts[i].stok) + 1;
            carts[i].total_harga = Number(this._getHargaAfterDiscById(carts[i])) * Number(carts[i].qty);
          }
        }
      }

        this.setState({carts:carts},()=>{
          this._getTotal();
          this._getSubTotal();
          this._getItems();
        })
      

    }

    _onKatClick=(item)=>{
      this.setState({selectedKat:item})
    }

    _doSort=(s)=>{
      if( this.state.products !== undefined && this.state.products !== null ){
        let setting = this.state.setting;
        setting.sort=s;
        this.setState({setting:setting},()=>{
          if( s=="A" )
            this.state.products.sort(function(a,b){
              var nameA=a.nama.toLowerCase(), nameB=b.nama.toLowerCase()
              if (nameA < nameB) //sort string ascending
                  return -1
              return 0 //default return value (no sorting)
            })
          else   
            this.state.products.sort(function(a,b){
              var nameA=a.nama.toLowerCase(), nameB=b.nama.toLowerCase()
              if (nameA > nameB)
                  return -1
              return 0 //default return value (no sorting)
            })

            this.setState({products:this.state.products})
        })
      }

    }

    _changeMode=(mode)=>{
      let setting = this.state.setting;
      setting.mode=mode;
      this.setState({setting:setting})
    }

    _onInputVoucher=(kode)=>{
      if(kode==""){
        this.setState({voucherTmp:{
          nominal:"0",
          min_belanja:"0",
          kode:"",
        }})
      }

      let isExist=false;let found={}
      this.setState({voucherTmp:{
        nominal:"0",
        min_belanja:"0",
        kode:"",
      }},()=>{
        if(this.state.vouchers!==undefined && this.state.vouchers!==null)
          this.state.vouchers.map(v=>{

            if(v.kode==kode){
              isExist=true;
              found=v;
            }
            
          })

        if(isExist){
          this.setState({voucherTmp:found})
        }else{
          this.setState({voucherTmp:{
            nominal:"0",
            min_belanja:"0",
            kode:"",
          }})
        }

      })
      

    }

    _useVoucher=()=>{
      if(this.state.voucherTmp.kode==""){
        ToastsStore.warning("Kode tidak boleh kosong");
        return;
      }
      if( this.state.voucherTmp.maxPenggunaan <= 0 ){
        ToastsStore.warning("Lembar Voucher sudah habis");
        return;
      }
      if( Number(this.state.order.total) < Number(this.state.voucherTmp.minimalBelanja) ){
        ToastsStore.warning("Minimal Belanja " + Helper.formatCurrency(this.state.voucherTmp.minimalBelanja,"") )
        return;
      }

      console.log("use voucher")
      console.log(this.state.voucherTmp)

      let set = this.state.setting;
      set.useVoucher = true;
      set.showVoucher=false;
      this.setState({setting:set,voucher:this.state.voucherTmp},()=>{
        this._getTotal();
      })
    }

    _showVoucher=()=>{
      if(this.state.showPrint) return;
      let set = this.state.setting;
      set.showVoucher = true;
      this.setState({setting:set})
    }

    _cancelVoucher=()=>{
      let set = this.state.setting;
      set.showVoucher = false;
      set.useVoucher=false;
      this.setState({setting:set,
        voucher:{
          nominal:"0",
          min_belanja:"0",
          kode:"",
        },
        voucherTmp:{
          nominal:"0",
          min_belanja:"0",
          kode:"",
        },
      },()=>{
        this._getTotal()
      })
    }

    _showBayar=()=>{
      if(this.state.showPrint) return
      if(this.state.order.dp > 0){
        let order = this.state.order;
        order.metodeBayar = "Tunai";
        let set = this.state.setting;
        set.showBayar = true;
        this.setState({order:order,showBank:false,setting:set})
      }else{
        let set = this.state.setting;
        set.showBayar = true;
        this.setState({setting:set,showBank:false})
      }
      
    }

    _showBank=()=>{
      if(this.state.showPrint) return
      if(this.state.banks.length <= 0 ){
        ToastsStore.warning("Belum ada bank yang di masukkan")
      }else
        this.setState({showBank:this.state.showBank ? false : true})
      
    }

    _onBayar=(val)=>{ //ketika ngetik di input uang
      let order = this.state.order;
      order.uang = val;
      order.metodeBayar="Tunai";
      this.setState({order:order})
    }

    _bayar=()=>{
      if( Number(this.state.order.uang)  < Number(this.state.order.total)  ){
        ToastsStore.error("Uang Pembeli tidak mencukupi");
      }else{
        let kembalian = Number(this.state.order.uang) - Number(this.state.order.total);
        let order = this.state.order;
        order.kembalian = kembalian;
        let set = this.state.setting;
        set.showBayar=false;
        this.setState({order:order,setting:set})
      } 
    }

    _cancelBayar=()=>{
      let set = this.state.setting;
      set.showBayar=false;
      let order = this.state.order;
      order.uang = 0;
      order.nominal=0;
      order.metodeBayar="-"
      this.setState({setting:set,order:order})
    }

    _onInputPIN=(pin)=>{
      this.setState({pin:pin});
    }

    _loginKasir=()=>{
      let isExist=false;let kasir={};
      if( this.state.kasirs !== null &&  this.state.kasirs !== undefined){
        this.state.kasirs.map(k=>{
          if( k.pin == this.state.pin ){
            isExist=true;
            kasir = k;
            this.setState({kasir:k})
          }
        })
      }

      if(!isExist){
        ToastsStore.error("Login gagal, PIN tidak cocok dengan user manapun")
      }else{
        localStorage.setItem("kasir",JSON.stringify(kasir))
        ToastsStore.success("Berhasil Login ")
      }

    }

    _updateStokProduk=(item)=>{
      let newProduks=[];

      this.state.productsOri.map(b=>{
        if( b.id == item.id ){
          b.stok = Number(b.stok) - item.qty
        }
        newProduks.push(b);
      })
      localStorage.setItem("produks",JSON.stringify(newProduks))
      
    }

    _print=()=>{
      if( this.state.txtFinish=="FINISH" ){
        if( this.state.order.metodeBayar == '-' ){
          ToastsStore.warning("Pilih metode pembayaran")
          return;
        }

        //jika dari transaksi pending, maka hapus transaksi pending tersebut
        if( localStorage.getItem("transaksi_pending")!==null ){
            //remove dari laporan pending
            let pending = JSON.parse(localStorage.getItem("transaksi_pending"));
            let pendingId = pending.pendingId;
            let pendings = JSON.parse(localStorage.getItem("pendings"));
            let newPendings = [];
            for( var i in pendings ){
              console.log(pendings[i].pendingId + " " + pendingId)
              if(pendings[i].pendingId != pendingId){
                newPendings.push(pendings[i])
              }
            }

            localStorage.setItem("pendings",JSON.stringify(newPendings));
            localStorage.removeItem("transaksi_pending")
        }

        //laporang gudang
        let gudangs = JSON.parse( localStorage.getItem('gudangs') );
        if(gudangs==null) gudangs = [];
        this.state.carts.map(c=>{
          //update stok produk
          let gudang = {
              produkId:c.id,
              qty:c.qty,
              tipe:"Keluar",
              date:moment().format('DD/MM/YYYY'),
              time:moment().format('HH:mm'),
              catatan:"Keluar",
              kategoriId:c.kategori,
              id:Helper.uniqID(),
              sisaStok:c.stok
          }

          //update sisa stok
          this._updateStokProduk(c)
          gudangs.push(gudang);
        })

       
        localStorage.setItem('gudangs',JSON.stringify(gudangs))

        let order = this.state.order;
        order.date = moment().format("DD/MM/YYYY");
        order.time = moment().format("HH:mm")
        order.status = "Success";
        order.item = this.state.carts[0].nama;
        order.statusBayar = this.state.order.dp > 0 ? "DP" : "Lunas";
        order.isLunas = this.state.order.dp > 0 ? false : true;
        order.items = this.state.carts;
        order.bank = this.state.bank.bank;
        order.trxid = "#"+Helper.uniqID();
        order.kasir = this.state.kasir;
        order.invoice = this.state.kasir.kode+"-"+moment().format("YYYYMMDDhhmm");
        order.voucher = this.state.voucher
        if( order.pembeli.nama=="" ){
          order.pembeli = {nama:"-",notelp:"",lokasi:"",catatan:""};
        }

        //pengurang lembar voucher 
        let newVouchers = []
        if( this.state.voucher.kode != "" ){
          this.state.vouchers.map(v=>{
            if(v.kode==this.state.voucher.kode){
              v.maxPenggunaan = v.maxPenggunaan - 1;
            }
            newVouchers.push(v)
          })
          this.setState({vouchers:newVouchers},()=>{
            localStorage.setItem("vouchers",JSON.stringify(newVouchers))
          })
        }


        let transaksi  = [];
        let t = localStorage.getItem("transaksi");
        if(t!==null)  transaksi = JSON.parse(t);
        transaksi.push(order);
        localStorage.setItem("transaksi",JSON.stringify(transaksi));
        ToastsStore.success("Transaksi Selesai")
        this.setState({showPrint:true,txtFinish:"RESET"})
      }else{
        this._reset(false);
      }
    
    }

  _getSisaStok=()=>{

  }

    _onSelectBank=(bank)=>{
      let order  = this.state.order;
      order.metodeBayar = "Transfer";
      this.setState({ showBank:false,bank:bank,order:order})
    }

    _renderBank=()=>{
      let items = [];
      if(this.state.banks!==undefined && this.state.banks!==null)
      this.state.banks.map(b=>{
        items.push(
          <div  onClick={ ()=>{ this._onSelectBank(b)  } } className={ this.state.bank.bank == b.bank ? "bank active" : "bank" }>
            <img src={b.icon} height="30" />
            <div style={{marginTop:5}}>{b.bank}</div>
          </div>
        )
      })

      return items;
    }

    _onInputDataPembeli=(c,val)=>{
      let pembeli = this.state.order.pembeli;
      let order = this.state.order;
      if( c=="nama" ){
        pembeli.nama = val;
      } else if( c=="notelp" ){
        pembeli.notelp = val;
      } else if( c=="lokasi" ){
        pembeli.lokasi = val;
      } else if( c=="catatan" ){
        pembeli.catatan = val;
      } 

      order.pembeli = pembeli;
      this.setState({order:order})
    }

    _onSaveDataPembeli=()=>{
      if( (this.state.order.pembeli.nama == "-" || this.state.order.pembeli.nama == "") && this.state.order.pembeli.notelp == "" ){
        ToastsStore.error("Lengkapi salah satu isian Nama/No. telp")
        return;
      }

      this.setState({showDataPembeli:false},()=>{
        ToastsStore.success("Berhasil")
      })
    }

    _onCancelDataPembeli=()=>{
      let pembeli = {nama:"-"}
      let order = this.state.order;
      order.pembeli = pembeli;
      this.setState({order:order,showDataPembeli:false})
    }

    _onInputDP=(dp)=>{
      if( dp!="" ){
        let re = /^[0-9\b]+$/;
        if( re.test(dp) ){
          let order = this.state.order
          let sisa = Number(this.state.order.total) - Number(dp);
          order.sisa = sisa;
          order.dp = dp;
          this.setState({order:order})
        }
      }else{
        let order = this.state.order;
        order.dp = "";
        order.sisa = this.state.order.total;
        this.setState({order:order})
      }

    }

    _onSaveDP=()=>{
      if(this.state.order.pembeli.nama == "-" 
      || this.state.order.pembeli.nama == "" 
      || this.state.order.pembeli.notelp == ""){
        ToastsStore.error("Lengkapi Nama dan No. telp")
        return;
      }

      if(this.state.order.dp <= 0 || this.state.order.dp == ""){
        ToastsStore.error("Lengkapi nominal DP")
        return;
      }

      let set = this.state.setting;
      set.showBayar=false;
      let order = this.state.order;
      order.uang = 0;
      order.nominal=0;
      order.metodeBayar="-"

      this.setState({showDP:false,setting:set,order:order},()=>{
        this._getTotal();
      })
    }

    _onCancelDP=()=>{
      let pembeli = {nama:"-"}
      let order = this.state.order;
      order.pembeli = pembeli;
      order.sisa=0;
      order.dp=0;
      this.setState({order:order,showDP:false})
    }

    _logoutKasir=()=>{

      this.refs.dialog.setMessage("Keluar dari akun kasir ?");
      this.refs.dialog.setButtonPositive({
          txt:"Keluar",
          submit:()=>{ 
            this.setState({kasir:{nama:"-"}},()=>{
              localStorage.setItem("kasir",JSON.stringify({kasir:{nama:"-"}}));
              this.refs.dialog.hide();
            })
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

    _toMenuSetting=()=>{
      if(this.state.kasir.tipe=="Admin") this.props.history.push("/setting");
      else{
        ToastsStore.warning("Anda harus seorang Admin")
      }

    }

    _doSync=()=>{
        let _this = this;
        this.refs.dialog.setMessage("Simpan berkas ke server ?");
        this.refs.dialog.setButtonPositive({
            txt:"Simpan",
            submit:()=>{ 
              this.refs.dialog.hide();
              this.setState({isSync:true})
              const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
                body: JSON.stringify({
                  products:this.state.products,
                  kategoris:this.state.kats,
                  outlet:this.state.outlet,
                  transaksi:JSON.parse( localStorage.getItem("transaksi") ),
                  banks:this.state.banks,
                  vouchers:this.state.vouchers,
                  gudangs:JSON.parse( localStorage.getItem("gudangs") ),
                  deletes:JSON.parse( localStorage.getItem("deletes") ),
                })
            }

            fetch(URL.base + "sync",requestOptions)
            .then(res=>res.json())
            .then(res=>{
              _this.setState({isSync:false},()=>{
                localStorage.setItem("deletes",JSON.stringify( {kategoris:[],produks:[],banks:[],vouchers:[]}));
                ToastsStore.success("Upload data berhasil")
              })
            })
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

    _sortKat=(tipe)=>{
      if(tipe=="A"){
          this.state.kats.sort(function(a,b){
              var nameA=a.nama.toLowerCase(), nameB=b.nama.toLowerCase()
              if (nameA < nameB) //sort string ascending
                  return -1
              return 0 //default return value (no sorting)
            })
            this.setState({kats:this.state.kats})
      }else if(tipe=="Z"){
          this.state.kats.sort(function(a,b){
              var nameA=a.nama.toLowerCase(), nameB=b.nama.toLowerCase()
              if (nameA > nameB)
                  return -1
              return 0 //default return value (no sorting)
            })
            this.setState({kats:this.state.kats})
      }else{
        this.state.kats.sort(function (a, b) {
            if(Number(a.urutan) < Number(b.urutan)) {
                return -1;
            } else if (Number(a.urutan) == Number(b.urutan)) {
                return 0;
            } else {
                return 1;
            }
        });
        this.setState({kats:this.state.kats})
      }
    }

    _savePending=()=>{
        if( this.state.carts <= 0 ){
          ToastsStore.warning("Belum ada transaksi")
          return;
        }
        let pendings =JSON.parse(localStorage.getItem("pendings"));
        if( pendings==null ) pendings = [];
        pendings.push({
          pendingId:Helper.uniqID(),
          item:this.state.carts[0].nama,
          carts:this.state.carts,
          date:moment().format("DD/MM/YYYY"),
          time:moment().format("HH:mm")
        })
        localStorage.setItem("pendings",JSON.stringify(pendings));
        ToastsStore.success("Berhasil Menyimpan ke Pending")
        this.setState({carts:[]})
    }

    _reset=(isPopup)=>{
      if( this.state.carts <= 0 ){
        ToastsStore.error("Belum ada transaksi")
        return;
      }
      if(!isPopup){
        this.setState({
          order:{
            total:0,
            subtotal:0,
            totalItem:0,
            uang:'',
            kembalian:0,
            bank:"-",
            pembeli:{nama:"-",notelp:"",lokasi:"",catatan:""},
            metodeBayar:"-",
            sisa:0,
            dp:0
          },showPrint:false,carts:[],txtFinish:"FINISH",
          voucher:{
            nominal:"0",
            min_belanja:"0",
            kode:"",
          },
          voucherTmp:{
            nominal:"0",
            min_belanja:"0",
            kode:"",
          },
        },()=>{
          window.location.reload();
          localStorage.removeItem("transaksi_pending")
        })
      }else{
        this.refs.dialog.setMessage("Reset Transaksi ?");
        this.refs.dialog.setButtonPositive({
            txt:"Reset",
            submit:()=>{ 
              this.refs.dialog.hide();
              this.setState({
                order:{
                  total:0,
                  subtotal:0,
                  totalItem:0,
                  uang:'',
                  kembalian:0,
                  bank:"-",
                  pembeli:{nama:"-",notelp:"",lokasi:"",catatan:""},
                  metodeBayar:"-",
                  sisa:0,
                  dp:0
                },showPrint:false,carts:[],txtFinish:"FINISH",
                voucher:{
                  nominal:"0",
                  min_belanja:"0",
                  kode:"",
                },
                voucherTmp:{
                  nominal:"0",
                  min_belanja:"0",
                  kode:"",
                },
              },()=>{
                window.location.reload();
                localStorage.removeItem("transaksi_pending")
              })
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

      
      
    }

    _getTotalPendings = ()=>{
      if( localStorage.getItem("pendings") !== null ){
        let p =  JSON.parse(localStorage.getItem("pendings"))
        return p.length
      }else return 0
    }
    
    _showPembeli=()=>{
      if(this.state.showPrint) return;
      else this.setState({showDataPembeli:true })
    }

    _showDP=()=>{
      if(this.state.showPrint) return;
      this.setState({showDP:true})
    }

    _cancelBayarTransfer=()=>{
      let order  = this.state.order;
      order.metodeBayar = "-";
      this.setState({showBank:false,order:order,bank:{bank:"-"}})
    }

     render(){
        return (
            <div className="App">
              
              <header className="h">
                
                <div className="h-section h-nama-kasir">
                  <img  onClick={ ()=>{ this._toMenuSetting() } } height="18" style={{marginLeft:10,marginTop:15}}  className="h-menu" src={iconMenu}  />
                  
                  <p className="nama-kasir"> {this.state.kasir !== null ? this.state.kasir.nama : null}</p>
                </div>

                <div className="h-section h-search">
                  <img  height="20" src={iconSearch} style={{marginTop:5,marginLeft:5}}/>
                  <input onChange={ (e)=>{ this._onSearch(e.target.value) } }  placeholder="Cari Produk atau kode" style={{width:"85%"}} />
                </div>

                <div className="h-section h-toggle-sort" >
                  <div onClick={ ()=>{this._doSort("A") } } className={this.state.setting.sort=="A" ? "sort sort-a sort-active" : "sort sort-z" }>A</div>
                  <div onClick={ ()=>{this._doSort("Z") } } className={this.state.setting.sort=="Z" ? "sort sort-z sort-active" : "sort sort-z"}>Z</div>
                </div>

                <div className="h-section h-toggle-mode" >
                  <div  onClick={ ()=>{ this._changeMode("list") } } className={this.state.setting.mode == "list" ? "mode list mode-active" : "mode list"}>
                    <img height="18" src={ this.state.setting.mode == "list" ?  iconListActive : iconList } style={{marginTop:5}} />
                  </div>
                  <div onClick={ ()=>{ this._changeMode("grid") } } className={this.state.setting.mode == "grid" ? "mode grid mode-active" : "mode grid"}>
                    <img height="18" src={ this.state.setting.mode == "grid" ?  iconGridActive : iconGrid } style={{marginTop:5}} />
                  </div>
                </div>

                <div className="h-section h-sync" onClick={ ()=>{ this._doSync() } } >
                    {this.state.outlet.nama}
                </div>

                <div className="h-section h-tipe" >
                  <Link to="/laporan/gudang">
                    <div className="tipe" >
                      <img height="20" className="h-menu" src={iconGudang} />
                      <span style={{color:"#fff"}}> Gudang </span>
                    </div>
                  </Link>
                  <Link to="/laporan/dp">
                    <div className="tipe">
                      <img height="20" className="h-menu" src={iconPaperDP} />
                      <span style={{color:"#FED460"}}> DP </span>
                    </div>
                  </Link>
                  <Link to="/laporan/lunas">
                    <div className="tipe">
                      <img height="20" className="h-menu" src={iconLunas} />
                      <span style={{color:"#123A58"}}> Lunas </span>
                    </div>
                  </Link>
                </div>

                <div className="h-section h-notif" >
                    <img height="35" className="notif notif-p" src={iconNotifP} onClick={ ()=>{ this.props.history.push("/laporan/pending") } }   />
                    {
                      Number(this._getTotalPendings()) > 0 ? 
                        <div className="total-pending"> {this._getTotalPendings()} </div>
                      : null
                    }
                    <img height="35" className="notif notif-s" src={iconNotifS} onClick={ ()=>{ this._savePending() } } />
                    <img onClick={ ()=>{ this._logoutKasir() } } height="20" src={iconLogout}  className="notif-logout"  />
                </div>


              </header>
              {
                this.state.isSync ? 
                 <div style={{top:this.state.styles.marginTop}} className="doing-sync">Sedang melakukan upload data, jangan melakukan transaksi apapun ...</div>
                : null
              }
              <ToastsContainer store={ToastsStore} position={ToastsContainerPosition.TOP_RIGHT} />
              <div>
                
                <div style={{height:this.state.styles.contentHeight,marginTop:this.state.styles.marginTop}} className="sideleft">
                  <p style={{fontWeight:"bold"}}>Kategori</p>
                  
                  <div className="cont-kategori">
                    {this._renderKategori()}
                  </div>
                  
                  <div className="cont-sort">
                    <img  src={iconSortUrutan} height="40" onClick={ ()=>{ this._sortKat("urutan") } }  />
                    <img  src={iconSortA} height="40" onClick={ ()=>{ this._sortKat("A") } }  />
                    <img  src={iconSortZ} height="40" onClick={ ()=>{ this._sortKat("Z") } } />
                  </div>

                </div>

                <div style={{height:this.state.styles.contentHeight,marginTop:this.state.styles.marginTop}} className="sidecenter">
                  {
                    !this.state.showPrint ?
                    <div style={{paddingBottom:100}}>
                      { this.state.setting.mode == "list" ?  this._renderProductsList() : this._renderProductsGrid()}
                    </div>
                     : null 
                  }

                  {
                    this.state.showPrint ? 
                      <PrintWithBtn order={this.state.order} outlet={this.state.outlet}  />
                    : null
                  }

                </div>

                <div style={{height:this.state.styles.contentHeight,marginTop:this.state.styles.marginTop}} className="sideright">
                  <div class='sideright-h'>
                    <div className="sr datapembeli" onClick={()=>{ this.state.carts.length <= 0 ?  ToastsStore.error("Belum ada Transaksi") :  this._showPembeli() }}>
                      <img height="20" style={{marginTop:8,float:"left",marginLeft:10}} src={iconPembeli} />
                      <span> Data Pembeli </span>
                    </div>
                    <div className="sr">
                      <img height="40" src={iconVoucher}  onClick={ ()=>{  this.state.carts.length <= 0 ? ToastsStore.error("Belum ada Transaksi") :  this._showVoucher() } } />

                      {
                        (this.state.setting.showVoucher) ? 
                          <div className="use-voucher">
                            <div className="voucher-arrow"></div>
                            <span>Kode Voucher :</span>
                            <input  value={this.state.voucherTmp.kode!=="" ? this.state.voucherTmp.kode : null } onChange={ (e)=>{ this._onInputVoucher(e.target.value) } }  className="input-voucher" />
                            <span>Potongan  &nbsp; : { this.state.voucherTmp.tipe == "Prosentase" ?  this.state.voucherTmp.nominal+"%" : Helper.formatCurrency(this.state.voucherTmp.nominal,"") }</span><br/>
                            <span>Min Belanja : {Helper.formatCurrency(this.state.voucherTmp.minimalBelanja,"")}</span>
                            <div>
                              <div className="btn-voucher btn-voucher-batal"  onClick={()=>{ this._cancelVoucher() }}>Batal</div>
                              <div className="btn-voucher btn-voucher-use" onClick={()=>{ this._useVoucher() }}>Gunakan</div>
                            </div>
                          </div>
                        : null
                      }
                      

                    </div>
                    <div className="sr">
                      <img height="40" width="40" src={iconDP} onClick={()=>{ this.state.carts.length <= 0 ? ToastsStore.error("Belum ada Transaksi") : this._showDP()}}/>
                    </div>
                    <div className="sr">
                      <img height="40"  src={iconReset}  onClick={ ()=>{ this._reset(true) } } />
                    </div>
                  </div>

                  {
                    this.state.showDataPembeli ? 
                      <div className="cont-pembeli">
                        <div className="col-2">
                          <label>Nama Pembeli</label>
                          <input value={this.state.order.pembeli.nama} onChange={ (e)=>{ this._onInputDataPembeli("nama",e.target.value) } } />
                        </div>
                        <div className="col-2">
                          <label>No. HP</label>
                          <input value={this.state.order.pembeli.notelp} onChange={ (e)=>{ this._onInputDataPembeli("notelp",e.target.value) } } />
                        </div>
                        <label>Lokasi</label>
                        <textarea value={this.state.order.pembeli.lokasi} onChange={ (e)=>{ this._onInputDataPembeli("lokasi",e.target.value) } } ></textarea>
                        <label>Catatan</label>
                        <textarea value={this.state.order.pembeli.catatan} onChange={ (e)=>{ this._onInputDataPembeli("catatan",e.target.value) } }></textarea>
                        <div className="btn btn-batal" onClick={ ()=>{ this._onCancelDataPembeli() } }> Batal</div>
                        <div className="btn btn-simpan"  onClick={ ()=>{ this._onSaveDataPembeli() } }> Simpan</div>
                      </div>
                    : null
                  }

                  {
                    this.state.showDP ? 
                      <div className="cont-pembeli">

                        <div className="dp">
                          <div className="dp-h">
                            <div className="header" style={{backgroundColor:"#023962"}}>Total Bayar</div>
                            <div className="value">{Helper.formatCurrency(this.state.order.total)}</div>
                          </div>
                          <div  className="dp-h">
                            <div className="header" style={{backgroundColor:"#F96767"}}>Sisa</div>
                            <div className="value">{Helper.formatCurrency(this.state.order.sisa)}</div>
                          </div>
                          <div  className="dp-h">
                            <div className="header" style={{backgroundColor:"#FED460"}}>DP</div>
                            <input  value={this.state.order.dp} onChange={ (e)=>{ this._onInputDP(e.target.value) } } style={{width:150,textAlign:"right",fontSize:16,marginTop:5}}  className="value"/>
                          </div>
                        </div>

                        <div className="col-2">
                          <label>Nama Pembeli</label>
                          <input value={this.state.order.pembeli.nama} onChange={ (e)=>{ this._onInputDataPembeli("nama",e.target.value) } } />
                        </div>
                        <div className="col-2">
                          <label>No. HP</label>
                          <input value={this.state.order.pembeli.notelp} onChange={ (e)=>{ this._onInputDataPembeli("notelp",e.target.value) } } />
                        </div>
                        <label>Lokasi</label>
                        <textarea value={this.state.order.pembeli.lokasi} onChange={ (e)=>{ this._onInputDataPembeli("lokasi",e.target.value) } } ></textarea>
                        <label>Catatan</label>
                        <textarea value={this.state.order.pembeli.catatan} onChange={ (e)=>{ this._onInputDataPembeli("catatan",e.target.value) } }></textarea>
                        <div className="btn btn-batal" onClick={ ()=>{ this._onCancelDP() } }> Batal</div>
                        <div className="btn btn-simpan"  onClick={ ()=>{ this._onSaveDP() } }> Simpan</div>
                      </div>
                    : null
                  }
                  
                  {
                    this.state.showBank ? 
                      <div className="banks" >
                        {this._renderBank()}
                        <img src={iconCloseCircle} height="32" className={"close-bank"} onClick={ ()=>{ this._cancelBayarTransfer() } }   />
                      </div>
                    : null
                  }
                  

                  <div className="cart">
                    {this._renderCart()}
                  </div>
                  
                  <div className="checkout" style={{display: this.state.carts.length > 0 ? "inherit" : "none" }} >
                    <div className="uangpembeli" style={{display: this.state.setting.showBayar ? "inherit" : "none" }}>
                      <span style={{fontWeight:"bold"}}>Uang Pembeli : </span>
                      <input placeholder="nominal" onChange={(e)=>{ this._onBayar(e.target.value) }} value={this.state.order.uang} />
                      <img src={iconSubmitNote} height="30" style={{marginTop:10,float:"right",marginRight:25,cursor:"pointer"}} onClick={ ()=>{ this._bayar() } } />
                      <img src={iconCloseCircle} height="32" style={{marginTop:10,float:"right",marginRight:25,cursor:"pointer"}} onClick={ ()=>{ this._cancelBayar() } } />
                    </div>

                    <div className="subtotal">
                      <div>
                        <span style={{float:"left"}}>Subtotal</span>
                        <span style={{float:"right"}}> ({this.state.order.totalItem} items) {Helper.formatCurrency(this.state.order.subtotal,'')}</span>
                      </div>
                    </div>

                    {
                      this.state.setting.useVoucher ? 
                      <div className="subtotal">
                        <div>
                          <span style={{float:"left"}}>Voucher ({this.state.voucher.kode})</span>
                          <span style={{float:"right"}}>  -{this.state.voucher.tipe=="Prosentase" ? this.state.voucher.nominal+"%" : Helper.formatCurrency(this.state.voucher.nominal,"")}</span>
                        </div>
                      </div>
                      : null
                    }
                  
                  {
                    this.state.order.metodeBayar == 'Tunai' && this.state.order.dp <= 0?
                      <div>
                        <div className="subtotal">
                          <div>
                            <span style={{float:"left"}}>Uang</span>
                            <span style={{float:"right"}}> {Helper.formatCurrency(this.state.order.uang,'')}</span>
                          </div>
                        </div>

                        <div className="subtotal">
                          <div>
                            <span style={{float:"left"}}>Kembalian</span>
                            <span style={{float:"right"}}> {Helper.formatCurrency(this.state.order.kembalian,'')}</span>
                          </div>
                        </div>
                      </div>
                    :   null
                  }

                  {
                    this.state.order.metodeBayar == 'Tunai' && this.state.order.dp > 0 ?
                      <div>
                        <div className="subtotal">
                          <div>
                            <span style={{float:"left"}}>Sisa</span>
                            <span style={{float:"right"}}> {Helper.formatCurrency(this.state.order.sisa,'')}</span>
                          </div>
                        </div>

                        <div className="subtotal">
                          <div>
                            <span style={{float:"left"}}>DP</span>
                            <span style={{float:"right"}}> {Helper.formatCurrency(this.state.order.dp,'')}</span>
                          </div>
                        </div>
                      </div>
                    :   null
                  }

                  {
                    this.state.order.metodeBayar == "Transfer" ? 
                      <div className="subtotal">
                        <div>
                          <span style={{float:"left"}}>Bank</span>
                          <span style={{float:"right"}}> {this.state.bank.bank}</span>
                        </div>
                      </div>
                    : null
                  }
                    

                    <div className="total">
                      <span style={{float:"left"}}>Total Bayar</span>
                      <span style={{float:"right"}}>{Helper.formatCurrency(this.state.order.total)}</span>
                    </div>

                    <div style={{display:"table",width:"100%"}}>

                      <div className="bayar">

                        <div className={this.state.order.metodeBayar == "Tunai" ? "datapembeli metodebayar-active" : "datapembeli"} style={{padding:"0px 20px"}}>
                          <img height="20" style={{marginTop:10,float:"left",marginLeft:10}} src={iconTunai} />
                          <div  onClick={ ()=>{  this._showBayar()  } } style={{position:"relative",top:10,display:"block",fontSize:14,fontWeight:"bold",color:"#023962"}}> TUNAI </div>
                        </div>

                        <div className={this.state.order.metodeBayar == "Transfer" ? "datapembeli metodebayar-active" : "datapembeli"} style={{padding:"0px 20px"}}>
                          <img height="20" style={{marginTop:8,float:"left",marginLeft:10}} src={iconTransfer} />
                          <span onClick={ ()=>{  this._showBank()  } } style={{position:"relative",top:8,display:"block",fontSize:14,fontWeight:"bold",color:"#023962"}}> TRANSFER </span>
                        </div>

                      </div>

                      <div className="btn-print" onClick={ ()=>{ this._print() } }>{this.state.txtFinish}</div>
                   
                    </div>

                  </div>

                </div>
                
                  {
                    this.state.kasir.pin === undefined ? 
                    <div className="login-kasir">
                        <div className="cont-login-kasir">
                          <label>MASUKKAN PIN KASIR ANDA</label>
                          <input  onChange={ (e)=>{ this._onInputPIN(e.target.value) } } />
                          <img src={iconSubmitNote} height="30" style={{marginTop:10,float:"right",marginRight:15,cursor:"pointer"}} onClick={ ()=>{ this._loginKasir() } } />
                        </div>
                    </div>
                    : null
                  }

                

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
      <Print isShow={true} order={props.order} outlet={props.outlet} ref={componentRef} />
    </div>
  );
};

export default Transaksi;
