from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


urlpatterns = [
    #  ********************************Token*****************************

    path('token', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh', TokenRefreshView.as_view(), name='token_refresh'),

    # ***********************Admin login****************************
    path("login", views.UserLogin.as_view(), name="user-login"),
    path('logout', views.LogoutView.as_view(), name='logout'),
    path('user/details/', views.UserDetailsView.as_view(), name='user-details'),


    # ************************* Order Summary ************************

    




    

    

]