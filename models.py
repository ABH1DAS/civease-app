from app import db
from datetime import datetime

class Citizen(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    dob = db.Column(db.Date, nullable=False)
    aadhaar = db.Column(db.String(12), unique=True, nullable=False)
    mobile = db.Column(db.String(10), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    reports = db.relationship('Problem', backref='reporter', lazy=True)

class Authority(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    authority_id = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    designation = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    mobile = db.Column(db.String(10), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

class Problem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    citizen_id = db.Column(db.Integer, db.ForeignKey('citizen.id'), nullable=False)
    description = db.Column(db.Text, nullable=False)
    file_path = db.Column(db.String(200), nullable=True)
    location = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(20), default='Pending')
    category = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class OTP(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    mobile = db.Column(db.String(10), nullable=False)
    otp_code = db.Column(db.String(6), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
