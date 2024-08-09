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
        return jsonify(success=True)
    return jsonify(success=False)

@bp.route('/delete/<model>/<id>', methods=('GET', 'POST'))
def delete(model,id):
    model_name = model
    if request.method == 'POST':
        model = globals()[model]
        obj = model.query.filter_by(id=id).first()
        obj.delete()
        return jsonify(url_for('editor.display_all',model=model_name))
    return jsonify(success=False)

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
    return jsonify(success=True)

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

@bp.route('/modal_edit_page/<model>/<id>', methods=('GET', 'POST'))
def modal_edit_page(model,id):
    model_name = model
    model = globals()[model_name]
    obj = model.query.filter_by(id=id).first()
    form = obj.get_basic_create_form()
    if request.method == 'POST':
        values = form.set_values(request)
        obj.update_with_dict(values)
        obj.save()
        response = {'value':obj.id,'name':obj.name}
        return jsonify(response)
    data = obj.get_display_data()
    return render_template('editor/modal_edit.html',data = data)


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
        return jsonify(success=False)

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

@bp.route('/lessons', methods=['GET'])
def get_coaches_lessons():
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

    if not start_date_str or not end_date_str:
        return jsonify({'error': 'Missing date parameters'}), 400

    start_date = datetime.datetime.strptime(start_date_str, '%Y-%m-%d')
    end_date = datetime.datetime.strptime(end_date_str, '%Y-%m-%d')

    lessons = Lesson.query.filter(Lesson.datetime >= start_date, Lesson.datetime <= end_date).all()

    lessons_list = [
        {
            'id': lesson.id,
            'title': lesson.name,
            'datetime': lesson.datetime.strftime('%Y-%m-%d %H:%M:%S'),
            'duration': lesson.duration.strftime('%H:%M:%S'),
            'level': lesson.level,
            'edit_modal_url': lesson.model_edit_url(),
        }
        for lesson in lessons
    ]
    return jsonify(lessons_list)

@bp.route('/create_lesson', methods=['POST'])
def create_lesson():
    if request.method == 'POST':
        form_data = request.form.to_dict(flat=False)

        single_class = tools.try_convert(form_data.get('singleClass', ['off'])[0])
        name = tools.try_convert(form_data.get('name', [None])[0])
        level = tools.try_convert(form_data.get('level', [None])[0])
        start_datetime = tools.try_convert(form_data.get('start_datetime', [None])[0])
        datetime = tools.try_convert(form_data.get('datetime', [None])[0])
        duration = tools.try_convert(form_data.get('duration', [None])[0])
        number_of_lessons = tools.try_convert(form_data.get('number_of_lessons', [None])[0])
        players_str_list = form_data.get('players', [])
        players = [tools.try_convert(player) for player in players_str_list]

        lesson = None
        scheduled_lesson = None
        if single_class:
            lesson = Lesson()
            form = lesson.get_create_form()
            values = form.set_values(request)
            lesson.update_with_dict(values)
            lesson.create()
            lesson.add_players(players)

        else:
            scheduled_lesson = ScheduledLesson()
            form = scheduled_lesson.get_create_form()
            values = form.set_values(request)
            scheduled_lesson.update_with_dict(values)
            scheduled_lesson.create()
            scheduled_lesson.add_players(players)

            scheduled_lesson.create_n_lessons(Lesson,number_of_lessons)

        return jsonify(success=True)
    return jsonify(success=False)

@bp.route('/players_in_lesson/<id>', methods=['GET'])
def players_in_lesson(id):
    lesson = Lesson.query.filter_by(id=id).first()
    players = [rel.player.get_dict() for rel in lesson.players_relations]
    return jsonify(players)

@bp.route('/remove_lesson_player_relationship', methods=('GET', 'POST'))
def remove_lesson_player_relationship():
    data = request.get_json()

    id1 = int(data.get('id1'))
    id2 = int(data.get('id2'))

    Association_PlayerLesson.query.filter_by(lesson_id=id1, player_id=id2).first().delete()
    return jsonify(success=True)