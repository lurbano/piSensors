from sensor_T import *
import asyncio

sT = sensor_T()
T = await sT.read()
print(T)
