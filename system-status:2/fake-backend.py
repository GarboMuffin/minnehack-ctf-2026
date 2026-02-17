import time
import random
import datetime

def rand_ip():
    return f"10.{random.randint(0,23)}.{random.randint(0,255)}.{random.randint(1,254)}"

def active():
    with open('status') as f:
        return "1" in f.read()

ENDPOINTS = [
    "/api/reactor/power_level",
    "/api/cooling/pump_status",
    "/api/radiation/check",
    "/api/control_rods/health",
    "/api/turbine/rpm"
]

while True:
    sleep_time = 0.5
    
    if active():
        now = datetime.datetime.now()
        timestamp = now.strftime("%d/%b/%Y:%H:%M:%S %z")
        ip = rand_ip()
        endpoint = random.choice(ENDPOINTS)
        status = random.choice([200, 200, 200, 200, 500, 503])
        size = random.randint(100, 2000)
        
        with open("log.txt", "a") as f:
            f.write(f'{ip} - - [{timestamp}] "GET {endpoint} HTTP/1.1" {status} {size}\n')
        
        sleep_time = random.uniform(0.1, 1.0)
    
    time.sleep(sleep_time)
