from connectcourt import model 
from connectcourt.sql_db import db
from sqlalchemy import Column, Integer , String , Enum , ForeignKey , DateTime, Time
from sqlalchemy.orm import relationship

from datetime import timedelta

from connectcourt.tools.input_tools import Field, Block, Tab , Form

class ScheduledLesson(db.Model, model.Model, model.Base):
    __tablename__ = 'scheduled_lessons'
    __table_args__ = {'extend_existing': True}
    page_title = 'Aulas Marcadas'
    model_name = 'ScheduledLesson'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(80))
    level = Column(Enum('Very Low','Low','Medium','High','Very High',name='level'))
    start_datetime = Column(DateTime)  
    duration = Column(Time)
    number_of_lessons = Column(Integer)

    lessons = relationship('Lesson', back_populates='scheduled_lesson', cascade="all, delete-orphan")
    
    players_relations = relationship('Association_PlayerScheduledLesson', back_populates='scheduled_lesson', cascade="all, delete-orphan")
    coaches_relations = relationship('Association_CoachScheduledLesson', back_populates='scheduled_lesson', cascade="all, delete-orphan")

    def display_all_info(self):
        searchable_column = {'field': 'name','label':'Nome'}
        table_columns = [
            {'field': 'id','label':'ID'},
            searchable_column,
            {'field': 'level','label':'Nivel'},
        ]
        return searchable_column , table_columns

    def get_create_form(self):
        def get_field(name,label,type,options=None,required=False,related_model=None):
            return Field(instance_id=self.id,model=self.model_name,name=name,label=label,type=type,options=options,required=required,related_model=related_model)
        form = Form()
        # Create Info block

        fields = [
            get_field(name='name',label='Nome',type='Text',required=True),
            get_field(name='level',label='Nivel',type='Select',options=['Very Low','Low','Medium','High','Very High']),
            get_field(name='start_datetime',label='Dia e hora',type='DateTime',required=True),
            get_field(name='duration',label='Duração',type='Time',required=True),
            get_field(name='number_of_lessons',label='Número de aulas', type='Integer'),
            get_field(name='players_relations',label='Jogadores (Relações)',type='OneToMany',related_model='Association_PlayerScheduledLessons'),
        ]
        info_block = Block('info_block',fields)
        form.add_block(info_block)

        return form
    
    def get_basic_create_form(self):
        return self.get_create_form()
    
    def create_n_lessons(self,Lesson,n):
        for i in range(n):
            lesson_datetime = self.start_datetime + timedelta(weeks=i)
            lesson = Lesson(
                name=self.name,
                level=self.level,
                duration=self.duration,
                datetime=lesson_datetime,
                scheduled_lesson_id=self.id
            )
            self.lessons.append(lesson)
            self.save()
            lesson.create()
            lesson.add_players([rel.player for rel in self.players_relations])
        return True

    def add_players(self, players):
        self.add_entities(players, 'players_relations')

    def add_coaches(self, coaches):
        self.add_entities(coaches, 'coaches_relations')