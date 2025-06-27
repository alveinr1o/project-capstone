from django.urls import path
from myapp import views
from django.conf import settings
from django.contrib import admin
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from myapp.views import MyTokenObtainPairView
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('home', views.home),
    path('admin/', admin.site.urls),
    path('', views.showLoginPage),
    path('get_user_detail', views.GetUserDetails),
    path('logout_user', views.logout_user),
    path('doLogin', views.doLogin),
    path('admin_dashboard', views.admin_dashboard),
    path('dosen_dashboard', views.dosen_dashboard),
    path('mahasiswa_dashboard', views.mahasiswa_dashboard, name='mahasiswa_dashboard'),
    path('register_mahasiswa/', views.register_mahasiswa, name='register_mahasiswa'),
    path('register_dosen/', views.register_dosen, name='register_dosen'), 
    path('tambah/', views.tambah_penelitian, name='tambah_penelitian'),
    path('tambah_bimbingan/', views.tambah_bimbingan, name='tambah_bimbingan'),
    path('milestone/logs/', views.deadline_log, name='deadline_log'),
    path('bimbingan/<int:pk>/', views.detail_bimbingan, name='detail_bimbingan'),
    path('bimbingan/<int:pk>/edit/', views.edit_bimbingan, name='edit_bimbingan'),
    path('bimbingan/<int:pk>/hapus/', views.hapus_bimbingan, name='hapus_bimbingan'),
    path('edit-deadline/', views.edit_deadline_dropdown, name='edit_deadline_dropdown'),
    path('upload-bukti/<int:milestone_id>/', views.upload_bukti_milestone, name='upload_bukti'),
    path('profil/', views.profile_mahasiswa, name='profile_mahasiswa'),
    path('dosen_dashboard', views.dosen_dashboard, name='dosen_dashboard'),
    path('bimbingan/<int:pk>/approve/', views.approve_bimbingan, name='approve_bimbingan'),
    path('bimbingan/<int:pk>/reject/', views.reject_bimbingan, name='reject_bimbingan'),
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('register_admin/', views.register_admin, name='register_admin'),
    path('milestone/<int:id>/approve/', views.approve_milestone, name='approve_milestone'),
    path('milestone/<int:id>/decline/', views.decline_milestone, name='decline_milestone'),

    path('api/dosen_dashboard_api/', views.dosen_dashboard_api, name='dosen_dashboard_api'),
    path('api/bimbingan/<int:pk>/approve/', views.approve_bimbingan_api, name='approve_bimbingan_api'),
    path('api/bimbingan/<int:pk>/reject/', views.reject_bimbingan_api, name='reject_bimbingan_api'),
    path("api/milestone/<int:id>/approve/", views.approve_milestone_api, name="approve_milestone_api"),
    path("api/milestone/<int:id>/decline/", views.decline_milestone_api, name="decline_milestone_api"),
    path('accounts/login/', views.showLoginPage, name='login'),
    path("api/token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    path("accounts/login/", auth_views.LoginView.as_view(), name="login"),

    path('admin/notifikasi/', views.notifikasi_admin_view, name='notifikasi_admin'),
    path('dashboard-admin/notifikasi/', views.notifikasi_admin_view, name='notifikasi_admin'),
    path('api/edit-deadline/', views.edit_deadline_api, name='edit_deadline_api'),
    path('api/upload-bukti/<int:milestone_id>/', views.upload_bukti_api, name='upload_bukti_api'),
    path('api/timeline/', views.get_timeline_milestones, name='get_timeline'),
    path('api/sebaran-mahasiswa/', views.sebaran_mahasiswa_view, name='sebaran-mahasiswa'),
    path("api/pengajuan-bimbingan/", views.pengajuan_bimbingan_api, name="pengajuan_bimbingan_api"),
    path('api/pengajuan-bimbingan/<int:id>/', views.hapus_bimbingan, name='hapus_bimbingan'),
    path('api/tambah-bimbingan/', views.TambahBimbinganAPI.as_view(), name='api_tambah_bimbingan'),
    path('api/dosen-pembimbing/', views.DosenPembimbingListAPI.as_view(), name='dosen_pembimbing_api'),
    path('api/detail-bimbingan/<int:pk>/', views.DetailBimbinganAPI.as_view(), name='detail-bimbingan'),
    path('api/edit-bimbingan/<int:pk>/', views.EditBimbinganAPI.as_view(), name='edit-bimbingan'),
    path('api/profil-mahasiswa/', views.get_profil_mahasiswa, name='mahasiswa_list_api'),
    path('api/profil-pembimbing/', views.ProfilPembimbingAPI.as_view(), name='profil_pembimbing'),
    path("api/mahasiswa-detail-page/<str:nim>/", views.mahasiswa_detail_view),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
