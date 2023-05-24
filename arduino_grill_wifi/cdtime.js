    /* To display a Countdown timer until specified Date-Time */
var countdownTime = function(refid) {
  // function to be executed when countdown timer reach to 0
  var cdTimer0 = function() {
    // HERE Add the code to be processed
  }

  // http://coursesweb.net/javascript/
  // sets an <option> lists and adds it into <select> with "id" from id parameter
  var setOptions = function(min, max, id) {
    re = '';
    for(var i=min; i<=max; i++) {
      re += '<option value="'+ i +'">'+ i +'</option>';
    }
    document.getElementById(id).innerHTML = re;
  }
  

  // sets the days in <select> list with days
  this.setDays = function(month) {
    // sets maximum day number according to month
    if(month == 3 || month == 5 || month == 7 || month == 9) var maxday = 30;
    else if(month == 1) {
      if((year % 4) == 0) var maxday = 29;
      else var maxday = 28;
    }
    else var maxday = 31;

    setOptions(1, maxday, refid +'fday');       // adds the option with days
  }

  // sets a object for current datetime and gets current year, month, milliseconds
  var obNow = new Date();
  var year = obNow.getFullYear();
  this.month = obNow.getMonth();
  this.fform = (document.querySelector('form#'+ refid +'timer') != null) ? 1 : 0;     // to know if datetime is from form or not
  var fmills = 0;         // number of milliseconds of ending datetime
  var thisOb = this;      // contains reference to object with this class, to can be used inside function to auto-call

  // if form field with id="cdttimer"
  if(this.fform == 1) setOptions(year, 2020, refid +'fyear');      // adds the option with years

  // this function is called from Start button. It sets and displays countdown data
  this.setCTimer = function() {
    // gets the difference between milliseconds of datetime from form and current datetime
    obNow = new Date();
    var mills = fmills - obNow.getTime();

    // if mills > 0, sets object and data with mills, else, returns false
    if(mills > 0) {
      // sets Date object with milliseconds of difference between current datetime and datetime from form
      // to get number of years, months, days, minutes and seconds in this milliseconds
      var obCDown = new Date(mills);
      var years = obCDown.getUTCFullYear() - 1970;
      var months = obCDown.getUTCMonth();
      var days = obCDown.getUTCDate() - 1;
      var hours = obCDown.getUTCHours();
      var minuts = obCDown.getUTCMinutes();
      var secs = obCDown.getUTCSeconds();

      // display the time in page, and auto-calls this function after 1 seccond
      document.getElementById(refid +'years').innerHTML = years;
      document.getElementById(refid +'months').innerHTML = months;
      document.getElementById(refid +'days').innerHTML = days;
      document.getElementById(refid +'hours').innerHTML = hours;
      document.getElementById(refid +'mints').innerHTML = minuts;
      document.getElementById(refid +'secs').innerHTML = secs;

      setTimeout(thisOb.setCTimer, 1000);       // auto-calls this function
    }
    else if(this.fform == 1 && mills < -999) alert('The ending datetime must be higher than current datetime.');
    else {
      // calls the cdTimer0() when countdown timer reach to 0
      cdTimer0();

      return false;
    }
  }

  // to set 'fmills' prop., and start the countdown, calls the setCTimer()
  this.startCDT = function() {
    // if element with id="cdttimer" exists, gets data for year, month, day, minutes and seconds
    if(document.getElementById(refid +'timer')) {
      var fyear = (this.fform == 1) ? document.getElementById(refid +'fyear').value : document.getElementById(refid +'fyear').innerHTML;
      var fmonth = (this.fform == 1) ? document.getElementById(refid +'fmonth').value : document.getElementById(refid +'fmonth').innerHTML;
      var fday = (this.fform == 1) ? document.getElementById(refid +'fday').value : document.getElementById(refid +'fday').innerHTML;
      var fhours = (this.fform == 1) ? document.getElementById(refid +'fhour').value : document.getElementById(refid +'fhour').innerHTML;
      var fminutes = (this.fform == 1) ? document.getElementById(refid +'fmints').value : document.getElementById(refid +'fmints').innerHTML;
      var fseconds = (this.fform == 1) ? document.getElementById(refid +'fsecs').value : document.getElementById(refid +'fsecs').innerHTML;

      // sets fmills with milliseconds of ending datetime
      fmills = Date.parse(fmonth+ ' '+ fday+ ', '+ fyear+ ' '+ fhours +':'+ fminutes +':'+ fseconds);

      // calls setCTimer(), and shows ending time in page
      this.setCTimer();
      if(document.getElementById(refid +'until')) document.getElementById(refid +'until').innerHTML = fmonth +'/'+ fday +'/'+ fyear +' - '+ fhours +':'+ fminutes +':'+ fseconds;
    }
  }
}

// create an object of the countdownTimer class
var objCT = new countdownTime('cdt');
if(objCT.fform == 1) objCT.setDays(objCT.month);        // adds the options with days according to current month

// to start the countdown automatically, delete the three slashes
/// objCT.startCDT();