# piSensors
Attaching using a Raspberry Pi as a data logger with different sensors:
1) DS18B20 temperature sensor 

* Author: Lensyl Urbano
* https://montessorimuddle.org


# Set up Raspberry Pi

## Install OS
### Create image on the SD card:
 (make image using Raspberry Pi Imager: https://www.raspberrypi.org/software/)

### Setup ssh, wifi, and usb connection
 Working on the boot directory of the SD Card

#### 1) ssh
[copy] or create empty file ***ssh*** on SD Card's boot directory
* Filename: *ssh*

#### 2) wpa_supplicant.conf
[edit] or create file for wifi connection and copy to boot directory of Pi:
* File name: *wpa_supplicant.conf*
* Change: `networkName` and `yourPassword`

The file should look like:

*wpa_supplicant.conf*
```
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1

network={
 ssid="networkName"
 psk="yourPassword"
}
```

#### 3) USB connection and 1-Wire Interface for temperature sensor.
[copy] over or update files on the SD Card for usb connection (https://learn.adafruit.com/turning-your-raspberry-pi-zero-into-a-usb-gadget/ethernet-gadget)

***config.txt***: Add `dtoverlay=dwc2` as the last line for USB, and add then `dtoverlay=w1-gpio` for 1-Wire.
 ```
dtoverlay=dwc2
dtoverlay=w1-gpio
```

***cmdline.txt***: Insert:
``` modules-load=dwc2,g_ether```
after `rootwait` (e.g. `rootwait modules-load=dwc2,g_ether`).


## Set up Pi

### Connect to Pi

Plug Pi into Laptop USB then once pi has booted up:

*Option 1: Windows*: Login with (putty: https://www.putty.org/):
* PuTTY Host/IP: raspberrypi.local
* Port: 22
* Username: pi
* Password: raspberry

*Option 2: Mac or Linux*: use Terminal app, which is built in, for the command line:
```console
ssh pi@raspberrypi.local
```

*NOTE: Troubleshooting*: you may have to remove the **~/.ssh/known_hosts** file if you find yourself logging in to the wrong pi or unable to connect.
```console
rm .ssh/known_hosts
```


### update Pi
Once you're logged into the Pi
 ```console
sudo apt-get update
sudo apt-get upgrade
```

### REBOOT pi
 ```console
sudo reboot
```
```

# Installing this software: r
From your home directory clone the github repository.
```console
git clone https://github.com/lurbano/piTornado-basic.git
```

# Setting up Server
## Install Tornado Webserver

Setting up the tornado server used for Websockets
```console
sudo pip3 install tornado
```

### Starting server
Go to the folder *~/piTornado/webServer/* and run the command
```console
sudo python3 server.py
```

### The webpage
The webpage will be at the pi's ip address (which should be printed to the screen when you start the server) and on port 8060 so if your ip address is 192.168.1.234, open up your browser and go to:
> http://192.168.1.234:8060

### Starting up on boot
** IMPORTANT **: the directory with the files needs to be in the pi home directory (e.g. */home/pi/rpi-led-strip*) with this setup. You can change this but be sure to put the full path to the commands. (From: https://learn.sparkfun.com/tutorials/how-to-run-a-raspberry-pi-program-on-startup)

EDIT */etc/rc.local* (the easy way)
```console
sudo nano /etc/rc.local
```

ADD THE LINE (before `exit 0` ).
```
sudo /usr/bin/python3 /home/pi/piTornado-basic/webServer/server.py  2> /home/pi/rpi-led-strip/error.log &
```

Save and exit (Ctrl-S and Ctrl-X) and then restart the Pi from the command line:
```console
sudo reboot
```


### If you need to kill the server
* https://unix.stackexchange.com/questions/104821/how-to-terminate-a-background-process
```console
pgrep -a python3
```
* this will give you the process id, the name line of the command, and a number 'nnn'. Find the one that has 'python3 server.py'. To kill use:
```console
sudo kill nnn
```

# Sous Vide









# [EXAMPLE] Adding things to be controlled by the webpage
The code below shows the whole process for creating the Hello World button.

## Add hello world button
*webServer/templates/index.html*: Add HTML for a button (#hello) and a span (#HelloResponse) where we will put the response from the server.
```HTML
<input type="button" id="hello" value="Hello World">
<span id="HelloResponse"></span>
```

## Add javascript
To listen for when someone clicks the Hello World button:
*webserver/static/ws-client.js* near bottom of file
```js
$("#hello").click(function(){
    let msg = '{"what": "hello"}';
    ws.send(msg);
});
```

Here we're sending the dict {"what": "hello"} to the server.


## Have the server act
It has to figure out what to do when it gets the message: msg = {"what": "hello"} in *webserver/server.py*. the write_message method sends the dictionary object `{"info": "hello", "reply":r}` back to the browser (client).
```.py
			if msg["what"] == "hello":
				r = 'Say what?'
				self.write_message({"info": "hello", "reply":r})
```

## Update the webpage

Now we go back to the *webserver/static/ws-client.js* to add some code to deal with the response from the server. Inside the ws.onmessage function add:

```js
if (sData.info == 'hello'){
  r = sData.reply.toString();
  $("#HelloResponse").html(r);
}
```

# Other examples
The `Start Timer` button follows the same steps as the Hello World button, but in addition it:

1) Collects information from two other inputs (minutes and seconds)

2) Runs a timer function (`basicTimer`, which is imported from another file *basic.py*) asynchronously, so that it could be running but the server can still do other stuff.

3) *basic.py* has the code for the `basicTimer` function.

The `Reboot Pi` button shows you how you could live dangerously and run terminal commands from your python script to, in this case, reboot the Pi.

# Refs:
OLED:
* http://codelectron.com/setup-oled-display-raspberry-pi-python/
* https://learn.adafruit.com/adafruit-pioled-128x32-mini-oled-for-raspberry-pi/usage

Temperature Sensor: DS18B20
* https://learn.adafruit.com/adafruits-raspberry-pi-lesson-11-ds18b20-temperature-sensing/ds18b20
* https://www.circuitbasics.com/raspberry-pi-ds18b20-temperature-sensor-tutorial/
