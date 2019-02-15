from datetime import datetime
from threading import Timer
from email_sender import EmailSender
class Scheduler():
    def __init__(self):
        pass
    
    def run_weekly_email_task():
        x=datetime.today()
        
        delta_day = 0
        if x.weekday() <= 5 :
            delta_day = 5 - x.weekday() 
        else:
            delta_day = 6

        y=x.replace(day=x.day+delta_day, hour=22, minute=0, second=0, microsecond=0)

        delta_t=y-x

        secs=delta_t.seconds+1

        #secs = 1

        sender = EmailSender ()
        t = Timer(secs, sender.send_weekly_reports)
        t.start()
