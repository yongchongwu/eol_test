# Settings common to all environments (development|staging|production)

import os

# Application settings
APP_NAME = "EOL 海外人才数据库"
APP_SYSTEM_ERROR_SUBJECT_LINE = APP_NAME + " system error"

# ElasticSearch URL
# SEARCH_URL = "http://172.26.8.226:9200/professors_20171016_data/logs/_search/"
SEARCH_URL = "http://47.92.85.234:9200/professors_20171016_data/logs/_search/"

# Flask settings
CSRF_ENABLED = True
WTF_CSRF_ENABLED=True
WTF_CSRF_CHECK_DEFAULT=True

# Flask-SQLAlchemy settings
SQLALCHEMY_TRACK_MODIFICATIONS = False

# Flask-User settings
USER_APP_NAME = APP_NAME
USER_ENABLE_CHANGE_PASSWORD = True  # Allow users to change their password
USER_ENABLE_CHANGE_USERNAME = False  # Allow users to change their username
USER_ENABLE_CONFIRM_EMAIL = False  # Force users to confirm their email
USER_ENABLE_FORGOT_PASSWORD = True  # Allow users to reset their passwords
USER_ENABLE_EMAIL = False  # Register with Email
USER_ENABLE_REGISTRATION = False  # Allow new users to register
USER_ENABLE_RETYPE_PASSWORD = True  # Prompt for `retype password` in:
USER_ENABLE_USERNAME = False  # Register and Login with username
USER_AFTER_LOGIN_ENDPOINT = 'user_page'
USER_AFTER_LOGOUT_ENDPOINT = 'home_page'

