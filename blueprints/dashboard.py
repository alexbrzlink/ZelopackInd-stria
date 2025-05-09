from flask import Blueprint, render_template
from flask_login import login_required, current_user
from models import Resource, User

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/')
@login_required
def index():
    # Get resources for dashboard
    all_resources = Resource.get_all()
    
    # Calculate stats
    total_resources = len(all_resources)
    available_resources = len([r for r in all_resources if r.status == 'disponível'])
    in_use_resources = len([r for r in all_resources if r.status == 'em uso'])
    maintenance_resources = len([r for r in all_resources if r.status == 'em manutenção'])
    
    # Get resources by category for chart
    categories = {}
    for resource in all_resources:
        cat = resource.category
        if cat in categories:
            categories[cat] += 1
        else:
            categories[cat] = 1
    
    # Get resources assigned to current user
    my_resources = Resource.get_by_assigned_user(current_user.id)
    
    # Get recent resources (last 5 added)
    recent_resources = sorted(all_resources, key=lambda x: x.created_at if x.created_at else 0, reverse=True)[:5]
    
    return render_template('dashboard.html',
                          total_resources=total_resources,
                          available_resources=available_resources,
                          in_use_resources=in_use_resources,
                          maintenance_resources=maintenance_resources,
                          categories=categories,
                          my_resources=my_resources,
                          recent_resources=recent_resources)
