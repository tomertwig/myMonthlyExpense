#!/usr/bin/env python
# -*- coding: utf-8 -*- 
# encoding=utf8
# decoding=utf8

from flask import *
from json import *
from flask_cors import CORS, cross_origin
from flask import request
import mysql.connector
from sqlwrapper import mysqlwrapper
import random
from datetime import datetime
import os
from email_sender import EmailSender
from datetime import timedelta

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
USER_SPENT_TYPES = 'user_spent_types'
USERS_TABLE = 'users2' # 'tom'
USER_ID_TO_EMAILS = 'USER_ID_TO_EMAILS'
db.create_transactional_table(EXPENSES_TABLE, ['user_id', 'spent_type','amount',],['integer', 'integer','integer'])
db.create_transactional_table(MONTHLY_EXPENSES_TABLE, ['user_id', 'spent_type','amount',],['integer', 'integer','integer'])
db.create_table(USERS_TABLE, ['user_name', 'password','user_id',],['VARCHAR(20)', 'VARCHAR(64)','integer'], primary_key='user_name')
#db.create_table('spent_types', ['user_id', 'spent_type_id', 'spent_type_name'],['integer', 'integer',' VARCHAR(32)'], primary_key='user_id')
#db.create_transactional_table(USER_SPENT_TYPE, ['user_id', 'spent_type_id', 'spent_type_name'],['integer', 'integer',' VARCHAR(32)'])
db.create_table(USER_SPENT_TYPES, ['user_id', 'spent_type_id', 'spent_type_name', 'is_valid'],['integer', 'integer',' VARCHAR(32)', 'TINYINT(1)'])
#db.drop_table(USER_SPENT_TYPES)
#db.add_coulmn(USER_SPENT_TYPES, 'is_valid', 'TINYINT(1)' )


#db.add_coulmn(USERS_TABLE, 'user_email', 'VARCHAR(64)')

db.create_table(USER_ID_TO_EMAILS, ['user_id', 'email1', 'email2'],['integer', 'VARCHAR(32)',' VARCHAR(32)'])

#db.create_table('spent_types', ['user_id', 'spent_type_id', 'spent_type_name'],['integer', 'integer',' VARCHAR(32)'], primary_key='user_id')

#db.add_coulmn(EXPENSES_TABLE, 'unusual', 'TINYINT(1)' )

f = db.fetch_all(USER_ID_TO_EMAILS)
print f
@app.route('/deleteTransaction')
def deleteLatestTransaction():

    user_id = request.args.get('user_id', default=0, type=int)
    expenses_type =  request.args.get('expenses_type', default=-1, type=int)
    idx =  request.args.get('idx', default=-1, type=int)
    assert idx >= 0
    assert expenses_type >= 0
    
    table = EXPENSES_TABLE if expenses_type < 2 else MONTHLY_EXPENSES_TABLE
    month = request.args.get('month', default=0, type=int)
    year = request.args.get('year', default=0, type=int)
    fetched_mountly_data = db.fetch_last_rows(table, user_id, month, year) or ()
    
    print 'idxidxidxidxidx'
    print expenses_type

    print idx

    ts = None
    index = 0
    for f in fetched_mountly_data:
        if index == idx:
           ts = f[0]
           print 'found ts'
           print ts
           break
        if expenses_type == 2:
            index+= 1
        if expenses_type == 1 and f[4]: # 4 unusual
           index+= 1
        if expenses_type == 0 and not f[4]: 
            index+= 1
     
    assert ts

    db.delete_by(table, where='user_id = ' + str(user_id) + " and ts= ' " + str(ts) + "'")
    return ''


@app.route('/pay')
def pay():
    user_id = request.args.get('user_id', default=0, type=int)
    amount = request.args.get('amount', default=0, type=int)
    spent_type = request.args.get('spent_type', default=0, type=int)
    expense_type = request.args.get('expense_type', default=0, type=int)


    if amount <= 0 or spent_type == 0:
        print 'failed pay !!!! '
        jsonResp = {'result': 'failed'}
        return jsonify(jsonResp)

    table = MONTHLY_EXPENSES_TABLE if expense_type == 2 else EXPENSES_TABLE
    coulmns = ['user_id', 'spent_type', 'amount']
    data = [user_id, spent_type, amount]

    if expense_type < 2:
        unusual = expense_type == 1 
        coulmns.append('unusual')
        data.append(unusual)
    
    db.insert(table, coulmns, data)  

    jsonResp = {'result': 'succeeded'}
    return jsonify(jsonResp)

@app.route('/expenses')
def getLestExpenses():

    user_id = request.args.get('user_id', default=0, type=int)
    month = request.args.get('month', default=0, type=int)
    year = request.args.get('year', default=0, type=int)

    now = datetime.now() 

    monthly_expenses_data =[]
    one_time_data =[]
    unusual_data = []
    mountly_expenses_sum = 0
    one_time_expenses_sum = 0
    unusual_data_sum = 0

    jsonResp = {'monthlyExpensesData':monthly_expenses_data,
     'monthlyExpensesSum':mountly_expenses_sum,
     'oneTimeExpensesData': one_time_data,
     'unusualExpensesData':unusual_data,
     'unusualExpensesDataSum': unusual_data_sum,
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
        if d[4]:#unusual flag:
            unusual_data.append([d[0].strftime("%d-%m"), d[2], d[3]])
            unusual_data_sum += int(d[3])
        else:
            one_time_data.append([d[0].strftime("%d-%m"), d[2], d[3]])
            one_time_expenses_sum += int(d[3])

    jsonResp = {'monthlyExpensesData':monthly_expenses_data,
     'monthlyExpensesSum':mountly_expenses_sum,
     'oneTimeExpensesData': one_time_data,
     'unusualExpensesData':unusual_data,
     'unusualExpensesSum': unusual_data_sum,
     'oneTimeExpensesSum': one_time_expenses_sum}

    f = db.fetch_all(USER_ID_TO_EMAILS)
    print 'tomeormoermpoerneipnpien'
    print f

    return jsonify(jsonResp)

@app.route('/login')
def login():
    print 'login !!!! '
    user_name = request.args.get('user_name')
    password = request.args.get('password')

    fetched_data = db.fetch_all(USERS_TABLE)

    result = 'failed'

    fetched_data = db.fetch_by(USERS_TABLE, 'user_name= ' +"'" + str(user_name) +"'" )

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
    user_email = request.args.get('user_email')
    user_id = _get_next_unique_user_id()
    
    db.insert(USERS_TABLE, ['user_name', 'password', 'user_id', 'user_email'], [user_name, password, user_id, user_email])  

    spenTypes = {
    1:'🛒 Supermarket',
    2:'🍺 Bar',
    3:'🍽️ Restaurant',
    4:'🏥 SuperPharm',
    5:'🚌 Rav-Kav',
    6:'🥤 Tamara',
    8:'🚕 Taxi',
    11:'🚗 Car2Go',
    13:'🏡 Rent Bill',
    14:'🌐 Internet Bill',
    15:'🏋️️ GYM',
    16:'🏘️ House Committee',
    17:'👩‍🍳 Gas Bill',
    18:'🚰 Water Bill',
    19:'🔌 Electricity Bill',
    20:'🏢 Arnona Bill',
    21:'☕ Coffee',
    22:'⚽ Soccer',
    23:'🍀 Green',
    24:'🥂 Events',
    25:'👜 Fashion',
    26:'💅 Pedicure',
    100:'❓ Other',
    }

    for k,v in spenTypes.iteritems():
        db.insert(USER_SPENT_TYPES, ['user_id', 'spent_type_id', 'spent_type_name', 'is_valid'], [user_id,k,v, True])  


    jsonResp = {'result': 'succeeded'}
    return jsonify(jsonResp)

def _month_year_iter():
    start_month = 1
    start_year = 2019
    now = datetime.now() 

    end_month = datetime.now().month
    end_year = datetime.now().year
    ym_start= 12*start_year + start_month - 1


    ym_end= 12*end_year + end_month - 1

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
        result = [{'date': date, 'amount': mountly_expenses }] + result

    jsonResp = {'result': result}
    return jsonify(jsonResp)


@app.route('/spent_types')
def spent_types():
    user_id = request.args.get('user_id')
    jsonResp = {'spentTypes': {}}

    fetched_spent_type = db.fetch_all_user_id(USER_SPENT_TYPES, user_id) or ()

    spent_types = {s['spent_type_id']: [s['spent_type_name'], s['is_valid']] for s in fetched_spent_type }
    jsonResp = {'spentTypes': spent_types}

    return jsonify(jsonResp)

@app.route('/add_new_type')
def add_new_type():
    user_id = request.args.get('user_id')
    spent_type = request.args.get('spent_type')

    user_id = request.args.get('user_id')
    spent_type = request.args.get('spent_type')

    fetched_spent_type = db.fetch_all_user_id(USER_SPENT_TYPES, user_id) or ()
    next_id = fetched_spent_type[-1]['spent_type_id'] + 1 if fetched_spent_type else 0
    db.insert(USER_SPENT_TYPES, ['user_id', 'spent_type_id', 'spent_type_name', 'is_valid'], [user_id, next_id, spent_type, True])  

    jsonResp = {'result': 'success'}

    return jsonify(jsonResp)

@app.route('/remove_type')
def remove_type():
    print 'remove_type......'

    user_id = request.args.get('user_id')
    spent_type_id = request.args.get('spent_type_id')
    db.update_by(USER_SPENT_TYPES, ['is_valid'], [False], 'user_id=' + str(user_id) +' And  spent_type_id=' + str(spent_type_id) )
    jsonResp = {'result': 'success'}
    fetched_spent_type = db.fetch_all_user_id(USER_SPENT_TYPES, user_id) or ()
    return jsonify(jsonResp)

def _get_weekly_data(user_id):
    today = datetime.today()
    year = today.year
    month = today.month
    prev_month = 12 if month == 1 else month-1
    prev_year = year - 1 if prev_month == 12 else year
    fetched_curr_mountly_data = db.fetch_last_rows(EXPENSES_TABLE, user_id, month, year) or ()
    fetched_prev_mountly_data = db.fetch_last_rows(EXPENSES_TABLE, user_id, prev_month, prev_year) or ()
    fetched_mountly_data = fetched_curr_mountly_data +  fetched_prev_mountly_data
    report = ""
    sum = 0
    now = datetime.now() 
    last_week = now - timedelta(days=7)
    privous_week = last_week - timedelta(days=7)
    privous_week_sum = 0

    last_week_expenses = []
    for f in fetched_mountly_data:
        if f[0] > last_week:
            last_week_expenses.append((f[2],f[3],f[4]))
            sum += f[3]
        elif  f[0] > privous_week:
            privous_week_sum += f[3]

    print 'last_week_expenses'
    print last_week_expenses

    expens_to_sum ={}
    for e in last_week_expenses:
        if e[0] not in expens_to_sum:
            expens_to_sum[e[0]] = 0
        
        expens_to_sum[e[0]] += e[1]
    fetched_spent_type = db.fetch_all_user_id(USER_SPENT_TYPES, user_id) or ()

    spent_types = {s['spent_type_id']:s['spent_type_name'] for s in fetched_spent_type }

    report = 'Total expenses this week: ' + str(sum) + '\n Last week total expensess: ' + str(privous_week_sum) + '\n'

    report += 'Expenses this week: \n'

    for k,v  in expens_to_sum.iteritems():
        report +=  str(spent_types[k]) + ':' + str(v) + '\n'

    
    return report



@app.route('/send_weekly_reports')
def send_weekly_reports():
    fetched_data = db.fetch_all(USER_ID_TO_EMAILS)
    
    print fetched_data
    for f in fetched_data:
        user_id = f['user_id']
        emails = [f['email1']]
        email2 = f['email2']
        if email2:
           emails.append(email2) 

        data = _get_weekly_data(user_id)
        print data
        emails_to_data = [(emails,data)]
        sender = EmailSender(emails_to_data)
        sender.send_weekly_reports()
    
    jsonResp = {'result': 'success'}
    return jsonify(jsonResp)


if __name__ == '__main__':
    app.run(host='0.0.0.0')