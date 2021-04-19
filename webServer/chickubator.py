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
    print(T, TF, TF > 99.5)

    if (TF > 99.5):
        gpio.output(relayPin, gpio.LOW)
    else:
        gpio.output(relayPin, gpio.HIGH)

    gpio.output(relayPin, gpio.HIGH)
    time.sleep(2)
    gpio.output(relayPin, gpio.LOW)
    time.sleep(2)
