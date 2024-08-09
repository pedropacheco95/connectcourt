from connectcourt import model 
from connectcourt.sql_db import db
from sqlalchemy import Column, Float, Integer, ForeignKey , Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.ext.hybrid import hybrid_property

from connectcourt.tools.input_tools import Field, Block , Form

class Association_CoachLesson(db.Model ,model.Model, model.Base):
    __tablename__ = 'coach_in_lesson'
    __table_args__ = (
        db.UniqueConstraint('coach_id', 'lesson_id', name='_coach_lesson_uc'),
        {'extend_existing': True}
    )
    page_title = 'Relação de Treinador Aula'
    model_name = 'Association_CoachLesson'

    id = Column(Integer, primary_key=True)

    coach_id = Column(Integer, ForeignKey('coaches.id'))
    lesson_id = Column(Integer, ForeignKey('lessons.id'))

    coach = relationship('Coach', back_populates='lessons_relations')
    lesson = relationship('Lesson', back_populates='coaches_relations')

    @hybrid_property
    def name(self):
        return f"{self.coach} in {self.lesson}"

    def __repr__(self):
        try:
            return f"{self.coach}: {self.lesson}"
        except:
            return f"Empty {self.model_name}"
    
    def __str__(self):
        try:
            return f"{self.lesson}: {self.coach}"
        except:
            return f"Empty {self.model_name}"
        

    def display_all_info(self):
        searchable_column = {'field': 'coach','label':'Treinador'}
        table_columns = [
            {'field': 'lesson','label':'Aula'},
            searchable_column,
        ]
        return searchable_column , table_columns

    def get_create_form(self):
        def get_field(name,label,type,required=False,related_model=None,options=None):
            return Field(instance_id=self.id,model=self.model_name,name=name,label=label,type=type,required=required,related_model=related_model,options=options)
        form = Form()

        # Create Info block
        fields = [
            get_field(name='lesson',label='Aulas',type='ManyToOne',related_model='Lesson'),
            get_field(name='coach',label='Treinador',type='ManyToOne',related_model='Coach'),
            
        ]
        info_block = Block('info_block',fields)
        form.add_block(info_block)

        return form
    