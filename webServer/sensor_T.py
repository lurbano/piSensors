import time
import asyncio
from subprocess import Popen
import glob
import pprint

class sensor_T:

    def __init__(self):

        #Thermometer setup
        Popen(['modprobe', 'w1-gpio'])
        Popen(['modprobe', 'w1-therm'])

        self.base_dir = '/sys/bus/w1/devices/'
        self.device_folder = glob.glob(self.base_dir + '28*')[0]
        self.device_file = self.device_folder + '/w1_slave'

    def read(self):
        l_yes = False
        while (not l_yes):
            with open(self.device_file) as f:
                lns = f.readlines()
                if (lns[0].strip()[-3:] == 'YES'):
                    l_yes = True
                    equals_pos = lns[1].find('t=')
                    if equals_pos != -1:
                        T_str = lns[1][equals_pos+2:]
                        T_C = float(T_str) / 1000.0
                #print(lns[0])
                #print(lns[1])
            time.sleep(0.25)
        return T_C

    async def aRead(self, server, getTime=False):
        l_yes = False
        while (not l_yes):
            with open(self.device_file) as f:
                lns = f.readlines()
                if (lns[0].strip()[-3:] == 'YES'):
                    l_yes = True
                    equals_pos = lns[1].find('t=')
                    if equals_pos != -1:
                        T_str = lns[1][equals_pos+2:]
                        T_C = float(T_str) / 1000.0
                #print(lns[0])
                #print(lns[1])
            time.sleep(0.25)
        message = { "info": "T", "T": T_C }
        if getTime:
            #now = time.localtime()
            #now = time.strftime("%a %b %d. %H:%S")
            message["t"] = time.ctime(time.time())
        server.write_message(message)
        return message

    async def aLog(self, server, t, dt):
        timeLeft = t
        message = {}
        message["info"] = "logT"
        message['start'] = time.ctime(time.time())
        message['logData'] = []
        while timeLeft > 0:
            timeLeft -= dt
            data = await self.aRead(server, getTime=True)
            data["ts"] = t - timeLeft
            message['logData'].append(data)
            time.sleep(dt)
        server.write_message(message)
        pprint.pprint(message)
