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

while True:
    T = sT.read()
    TF = (T *9/5)+32
    print(T, TF)
    time.sleep(1)
