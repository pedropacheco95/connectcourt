from connectcourt import model 
from connectcourt.sql_db import db
from sqlalchemy import Column, Float, Integer, ForeignKey , Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.ext.hybrid import hybrid_property

from connectcourt.tools.input_tools import Field, Block , Form

class Association_PlayerScheduledLesson(db.Model ,model.Model, model.Base):
    __tablename__ = 'player_in_scheduled_lesson'
    __table_args__ = (
        db.UniqueConstraint('player_id', 'scheduled_lesson_id', name='_player_scheduled_lesson_uc'),
        {'extend_existing': True}
    )
    page_title = 'Relação de Jogador Aula'
    model_name = 'Association_PlayerScheduledLesson'

    id = Column(Integer, primary_key=True)

    player_id = Column(Integer, ForeignKey('players.id'))
    scheduled_lesson_id = Column(Integer, ForeignKey('scheduled_lessons.id'))

    player = relationship('Player', back_populates='scheduled_lessons_relations')
    scheduled_lesson = relationship('ScheduledLesson', back_populates='players_relations')

    @hybrid_property
    def name(self):
        return f"{self.player} in {self.scheduled_lesson}"

    def __repr__(self):
        try:
            return f"{self.player}: {self.scheduled_lesson}"
        except:
            return f"Empty {self.model_name}"
    
    def __str__(self):
        try:
            return f"{self.scheduled_lesson}: {self.player}"
        except:
            return f"Empty {self.model_name}"
        

    def display_all_info(self):
        searchable_column = {'field': 'player','label':'Jogador'}
        table_columns = [
            {'field': 'scheduled_lesson','label':'Aula'},
            searchable_column,
        ]
        return searchable_column , table_columns

    def get_create_form(self):
        def get_field(name,label,type,required=False,related_model=None,options=None):
            return Field(instance_id=self.id,model=self.model_name,name=name,label=label,type=type,required=required,related_model=related_model,options=options)
        form = Form()

        # Create Info block
        fields = [
            get_field(name='scheduled_lesson',label='Aulas',type='ManyToOne',related_model='ScheduledLesson'),
            get_field(name='player',label='Jogador',type='ManyToOne',related_model='Player'),
            
        ]
        info_block = Block('info_block',fields)
        form.add_block(info_block)

        return form
    