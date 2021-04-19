from sensor_T import *
import asyncio
import time

import RPi.GPIO as gpio
gpio.setmode(gpio.BCM)

relayPin = 26

sT = sensor_T(None)
T = sT.read()
print(T)

gpio.setup(relayPin, gpio.OUT)

for i in range(4):
    gpio.output(relayPin, gpio.HIGH)
    time.sleep(2)
    gpio.output(relayPin, gpio.LOW)
    time.sleep(2)
