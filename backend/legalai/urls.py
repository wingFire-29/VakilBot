from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def home(request):
    return HttpResponse("<h1>VakilBot Backend Server is Running!</h1><p>The backend only serves an API. Please visit the frontend at <a href='http://localhost:5173/'>http://localhost:5173/</a>.</p>")

urlpatterns = [
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/firms/', include('firms.urls')),
    path('api/chat/', include('chatbot.urls')),
]
