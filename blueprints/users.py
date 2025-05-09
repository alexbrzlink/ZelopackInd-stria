from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user
from models import User
from config import Config

users_bp = Blueprint('users', __name__)

@users_bp.route('/')
@login_required
def index():
    # Only admins can view user list
    if not current_user.is_admin():
        flash('Você não tem permissão para acessar esta página.', 'danger')
        return redirect(url_for('dashboard.index'))
    
    users = User.get_all_users()
    return render_template('users/index.html', users=users)

@users_bp.route('/<user_id>')
@login_required
def details(user_id):
    # Only admins can view user details (except their own)
    if not current_user.is_admin() and current_user.id != user_id:
        flash('Você não tem permissão para acessar esta página.', 'danger')
        return redirect(url_for('dashboard.index'))
    
    user = User.query_by_id(user_id)
    
    if not user:
        flash('Usuário não encontrado.', 'danger')
        return redirect(url_for('users.index'))
    
    return render_template('users/details.html', user=user)

@users_bp.route('/<user_id>/edit', methods=['GET', 'POST'])
@login_required
def edit(user_id):
    # Only admins can edit users (except their own profile)
    if not current_user.is_admin() and current_user.id != user_id:
        flash('Você não tem permissão para editar este usuário.', 'danger')
        return redirect(url_for('dashboard.index'))
    
    user = User.query_by_id(user_id)
    
    if not user:
        flash('Usuário não encontrado.', 'danger')
        return redirect(url_for('users.index'))
    
    if request.method == 'POST':
        # Prepare user data
        user_data = {
            'name': request.form.get('name'),
            'department': request.form.get('department')
        }
        
        # Only admins can change roles
        if current_user.is_admin():
            user_data['role'] = request.form.get('role')
        
        # Update user
        if User.update(user_id, user_data):
            flash('Usuário atualizado com sucesso!', 'success')
            
            # Redirect to appropriate page
            if current_user.id == user_id:
                return redirect(url_for('auth.profile'))
            else:
                return redirect(url_for('users.details', user_id=user_id))
        else:
            flash('Erro ao atualizar usuário. Tente novamente.', 'danger')
    
    return render_template('users/edit.html', 
                          user=user,
                          roles=Config.USER_ROLES,
                          departments=Config.DEPARTMENTS)

@users_bp.route('/<user_id>/delete', methods=['POST'])
@login_required
def delete(user_id):
    # Only admins can delete users
    if not current_user.is_admin():
        flash('Você não tem permissão para excluir usuários.', 'danger')
        return redirect(url_for('dashboard.index'))
    
    # Cannot delete self
    if current_user.id == user_id:
        flash('Você não pode excluir sua própria conta.', 'danger')
        return redirect(url_for('users.index'))
    
    user = User.query_by_id(user_id)
    
    if not user:
        flash('Usuário não encontrado.', 'danger')
        return redirect(url_for('users.index'))
    
    # Delete user
    if User.delete(user_id):
        flash('Usuário excluído com sucesso!', 'success')
    else:
        flash('Erro ao excluir usuário. Tente novamente.', 'danger')
    
    return redirect(url_for('users.index'))
