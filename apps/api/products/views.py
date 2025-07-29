from rest_framework import viewsets
from .models import AIProduct
from .serializers import AIProductSerializer
from rest_framework.permissions import AllowAny

class AIProductViewSet(viewsets.ModelViewSet):
    queryset = AIProduct.objects.all()
    serializer_class = AIProductSerializer
    permission_classes = [AllowAny]  # Adjust permissions as needed
