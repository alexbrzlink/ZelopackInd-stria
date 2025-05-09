import os
import json
import requests
import pyrebase
from flask_login import UserMixin

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
db = firebase.database()
auth = firebase.auth()

class User(UserMixin):
    def __init__(self, id, email, name, role='user', department=None, profile_pic=None):
        self.id = id
        self.email = email
        self.name = name
        self.role = role
        self.department = department
        self.profile_pic = profile_pic

    @staticmethod
    def create(user_info):
        """Create a new user in the database"""
        try:
            user_data = {
                'email': user_info['email'],
                'name': user_info.get('name', user_info['email'].split('@')[0]),
                'role': user_info.get('role', 'user'),
                'department': user_info.get('department', None),
                'profile_pic': user_info.get('profile_pic', None),
                'created_at': {'.sv': 'timestamp'}
            }
            db.child("users").child(user_info['localId']).set(user_data)
            return User(
                id=user_info['localId'],
                email=user_data['email'],
                name=user_data['name'],
                role=user_data['role'],
                department=user_data['department'],
                profile_pic=user_data['profile_pic']
            )
        except Exception as e:
            print(f"Error creating user: {e}")
            return None

    @staticmethod
    def query_by_id(user_id):
        """Query a user by id"""
        try:
            user = db.child("users").child(user_id).get().val()
            if user:
                return User(
                    id=user_id,
                    email=user.get('email'),
                    name=user.get('name'),
                    role=user.get('role', 'user'),
                    department=user.get('department'),
                    profile_pic=user.get('profile_pic')
                )
            return None
        except Exception as e:
            print(f"Error querying user by id: {e}")
            return None

    @staticmethod
    def get_all_users():
        """Get all users"""
        try:
            users = db.child("users").get().val()
            if users:
                return [
                    User(
                        id=user_id,
                        email=data.get('email'),
                        name=data.get('name'),
                        role=data.get('role', 'user'),
                        department=data.get('department'),
                        profile_pic=data.get('profile_pic')
                    )
                    for user_id, data in users.items()
                ]
            return []
        except Exception as e:
            print(f"Error getting all users: {e}")
            return []

    @staticmethod
    def update(user_id, user_data):
        """Update a user"""
        try:
            allowed_fields = ['name', 'role', 'department', 'profile_pic']
            update_data = {k: v for k, v in user_data.items() if k in allowed_fields}
            update_data['updated_at'] = {'.sv': 'timestamp'}
            db.child("users").child(user_id).update(update_data)
            return True
        except Exception as e:
            print(f"Error updating user: {e}")
            return False

    @staticmethod
    def delete(user_id):
        """Delete a user"""
        try:
            db.child("users").child(user_id).remove()
            return True
        except Exception as e:
            print(f"Error deleting user: {e}")
            return False

    def get_id(self):
        return self.id

    def is_admin(self):
        return self.role == 'admin'

class Resource:
    def __init__(self, id=None, name=None, category=None, location=None, 
                 status='available', assigned_to=None, description=None, 
                 quantity=1, last_maintenance=None, next_maintenance=None,
                 created_at=None, updated_at=None):
        self.id = id
        self.name = name
        self.category = category
        self.location = location
        self.status = status
        self.assigned_to = assigned_to
        self.description = description
        self.quantity = quantity
        self.last_maintenance = last_maintenance
        self.next_maintenance = next_maintenance
        self.created_at = created_at
        self.updated_at = updated_at

    @staticmethod
    def create(resource_data):
        """Create a new resource in the database"""
        try:
            resource_data['created_at'] = {'.sv': 'timestamp'}
            resource_data['updated_at'] = {'.sv': 'timestamp'}
            result = db.child("resources").push(resource_data)
            resource_id = result.get('name')
            return Resource(id=resource_id, **resource_data)
        except Exception as e:
            print(f"Error creating resource: {e}")
            return None

    @staticmethod
    def get_by_id(resource_id):
        """Get a resource by ID"""
        try:
            resource = db.child("resources").child(resource_id).get().val()
            if resource:
                return Resource(id=resource_id, **resource)
            return None
        except Exception as e:
            print(f"Error getting resource by id: {e}")
            return None

    @staticmethod
    def get_all():
        """Get all resources"""
        try:
            resources = db.child("resources").get().val()
            if resources:
                return [
                    Resource(id=resource_id, **data)
                    for resource_id, data in resources.items()
                ]
            return []
        except Exception as e:
            print(f"Error getting all resources: {e}")
            return []

    @staticmethod
    def update(resource_id, resource_data):
        """Update a resource"""
        try:
            resource_data['updated_at'] = {'.sv': 'timestamp'}
            db.child("resources").child(resource_id).update(resource_data)
            return True
        except Exception as e:
            print(f"Error updating resource: {e}")
            return False

    @staticmethod
    def delete(resource_id):
        """Delete a resource"""
        try:
            db.child("resources").child(resource_id).remove()
            return True
        except Exception as e:
            print(f"Error deleting resource: {e}")
            return False

    @staticmethod
    def get_by_category(category):
        """Get resources by category"""
        try:
            resources = db.child("resources").order_by_child("category").equal_to(category).get().val()
            if resources:
                return [
                    Resource(id=resource_id, **data)
                    for resource_id, data in resources.items()
                ]
            return []
        except Exception as e:
            print(f"Error getting resources by category: {e}")
            return []

    @staticmethod
    def get_by_location(location):
        """Get resources by location"""
        try:
            resources = db.child("resources").order_by_child("location").equal_to(location).get().val()
            if resources:
                return [
                    Resource(id=resource_id, **data)
                    for resource_id, data in resources.items()
                ]
            return []
        except Exception as e:
            print(f"Error getting resources by location: {e}")
            return []

    @staticmethod
    def get_by_status(status):
        """Get resources by status"""
        try:
            resources = db.child("resources").order_by_child("status").equal_to(status).get().val()
            if resources:
                return [
                    Resource(id=resource_id, **data)
                    for resource_id, data in resources.items()
                ]
            return []
        except Exception as e:
            print(f"Error getting resources by status: {e}")
            return []

    @staticmethod
    def get_by_assigned_user(user_id):
        """Get resources assigned to a user"""
        try:
            resources = db.child("resources").order_by_child("assigned_to").equal_to(user_id).get().val()
            if resources:
                return [
                    Resource(id=resource_id, **data)
                    for resource_id, data in resources.items()
                ]
            return []
        except Exception as e:
            print(f"Error getting resources by assigned user: {e}")
            return []
