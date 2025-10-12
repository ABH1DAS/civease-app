from flask import Blueprint, request, jsonify
from app import db, bcrypt
from models import Authority, Problem
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

authority_bp = Blueprint('authority_bp', __name__)

@authority_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    authority_id = data.get('authority_id')
    name = data.get('name')
    designation = data.get('designation')
    department = data.get('department')
    email = data.get('email')
    mobile = data.get('mobile')
    password = data.get('password')

    if not all([authority_id, name, designation, department, email, mobile, password]):
        return jsonify({'message': 'Missing required fields'}), 400

    if Authority.query.filter_by(authority_id=authority_id).first() or Authority.query.filter_by(email=email).first():
        return jsonify({'message': 'Authority already exists'}), 409

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_authority = Authority(
        authority_id=authority_id,
        name=name,
        designation=designation,
        department=department,
        email=email,
        mobile=mobile,
        password_hash=hashed_password
    )
    db.session.add(new_authority)
    db.session.commit()

    return jsonify({'message': 'Authority registered successfully'}), 201

@authority_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    authority_id = data.get('authority_id')
    password = data.get('password')

    if not authority_id or not password:
        return jsonify({'message': 'Authority ID and password are required'}), 400

    authority = Authority.query.filter_by(authority_id=authority_id).first()

    if authority and bcrypt.check_password_hash(authority.password_hash, password):
        access_token = create_access_token(identity={'authority_id': authority.id})
        return jsonify(access_token=access_token), 200
    else:
        return jsonify({'message': 'Invalid credentials'}), 401

@authority_bp.route('/problems', methods=['GET'])
@jwt_required()
def get_problems():
    status = request.args.get('status')
    category = request.args.get('category')

    query = Problem.query
    if status:
        query = query.filter_by(status=status)
    if category:
        query = query.filter_by(category=category)

    problems = query.all()
    output = []
    for problem in problems:
        problem_data = {
            'id': problem.id,
            'description': problem.description,
            'location': problem.location,
            'status': problem.status,
            'category': problem.category,
            'file_path': problem.file_path,
            'created_at': problem.created_at,
            'reporter': {
                'name': problem.reporter.name,
                'mobile': problem.reporter.mobile
            }
        }
        output.append(problem_data)

    return jsonify({'problems': output}), 200

@authority_bp.route('/update-status', methods=['PUT'])
@jwt_required()
def update_status():
    data = request.get_json()
    problem_id = data.get('problem_id')
    status = data.get('status')

    if not problem_id or not status:
        return jsonify({'message': 'Problem ID and status are required'}), 400

    problem = Problem.query.get(problem_id)
    if not problem:
        return jsonify({'message': 'Problem not found'}), 404

    problem.status = status
    db.session.commit()

    return jsonify({'message': 'Status updated successfully'}), 200

@authority_bp.route('/analytics', methods=['GET'])
@jwt_required()
def analytics():
    total_reports = Problem.query.count()
    resolved_reports = Problem.query.filter_by(status='Resolved').count()
    pending_reports = Problem.query.filter_by(status='Pending').count()

    category_counts = db.session.query(Problem.category, db.func.count(Problem.category)).group_by(Problem.category).all()
    categories = {category: count for category, count in category_counts}

    return jsonify({
        'total_reports': total_reports,
        'resolved_reports': resolved_reports,
        'pending_reports': pending_reports,
        'category_wise_count': categories
    }), 200
