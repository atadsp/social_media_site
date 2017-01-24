function getWednesday( date ) {
    var day = date.getDay() || 7;  
    if( day !== 3 ) {
        date.setHours(-24 * (day - 3)); 
    }
    return date;
}

getWednesday(new Date("01/01/0100"));