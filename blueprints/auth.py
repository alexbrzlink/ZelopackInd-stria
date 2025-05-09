import os
import json
from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from flask_login import login_user, logout_user, login_required, current_user
import pyrebase
import requests
from models import User

auth_bp = Blueprint('auth', __name__)

# Firebase configuration
firebase_config = {
    "apiKey": os.environ.get("FIREBASE_API_KEY"),
    "authDomain": f"{os.environ.get('FIREBASE_PROJECT_ID')}.firebaseapp.com",
    "databaseURL": f"https://{os.environ.get('FIREBASE_PROJECT_ID')}-default-rtdb.firebaseio.com",
    "projectId": os.environ.get("FIREBASE_PROJECT_ID"),
    "storageBucket": f"{os.environ.get('FIREBASE_PROJECT_ID')}.appspot.com",
    "messagingSenderId": "",
    "appId": os.environ.get("FIREBASE_APP_ID")
}

# Initialize Firebase
firebase = pyrebase.initialize_app(firebase_config)
auth = firebase.auth()

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard.index'))
    
    error = None
    
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        try:
            # Authenticate user with Firebase
            user = auth.sign_in_with_email_and_password(email, password)
            
            # Get user info from Firebase
            user_info = auth.get_account_info(user['idToken'])
            user_id = user_info['users'][0]['localId']
            
            # Check if user exists in database
            db_user = User.query_by_id(user_id)
            
            if db_user is None:
                # Create user in database if not exists
                db_user = User.create({
                    'localId': user_id,
                    'email': email,
                    'name': email.split('@')[0]
                })
            
            # Login the user
            login_user(db_user)
            
            # Save user token in session
            session['user_token'] = user['idToken']
            
            flash('Login realizado com sucesso!', 'success')
            return redirect(url_for('dashboard.index'))
            
        except requests.exceptions.HTTPError as e:
            error_json = e.args[1]
            error_data = json.loads(error_json)
            error_message = error_data.get('error', {}).get('message', 'Erro desconhecido')
            
            if error_message == 'EMAIL_NOT_FOUND':
                error = 'Email não encontrado. Por favor, verifique suas credenciais.'
            elif error_message == 'INVALID_PASSWORD':
                error = 'Senha inválida. Por favor, tente novamente.'
            elif error_message == 'USER_DISABLED':
                error = 'Sua conta foi desativada. Entre em contato com o administrador.'
            else:
                error = f'Erro ao fazer login: {error_message}'
                
            flash(error, 'danger')
    
    return render_template('login.html', 
                          firebase_api_key=os.environ.get("FIREBASE_API_KEY"),
                          firebase_project_id=os.environ.get("FIREBASE_PROJECT_ID"),
                          firebase_app_id=os.environ.get("FIREBASE_APP_ID"))

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    session.pop('user_token', None)
    flash('Você foi desconectado.', 'info')
    return redirect(url_for('index'))

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard.index'))
    
    error = None
    
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        name = request.form.get('name')
        
        try:
            # Create user in Firebase
            user = auth.create_user_with_email_and_password(email, password)
            
            # Get user info from Firebase
            user_info = auth.get_account_info(user['idToken'])
            user_id = user_info['users'][0]['localId']
            
            # Create user in database
            db_user = User.create({
                'localId': user_id,
                'email': email,
                'name': name if name else email.split('@')[0]
            })
            
            # Login the user
            login_user(db_user)
            
            # Save user token in session
            session['user_token'] = user['idToken']
            
            flash('Registro realizado com sucesso!', 'success')
            return redirect(url_for('dashboard.index'))
            
        except requests.exceptions.HTTPError as e:
            error_json = e.args[1]
            error_data = json.loads(error_json)
            error_message = error_data.get('error', {}).get('message', 'Erro desconhecido')
            
            if error_message == 'EMAIL_EXISTS':
                error = 'Este email já está em uso. Tente fazer login.'
            elif error_message == 'WEAK_PASSWORD':
                error = 'Senha muito fraca. Use pelo menos 6 caracteres.'
            else:
                error = f'Erro ao criar conta: {error_message}'
                
            flash(error, 'danger')
    
    return render_template('login.html', register=True,
                          firebase_api_key=os.environ.get("FIREBASE_API_KEY"),
                          firebase_project_id=os.environ.get("FIREBASE_PROJECT_ID"),
                          firebase_app_id=os.environ.get("FIREBASE_APP_ID"))

@auth_bp.route('/reset-password', methods=['GET', 'POST'])
def reset_password():
    if request.method == 'POST':
        email = request.form.get('email')
        
        try:
            auth.send_password_reset_email(email)
            flash('Email de redefinição de senha enviado. Verifique sua caixa de entrada.', 'info')
            return redirect(url_for('auth.login'))
        except:
            flash('Erro ao enviar email de redefinição. Verifique se o email está correto.', 'danger')
    
    return render_template('login.html', reset_password=True,
                          firebase_api_key=os.environ.get("FIREBASE_API_KEY"),
                          firebase_project_id=os.environ.get("FIREBASE_PROJECT_ID"),
                          firebase_app_id=os.environ.get("FIREBASE_APP_ID"))

@auth_bp.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    if request.method == 'POST':
        name = request.form.get('name')
        department = request.form.get('department')
        
        # Update user profile
        user_data = {
            'name': name,
            'department': department
        }
        
        if User.update(current_user.id, user_data):
            flash('Perfil atualizado com sucesso!', 'success')
            return redirect(url_for('auth.profile'))
        else:
            flash('Erro ao atualizar perfil. Tente novamente.', 'danger')
    
    return render_template('profile.html')
