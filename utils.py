import random
from datetime import datetime, timedelta

def generate_otp():
    return str(random.randint(100000, 999999))
