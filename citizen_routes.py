from flask import Blueprint, request, jsonify
from app import db, bcrypt
from models import Citizen, Problem, OTP
from utils import generate_otp
from datetime import datetime, timedelta
import re
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import os

citizen_bp = Blueprint('citizen_bp', __name__)

# Dummy function to simulate sending OTP via SMS
def send_sms_otp(mobile, otp):
    print(f"Sending OTP {otp} to {mobile}")

@citizen_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    dob = data.get('dob')
    aadhaar = data.get('aadhaar')
    mobile = data.get('mobile')

    if not all([name, dob, aadhaar, mobile]):
        return jsonify({'message': 'Missing required fields'}), 400

    if not re.match(r'^\d{12}$', aadhaar):
        return jsonify({'message': 'Invalid Aadhaar number'}), 400

    if not re.match(r'^\d{10}$', mobile):
        return jsonify({'message': 'Invalid mobile number'}), 400

    if Citizen.query.filter_by(aadhaar=aadhaar).first() or Citizen.query.filter_by(mobile=mobile).first():
        return jsonify({'message': 'User already exists'}), 409

    try:
        dob_date = datetime.strptime(dob, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'message': 'Invalid date format for DOB. Use YYYY-MM-DD'}), 400

    new_citizen = Citizen(name=name, dob=dob_date, aadhaar=aadhaar, mobile=mobile)
    db.session.add(new_citizen)
    db.session.commit()

    return jsonify({'message': 'Citizen registered successfully'}), 201

@citizen_bp.route('/send-otp', methods=['POST'])
def send_otp():
    data = request.get_json()
    mobile = data.get('mobile')

    if not mobile or not re.match(r'^\d{10}$', mobile):
        return jsonify({'message': 'Invalid mobile number'}), 400

    if not Citizen.query.filter_by(mobile=mobile).first():
        return jsonify({'message': 'Citizen not registered'}), 404

    otp_code = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=5)

    otp_entry = OTP.query.filter_by(mobile=mobile).first()
    if otp_entry:
        otp_entry.otp_code = otp_code
        otp_entry.expires_at = expires_at
    else:
        otp_entry = OTP(mobile=mobile, otp_code=otp_code, expires_at=expires_at)
        db.session.add(otp_entry)

    db.session.commit()

    send_sms_otp(mobile, otp_code)  # Simulate sending OTP

    return jsonify({'message': 'OTP sent successfully'}), 200

@citizen_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    mobile = data.get('mobile')
    otp_code = data.get('otp')

    if not mobile or not otp_code:
        return jsonify({'message': 'Mobile and OTP are required'}), 400

    otp_entry = OTP.query.filter_by(mobile=mobile).first()

    if not otp_entry or otp_entry.otp_code != otp_code or otp_entry.expires_at < datetime.utcnow():
        return jsonify({'message': 'Invalid or expired OTP'}), 400

    citizen = Citizen.query.filter_by(mobile=mobile).first()
    access_token = create_access_token(identity={'citizen_id': citizen.id})

    db.session.delete(otp_entry)
    db.session.commit()

    return jsonify({'access_token': access_token}), 200

@citizen_bp.route('/report-problem', methods=['POST'])
@jwt_required()
def report_problem():
    current_citizen_id = get_jwt_identity()['citizen_id']
    description = request.form.get('description')
    location = request.form.get('location')
    category = request.form.get('category')
    file = request.files.get('file')

    if not all([description, location, category]):
        return jsonify({'message': 'Description, location, and category are required'}), 400

    file_path = None
    if file:
        if not os.path.exists('uploads'):
            os.makedirs('uploads')
        file_path = os.path.join('uploads', file.filename)
        file.save(file_path)

    new_problem = Problem(
        citizen_id=current_citizen_id,
        description=description,
        location=location,
        category=category,
        file_path=file_path
    )
    db.session.add(new_problem)
    db.session.commit()

    return jsonify({'message': 'Problem reported successfully'}), 201

@citizen_bp.route('/my-reports', methods=['GET'])
@jwt_required()
def my_reports():
    current_citizen_id = get_jwt_identity()['citizen_id']
    reports = Problem.query.filter_by(citizen_id=current_citizen_id).all()
    output = []
    for report in reports:
        report_data = {
            'id': report.id,
            'description': report.description,
            'location': report.location,
            'status': report.status,
            'category': report.category,
            'file_path': report.file_path,
            'created_at': report.created_at
        }
        output.append(report_data)

    return jsonify({'reports': output}), 200
