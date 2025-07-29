from rest_framework import serializers
from .models import AIProduct

class AIProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIProduct
        fields = '__all__'
