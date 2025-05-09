import os
import logging
from flask import Flask, render_template, redirect, url_for
from flask_login import LoginManager, current_user
from models import User

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET")

# Initialize login manager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'auth.login'

@login_manager.user_loader
def load_user(user_id):
    from models import User
    return User.query_by_id(user_id)

# Register blueprints
from blueprints.auth import auth_bp
from blueprints.resources import resources_bp
from blueprints.users import users_bp
from blueprints.dashboard import dashboard_bp

app.register_blueprint(auth_bp)
app.register_blueprint(resources_bp, url_prefix='/resources')
app.register_blueprint(users_bp, url_prefix='/users')
app.register_blueprint(dashboard_bp, url_prefix='/dashboard')

@app.route("/")
def index():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard.index'))
    return render_template(
        "index.html",
        firebase_api_key=os.environ.get("FIREBASE_API_KEY"),
        firebase_project_id=os.environ.get("FIREBASE_PROJECT_ID"),
        firebase_app_id=os.environ.get("FIREBASE_APP_ID"),
    )

@app.context_processor
def global_template_vars():
    return {
        'app_name': 'Zelopack Gerenciamento de Recursos',
        'current_year': 2023
    }

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_server_error(e):
    return render_template('500.html'), 500
