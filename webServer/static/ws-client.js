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

        if (sData.info == 'T'){
          $("#T_measure").html(sData.T + " °C");
          // if (sData.t !== 'undefined') {
          //   $("#info").html(sData.t);
          // }
          let now = new Date();
          $("#T_time").html(now.toString().split(" GMT")[0]);

        }

        if (sData.info == 'logT'){
          console.log(sData);
          // dataT = new dataTable("logData", "deg C");
          // dataT.setupTable();
          dataT.writeAllData(sData);
        }
        if (sData.info == 'logUpdate'){
          dataT.addRow(sData);
          graphT.addDataPoint(sData);
        }

      };
  };

  ws.onclose = function(evt) {
      $("#ws-status").html("Disconnected");
      $("#ws-status").css("background-color", "#faa");
      $("#server_light").val("OFF");
  };

  //MESSAGES TO SEND TO THE SERVER

  $("#checkTemp").click(function(){
      let msg = '{"what": "checkT"}';
      ws.send(msg);
      $("#T_measure").html("Checking Temperature");
  });

  $("#logT").click(function(){
      dataT = new dataTable("logData", "deg C");
      dataT.setupTable();

      graphT = new dataGraph("logGraph", "deg C");
      console.log(graphT.plot.data);

      let timeMin = parseInt($("#logT_timeMin").val());
      let timeSec = parseInt($("#logT_timeSec").val());
      let timeLog = timeMin * 60 + timeSec;

      let dtMin = parseInt($("#logT_dtMin").val());
      let dtSec = parseInt($("#logT_dtSec").val());
      let dt = dtMin * 60 + dtSec;

      let msg = {
        "what": "logT",
        "t": timeLog,
        "dt": dt,
        "update": "live"
      }
      ws.send(JSON.stringify(msg));
  });

  $("#hello").click(function(){
      let msg = '{"what": "hello"}';
      ws.send(msg);
  });

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
    th.appendChild(document.createTextNode("time"));
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
      // let tr = document.createElement("TR");
      //
      // let t = document.createElement("TD");
      // t.appendChild(document.createTextNode(data.logData[i]["t"]));
      // tr.appendChild(t);
      //
      // let val = document.createElement("TD");
      // val.appendChild(document.createTextNode(data.logData[i]["x"]));
      // tr.appendChild(val);
      //
      // this.body.appendChild(tr);
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
  constructor(targetDiv, dataTitle){
    this.targetDiv = targetDiv;
    this.dataTitle = dataTitle;

    this.plot = document.getElementById(targetDiv);

    Plotly.newPlot( this.plot,
      [
        {
          type: 'scatter',
        	x: [1, 2, 3, 4, 5],
        	y: [1, 2, 4, 8, 16]
        }
      ],
      {
    	   margin: { t: 0 }
       }
    );

  }
  addDataPoint( dataList ){
    // let x = this.plot.data[0].x.push(dataList["t"]);
    // let y = this.plot.data[0].y.push(dataList["x"]);
    let newx = parseFloat(dataList["t"]);
    let newy = parseFloat(dataList["x"]);
    console.log(x,y);
    let update = { x: [[newx]], y: [[newy]]};
    console.log(update);

    Plotly.extendTraces(this.plot, update, {}, [0] );
  }
}
