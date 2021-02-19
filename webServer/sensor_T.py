import time
import asyncio
import subprocess

class sensor_T:

    def __init__(self):

        #Thermometer setup
        Popen(['modprobe', 'w1-gpio'])
        Popen(['modprobe', 'w1-therm'])

        self.base_dir = '/sys/bus/w1/devices/'
        self.device_folder = glob.glob(base_dir + '28*')[0]
        self.device_file = device_folder + '/w1_slave'

    def read():
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
