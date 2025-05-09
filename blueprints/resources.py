from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user
from models import Resource, User
from config import Config

resources_bp = Blueprint('resources', __name__)

@resources_bp.route('/')
@login_required
def index():
    resources = Resource.get_all()
    return render_template('resources/index.html', resources=resources)

@resources_bp.route('/add', methods=['GET', 'POST'])
@login_required
def add():
    # Only admins can add resources
    if not current_user.is_admin() and current_user.role != 'gestor':
        flash('Você não tem permissão para adicionar recursos.', 'danger')
        return redirect(url_for('resources.index'))
    
    if request.method == 'POST':
        resource_data = {
            'name': request.form.get('name'),
            'category': request.form.get('category'),
            'location': request.form.get('location'),
            'status': request.form.get('status', 'disponível'),
            'description': request.form.get('description', ''),
            'quantity': int(request.form.get('quantity', 1)),
            'last_maintenance': request.form.get('last_maintenance'),
            'next_maintenance': request.form.get('next_maintenance')
        }
        
        # Create resource
        resource = Resource.create(resource_data)
        
        if resource:
            flash('Recurso adicionado com sucesso!', 'success')
            return redirect(url_for('resources.index'))
        else:
            flash('Erro ao adicionar recurso. Tente novamente.', 'danger')
    
    return render_template('resources/add.html', 
                          categories=Config.RESOURCE_CATEGORIES,
                          status_options=Config.RESOURCE_STATUS)

@resources_bp.route('/<resource_id>')
@login_required
def details(resource_id):
    resource = Resource.get_by_id(resource_id)
    
    if not resource:
        flash('Recurso não encontrado.', 'danger')
        return redirect(url_for('resources.index'))
    
    # Get assigned user details if assigned
    assigned_user = None
    if resource.assigned_to:
        assigned_user = User.query_by_id(resource.assigned_to)
    
    return render_template('resources/details.html', resource=resource, assigned_user=assigned_user)

@resources_bp.route('/<resource_id>/edit', methods=['GET', 'POST'])
@login_required
def edit(resource_id):
    # Only admins can edit resources
    if not current_user.is_admin() and current_user.role != 'gestor':
        flash('Você não tem permissão para editar recursos.', 'danger')
        return redirect(url_for('resources.index'))
    
    resource = Resource.get_by_id(resource_id)
    
    if not resource:
        flash('Recurso não encontrado.', 'danger')
        return redirect(url_for('resources.index'))
    
    if request.method == 'POST':
        resource_data = {
            'name': request.form.get('name'),
            'category': request.form.get('category'),
            'location': request.form.get('location'),
            'status': request.form.get('status'),
            'description': request.form.get('description', ''),
            'quantity': int(request.form.get('quantity', 1)),
            'last_maintenance': request.form.get('last_maintenance'),
            'next_maintenance': request.form.get('next_maintenance')
        }
        
        # Update resource
        if Resource.update(resource_id, resource_data):
            flash('Recurso atualizado com sucesso!', 'success')
            return redirect(url_for('resources.details', resource_id=resource_id))
        else:
            flash('Erro ao atualizar recurso. Tente novamente.', 'danger')
    
    return render_template('resources/edit.html', 
                          resource=resource,
                          categories=Config.RESOURCE_CATEGORIES,
                          status_options=Config.RESOURCE_STATUS)

@resources_bp.route('/<resource_id>/delete', methods=['POST'])
@login_required
def delete(resource_id):
    # Only admins can delete resources
    if not current_user.is_admin():
        flash('Você não tem permissão para excluir recursos.', 'danger')
        return redirect(url_for('resources.index'))
    
    resource = Resource.get_by_id(resource_id)
    
    if not resource:
        flash('Recurso não encontrado.', 'danger')
        return redirect(url_for('resources.index'))
    
    # Delete resource
    if Resource.delete(resource_id):
        flash('Recurso excluído com sucesso!', 'success')
    else:
        flash('Erro ao excluir recurso. Tente novamente.', 'danger')
    
    return redirect(url_for('resources.index'))

@resources_bp.route('/<resource_id>/assign', methods=['POST'])
@login_required
def assign(resource_id):
    # Only admins or managers can assign resources
    if not current_user.is_admin() and current_user.role != 'gestor':
        flash('Você não tem permissão para atribuir recursos.', 'danger')
        return redirect(url_for('resources.details', resource_id=resource_id))
    
    resource = Resource.get_by_id(resource_id)
    
    if not resource:
        flash('Recurso não encontrado.', 'danger')
        return redirect(url_for('resources.index'))
    
    user_id = request.form.get('user_id')
    
    # Check if user exists
    user = User.query_by_id(user_id)
    if not user:
        flash('Usuário não encontrado.', 'danger')
        return redirect(url_for('resources.details', resource_id=resource_id))
    
    # Update resource
    if Resource.update(resource_id, {
        'assigned_to': user_id,
        'status': 'em uso'
    }):
        flash(f'Recurso atribuído a {user.name} com sucesso!', 'success')
    else:
        flash('Erro ao atribuir recurso. Tente novamente.', 'danger')
    
    return redirect(url_for('resources.details', resource_id=resource_id))

@resources_bp.route('/<resource_id>/release', methods=['POST'])
@login_required
def release(resource_id):
    # Check if user is admin, manager or the assigned user
    resource = Resource.get_by_id(resource_id)
    
    if not resource:
        flash('Recurso não encontrado.', 'danger')
        return redirect(url_for('resources.index'))
    
    if not current_user.is_admin() and current_user.role != 'gestor' and resource.assigned_to != current_user.id:
        flash('Você não tem permissão para liberar este recurso.', 'danger')
        return redirect(url_for('resources.details', resource_id=resource_id))
    
    # Update resource
    if Resource.update(resource_id, {
        'assigned_to': None,
        'status': 'disponível'
    }):
        flash('Recurso liberado com sucesso!', 'success')
    else:
        flash('Erro ao liberar recurso. Tente novamente.', 'danger')
    
    return redirect(url_for('resources.details', resource_id=resource_id))
