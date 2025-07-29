from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
                  path('admin/', admin.site.urls),
                  path('api/', include('products.urls')),  # API endpoints will be available at /api/products/
                  path('api/', include('resume_builder.urls')),  # Resume builder API endpoints
              ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
