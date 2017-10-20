import os

# *****************************
# Environment specific settings
# *****************************

# DO NOT use "DEBUG = True" in production environments
DEBUG = True

# DO NOT use Unsecure Secrets in production environments
# Generate a safe one with:
#     python -c "import os; print repr(os.urandom(24));"
SECRET_KEY = "\xb2\x86\x85'\xa2\xbf9A\x9e\x1e0\xfej\x1d\xfbOS,d9\x1a\xc7\x8c\x19"

# SQLAlchemy settings
SQLALCHEMY_DATABASE_URI = 'sqlite:///../app.sqlite'

# Flask-Mail settings
MAIL_SERVER = 'smtp.exmail.qq.com'
MAIL_PORT = 465
MAIL_USE_SSL = True
MAIL_USE_TLS = False
MAIL_USERNAME = 'nemo@ifuture.ai'
MAIL_PASSWORD = 'Eol2017'
MAIL_DEFAULT_SENDER = '"Yu Zhu" <nemo@ifuture.ai>'

ADMINS = [
    '"Yu Zhu" <nemo@ifuture.ai>',
    ]
