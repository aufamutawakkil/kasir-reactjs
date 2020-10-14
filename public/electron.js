//index electron
const {app, BrowserWindow} = require('electron')      
const path = require('path');
function createWindow () {   
    // Create the browser window.     
    let win = new BrowserWindow({show:false}) 
    win.maximize();
    win.setMenu(null)
    win.removeMenu();
    win.show();
    
    // on localhost     
    //win.loadURL('http://localhost:3000/') 

    //on webpack prod, on dev
    //win.loadFile(path.join(__dirname,'dist/index.html'))

    //on prod
    win.loadFile('build/index.html')
}      
app.allowRendererProcessReuse=true;
app.on('ready', createWindow)