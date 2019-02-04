from flask import *
from json import *
from flask_cors import CORS, cross_origin
from flask import request
import mysql.connector
from sqlwrapper import mysqlwrapper
import random
from datetime import datetime
import os

DATABASE = 'test123'
app = Flask(__name__)
CORS(app)
db = mysqlwrapper()
db.connect("db", "root", "root")
try:
    db.create_db(DATABASE)
except Exception as e:
    print 'db already initalized'

db.connect_db(DATABASE)
EXPENSES_TABLE = 'with_user_id' # 'tom'
MONTHLY_EXPENSES_TABLE = 'monthly'
USERS_TABLE = 'users2' # 'tom'
db.create_transactional_table(EXPENSES_TABLE, ['user_id', 'spent_type','amount',],['integer', 'integer','integer'])
db.create_transactional_table(MONTHLY_EXPENSES_TABLE, ['user_id', 'spent_type','amount',],['integer', 'integer','integer'])
db.create_table(USERS_TABLE, ['user_name', 'password','user_id',],['VARCHAR(20)', 'VARCHAR(64)','integer'], primary_key='user_name')

@app.route('/deleteLatestTransaction')
def deleteLatestTransaction():
    user_id = request.args.get('user_id', default=0, type=int)
    isOneTimeExpenses = request.args.get('isOneTimeExpenses') == 'true'
    table = EXPENSES_TABLE if isOneTimeExpenses else MONTHLY_EXPENSES_TABLE
    db.delete_latest_transaction(table, user_id)
    return ''


@app.route('/pay')
def pay():
    user_id = request.args.get('user_id', default=0, type=int)
    amount = request.args.get('amount', default=0, type=int)
    spent_type = request.args.get('spent_type', default=0, type=int)
    is_monthly_expense = request.args.get('is_monthly_expense') == 'true'


    if amount <= 0 or spent_type == 0:
        print 'failed pay !!!! '
        jsonResp = {'result': 'failed'}
        return jsonify(jsonResp)
    
    table = MONTHLY_EXPENSES_TABLE if is_monthly_expense else EXPENSES_TABLE
    db.insert(table, ['user_id', 'spent_type', 'amount'], [user_id, spent_type, amount])  

    jsonResp = {'result': 'succeeded'}
    return jsonify(jsonResp)

def _db_heartbeat():
    try:
      print '_db_heartbeat'
      db.fetch_first(EXPENSES_TABLE)
    except Exception as e:
        exit()


@app.route('/expenses')
def getLestExpenses():
    print 'expenses'
    _db_heartbeat()

    user_id = request.args.get('user_id', default=0, type=int)
    month = request.args.get('month', default=0, type=int)
    year = request.args.get('year', default=0, type=int)

    now = datetime.now() 

    monthly_expenses_data =[]
    one_time_data =[]
    mountly_expenses_sum = 0
    one_time_expenses_sum = 0

    jsonResp = {'monthlyExpensesData':monthly_expenses_data, 'monthlyExpensesSum':mountly_expenses_sum,
     'oneTimeExpensesData': one_time_data,
     'oneTimeExpensesSum': one_time_expenses_sum}

    fetched_one_time_data = db.fetch_last_rows(EXPENSES_TABLE, user_id, month, year) or ()
    fetched_mountly_data = db.fetch_last_rows(MONTHLY_EXPENSES_TABLE, user_id) or ()

    for d in fetched_mountly_data:
        fetched_month = int(d[0].strftime("%m"))
        fetched_year = int(d[0].strftime("%Y"))

        if fetched_year < year or (fetched_year == year and fetched_month <= month):
            monthly_expenses_data.append([now.replace(day=1, month=month).strftime("%d-%m"), d[2], d[3]])
            mountly_expenses_sum += int(d[3])  
    
    for d in fetched_one_time_data:
        one_time_data.append([d[0].strftime("%d-%m"), d[2], d[3]])
        one_time_expenses_sum += int(d[3])
        
    jsonResp = {'monthlyExpensesData':monthly_expenses_data, 'monthlyExpensesSum':mountly_expenses_sum,
     'oneTimeExpensesData': one_time_data,
     'oneTimeExpensesSum': one_time_expenses_sum}
    return jsonify(jsonResp)

@app.route('/login')
def login():
    print 'login !!!! '
    user_name = request.args.get('user_name')
    password = request.args.get('password')

    fetched_data = db.fetch_all(USERS_TABLE)

    result = 'failed'

    fetched_data = db.fetch_by(USERS_TABLE, 'user_name= ' +"'" + str(user_name) +"'" )
    print fetched_data

    user_id = 0
    if len(fetched_data) == 1 and fetched_data[0]['password'] == password:
        result = 'succeeded' 
        user_id = fetched_data[0]['user_id']

    jsonResp = {'result': result, 'userID': user_id}
    return jsonify(jsonResp)

def _get_next_unique_user_id():
    fetched_data = db.fetch_all(USERS_TABLE)

    unique = False 
    user_id = None
    while not unique:
        unique = True
        user_id = random.randint(1,1000000)

        for d in fetched_data:
            if d['user_id'] == user_id:
                unique = False
                break
    
    return user_id

@app.route('/signin')
def sign_in():
    user_name = request.args.get('user_name')
    password = request.args.get('password')
    user_id = _get_next_unique_user_id()
    
    db.insert(USERS_TABLE, ['user_name', 'password', 'user_id'], [user_name, password, user_id])  
    jsonResp = {'result': 'succeeded'}
    return jsonify(jsonResp)

def _month_year_iter():
    start_month = 1
    start_year = 2019
    now = datetime.now() 

    end_month = datetime.now().month
    print end_month
    end_year = datetime.now().year
    ym_start= 12*start_year + start_month - 1


    ym_end= 12*end_year + end_month - 1
    print ym_start
    print ym_end


    for ym in range( ym_start, ym_end +1 ):
        y, m = divmod( ym, 12 )
        yield m+1, y

@app.route('/all_expenses')
def all_expenses():
    user_id = request.args.get('user_id')
    result = []
    now = datetime.now() 

    fetched_permanent_data = db.fetch_last_rows(MONTHLY_EXPENSES_TABLE, user_id) or ()

    for month, year in _month_year_iter():
        print 'month'
        print month

        fetched_mountly_data = db.fetch_last_rows(EXPENSES_TABLE, user_id, month, year) or ()

        mountly_expenses = 0
        for d in fetched_mountly_data:
            mountly_expenses += int(d[3])

        for d in fetched_permanent_data:
            fetched_month = int(d[0].strftime("%m"))
            fetched_year = int(d[0].strftime("%Y"))

            if fetched_year < year or (fetched_year == year and fetched_month <= month):
                mountly_expenses += int(d[3])  
                
        date = now.replace(month=month, year=year).strftime("%m-%Y")
        print result
        result = [{'date': date, 'amount': mountly_expenses }] + result
        print result

    jsonResp = {'result': result}
    return jsonify(jsonResp)

if __name__ == '__main__':
    app.run(host='0.0.0.0')
