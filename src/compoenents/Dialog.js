import React from 'react';
import '../style/dialog.css';

class Dialog extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            title:"",
            message:"",
            show:false ,
            buttonPositive:null,
            buttonNegative:null,
            buttonNetral:null,
        }
    }

    setMessage=(msg)=>{
        this.setState({message:msg})
    }

    setTitle=(txt)=>{
        this.setState({title:txt})
    }

    show=()=>{
        this.setState({show:true})
    }

    hide=()=>{
        this.setState({show:false})
    }

    setButtonPositive=(btn)=>{
        this.setState({buttonPositive:btn})
    }

    setButtonNegative=(btn)=>{
        this.setState({buttonNegative:btn})
    }

    setButtonNetral=(btn)=>{
        this.setState({buttonNetral:btn})
    }

    render(){
        return (
            <div className={ this.state.show ? "dialog-cont show" : "dialog-cont" } >
                <div className="dialog">

                    {
                        this.state.title != "" ? 
                            <div className="title">{this.state.title}</div>
                        : null
                    }
                
                    <div className="message">{this.state.message}</div>
                    
                    <div className="dialog-btn">
                        {   
                            this.state.buttonPositive != null ? 
                                <div  onClick={ ()=>{ this.state.buttonPositive.submit() }} className="positive">{this.state.buttonPositive.txt}</div>
                            : null
                        }
                        {   
                            this.state.buttonNegative != null ? 
                                <div onClick={ ()=>{ this.state.buttonNegative.submit() }} className="negative">{this.state.buttonNegative.txt}</div>
                            : null
                        }
                        {   
                            this.state.buttonNetral != null ? 
                                <div onClick={ ()=>{ this.state.buttonNetral.submit() }} className="netral">{this.state.buttonNetral.txt}</div>
                            : null
                        }
                    </div>

                </div>
            </div>
        );
    }
}

export default Dialog;