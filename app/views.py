from flask import redirect, render_template
from flask import request, url_for
from flask_user import current_user, login_required, roles_accepted
from app.init_app import app, db, csrf
from app.models import UserProfileForm
import json
import requests

@app.before_request
def before_request():
    pass

@app.route('/')
@login_required
def home_page():
    return render_template('index.html')

@app.route('/user')
@login_required  # Limits access to authenticated users
def user_page():
    return render_template('pages/user_page.html')

@app.route('/admin')
@roles_accepted('admin')  # Limits access to users with the 'admin' role
def admin_page():
    return render_template('pages/admin_page.html')

@app.route('/pages/profile', methods=['GET', 'POST'])
@login_required
def user_profile_page():
    # Initialize form
    form = UserProfileForm(request.form, current_user)

    # Process valid POST
    if request.method == 'POST' and form.validate():
        # Copy form fields to user_profile fields
        form.populate_obj(current_user)

        # Save user_profile
        db.session.commit()

        # Redirect to home page
        return redirect(url_for('home_page'))

    # Process GET or invalid POST
    return render_template('pages/user_profile_page.html',
                           form=form)

@app.route('/index', methods=['GET','POST'])
@login_required
def search_page():
    return render_template('index.html')

@csrf.exempt
@app.route('/_search', methods=['GET','POST'])
@login_required
def search_es():
    query = request.get_data()
    search_url = app.config['SEARCH_URL']
    response = requests.get(search_url, data=query)
    return response.text

@app.route('/professors/<index>', methods=['GET','POST'])
@login_required
def professor_page(index):
    query = json.dumps({
        "query": {
            "match": {
                "index": index
            }
        }
    })
    search_url=app.config['SEARCH_URL']
    response = requests.get(search_url, data=query)
    results = json.loads(response.text)
    professor = {}
    try:
        professor = results['hits']['hits'][0]['_source']
    except:
        professor = {}

    professor['url_root'] = request.url_root
    professor['search_url'] = search_url

    try:
        professor['research'] = eval(professor['research'])
        professor['research_isList'] = True
    except:
        professor['research'] = professor['research']
        professor['research_isList'] = False

    try:
        professor['publication'] = eval(professor['publication'])
        professor['publication_isList'] = True
    except:
        professor['publication'] = professor['publication']
        professor['publication_isList'] = False

    try:
        professor['education'] = eval(professor['education'])
        professor['education_isList'] = True
    except:
        professor['education'] = professor['education']
        professor['education_isList'] = False

    try:
        professor['education_linkedin'] = eval(professor['education_linkedin'])
        professor['education_linkedin_isList'] = True
    except:
        professor['education_linkedin'] = professor['education_linkedin']
        professor['education_linkedin_isList'] = False

    try:
        professor['experience_linkedin'] = eval(professor['experience_linkedin'])
        professor['experience_linkedin_isList'] = True
    except:
        professor['experience_linkedin'] = professor['experience_linkedin']
        professor['experience_linkedin_isList'] = False

    try:
        professor['status_linkedin'] = professor['status_linkedin']
    except:
        professor['status_linkedin'] =''

    try:
        professor['company_linkedin'] = professor['company_linkedin']
    except:
        professor['company_linkedin'] =''

    try:
        professor['summary_linkedin'] = professor['summary_linkedin']
    except:
        professor['summary_linkedin'] =''

    return render_template('professor.html', results=professor)
