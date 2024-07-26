import functools
import json
import sys
import csv
import os
import datetime

from flask import Blueprint, flash, g, redirect, render_template, request, session, url_for , current_app , jsonify , render_template_string
from werkzeug.security import check_password_hash, generate_password_hash
import jinja2

from connectcourt.models import *
from connectcourt.tools import tools
from connectcourt.tools.sms_tools import TwilioSMS
from connectcourt.tools.whatsapp_tools import TwilioWhatsApp

bp = Blueprint('api', __name__, url_prefix='/api')

@bp.route('/edit/<model>/<id>', methods=('GET', 'POST'))
def edit(model,id):
    if request.method == 'POST':
        model = globals()[model]
        obj = model.query.filter_by(id=id).first()
        form = obj.get_edit_form()
        values = form.set_values(request)
        obj.update_with_dict(values)
        return jsonify(sucess=True)
    return jsonify(sucess=False)

@bp.route('/delete/<model>/<id>', methods=('GET', 'POST'))
def delete(model,id):
    model_name = model
    if request.method == 'POST':
        model = globals()[model]
        obj = model.query.filter_by(id=id).first()
        obj.delete()
        return jsonify(url_for('editor.display_all',model=model_name))
    return jsonify(sucess=False)

@bp.route('/query/<model>', methods=('GET', 'POST'))
def query(model):
    model = globals()[model]
    instances = model.query.order_by(model.creation_datetime.asc()).all()
    instances = [{'value':instance.id,'name':instance.name} for instance in instances]
    return jsonify(instances)

@bp.route('/remove_relationship', methods=('GET', 'POST'))
def remove_relationship():
    data = request.get_json()

    model_name1 = data.get('model_name1')
    model_name2 = data.get('model_name2')
    field_name = data.get('field_name')
    id1 = int(data.get('id1'))
    id2 = int(data.get('id2'))

    model1 = globals()[model_name1]
    model2 = globals()[model_name2]

    obj1 = model1.query.filter_by(id=id1).first()
    obj2 = model2.query.filter_by(id=id2).first()

    field = getattr(obj1,field_name)
    field.remove(obj2)
    obj1.save()
    return jsonify(sucess=True)

@bp.route('/modal_create_page/<model>', methods=('GET', 'POST'))
def modal_create_page(model):
    model_name = model
    model = globals()[model_name]
    empty_instance = model()
    form = empty_instance.get_basic_create_form()
    if request.method == 'POST':
        values = form.set_values(request)
        empty_instance.update_with_dict(values)
        empty_instance.create()
        response = {'value':empty_instance.id,'name':empty_instance.name}
        return jsonify(response)
    data = empty_instance.get_basic_create_data(form)
    return render_template('editor/modal_create.html',data = data)


@bp.route("/download_csv/<model>", methods =["GET", "POST"])
def download_csv(model):
    model_name = model
    model = globals()[model_name]
    filepath = tools.create_csv_for_model(model)
    return filepath


@bp.route("/upload_csv_to_db/<model>", methods =["GET", "POST"])
def upload_csv_to_db(model):
    model_name = model
    model = globals()[model_name]
    check = tools.upload_csv_to_model(model)
    if check:
        return jsonify(url_for('editor.display_all',model=model_name))
    else:
        return jsonify(sucess=False)

@bp.route("/send_sms", methods=["GET", "POST"])
def send_sms():
    if request.method == "POST":
        # Assuming data is sent through form-fields not JSON
        to_number = request.form['to_number']
        message = request.form['message']

        # Initialize TwilioSMS using environment variables for safety
        twilio_sms = TwilioSMS('place_holder', 'place_holder')
        
        try:
            sid = twilio_sms.send_sms('+16562316216', to_number, message)  # Your Twilio number should also be an environment variable
            return jsonify({'success': True, 'message_sid': sid}), 200
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

    # Provide a simple form for GET request to test
    return render_template('sms.html')

@bp.route('/send_whatsapp_message', methods=["GET", "POST"])
def send_whatsapp_message():
    """
    Endpoint to send a WhatsApp message.
    Expects JSON payload with 'to_number' and 'message'.
    """
    if request.method == 'POST':
        to_number = 'whatsapp:' + request.form['to_number']
        message = request.form['message']
        twilio_client = TwilioWhatsApp('place_holder', 'place_holder')
        try:
            # Sending the WhatsApp message
            message_sid = twilio_client.send_whatsapp_message('place_holder', to_number, message)
            return jsonify({'success': True, 'message_sid': message_sid}), 200
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    # Provide a simple form for GET request to test
    return render_template('whatsapp.html')

@bp.route('/lessons/<int:coach_id>')
def get_coaches_lessons(coach_id):
    return jsonify()