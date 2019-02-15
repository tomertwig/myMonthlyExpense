FROM ubuntu:latest


EXPOSE 5000

WORKDIR /app

COPY requirements.txt /app
RUN apt-get update -y
RUN apt-get install -y python python-pip wget
RUN pip install Flask
RUN pip install flask-cors 
RUN apt-get install libmysqlclient-dev -y
RUN pip install mysql
RUN pip install mysql-connector-python  
RUN pip install psycopg2 
RUN pip install -r requirements.txt

COPY app.py /app
COPY sqlwrapper /app/sqlwrapper

CMD python app.py
