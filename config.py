import os

class Config:
    # Flask configuration
    SECRET_KEY = os.environ.get('SESSION_SECRET', 'default-secret-key')
    DEBUG = True

    # Firebase configuration
    FIREBASE_API_KEY = os.environ.get('FIREBASE_API_KEY')
    FIREBASE_PROJECT_ID = os.environ.get('FIREBASE_PROJECT_ID')
    FIREBASE_APP_ID = os.environ.get('FIREBASE_APP_ID')
    
    # Database configuration (if needed)
    DATABASE_URL = os.environ.get('DATABASE_URL')
    
    # Application configuration
    APP_NAME = 'Zelopack Gerenciamento de Recursos'
    
    # Resource categories
    RESOURCE_CATEGORIES = [
        'Equipamento',
        'Ferramenta',
        'Sala',
        'Veículo',
        'Material',
        'Software',
        'Outro'
    ]
    
    # Resource status options
    RESOURCE_STATUS = [
        'disponível',
        'em uso',
        'em manutenção',
        'reservado',
        'indisponível'
    ]
    
    # User roles
    USER_ROLES = [
        'admin',
        'gestor',
        'usuário'
    ]
    
    # Departments
    DEPARTMENTS = [
        'Administrativo',
        'Operações',
        'Logística',
        'TI',
        'Financeiro',
        'RH',
        'Vendas',
        'Marketing',
        'Outro'
    ]
