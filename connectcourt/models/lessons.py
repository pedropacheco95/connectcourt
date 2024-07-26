from connectcourt import model 
from connectcourt.sql_db import db
from sqlalchemy import Column, Integer , String , Enum , ForeignKey , Boolean, Time, DateTime
from sqlalchemy.orm import relationship

from connectcourt.tools.input_tools import Field, Block, Tab , Form

class Lesson(db.Model, model.Model, model.Base):
    __tablename__ = 'lessons'
    __table_args__ = {'extend_existing': True}
    page_title = 'Aulas'
    model_name = 'Lesson'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(80))
    level = Column(Enum('Very Low','Low','Medium','High','Very High', name='level'))
    duration = Column(Time)
    datetime = Column(DateTime)  
    
    players_relations = relationship('Association_PlayerLesson', back_populates='lesson', cascade="all, delete-orphan")
    coaches_relations = relationship('Association_CoachLesson', back_populates='lesson', cascade="all, delete-orphan")

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
            get_field(name='datetime',label='Dia e hora',type='DateTime',required=True),
            get_field(name='duration',label='Duração',type='Time',required=True),
        ]
        info_block = Block('info_block',fields)
        form.add_block(info_block)

        return form