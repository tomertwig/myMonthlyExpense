import smtplib

from email.mime.multipart import MIMEMultipart
from email.MIMEText import MIMEText
from datetime import datetime  

 

class EmailSender():
    
    def __init__(self, emails_to_data):

        filepath = 'email_conf.txt'  
        with open(filepath) as fp:  
            temp = fp.read().splitlines()
            self.sender_address = temp[0]
            self.password = temp[1]
        

        print 'EmailSenderEmailSenderEmailSender'
        print self.sender_address
        print self.password

        self.emails_to_data = emails_to_data

    def send_weekly_reports(self):
        
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(self.sender_address, self.password)
        for emails_to_data in self.emails_to_data:
            print  emails_to_data
            for email in emails_to_data[0]:
                print email
                msg = MIMEMultipart()
                msg['From'] = 'My-Monthly -Expensess'
                msg['To'] = email
                msg['Subject'] = 'Your weekly expensess'
                print emails_to_data[1]
                msg.attach(MIMEText(emails_to_data[1], 'plain'))
                text = msg.as_string()

                server.sendmail(self.sender_address, email, text)
        server.quit()
