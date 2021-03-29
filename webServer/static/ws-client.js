$(document).ready(function(){

  var WEBSOCKET_ROUTE = "/ws";

  if(window.location.protocol == "http:"){
      //localhost
      var ws = new WebSocket("ws://" + window.location.host + WEBSOCKET_ROUTE);
  }
  else if(window.location.protocol == "https:"){
      //Dataplicity
      var ws = new WebSocket("wss://" + window.location.host + WEBSOCKET_ROUTE);
  }

  ws.onopen = function(evt) {
      // $("#ws-status").html("Connected");
      // $("#ws-status").css("background-color", "#afa");
      // $("#server_light").val("ON");
      $("#signal").html("READY");
      $("#ws-status").html("Connected");
      $("#ws-status").css("background-color", "#afa");

      //$("#logCheck").prop("checked", false);
      $("#timerCheck").prop("checked", false);

      dataT = new dataTable("logData", "°C");
      dataT.setupTable();

      graphT = new dataGraph("logGraph", "°C");

      //LED
      if ($("#hasLEDs").prop("checked")){
        //ledSetScale();
        let ledMin = parseFloat($("#ledMin").val());
        let ledMax = parseFloat($("#ledMax").val());
        let msg = {
          "what": "ledMinMax",
          "min": ledMin,
          "max": ledMax
        }
        ws.send(JSON.stringify(msg));
      }
      //LED END


  };

  ws.onmessage = function(evt) {
      //console.log(evt);
      var sData = JSON.parse(evt.data);
      //console.log(sData);
      if (sData.sensor !== 'undefined'){
        //console.log(sData.info + "|" + )

        if (sData.info == 'hello'){
          r = sData.reply.toString();
          $("#HelloResponse").html(r);
        }

        //WHAT TO DO WHEN WE GET A MESSAGE FROM THE SERVER
        if (sData.info == 'timer'){
          m = sData.m.toString();
          s = sData.s.toString().padStart(2,"0");
          $("#timeLeft").html(m + ":" + s);
        }

        // TEMPERATURE SENSOR (1/2)

        // measure temperature once (button press)
        if (sData.info == 'S-one'){
          $("#sensor_measure").html(sData.S + ' ' + sData.units) //" °C");
          let now = new Date();
          $("#sensor_time").html(now.toString().split(" GMT")[0]);
        }

        // write all data to log at end of sensing
        if (sData.info == 'logT'){
          dataT.writeAllData(sData);
        }

        // continuous log: Add one data point to graph and table
        if (sData.info == 'logUp'){
          dataT.addRow(sData);
          graphT.addDataPoint(sData);

          $("#countdownData").html("-"+sData.timeLeft+" s");
          $("#timeLeftT").css("width", 100*sData.timeLeft/sData.timeLog+"%");
        }
        if (sData.info == 'logFile'){
          const a = document.createElement("a");
          a.href = URL.createObjectURL(new Blob([sData.data], {
            type: "text/plain"
          }));
          a.setAttribute("download", "data.txt");
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
        //TEMPERATURE SENSOR (END)

        //LEDs
        // Activate LEDs
        if (sData.info == 'LEDsActive'){
          if (sData.active == "show") {
            $("#ledBlock").show();
            $("#hasLEDs").prop("checked", true);
            $("#nPix").val(sData.nPix);
          }
          else {
            $("#ledBlock").hide();
            console.log("LED's not activated by server. You may need to install the neoPixel library (see http://github.com/lurbano/rpi-led-strip)");
          }
        }
        //LEDs (END)

      };
  };

  ws.onclose = function(evt) {
      $("#ws-status").html("Disconnected");
      $("#ws-status").css("background-color", "#faa");
      $("#server_light").val("OFF");
  };

  //MESSAGES TO SEND TO THE SERVER

  // TEMPERATURE SENSOR (2/2)

  $("#loggingMenu").click(function(){
    let title = "Logging"
    if (openMenuQ(this.innerHTML)){
      $(".logging").show();
      this.innerHTML = title + " ^";
    }
    else {
      $(".logging").hide();
      this.innerHTML = title + " ▼";
    }

  })



  $("#checkSensor").click(function(){
      let msg = '{"what": "checkS"}';
      ws.send(msg);
      let return_signal = "Checking " + this.value.split(" ")[1];
      $("#sensor_measure").html(return_signal);
  });

  $("#monitorSensor").click(function(){
    let dt = $("#monitorSec").val();
    let msg = {
      "what": "monitor",
      "dt": dt
    };
    ws.send(JSON.stringify(msg));
  })

  $("#startLog").click(function(){
      console.log(this.value);
      if (this.value === "Start Logging"){

        $("#logGraph").css("height", "400px");
        console.log(graphT.plot.data);

        if (document.getElementById("setEnd").checked){
          let timeMin = parseInt($("#logT_timeMin").val());
          let timeSec = parseInt($("#logT_timeSec").val());
          timeLog = timeMin * 60 + timeSec;
        }
        else {
          timeLog = false;
        }

        let dtMin = parseInt($("#logT_dtMin").val());
        let dtSec = parseInt($("#logT_dtSec").val());
        let dtMil = parseInt($("#logT_dtMil").val());
        let dt = (dtMin * 60 + dtSec) + (dtMil/1000);
        console.log(dt);

        var msg = {
          "what": "startLog",
          "t": timeLog,
          "dt": dt,
          "update": "live"
        }
        this.value = "Stop Logging"
        $("#saveFileName").val(getLogFileName());
      }
      else {
        let fname = $("#saveFileName").val();
        var msg = {
          "what": "stopLog",
          "fname": fname
        }
        this.value = "Start Logging"
      }

      ws.send(JSON.stringify(msg));
  });

  $("#setEnd").change(function(){
    console.log("Set end time:", this.checked);
    if (this.checked){
      $(".logEndTime").prop("disabled", false);
      $("#logTimeLimit").show();
    }
    else {
      $(".logEndTime").prop("disabled", true);
      $("#logTimeLimit").hide();
    }

  })

  $("#getDataMenu").click(function(){
    let title = "Get Data"
    if (openMenuQ(this.innerHTML)){
      $("#getDataCtrls").show();
      this.innerHTML = title + " ^";
    }
    else {
      $("#getDataCtrls").hide();
      this.innerHTML = title + " ▼";
    }

  })

  $("#saveData").click(function(){
    let fname = $("#saveFileName").val();
    console.log("Save File: ", fname);
    let msg = {
      "what": "save",
      "fname": fname
    }
    ws.send(JSON.stringify(msg));
  })

  $("#getData").click(function(){
    ws.send('{"what": "getData"}');
  })

  //TEMPERATURE SENSOR (END)

  //LEDs
  $("#hasLEDs").change(function(){
    let nPix = parseInt($("#nPix").val());
    console.log(this.checked, nPix);

    if (this.checked){
      var msg = {
        "what": "LEDs",
        "nPix": nPix,
        "activate": true
      }
      $(".ledControls").show();
    }
    else {
      var msg = {
        "what": "LEDs",
        "activate": false
      }
      $(".ledControls").hide();
    }

    ws.send(JSON.stringify(msg));

  })

  $("#nPixSet").click(function(){
    let nPix = parseInt($("#nPix").val());
    let msg = {
      "what": "nPixSet",
      "nPix": nPix
    }
    ws.send(JSON.stringify(msg));
  })

  $(".ledMinMax").change(function(){
    ledSetScale();
    // let ledMin = parseFloat($("#ledMin").val());
    // let ledMax = parseFloat($("#ledMax").val());
    // let msg = {
    //   "what": "ledMinMax",
    //   "min": ledMin,
    //   "max": ledMax
    // }
    // ws.send(JSON.stringify(msg));

  })
  //LEDs (END)

  $("#hello").click(function(){
      let msg = '{"what": "hello"}';
      ws.send(msg);
  });

  $("#timerCheck").change(function(){
    this.checked ? $(".timer").show() : $(".timer").hide();
  })
  $("#timer").click(function(){
      let m = $("#timerMin").val();
      let s = $("#timerSec").val();
      let msg = '{"what": "timer", "minutes":'+ m + ', "seconds": '+ s + '}';
      ws.send(msg);
  });

  $("#reboot").click(function(){
      let check = confirm("Reboot Pi?");
      if (check){
        var msg = '{"what": "reboot"}';
        ws.send(msg);
      }
  });


});



class dataTable{
  constructor(targetDiv, dataTitle){
    this.targetDiv = targetDiv;
    this.dataTitle = dataTitle;
  }
  setupTable(){
    this.table = document.createElement("table");
    let thead = this.table.createTHead();
    let row = thead.insertRow();

    let th = document.createElement('th');
    th.appendChild(document.createTextNode("time (s)"));
    row.appendChild(th);

    th = document.createElement('th');
    th.appendChild(document.createTextNode(this.dataTitle));
    row.appendChild(th);

    this.body = document.createElement('TBODY');
    this.table.appendChild(this.body);

    let tableDiv = document.getElementById(this.targetDiv);
    while (tableDiv.firstChild){
      tableDiv.removeChild(tableDiv.firstChild);
    }
    tableDiv.appendChild(this.table);
  }
  writeAllData(data){
    for (let i = 0; i< data.logData.length; i++){

      this.addRow(data.logData[i]);
    }
  }
  addRow(rowList){
    let tr = document.createElement("TR");

    let t = document.createElement("TD");
    t.appendChild(document.createTextNode(rowList["t"]));
    tr.appendChild(t);

    let val = document.createElement("TD");
    val.appendChild(document.createTextNode(rowList["x"]));
    tr.appendChild(val);

    this.body.appendChild(tr);
  }

}

class dataGraph{
  constructor(targetDiv, dataTitle, ctrlDiv="graphCtrls", T_units="C", timeUnits="sec"){
    this.targetDiv = targetDiv;
    this.dataTitle = dataTitle;

    this.ctrlDiv = document.getElementById(ctrlDiv);
    console.log("Inserting Temperature Unit Controls");
    this.T_units = T_units;
    this.insertTemperatureUnitCtrl();

    this.timeUnits = timeUnits;
    this.insertTimeUnitCtrl();


    this.plot = document.getElementById(targetDiv);

    Plotly.newPlot( this.plot,
      [
        {
          type: 'scatter',
        	x: [],
        	y: []
        }
      ],
      {
        xaxis: {
          title: "time (s)"
        },
    	  yaxis: {
          title: this.dataTitle
        }
      }
    );

    this.plot.style.height = "300px";

  }
  addDataPoint( dataList ){
    let newx = parseFloat(dataList["t"]);
    let newy = parseFloat(dataList["x"]);
    //console.log(newx, newy);

    //adjust for time units
    console.log("before", this.timeUnits, newx);
    newx = (this.timeUnits !== "sec") ? this.timeConvert(newy, this.timeUnits, "sec"): newx;
    console.log("after", this.timeUnits, newx);


    //adjust for temperature units
    newy = (this.T_units === "F") ? CtoF(newy) : newy;

    let update = { x: [[newx]], y: [[newy]]};
    //console.log(update);

    Plotly.extendTraces(this.plot, update, [0] );
  }
  insertTemperatureUnitCtrl(){
    this.unitCtrl = document.createElement("select");
    this.unitCtrl.id = "temperatureUnitCtrl";

    let c = document.createElement("option");
    c.value ="C";
    c.text = "°C";
    c.selected = true; //default
    this.unitCtrl.appendChild(c);

    let f = document.createElement("option");
    f.value = "F";
    f.text = "°F";
    this.unitCtrl.appendChild(f);

    let label = document.createElement("label");
    label.innerHTML = "T units: "
    label.htmlFor = "temperatureUnitCtrl";

    this.ctrlDiv.appendChild(label).appendChild(this.unitCtrl);

    // add js controls
    $("#temperatureUnitCtrl").change({graph: this},function(event){
      var graph = event.data.graph;
      let data = graph.plot.data[0];
      //let y = graph.plot.data[0].y;
      if (this.value === "C" && graph.T_units === "F"){
        graph.T_units = "C";
        for (let i = 0; i < data.y.length; i++){
          data.y[i] = FtoC(data.y[i])
        }
      }
      else if (this.value === "F" && graph.T_units === "C"){
        graph.T_units = "F";
        for (let i = 0; i < data.y.length; i++){
          data.y[i] = CtoF(data.y[i])
        }
      }
      Plotly.react(graph.plot, [data]);
    })

  }

  insertTimeUnitCtrl(){
    console.log("time units adding");
    let id = "timeUnitCtrl"
    this.timeUnitCtrl = document.createElement("select");
    this.timeUnitCtrl.id = id;

    var f = document.createElement("option");
    f.value ="sec";
    f.text = "seconds";
    f.selected = true; //default
    this.timeUnitCtrl.appendChild(f);

    f = document.createElement("option");
    f.value = "min";
    f.text = "minutes";
    this.timeUnitCtrl.appendChild(f);

    f = document.createElement("option");
    f.value = "hrs";
    f.text = "hours";
    this.timeUnitCtrl.appendChild(f);

    f = document.createElement("option");
    f.value = "day";
    f.text = "days";
    this.timeUnitCtrl.appendChild(f);

    let label = document.createElement("label");
    label.innerHTML = "time units: "
    label.htmlFor = id;

    this.ctrlDiv.appendChild(label).appendChild(this.timeUnitCtrl);

    // add js controls
    $(`#${id}`).change({graph: this},function(event){
      var graph = event.data.graph;
      console.log("Data", graph.plot.data[0].x);
      let data = graph.plot.data[0];
      //let y = graph.plot.data[0].y;
      if (this.value === "sec" && graph.T_units !== "sec"){
        for (let i = 0; i < data.x.length; i++){
          data.x[i] = graph.timeConvert(data.x[i], "sec")
        }
        graph.timeUnits = "sec";
      }
      else if (this.value === "min" && graph.T_units !== "min"){
        for (let i = 0; i < data.x.length; i++){
          data.x[i] = graph.timeConvert(data.x[i], "min")
        }
        graph.timeUnits = "min";
      }
      else if (this.value === "hrs" && graph.T_units !== "hrs"){
        for (let i = 0; i < data.x.length; i++){
          data.x[i] = graph.timeConvert(data.x[i], "hrs")
        }
        graph.timeUnits = "hrs";
      }
      else if (this.value === "day" && graph.T_units !== "day"){
        for (let i = 0; i < data.x.length; i++){
          data.x[i] = graph.timeConvert(data.x[i], "day")
        }
        graph.timeUnits = "day";
      }

      Plotly.newPlot(graph.plot, [data]);
    })

  }
  timeConvert(val, toUnit, fromUnits){
    fromUnits = typeof fromUnits === 'undefined' ? this.timeUnits : fromUnits;

    if (toUnit === "sec"){
      val = (fromUnits === "min" ) ? val * 60
          : (fromUnits === "hrs") ? val * 60 * 60
          : (fromUnits === "day") ? val * 60 * 60 * 24
          : val;
    }
    else if (toUnit === "min"){
      val = (fromUnits === "sec" ) ? val / 60
          : (fromUnits === "hrs") ? val * 60
          : (fromUnits === "day") ? val * 60 * 24
          : val;
    }
    else if (toUnit === "hrs"){
      val = (fromUnits === "sec" ) ? val / 60 / 60
          : (fromUnits === "min") ? val / 60
          : (fromUnits === "day") ? val * 24
          : val;
    }
    else if (toUnit === "day"){
      val = (fromUnits === "sec" ) ? val / 60 / 60 / 24
          : (fromUnits === "min") ? val / 60 / 24
          : (fromUnits === "hrs") ? val / 24
          : val;
    }
    return val;
  }
}

function CtoF(C){
  return 32 + (C*9/5)
}
function FtoC(F){
  return (F-32) * (5/9)
}

function getLogFileName(){
  let now = new Date();
  let y = now.getFullYear();
  let m = now.getMonth();
  let d = now.getDate();
  let h = now.getHours();
  let mn = now.getMinutes();
  let fname = [y, m, d, h, mn].join("-")+".log";
  return fname;
}

function openMenuQ(str){
  //get the last character in the string and see if it points up or down.
  let chars = str.trim();
  let lastChar = chars[chars.length-1];
  if (lastChar === "▼"){
    return true;
  } else {
    return false;
  }
}

function ledSetScale(){
  let ledMin = parseFloat($("#ledMin").val());
  let ledMax = parseFloat($("#ledMax").val());
  let msg = {
    "what": "ledMinMax",
    "min": ledMin,
    "max": ledMax
  }
  ws.send(JSON.stringify(msg));
}
