from flask import *
from json import *
from flask_cors import CORS, cross_origin
from flask import request
import mysql.connector
from sqlwrapper import mysqlwrapper
import random

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
USERS_TABLE = 'users1' # 'tom'

db.create_transactional_table(EXPENSES_TABLE, ['user_id', 'spent_type','amount',],['integer', 'integer','integer'])
db.create_table(USERS_TABLE, ['user_name', 'password','user_id',],['VARCHAR(20)', 'VARCHAR(20)','integer'], primary_key='user_name')

@app.route('/deleteLatestTransaction')
def deleteLatestTransaction():
    user_id = request.args.get('user_id', default=0, type=int)
    print ('deleteLatestTransaction !!!! ')
    db.delete_latest_transaction(EXPENSES_TABLE, user_id)
    return ''


@app.route('/pay')
def pay():
    print 'pay !!!! '
    user_id = request.args.get('user_id', default=0, type=int)
    amount = request.args.get('amount', default=0, type=int)
    spent_type = request.args.get('spent_type', default=0, type=int)
    if amount == 0 or spent_type == 0:
        print user_id
        print amount
        print spent_type

        print 'failed pay !!!! '
        jsonResp = {'result': 'failed'}
        return jsonify(jsonResp)

    db.insert(EXPENSES_TABLE, ['user_id', 'spent_type', 'amount'], [user_id, spent_type, amount])  

    jsonResp = {'result': 'succeeded'}
    return jsonify(jsonResp)



@app.route('/expenses')
def getLestExpenses():
    user_id = request.args.get('user_id', default=0, type=int)

    all = request.args.get('all', default=0, type=int) == 1

    data = []
    mountly_expenses = 0
    jsonResp = {'expenses': data, 'expensesSum': mountly_expenses}

    fetched_data = db.fetch_last_rows(EXPENSES_TABLE, user_id)
    
    if fetched_data:
        number_of_rows = len(fetched_data) if all else min (10, len(fetched_data))
        print (fetched_data)

        i = 0
        for d in fetched_data[:number_of_rows]:
            data.append([d[0].strftime("%Y-%m-%d"), d[2], d[3]])
            mountly_expenses += int(d[3])
            i += 1

        for d in fetched_data[i:]:
            mountly_expenses += int(d[3])

        jsonResp = {'expenses': data, 'expensesSum': mountly_expenses}
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
    print "jdsaiojsdaioadjoidasjiodjiodsaji"

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

if __name__ == '__main__':
    app.run(host='0.0.0.0')
