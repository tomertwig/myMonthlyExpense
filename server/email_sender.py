import smtplib

from email.mime.multipart import MIMEMultipart
from email.MIMEText import MIMEText
from datetime import datetime  

 

class EmailSender():
    
    def __init__(self, emails_to_data):

        filepath = 'email_conf.txt'  
        with open(filepath) as fp:  
            self.sender_address = fp.readline()
            self.password = fp.readline()
        
        self.emails_to_data = emails_to_data

    def send_weekly_reports(self):
        
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(self.sender_address, "nbvcxz11")
        for emails, data in self.emails_to_data:
            for email in emails:
                msg = MIMEMultipart()
                msg['From'] = self.sender_address
                msg['To'] = email
                msg['Subject'] = 'Your weakly report'
                
                msg.attach(MIMEText(data, 'plain'))
                text = msg.as_string()

                server.sendmail(self.sender_address, email, text)
        server.quit()

