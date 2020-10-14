import React from 'react';
import '../style/kategori.css';
import '../style/table.css';
import {ToastsContainer, ToastsStore, ToastsContainerPosition} from 'react-toasts';
import iconSortZ from '../assets/icon_sort_z.png';
import iconSortA from '../assets/icon_sort_a.png';
import iconSortNew from '../assets/icon_sort_new.png';

import iconEdit from '../assets/icon_edit_kategori.png';
import iconDel from '../assets/icon_del_kategori.png';
import iconVisible from '../assets/icon_visible.png';
import Helper from '../helper/Helper';
import moment from 'moment';

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";


class Kategori extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            katId:0,
            katNama:"",
            kategoris:[],
            kategorisSort:[],
            actionActive:"",
            kategoriActiveId:"",
            kategoriActiveName:"",
            styles:{contentHeight:0,marginTop:0}
        }
        this.onDragEnd = this.onDragEnd.bind(this);
    }

   
    componentDidMount(){
        //get UI setting
        let styles = this.state.styles;
        let winHeight = window.innerHeight;
        let headerHeight = document.getElementsByClassName("setting-header")[0].clientHeight;
        let contentHeight = winHeight - headerHeight;
        styles.contentHeight = contentHeight;
        styles.marginTop = headerHeight;

        if( localStorage.getItem("kategoris") != null ){
            let kats = JSON.parse(localStorage.getItem("kategoris"));
            this.setState({kategoris:kats},()=>{
                //sorting kats
                let katsUrutan = kats;
                katsUrutan.sort(function (a, b) {
                    if(Number(a.urutan) < Number(b.urutan)) {
                        return -1;
                    } else if (Number(a.urutan) == Number(b.urutan)) {
                        return 0;
                    } else {
                        return 1;
                    }
                });

                this.setState({kategorisSort:katsUrutan,styles:styles})

            })
        }
    }

    _add=()=>{
        if( this._checkIsSame(this.state.katNama) ){
            ToastsStore.error("Nama tidak boleh sama")
            return;
        }

        let kats = this.state.kategoris == null ? [] : this.state.kategoris;
        let kat = {
            id:Helper.uniqID(),
            nama:this.state.katNama,
            urutan:1,
            visible:'yes',
            date:moment().format("DD/MM/YYYY"),
            time:moment().format("HH:mm")
        }
        kats.push(kat)
        
        localStorage.setItem("kategoris",JSON.stringify(kats))
        this.setState({
            katId:0,
            katNama:"",
            kategoris:kats
        })

        ToastsStore.success("Berhasil")
    }

    _checkIsSame=(nama)=>{
        let isSame=false;
        if(this.state.kategoris != null && this.state.kategoris.length > 0)
            this.state.kategoris.map(v=>{
                if( v.nama == nama ) isSame=true
            })

        return isSame;
    }

    _getLastId=()=>{
        if( this.state.kategoris == null || this.state.kategoris.length <= 0 ) return 1;
        else{
            console.log(this.state.kategoris)
            let lastId = this.state.kategoris[ this.state.kategoris.length - 1 ].id
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

    _renderKat=()=>{
        var items = [];
        let num = 1;
        if(this.state.kategoris!=null)
        this.state.kategoris.map(b=>{
        items.push(
            <div key={b.id} className={ this._isActionActive() ?  b.id == this.state.kategoriActiveId ?  "kat kat-pointer " + this.state.actionActive  : "kat kat-pointer"  :  b.visible=='no' ? "kat kat-visible-yes" : "kat" }  onClick={ ()=>{ this._onSelectKat(b) } }>
                <div> {b.nama} </div>
            </div>
            )
        })
        return items;
    }

    _onSelectKat=(kat)=>{
        if(this.state.actionActive!="") //jika hnya ketika ada action
            this.setState({kategoriActiveId:kat.id,kategoriActiveName:kat.nama})
    }

    _renderUrutkan=()=>{
        var items = [];
        let idx=0;
        if(this.state.kategorisSort!=null)
        this.state.kategorisSort.map(b=>{
        items.push(
            <Draggable key={b.id}  draggableId={b.id} index={idx}>
                {(provided, snapshot) => (
                    <div
                    className="urutkan"
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={this.getItemStyle(
                      snapshot.isDragging,
                      provided.draggableProps.style
                    )}>
                    <div className="kat-num"> {b.urutan} </div>
                    <div className="kat"> {b.nama} </div>
                  </div>
                )}
                
            </Draggable>
            )
            idx++;
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
        deletes.kategoris.push(this.state.kategoriActiveId)
        localStorage.setItem("deletes",JSON.stringify(deletes))

        let newV=[];
        this.state.kategoris.map(v=>{
            if( v.id != this.state.kategoriActiveId ){
                newV.push(v)
            }
        })

        this.setState({kategoris:newV,actionActive:""},()=>{
            localStorage.setItem("kategoris",JSON.stringify(newV))
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


    _submitYes=()=>{
        let kats = this.state.kategoris;let newKats=[];
        if(this.state.actionActive=="edit"){
            for(var i in kats ){
                if( kats[i].id == this.state.kategoriActiveId ){
                    kats[i].nama = this.state.kategoriActiveName;
                }
                newKats.push(kats[i])
            }
            this.setState({kategoris:newKats,kategoriActiveName:"",kategoriActiveId:"",actionActive:""},()=>{
                localStorage.setItem("kategoris",JSON.stringify(newKats))
                ToastsStore.success("Perubahan Berhasil")
            })
        }else if(this.state.actionActive=="del"){
            this._del();
        }else if(this.state.actionActive=="visible"){
            this._visible();
        }
    }

    _submitNo=()=>{
        this.setState({kategoriActiveName:"",kategoriActiveId:"",actionActive:""})
    }

    _setClassPopuup=()=>{
        let cl = "action-popup" 
        if(this.state.actionActive!="" && this.state.kategoriActiveName!="") cl+=" show";
        if( this.state.actionActive=="visible" ) cl+=" top-visible";
        else if( this.state.actionActive=="del" ) cl+=" top-del";
        return cl;
    }

    _sort=(tipe)=>{
        if(tipe=="A"){
            this.state.kategoris.sort(function(a,b){
                var nameA=a.nama.toLowerCase(), nameB=b.nama.toLowerCase()
                if (nameA < nameB) //sort string ascending
                    return -1
                return 0 //default return value (no sorting)
              })
              this.setState({kategoris:this.state.kategoris})
        }else if(tipe=="Z"){
            this.state.kategoris.sort(function(a,b){
                var nameA=a.nama.toLowerCase(), nameB=b.nama.toLowerCase()
                if (nameA > nameB)
                    return -1
                return 0 //default return value (no sorting)
              })
              this.setState({kategoris:this.state.kategoris})
        }else if(tipe=="New"){
            this._filterByDate()
        }
    }

    _filterByDate=()=>{
        let kats = this.state.kategoris;
        kats.sort(function (a, b) {
            var key1 =moment(Date.parse(a.date)+" "+Date.parse(a.time)).format("DD/MM/YYYY HH:mm");
            var key2 = moment(Date.parse(b.date)+" "+Date.parse(b.time)).format("DD/MM/YYYY HH:mm");
        
            if (key1 < key2) {
                return -1;
            } else if (key1 == key2) {
                return 0;
            } else {
                return 1;
            }
        });

        this.setState({transaksi:kats})
    }

    reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        let num=1;let newRes=[];
        result.map(res=>{
            res.urutan = num++;
            newRes.push(res)
        })
        this.setState({kategorisSort:newRes},()=>{
            localStorage.setItem("kategoris",JSON.stringify(newRes));
        })
        return result;
    };

    onDragEnd(result) {
        // dropped outside the list
        if (!result.destination) {
          return;
        }
    
        const items = this.reorder(
          this.state.kategorisSort,
          result.source.index,
          result.destination.index
        );
    
        this.setState({
          items
        });
    }

    getListStyle = isDraggingOver => ({
        border: isDraggingOver ? "0px" : "0px",
    });

    getItemStyle = (isDragging, draggableStyle) => ({
        // some basic styles to make the items look a bit nicer
        userSelect: "none",
        // change background colour if dragging
        border: isDragging ? "1px solid #bbb" : "white",
        width:"30%",
        // styles we need to apply on draggables
        ...draggableStyle
      });


    render(){
        const h = window.innerHeight - document.getElementsByClassName("setting-header")[0].clientHeight;
        return (
            <div className="kategori" style={{height:this.state.styles.contentHeight,marginTop:this.state.styles.marginTop}} >
                <ToastsContainer store={ToastsStore} position={ToastsContainerPosition.TOP_RIGHT} />

                <div className="side1" style={{height:h-80}}>
                    <div className="header">
                        <input value={this.state.katNama} onChange={ (e)=>{ this.setState({katNama:e.target.value}) } } placeholder="Buat Kategori..." />
                        <div className="btn-add" onClick={ ()=>{ this._add() } } >ADD</div>
                    </div>
                    <div className="kat-cont" style={{height:h-150}}>
                        {this._renderKat()}
                    </div>
                    <div style={{height:h-80}} className={this.state.kategoris.length>0 ? "action-cont": "action-cont hide"}>
                        <img src={iconEdit} style={{height:38,width:38}}  onClick={ ()=>{ this._activateAction("edit") } } />
                        <div className={this._setClassPopuup()}>
                            {
                                this.state.actionActive == "del" ?
                                <span> yakin mau di hapus ? </span>
                                : null
                            }
                            {
                                this.state.actionActive == "visible" ?
                                <span> yakin mau di sembunyikan ? </span>
                                : null
                            }
                            <div className="action-arrow"></div>
                            {
                                this.state.actionActive == "edit" ? 
                                <input className="action-input" value={this.state.kategoriActiveName} onChange={(e)=>{ this.setState({kategoriActiveName:e.target.value}) }} />
                                : null
                            }
                            
                            <div onClick={()=>{ this._submitNo() }} className="btn-no" >CANCEL</div>
                            <div  onClick={()=>{ this._submitYes() }} className="btn-yes"> {this.state.actionActive=="del" || this.state.actionActive=="visible" ? "YES" : "SAVE" } </div>
                        </div>
                        <img src={iconDel} style={{height:38,width:38}} onClick={ ()=>{ this._activateAction("del") } } />
                        <img src={iconVisible} style={{height:38,width:38}} onClick={ ()=>{ this._activateAction("visible") } } />
                        <div className="action-sort">
                            {/*<img src={iconSortNew} style={{height:38,width:38}} onClick={ ()=>{this._sort('New')}} />*/}
                            <img src={iconSortA} style={{height:38,width:38}} onClick={ ()=>{this._sort('A')}} />
                            <img src={iconSortZ} style={{height:38,width:38}} onClick={ ()=>{this._sort('Z')}} />
                        </div>
                    </div>

                    
                   
                </div>

                <div className="side2" style={{height:h-80}}>
                    <div className="header">
                        <div>"Urutkan Tampilan"</div>
                        <div>10 Kategori Teratas</div>
                    </div>
                    <DragDropContext onDragEnd={this.onDragEnd} className="urutkan-cont" style={{height:h-150}}>
                        <Droppable droppableId="droppable" style={{height:h-80}}>
                            {(provided, snapshot) => (
                                <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                style={this.getListStyle(snapshot.isDraggingOver)}>
                                    {this._renderUrutkan()}
                                </div>
                            )}
                            
                        </Droppable>
                    </DragDropContext>
                </div>

            </div>
        );
    }
}

export default Kategori;