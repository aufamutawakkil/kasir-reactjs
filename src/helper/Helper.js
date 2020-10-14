const formatCurrency = (angka,pref="Rp. ") => {
    if( angka === undefined || angka == null ) return "0";
    angka = angka.toString();
    angka = Number(angka);
	var rupiah = '';		
	var angkarev = angka.toString().split('').reverse().join('');
	for(var i = 0; i < angkarev.length; i++) if(i%3 == 0) rupiah += angkarev.substr(i,3)+',';
	return pref+rupiah.split('',rupiah.length-1).reverse().join('');
}


let  uniqID = function () {
    return  Math.random().toString(36).substr(2, 5);
};

export default{
    formatCurrency,
    uniqID
}
