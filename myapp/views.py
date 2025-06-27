from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.decorators import login_required, user_passes_test
from django.urls import reverse
from django.shortcuts import render, redirect, get_object_or_404
from myapp.EmailBackEnd import EmailBackEnd
from .forms import MahasiswaSignUpForm, DosenSignUpForm, PenelitianForm, BimbinganForm, BuktiMilestoneForm, Pembimbing, AdminRegistrationForm
from .models import Bimbingan, Penelitian, Mhs, Milestone, DeadlineChangeLog, Notifikasi, CustomUser
from django.contrib import messages
from django.utils import timezone
from django.db.models import Count, Q
from collections import Counter
from datetime import datetime
from django.db.models import Max

import json
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from django.utils.dateparse import parse_date
from .serializers import MilestoneTimelineSerializer, PembimbingSerializer, BimbinganSerializer, MhsSerializer
from rest_framework.views import APIView

User = get_user_model()

# Create your views here.
def home(request):
    return render(request, 'home.html')

def showLoginPage(request):
    return render(request, "login.html")

def admin_dashboard(request):
    return render(request, "admin_dashboard.html")

@login_required
def dosen_dashboard(request):
    pembimbing = get_object_or_404(Pembimbing, admin=request.user)

    # Ambil semua penelitian yang dosen ini bimbing
    penelitian_list = Penelitian.objects.filter(nip=pembimbing).distinct()

    total_mahasiswa = penelitian_list.count()

    # Hitung status milestone per mahasiswa
    status_counter = {
        'ahead of schedule': 0,
        'on ideal schedule': 0,
        'behind the schedule': 0,
    }

    for penelitian in penelitian_list:
        milestones = list(Milestone.objects.filter(penelitian_id=penelitian).order_by('id'))
        if milestones:
            milestone_terakhir = next((m for m in reversed(milestones) if m.is_approved == 'disetujui'), None)
            milestone_next = milestones[0]
            if milestone_terakhir:
                idx = milestones.index(milestone_terakhir)
                if idx + 1 < len(milestones):
                    milestone_next = milestones[idx + 1]
                else:
                    milestone_next = None

            if milestone_next and milestone_next.status in status_counter:
                status_counter[milestone_next.status] += 1
        else:
            status_counter['ahead of schedule'] += 1

    # ✅ Ambil hanya bimbingan yang ditujukan ke pembimbing ini
    bimbingan_list = Bimbingan.objects.filter(pembimbing=pembimbing).select_related('penelitian_id__nim')

    for bimbingan in bimbingan_list:
        milestones = list(Milestone.objects.filter(penelitian_id=bimbingan.penelitian_id).order_by('id'))
        milestone_ids = [m.id for m in milestones]
        logs = DeadlineChangeLog.objects.filter(milestone_id__in=milestone_ids).select_related('milestone')
        bimbingan.deadline_logs = logs

        if milestones:
            milestone_terakhir = next((m for m in reversed(milestones) if m.is_approved == 'disetujui'), None)
            milestone_next = milestones[0]
            if milestone_terakhir:
                idx = milestones.index(milestone_terakhir)
                if idx + 1 < len(milestones):
                    milestone_next = milestones[idx + 1]
                else:
                    milestone_next = None

            if milestone_next:
                bimbingan.status_progress = milestone_next.get_jenis_milestone_display()
            else:
                bimbingan.status_progress = "Semua milestone selesai"
        else:
            bimbingan.status_progress = "Penetapan Komisi Pembimbing"

    # Milestone yang perlu disetujui oleh dosen ini
    pending_milestones = Milestone.objects.filter(
        penelitian_id__in=penelitian_list,
        is_approved='pending'
    ).select_related('penelitian_id__nim')

    context = {
        'total_mahasiswa': total_mahasiswa,
        'ahead_count': status_counter['ahead of schedule'],
        'ideal_count': status_counter['on ideal schedule'],
        'behind_count': status_counter['behind the schedule'],
        'bimbingan_list': bimbingan_list,
        'pending_milestones': pending_milestones,
    }

    return render(request, 'dosen_dashboard.html', context)

def tambah_penelitian(request):
    if request.method == 'POST':
        form = PenelitianForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('tambah_penelitian')  # Ganti sesuai URL tujuan setelah tambah
    else:
        form = PenelitianForm()
    return render(request, 'tambah_penelitian.html', {'form': form})

@login_required(login_url='/')
def tambah_bimbingan(request):
    try:
        mahasiswa = get_object_or_404(Mhs, admin=request.user)
        penelitian = Penelitian.objects.filter(nim=mahasiswa).first()

        if not penelitian:
            return HttpResponse("Anda belum memiliki penelitian yang terdaftar.")

        if request.method == 'POST':
            form = BimbinganForm(request.POST, request.FILES, penelitian=penelitian)
            if form.is_valid():
                bimbingan_obj = form.save(commit=False)
                bimbingan_obj.penelitian_id = penelitian
                bimbingan_obj.save()
                return HttpResponseRedirect('/mahasiswa_dashboard')
        else:
            form = BimbinganForm(penelitian=penelitian)

        return render(request, 'tambah_bimbingan.html', {'form': form})

    except Exception as e:
        return HttpResponse(f"Error: {str(e)}")


@login_required
def notifikasi_admin_view(request):
    # Pastikan user adalah admin
    if not hasattr(request.user, 'adminipb'):
        return render(request, '403.html')  # atau return HttpResponseForbidden()

    # Query notifikasi untuk admin yang sedang login
    notifikasi_list = Notifikasi.objects.filter(user=request.user).order_by('-waktu_kirim')

    context = {
        'notifikasi_list': notifikasi_list,
    }
    return render(request, 'notifikasi_admin.html', context)


def generate_notifikasi_deadline(mahasiswa):
    today = timezone.now().date()
    h_30_date = today + timedelta(days=30)

    # Ambil semua milestone mahasiswa ini yang deadline-nya HARI INI atau 30 HARI LAGI
    milestones = Milestone.objects.filter(
        penelitian_id__nim=mahasiswa,
        deadline__in=[today, h_30_date],
    ).exclude(is_approved='disetujui').distinct()

    for milestone in milestones:
        if not milestone.deadline:
            continue

        days_left = (milestone.deadline - today).days
        if days_left == 30:
            isi_notif = f"Milestone '{milestone.jenis_milestone}' akan deadline dalam 30 hari (deadline: {milestone.deadline})."
        elif days_left == 0:
            isi_notif = f"Milestone '{milestone.jenis_milestone}' hari ini deadline-nya! (deadline: {milestone.deadline})"
        else:
            continue

        # Target: semua AdminIPB dan mahasiswa itu sendiri
        target_users = list(CustomUser.objects.filter(user_type='1'))  # Admin

        # Tambahkan user mahasiswa jika belum
        if mahasiswa.admin and mahasiswa.admin not in target_users:
            target_users.append(mahasiswa.admin)

        for user in target_users:
            Notifikasi.objects.create(
                nim=mahasiswa,
                user=user,
                isi=isi_notif,
                waktu_kirim=timezone.now()
            )
          
def admin_dashboard(request):
    # Ambil parameter filter dari GET
    nama_query = request.GET.get('nama')
    milestone_query = request.GET.get('milestone')
    deadline_query = request.GET.get('deadline')
    dosen_query = request.GET.get('dosen')
    tahun_masuk_query = request.GET.get('tahun_masuk', '').strip()
    tahun_list = Mhs.objects.values_list('tahun_masuk', flat=True).distinct().order_by('-tahun_masuk')

    ALL_MILESTONES = [m[0] for m in Milestone.STATUS_CHOICES]
    distribusi_milestone = Counter()
    status_counter = {
        'ahead of schedule': 0,
        'on ideal schedule': 0,
        'behind the schedule': 0,
    }

    mahasiswa_milestones = []
    daftar_mahasiswa = []

    for mhs in Mhs.objects.all():
        penelitian = mhs.penelitian_set.first()
        if not penelitian:
            continue

        milestones = list(penelitian.milestone_set.order_by('id'))
        if not milestones:
            continue

        # Ambil milestone terakhir yang disetujui
        milestone_disetujui = None
        for m in reversed(milestones):
            if m.is_approved in ['disetujui', 'approved']:
                milestone_disetujui = m
                break

        # Ambil milestone aktif (satu tahap setelah yang disetujui)
        milestone_aktif = None
        if milestone_disetujui:
            idx = milestones.index(milestone_disetujui)
            if idx + 1 < len(milestones):
                milestone_aktif = milestones[idx + 1]
        else:
            milestone_aktif = milestones[0]

        if milestone_aktif:
            # Filter nama mahasiswa
            if nama_query and nama_query.lower() not in mhs.nama_Mhs.lower():
                continue

            # Filter jenis milestone
            if milestone_query and milestone_aktif.jenis_milestone != milestone_query:
                continue

            # Filter deadline milestone
            if deadline_query and str(milestone_aktif.deadline)[:10] != deadline_query:
                continue

            # Filter dosen pembimbing
            if dosen_query:
                if not penelitian.nip.filter(nama_Dosen__icontains=dosen_query).exists():
                    continue

            # ✅ Filter tahun masuk
            if tahun_masuk_query and str(mhs.tahun_masuk) != tahun_masuk_query:
                continue

                

            mahasiswa_milestones.append({
                'penelitian_id': penelitian,
                'milestone': milestone_aktif,
            })

            distribusi_milestone[milestone_aktif.jenis_milestone] += 1
            if milestone_aktif.status in status_counter:
                status_counter[milestone_aktif.status] += 1
            else:
                status_counter['ahead of schedule'] += 1
        else:
            distribusi_milestone["Semua milestone selesai"] += 1

        total_mahasiswa = (
            status_counter['ahead of schedule'] +
            status_counter['on ideal schedule'] +
            status_counter['behind the schedule']
        )
        
        daftar_mahasiswa.append({
            'nama': mhs.nama_Mhs,
            'judul': penelitian.judul,
            'tahap': milestone_disetujui.jenis_milestone if milestone_disetujui else 'Belum Ada'
        })

    distribusi_milestone_list = [
        {'jenis_milestone': milestone, 'jumlah': distribusi_milestone.get(milestone, 0)}
        for milestone in ALL_MILESTONES
    ]

    context = {
        'total_mahasiswa': total_mahasiswa,
        'mahasiswa_ahead': status_counter['ahead of schedule'],
        'mahasiswa_ideal': status_counter['on ideal schedule'],
        'mahasiswa_behind': status_counter['behind the schedule'],
        'tahap_grafik': distribusi_milestone_list,
        'daftar_mahasiswa': daftar_mahasiswa,
        'mahasiswa_milestones': mahasiswa_milestones,
        'milestone_choices': ALL_MILESTONES,
        'dosen_list': Pembimbing.objects.all(),  # untuk dropdown filter
        'tahun_list': tahun_list,
    }

    return render(request, 'admin_dashboard.html', context)

@login_required
def mahasiswa_dashboard(request):
    try:
        mhs = get_object_or_404(Mhs, admin=request.user)
        penelitian = Penelitian.objects.filter(nim=mhs).first()
        if not penelitian:
            return HttpResponse("Belum ada data penelitian")

        bimbingans = Bimbingan.objects.filter(penelitian_id=penelitian)
        milestones = Milestone.objects.filter(penelitian_id=penelitian).order_by('deadline')

        # Update status berdasarkan deadline
        today = timezone.now().date()
        for m in milestones:
            if m.deadline:
                delta = (m.deadline - today).days
                if delta < 1:
                    m.status = "behind the schedule"
                elif delta < 30:
                    m.status = "on ideal schedule"
                else:
                    m.status = "ahead of schedule"
                m.save()

        # Ambil notifikasi mahasiswa terbaru (misal 2 notifikasi terakhir)
        notifikasi_list = Notifikasi.objects.filter(nim=mhs, user=request.user).order_by('-waktu_kirim')[:1]

        stages = [
            "penetapan komisi pembimbing",
            "sidang komisi 1",
            "kolokium",
            "proposal",
            "penelitian dan bimbingan",
            "evaluasi dan monitoring",
            "sidang komisi 2",
            "seminar",
            "publikasi ilmiah",
            "ujian tesis"
        ]

        milestone_dict = {m.jenis_milestone.lower(): m for m in milestones}

        milestone_terbaru = milestones.order_by('-updated_at').first()
        if milestone_terbaru and milestone_terbaru.jenis_milestone.lower() in stages:
            current_stage_index = stages.index(milestone_terbaru.jenis_milestone.lower()) + 1
        else:
            current_stage_index = 0

        progress = int((current_stage_index / len(stages)) * 100)

        logs = DeadlineChangeLog.objects.select_related('milestone', 'changed_by').filter(
            milestone__penelitian_id=penelitian
        ).order_by('-timestamp')

        milestone_info = []
        for stage in stages:
            m = milestone_dict.get(stage)
            milestone_info.append({
                'nama': stage,
                'deadline': m.deadline if m else None,
                'status': m.status if m else 'Belum tersedia',
                'id': m.id if m else None,
                'is_approved': m.is_approved if m else 'Belum upload',
                'boleh_upload': m.boleh_upload() if m else False,
            })

        context = {
            'penelitian': penelitian,
            'bimbingans': bimbingans,
            'progress': progress,
            'current_stage': current_stage_index,
            'milestone_info': milestone_info,
            'logs': logs,
            'notifikasi_list': notifikasi_list,  # Notifikasi untuk alert
        }

        return render(request, "mahasiswa_dashboard.html", context)

    except Exception as e:
        return HttpResponse(f"Terjadi error: {str(e)}")


def doLogin(request):
    if request.method != "POST":
        return HttpResponse("<h2>Method Not Allowed</h2>")
    else:
        user = EmailBackEnd.authenticate(request, username=request.POST.get("email"), password=request.POST.get("password"))
        if user is not None:
            login(request, user)
            if user.user_type == "1":
                return HttpResponseRedirect("/admin_dashboard")
            elif user.user_type == "2":
                return HttpResponseRedirect("/dosen_dashboard")
            elif user.user_type == "3":
                return HttpResponseRedirect("/mahasiswa_dashboard")
        else:
            return HttpResponse("Invalid login")
        
def GetUserDetails(request):
    if request.user!=None:
        return HttpResponse("User : "+request.user.email+" usertype : "+request.user.user_type)
    else:
        return HttpResponse("Please Login First")

def logout_user(request):
    logout(request)
    return HttpResponseRedirect("/")

def register_mahasiswa(request):
    if request.method == 'POST':
        form = MahasiswaSignUpForm(request.POST)
        if form.is_valid():
            form.save()
            return HttpResponse("Mahasiswa berhasil didaftarkan!")
    else:
        form = MahasiswaSignUpForm()
    return render(request, 'register_mahasiswa.html', {'form': form})

def register_dosen(request):
    if request.method == 'POST':
        form = DosenSignUpForm(request.POST)
        if form.is_valid():
            form.save()
            return HttpResponse("Dosen berhasil didaftarkan!")
    else:
        form = DosenSignUpForm()
    return render(request, 'register_dosen.html', {'form': form})


@login_required
def edit_deadline_dropdown(request):
    if request.method == 'POST':
        milestone_id = request.POST.get('milestone_id')
        new_deadline_str = request.POST.get('new_deadline')

        try:
            new_deadline = datetime.strptime(new_deadline_str, '%Y-%m-%d').date()
            milestone = Milestone.objects.select_related('penelitian_id').get(id=milestone_id)

            # Ambil semua milestone dari penelitian ini
            all_milestones = Milestone.objects.filter(penelitian_id=milestone.penelitian_id)
            all_milestones_by_stage = {
                m.jenis_milestone.lower(): m for m in all_milestones
            }

            stages = [
                "penetapan komisi pembimbing",
                "sidang komisi 1",
                "kolokium",
                "proposal",
                "penelitian dan bimbingan",
                "evaluasi dan monitoring",
                "sidang komisi 2",
                "seminar",
                "publikasi ilmiah",
                "ujian tesis"
            ]

            current_index = stages.index(milestone.jenis_milestone.lower())

            # 🔴 Validasi 1: Tidak boleh melebihi milestone setelahnya
            if current_index + 1 < len(stages):
                next_stage_name = stages[current_index + 1]
                next_milestone = all_milestones_by_stage.get(next_stage_name)
                if next_milestone and next_milestone.deadline and new_deadline > next_milestone.deadline:
                    messages.error(
                        request,
                        f"❌ Gagal menyimpan! Deadline '{milestone.jenis_milestone.title()}' "
                        f"({new_deadline.strftime('%d %b %Y')}) tidak boleh melebihi deadline tahap selanjutnya "
                        f"'{next_stage_name.title()}' ({next_milestone.deadline.strftime('%d %b %Y')})."
                    )
                    return redirect('mahasiswa_dashboard')

            # 🔴 Validasi 2: Tidak boleh lebih awal dari milestone sebelumnya
            if current_index - 1 >= 0:
                prev_stage_name = stages[current_index - 1]
                prev_milestone = all_milestones_by_stage.get(prev_stage_name)
                if prev_milestone and prev_milestone.deadline and new_deadline < prev_milestone.deadline:
                    messages.error(
                        request,
                        f"❌ Gagal menyimpan! Deadline '{milestone.jenis_milestone.title()}' "
                        f"({new_deadline.strftime('%d %b %Y')}) tidak boleh lebih awal dari deadline tahap sebelumnya "
                        f"'{prev_stage_name.title()}' ({prev_milestone.deadline.strftime('%d %b %Y')})."
                    )
                    return redirect('mahasiswa_dashboard')

            # Simpan log perubahan deadline
            DeadlineChangeLog.objects.create(
                milestone=milestone,
                old_deadline=milestone.deadline,
                new_deadline=new_deadline,
                changed_by=request.user
            )

            milestone.deadline = new_deadline
            milestone.updated_at = timezone.now()
            milestone.save()

            messages.success(request, "✅ Deadline berhasil diperbarui.")
            return redirect('mahasiswa_dashboard')

        except Milestone.DoesNotExist:
            messages.error(request, "Milestone tidak ditemukan.")
        except ValueError:
            messages.error(request, "Format tanggal tidak valid. Gunakan format YYYY-MM-DD.")

    return redirect('mahasiswa_dashboard')


@login_required
def deadline_log(request):
    user = request.user
    if hasattr(user, 'mhs'):
        mahasiswa = user.mhs

        # Ambil semua ID penelitian milik mahasiswa ini
        penelitian_ids = Penelitian.objects.filter(nim=mahasiswa).values_list('penelitian_id', flat=True)

        # Ambil semua log milik penelitian itu saja dan diubah oleh user yang login
        logs = DeadlineChangeLog.objects.select_related(
            'milestone',
            'milestone__penelitian_id',
            'milestone__penelitian_id__nim',
            'changed_by'
        ).filter(
            milestone__penelitian_id__in=penelitian_ids,
            changed_by=user
        ).order_by('-timestamp')
    else:
        logs = DeadlineChangeLog.objects.none()

    return render(request, 'mahasiswa_dashboard.html', {'logs': logs})


@login_required
def detail_bimbingan(request, pk):
    bimbingan = get_object_or_404(Bimbingan, pk=pk)
    return render(request, 'detail.html', {'bimbingan': bimbingan})

@login_required
def edit_bimbingan(request, pk):
    bimbingan = get_object_or_404(Bimbingan, pk=pk)
    
    if request.method == 'POST':
        form = BimbinganForm(request.POST, instance=bimbingan)
        if form.is_valid():
            form.save()
            return redirect('mahasiswa_dashboard')  
    else:
        form = BimbinganForm(instance=bimbingan)

    return render(request, 'edit_bimbingan.html', {'form': form, 'bimbingan': bimbingan})

@login_required
def hapus_bimbingan(request, pk):
    bimbingan = get_object_or_404(Bimbingan, pk=pk)
    if request.method == 'POST':
        bimbingan.delete()
        return redirect('/mahasiswa_dashboard')  # pastikan nama ini sesuai
    return render(request, 'bimbingan/confirm_delete.html', {'bimbingan': bimbingan})



@login_required
def upload_bukti_milestone(request, milestone_id):
    milestone = get_object_or_404(Milestone, id=milestone_id)

    # Validasi: hanya mahasiswa pemilik yang bisa upload
    if milestone.penelitian_id.nim.admin != request.user:
        return redirect('forbidden')  # atau tampilkan pesan error

    # Validasi urutan milestone
    stages = [
        "penetapan komisi pembimbing",
        "sidang komisi 1",
        "kolokium",
        "proposal",
        "penelitian dan bimbingan",
        "evaluasi dan monitoring",
        "sidang komisi 2",
        "seminar",
        "publikasi ilmiah",
        "ujian tesis"
    ]

    # Ambil semua milestone terkait penelitian
    all_milestones = Milestone.objects.filter(penelitian_id=milestone.penelitian_id)

    # Buat dict milestone berdasarkan jenis
    milestone_dict = {m.jenis_milestone.lower(): m for m in all_milestones}

    # Cari posisi saat ini dalam stages
    current_index = stages.index(milestone.jenis_milestone.lower())

    if current_index > 0:
        previous_stage = stages[current_index - 1]
        previous_milestone = milestone_dict.get(previous_stage.lower())
        if not previous_milestone or previous_milestone.is_approved.lower() != "disetujui":
            messages.warning(request, f"Anda belum dapat mengunggah bukti untuk tahap '{milestone.jenis_milestone}'. "
                                    f"Pastikan tahap '{previous_stage}' sudah disetujui oleh dosen.")
            return redirect('mahasiswa_dashboard')

    # Validasi: hanya jika boleh upload
    if not milestone.boleh_upload():
        messages.warning(request, "Anda belum bisa mengunggah bukti untuk milestone ini. Selesaikan milestone sebelumnya dulu.")
        return redirect('mahasiswa_dashboard')

    if request.method == 'POST':
        form = BuktiMilestoneForm(request.POST, request.FILES, instance=milestone)
        if form.is_valid():
            milestone = form.save(commit=False)
            milestone.tanggal_upload = timezone.now()
            milestone.is_approved = 'pending'
            milestone.save()
            messages.success(request, "Bukti berhasil diunggah. Menunggu persetujuan dosen.")
            return redirect('mahasiswa_dashboard')
    else:
        form = BuktiMilestoneForm(instance=milestone)

    return render(request, 'upload_bukti.html', {'form': form, 'milestone': milestone})


def profile_mahasiswa(request):
    user = request.user
    mahasiswa = get_object_or_404(Mhs, admin=user)
    penelitian = mahasiswa.penelitian_set.first()

    tahap_terakhir = None
    tahap_aktif = None
    pembimbings = []

    if penelitian:
        milestones = penelitian.milestone_set.order_by('id')

        for milestone in milestones:
            if milestone.is_approved == 'disetujui':
                tahap_terakhir = milestone
            elif milestone.is_approved in ['pending', 'belum upload', 'ditolak']:
                tahap_aktif = milestone
                break

        # Ambil dua pembimbing
        pembimbings = penelitian.nip.all()

    context = {
        'mahasiswa': mahasiswa,
        'penelitian': penelitian,
        'tahap_terakhir': tahap_terakhir,
        'tahap_aktif': tahap_aktif,
        'pembimbings': pembimbings,
    }
    return render(request, 'profile_mahasiswa.html', context)


@login_required
def approve_bimbingan(request, pk):
    if request.method == 'POST':
        bimbingan = get_object_or_404(Bimbingan, pk=pk)
        bimbingan.status = 'disetujui'
        bimbingan.save()
        messages.success(request, "Kegiatan disetujui.")
    return redirect('dosen_dashboard')

@login_required
def reject_bimbingan(request, pk):
    if request.method == 'POST':
        alasan = request.POST.get('alasan')
        bimbingan = get_object_or_404(Bimbingan, pk=pk)
        bimbingan.status = 'ditolak'
        bimbingan.komentar = alasan
        bimbingan.alasan_reject = alasan 
        bimbingan.save()
        messages.error(request, "Kegiatan ditolak.")
    return redirect('dosen_dashboard')

from collections import Counter
from django.db.models import Prefetch

@login_required
def admin_dashboard(request):
    # Ambil parameter filter dari GET
    nama_query = request.GET.get('nama')
    milestone_query = request.GET.get('milestone')
    deadline_query = request.GET.get('deadline')
    dosen_query = request.GET.get('dosen')
    tahun_masuk_query = request.GET.get('tahun_masuk', '').strip()
    tahun_list = Mhs.objects.values_list('tahun_masuk', flat=True).distinct().order_by('-tahun_masuk')

    total_mahasiswa = Mhs.objects.count()
    ALL_MILESTONES = [m[0] for m in Milestone.STATUS_CHOICES]
    distribusi_milestone = Counter()
    status_counter = {
        'ahead of schedule': 0,
        'on ideal schedule': 0,
        'behind the schedule': 0,
    }

    mahasiswa_milestones = []
    daftar_mahasiswa = []

    for mhs in Mhs.objects.all():
        penelitian = mhs.penelitian_set.first()
        if not penelitian:
            continue

        milestones = list(penelitian.milestone_set.order_by('id'))
        if not milestones:
            continue

        # Ambil milestone terakhir yang disetujui
        milestone_disetujui = None
        for m in reversed(milestones):
            if m.is_approved in ['disetujui', 'approved']:
                milestone_disetujui = m
                break

        # Ambil milestone aktif (satu tahap setelah yang disetujui)
        milestone_aktif = None
        if milestone_disetujui:
            idx = milestones.index(milestone_disetujui)
            if idx + 1 < len(milestones):
                milestone_aktif = milestones[idx + 1]
        else:
            milestone_aktif = milestones[0]

        if milestone_aktif:
            # Filter nama mahasiswa
            if nama_query and nama_query.lower() not in mhs.nama_Mhs.lower():
                continue

            # Filter jenis milestone
            if milestone_query and milestone_aktif.jenis_milestone != milestone_query:
                continue

            # Filter deadline milestone
            if deadline_query and str(milestone_aktif.deadline)[:10] != deadline_query:
                continue

            # Filter dosen pembimbing
            if dosen_query:
                if not penelitian.nip.filter(nama_Dosen__icontains=dosen_query).exists():
                    continue

            # ✅ Filter tahun masuk
            if tahun_masuk_query and str(mhs.tahun_masuk) != tahun_masuk_query:
                continue
                

            mahasiswa_milestones.append({
                'penelitian_id': penelitian,
                'milestone': milestone_aktif,
            })

            distribusi_milestone[milestone_aktif.jenis_milestone] += 1
            if milestone_aktif.status in status_counter:
                status_counter[milestone_aktif.status] += 1
            else:
                status_counter['ahead of schedule'] += 1
        else:
            distribusi_milestone["Semua milestone selesai"] += 1

        daftar_mahasiswa.append({
            'nama': mhs.nama_Mhs,
            'judul': penelitian.judul,
            'tahap': milestone_disetujui.jenis_milestone if milestone_disetujui else 'Belum Ada'
        })

    distribusi_milestone_list = [
        {'jenis_milestone': milestone, 'jumlah': distribusi_milestone.get(milestone, 0)}
        for milestone in ALL_MILESTONES
    ]

    context = {
        'total_mahasiswa': total_mahasiswa,
        'mahasiswa_ahead': status_counter['ahead of schedule'],
        'mahasiswa_ideal': status_counter['on ideal schedule'],
        'mahasiswa_behind': status_counter['behind the schedule'],
        'tahap_grafik': distribusi_milestone_list,
        'daftar_mahasiswa': daftar_mahasiswa,
        'mahasiswa_milestones': mahasiswa_milestones,
        'milestone_choices': ALL_MILESTONES,
        'dosen_list': Pembimbing.objects.all(),  # untuk dropdown filter
        'tahun_list': tahun_list,
    }

    return render(request, 'admin_dashboard.html', context)

def register_admin(request):
    if request.method == 'POST':
        form = AdminRegistrationForm(request.POST)
        if form.is_valid():
            form.save()
            return HttpResponse("admin berhasil didaftarkan!")
    else:
        form = AdminRegistrationForm()
    return render(request, 'register_admin.html', {'form': form})

@csrf_exempt
@login_required
def approve_milestone(request, id):
    milestone = get_object_or_404(Milestone, id=id)
    if milestone.is_approved == 'pending':
        milestone.is_approved = 'disetujui'
        milestone.tanggal_disetujui = timezone.now()
        milestone.save()
        messages.success(request, "Milestone berhasil disetujui.")
    else:
        messages.warning(request, "Milestone sudah diproses sebelumnya.")
    return redirect('dosen_dashboard')

@csrf_exempt
@login_required
def decline_milestone(request, id):
    milestone = get_object_or_404(Milestone, id=id)
    if milestone.is_approved == 'pending':
        milestone.is_approved = 'ditolak'
        milestone.save()
        messages.success(request, "Milestone berhasil ditolak.")
    else:
        messages.warning(request, "Milestone sudah diproses sebelumnya.")
    return redirect('dosen_dashboard')

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dosen_dashboard_api(request):
    pembimbing = get_object_or_404(Pembimbing, admin=request.user)
    tahun_query = request.GET.get('tahun_masuk')

    # Ambil semua mahasiswa yang dibimbing oleh dosen
    semua_penelitian = Penelitian.objects.filter(nip=pembimbing).select_related('nim').distinct()

    # Untuk tahun_list
    tahun_list = (
        semua_penelitian
        .values_list('nim__tahun_masuk', flat=True)
        .distinct()
        .order_by('-nim__tahun_masuk')
    )

    # Filter tahun jika diberikan
    if tahun_query:
        penelitian_list = semua_penelitian.filter(nim__tahun_masuk=tahun_query)
    else:
        penelitian_list = semua_penelitian

    total_mahasiswa = penelitian_list.count()
    ALL_MILESTONES = [m[1] for m in Milestone.STATUS_CHOICES]
    distribusi_milestone = {milestone: 0 for milestone in ALL_MILESTONES}
    status_counter = {
        'ahead of schedule': 0,
        'on ideal schedule': 0,
        'behind the schedule': 0,
    }

    # Distribusi milestone berdasarkan penelitian
    for penelitian in penelitian_list:
        milestones = list(Milestone.objects.filter(penelitian_id=penelitian).order_by('id'))
        milestone_terakhir = next((m for m in reversed(milestones) if m.is_approved == 'disetujui'), None)
        milestone_next = milestones[0] if milestones else None
        if milestone_terakhir:
            idx = milestones.index(milestone_terakhir)
            milestone_next = milestones[idx + 1] if idx + 1 < len(milestones) else None

        if milestone_next:
            milestone_name = milestone_next.get_jenis_milestone_display()
            distribusi_milestone[milestone_name] += 1
            if milestone_next.status in status_counter:
                status_counter[milestone_next.status] += 1
        else:
            distribusi_milestone["Penetapan Komisi Pembimbing"] += 1
            status_counter['ahead of schedule'] += 1

    # Semua bimbingan (riwayat)
    bimbingan_list = Bimbingan.objects.filter(pembimbing=pembimbing).select_related('penelitian_id__nim')
    for bimbingan in bimbingan_list:
        milestones = list(Milestone.objects.filter(penelitian_id=bimbingan.penelitian_id).order_by('id'))
        bimbingan.deadline_logs = DeadlineChangeLog.objects.filter(
            milestone_id__in=[m.id for m in milestones]
        ).select_related('milestone')
        milestone_terakhir = next((m for m in reversed(milestones) if m.is_approved == 'disetujui'), None)
        milestone_next = milestones[0] if milestones else None
        if milestone_terakhir:
            idx = milestones.index(milestone_terakhir)
            milestone_next = milestones[idx + 1] if idx + 1 < len(milestones) else None
        bimbingan.status_progress = milestone_next.get_jenis_milestone_display() if milestone_next else "Semua milestone selesai"
        bimbingan.status_milestone = milestone_next.status if milestone_next else None

    # Ambil bimbingan terbaru (1 mahasiswa 1 bimbingan)
    latest_ids = (
        Bimbingan.objects
        .filter(pembimbing=pembimbing)
        .values('penelitian_id__nim')
        .annotate(max_id=Max('id'))
        .values_list('max_id', flat=True)
    )
    bimbingan_terbaru_list = Bimbingan.objects.filter(id__in=latest_ids).select_related('penelitian_id__nim')
    for bimbingan in bimbingan_terbaru_list:
        milestones = list(Milestone.objects.filter(penelitian_id=bimbingan.penelitian_id).order_by('id'))
        bimbingan.deadline_logs = DeadlineChangeLog.objects.filter(
            milestone_id__in=[m.id for m in milestones]
        ).select_related('milestone')
        milestone_terakhir = next((m for m in reversed(milestones) if m.is_approved == 'disetujui'), None)
        milestone_next = milestones[0] if milestones else None
        if milestone_terakhir:
            idx = milestones.index(milestone_terakhir)
            milestone_next = milestones[idx + 1] if idx + 1 < len(milestones) else None
        bimbingan.status_progress = milestone_next.get_jenis_milestone_display() if milestone_next else "Semua milestone selesai"
        bimbingan.status_milestone = milestone_next.status if milestone_next else None

    # Pending milestone
    pending_milestones = Milestone.objects.filter(
        penelitian_id__in=penelitian_list,
        is_approved='pending'
    ).select_related('penelitian_id__nim')

    distribusi_milestone_list = [
        {"name": milestone, "value": distribusi_milestone[milestone]} for milestone in ALL_MILESTONES
    ]

    return JsonResponse({
        'total_mahasiswa': total_mahasiswa,
        'ahead_count': status_counter['ahead of schedule'],
        'ideal_count': status_counter['on ideal schedule'],
        'behind_count': status_counter['behind the schedule'],
        'tahun_list': list(tahun_list),
        'distribusi_milestone': distribusi_milestone_list,
        'bimbingan_list': [
            {
                'id': b.id,
                'penelitian': {
                    'judul': b.penelitian_id.judul,
                    'nim': b.penelitian_id.nim.nim,
                    'nama_mahasiswa': b.penelitian_id.nim.nama_Mhs,
                    'username': b.penelitian_id.nim.admin.username if b.penelitian_id.nim.admin else None,
                    'tahun_masuk': b.penelitian_id.nim.tahun_masuk
                },
                'deskripsi_kegiatan': b.deskripsi_kegiatan,
                'tanggal_mulai': b.tanggal_mulai.isoformat(),
                'tanggal_selesai': b.tanggal_selesai.isoformat(),
                'komentar': b.komentar,
                'link': b.link,
                'nama_dokumen': b.nama_dokumen,
                'file_url': b.file.url if b.file else None,
                'status_progress': b.status_progress,
                'status': b.status,
                'status_milestone': b.status_milestone,
                'deadline_logs': [
                    {
                        'milestone_id': log.milestone.id,
                        'milestone_jenis': log.milestone.get_jenis_milestone_display(),
                        'old_deadline': log.old_deadline.isoformat(),
                        'new_deadline': log.new_deadline.isoformat(),
                        'timestamp': log.timestamp.isoformat(),
                        'changed_by': {
                            'username': log.changed_by.username,
                            'email': log.changed_by.email,
                        }
                    } for log in getattr(b, 'deadline_logs', [])
                ]
            } for b in bimbingan_list
        ],
        'bimbingan_terbaru_list': [
            {
                'id': b.id,
                'penelitian': {
                    'judul': b.penelitian_id.judul,
                    'nim': b.penelitian_id.nim.nim,
                    'nama_mahasiswa': b.penelitian_id.nim.nama_Mhs,
                    'username': b.penelitian_id.nim.admin.username if b.penelitian_id.nim.admin else None,
                    'tahun_masuk': b.penelitian_id.nim.tahun_masuk
                },
                'deskripsi_kegiatan': b.deskripsi_kegiatan,
                'tanggal_mulai': b.tanggal_mulai.isoformat(),
                'tanggal_selesai': b.tanggal_selesai.isoformat(),
                'komentar': b.komentar,
                'link': b.link,
                'nama_dokumen': b.nama_dokumen,
                'file_url': b.file.url if b.file else None,
                'status_progress': b.status_progress,
                'status': b.status,
                'status_milestone': b.status_milestone,
                'deadline_logs': [
                    {
                        'milestone_id': log.milestone.id,
                        'milestone_jenis': log.milestone.get_jenis_milestone_display(),
                        'old_deadline': log.old_deadline.isoformat(),
                        'new_deadline': log.new_deadline.isoformat(),
                        'timestamp': log.timestamp.isoformat(),
                        'changed_by': {
                            'username': log.changed_by.username,
                            'email': log.changed_by.email,
                        }
                    } for log in getattr(b, 'deadline_logs', [])
                ]
            } for b in bimbingan_terbaru_list
        ],
        'pending_milestones': [
            {
                'id': m.id,
                'penelitian_nim': m.penelitian_id.nim.nim,
                'nama_mahasiswa': m.penelitian_id.nim.nama_Mhs,
                'jenis_milestone': m.get_jenis_milestone_display(),
                'bukti_file_url': m.bukti_file.url if m.bukti_file else None,
                'is_approved': m.is_approved,
                'is_approved_display': m.get_is_approved_display(),
            } for m in pending_milestones
        ]
    }, safe=False)

# API
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        try:
            user = User.objects.get(
                Q(username__iexact=attrs['username']) | Q(email__iexact=attrs['username'])
            )
        except User.DoesNotExist:
            raise AuthenticationFailed("User tidak ditemukan.")

        if not user.check_password(attrs['password']):
            raise AuthenticationFailed("Password salah.")

        if not user.is_active:
            raise AuthenticationFailed("Akun tidak aktif.")

        # Buat token secara manual
        refresh = RefreshToken.for_user(user)

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'username': user.username,
            'email': user.email,
            'user_type': user.user_type,
        }

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_bimbingan_api(request, pk):
    if request.method == 'POST':
        bimbingan = get_object_or_404(Bimbingan, pk=pk)
        bimbingan.status = 'disetujui'
        bimbingan.save()
        return JsonResponse({'message': 'Bimbingan disetujui.'}, status=200)
    return JsonResponse({'error': 'Metode tidak diizinkan'}, status=405)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_bimbingan_api(request, pk):
    if request.method == 'POST':
        data = json.loads(request.body)
        alasan = data.get('alasan', '')
        bimbingan = get_object_or_404(Bimbingan, pk=pk)
        bimbingan.status = 'ditolak'
        bimbingan.komentar = alasan
        bimbingan.alasan_reject = alasan
        bimbingan.save()
        return JsonResponse({'message': 'Bimbingan ditolak.'}, status=200)
    return JsonResponse({'error': 'Metode tidak diizinkan'}, status=405)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_milestone_api(request, id):
    if request.method == 'POST':
        milestone = get_object_or_404(Milestone, id=id)
        if milestone.is_approved == 'pending':
            milestone.is_approved = 'disetujui'
            milestone.tanggal_disetujui = timezone.now()
            milestone.save()
            return JsonResponse({'message': 'Milestone berhasil disetujui.'}, status=200)
        return JsonResponse({'message': 'Milestone sudah diproses sebelumnya.'}, status=400)
    return JsonResponse({'error': 'Metode tidak diizinkan'}, status=405)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def decline_milestone_api(request, id):
    if request.method != 'POST':
        milestone = get_object_or_404(Milestone, id=id)
        if milestone.is_approved == 'pending':
            milestone.is_approved = 'ditolak'
            milestone.save()
            return JsonResponse({'message': 'Milestone berhasil ditolak.'}, status=200)
        return JsonResponse({'message': 'Milestone sudah diproses sebelumnya.'}, status=400)
    return JsonResponse({'error': 'Metode tidak diizinkan'}, status=405)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def edit_deadline_api(request):
    data = request.data
    milestone_id = data.get('milestone_id')
    new_deadline_str = data.get('new_deadline')

    if not milestone_id or not new_deadline_str:
        return Response({"error": "Milestone dan deadline wajib diisi."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        new_deadline = datetime.strptime(new_deadline_str, '%Y-%m-%d').date()
        milestone = Milestone.objects.select_related('penelitian_id').get(id=milestone_id)

        all_milestones = Milestone.objects.filter(penelitian_id=milestone.penelitian_id)
        all_milestones_by_stage = {
            m.jenis_milestone.lower(): m for m in all_milestones
        }

        stages = [
            "penetapan komisi pembimbing", "sidang komisi 1", "kolokium", "proposal",
            "penelitian dan bimbingan", "evaluasi dan monitoring", "sidang komisi 2",
            "seminar", "publikasi ilmiah", "ujian tesis"
        ]
        current_index = stages.index(milestone.jenis_milestone.lower())

        # Validasi setelahnya
        if current_index + 1 < len(stages):
            next_milestone = all_milestones_by_stage.get(stages[current_index + 1])
            if next_milestone and next_milestone.deadline and new_deadline > next_milestone.deadline:
                return Response({
                    "error": f"Deadline tidak boleh melebihi tahap selanjutnya ({next_milestone.deadline})"
                }, status=status.HTTP_400_BAD_REQUEST)

        # Validasi sebelumnya
        if current_index - 1 >= 0:
            prev_milestone = all_milestones_by_stage.get(stages[current_index - 1])
            if prev_milestone and prev_milestone.deadline and new_deadline < prev_milestone.deadline:
                return Response({
                    "error": f"Deadline tidak boleh lebih awal dari tahap sebelumnya ({prev_milestone.deadline})"
                }, status=status.HTTP_400_BAD_REQUEST)

        # Log perubahan
        DeadlineChangeLog.objects.create(
            milestone=milestone,
            old_deadline=milestone.deadline,
            new_deadline=new_deadline,
            changed_by=request.user
        )

        milestone.deadline = new_deadline
        milestone.updated_at = timezone.now()
        milestone.save()

        return Response({"message": "✅ Deadline berhasil diperbarui."}, status=status.HTTP_200_OK)

    except Milestone.DoesNotExist:
        return Response({"error": "Milestone tidak ditemukan."}, status=status.HTTP_404_NOT_FOUND)
    except ValueError:
        return Response({"error": "Format tanggal tidak valid (harus YYYY-MM-DD)."}, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_bukti_api(request, milestone_id):
    try:
        milestone = Milestone.objects.select_related('penelitian_id__nim').get(id=milestone_id)

        # Validasi user adalah mahasiswa pemilik
        if milestone.penelitian_id.nim.admin != request.user:
            return Response({"error": "Anda tidak diizinkan mengunggah bukti untuk milestone ini."}, status=403)

        # Validasi tahapan
        stages = [
            "penetapan komisi pembimbing",
            "sidang komisi 1",
            "kolokium",
            "proposal",
            "penelitian dan bimbingan",
            "evaluasi dan monitoring",
            "sidang komisi 2",
            "seminar",
            "publikasi ilmiah",
            "ujian tesis"
        ]

        all_milestones = Milestone.objects.filter(penelitian_id=milestone.penelitian_id)
        milestone_dict = {m.jenis_milestone.lower(): m for m in all_milestones}
        current_index = stages.index(milestone.jenis_milestone.lower())

        if current_index > 0:
            prev_stage = stages[current_index - 1]
            prev_milestone = milestone_dict.get(prev_stage.lower())
            if not prev_milestone or prev_milestone.is_approved.lower() != "disetujui":
                return Response({
                    "error": f"Anda belum dapat mengunggah bukti. Tahap sebelumnya ({prev_stage}) belum disetujui."
                }, status=400)

        # Validasi custom method (boleh_upload)
        if not milestone.boleh_upload():
            return Response({
                "error": "Anda belum bisa mengunggah bukti untuk milestone ini."
            }, status=400)

        form = BuktiMilestoneForm(request.POST, request.FILES, instance=milestone)
        if form.is_valid():
            milestone = form.save(commit=False)
            milestone.tanggal_upload = timezone.now()
            milestone.is_approved = 'pending'
            milestone.save()
            return Response({"message": "✅ Bukti berhasil diunggah. Menunggu persetujuan dosen."})
        else:
            return Response({"error": "Form tidak valid", "detail": form.errors}, status=400)

    except Milestone.DoesNotExist:
        return Response({"error": "Milestone tidak ditemukan"}, status=404)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_timeline_milestones(request):
    user = request.user
    try:
        penelitian = Penelitian.objects.get(nim__admin=user)
        milestones = Milestone.objects.filter(penelitian_id=penelitian)
        serializer = MilestoneTimelineSerializer(milestones, many=True)
        return Response(serializer.data, status=200)
    except Penelitian.DoesNotExist:
        return Response({"error": "Data penelitian tidak ditemukan."}, status=404)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sebaran_mahasiswa_view(request):
    ALL_MILESTONES = [m[1] for m in Milestone.STATUS_CHOICES]
    distribusi_milestone = {milestone: 0 for milestone in ALL_MILESTONES}

    # Ambil query parameter filter
    filter_value = request.GET.get('filter', 'all')

    # Ambil semua penelitian
    penelitian_list = Penelitian.objects.all()

    # Jika filter dipakai, filter berdasarkan tahun masuk mahasiswa
    if filter_value != "all":
        penelitian_list = penelitian_list.filter(nim__tahun_masuk=filter_value)

    for penelitian in penelitian_list:
        milestones = list(Milestone.objects.filter(penelitian_id=penelitian).order_by('id'))

        if milestones:
            milestone_terakhir = next(
                (m for m in reversed(milestones) if m.is_approved == 'disetujui'),
                None
            )
            milestone_next = milestones[0]

            if milestone_terakhir:
                idx = milestones.index(milestone_terakhir)
                milestone_next = milestones[idx + 1] if idx + 1 < len(milestones) else None

            if milestone_next:
                milestone_name = milestone_next.get_jenis_milestone_display()
                if milestone_name in distribusi_milestone:
                    distribusi_milestone[milestone_name] += 1
        else:
            # Jika belum ada milestone sama sekali
            distribusi_milestone["Penetapan Komisi Pembimbing"] += 1

    distribusi_milestone_list = [
        {'name': milestone, 'value': distribusi_milestone.get(milestone, 0)}
        for milestone in ALL_MILESTONES
    ]

    return Response(distribusi_milestone_list)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pengajuan_bimbingan_api(request):
    try:
        mhs = get_object_or_404(Mhs, admin=request.user)
        penelitian = Penelitian.objects.filter(nim=mhs).first()
        if not penelitian:
            return Response({"error": "Belum ada data penelitian"}, status=404)

        bimbingans = Bimbingan.objects.filter(penelitian_id=penelitian).order_by('-tanggal_mulai')

        data = []
        for b in bimbingans:
            durasi_jam = (b.tanggal_selesai - b.tanggal_mulai).total_seconds() / 3600

            data.append({
                "id": b.id,
                "tahunSemester": b.tahun_semester,
                "namaDosen": str(b.pembimbing) if b.pembimbing else "-",
                "waktu": b.tanggal_mulai.strftime("%d %b %Y, %H:%M"),
                "durasi": f"{durasi_jam:.1f} Jam",
                "jenis": b.tipe_penyelenggaraan.capitalize(),  # contoh: Hybrid
                "status": b.status.capitalize(),  # contoh: Disetujui
            })

        return Response({"pengajuan": data})
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def hapus_bimbingan(request, id):
    try:
        bimbingan = get_object_or_404(Bimbingan, id=id, penelitian_id__nim__admin=request.user)
        bimbingan.delete()
        return Response({"message": "Bimbingan berhasil dihapus"}, status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

class TambahBimbinganAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Ambil mahasiswa berdasarkan user login
            mahasiswa = get_object_or_404(Mhs, admin=request.user)
            penelitian = Penelitian.objects.filter(nim=mahasiswa).first()

            if not penelitian:
                return Response({"error": "Anda belum memiliki penelitian yang terdaftar."}, status=400)

            form = BimbinganForm(request.data, request.FILES, penelitian=penelitian)
            if form.is_valid():
                bimbingan = form.save(commit=False)
                bimbingan.penelitian_id = penelitian
                bimbingan.save()
                return Response({"message": "Bimbingan berhasil disimpan."}, status=200)
            else:
                return Response({"error": form.errors}, status=400)

        except Exception as e:
            return Response({"error": str(e)}, status=500)
        
class DosenPembimbingListAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            mhs = Mhs.objects.get(admin=request.user)
            penelitian = Penelitian.objects.filter(nim=mhs).first()

            if not penelitian:
                return Response({"error": "Tidak ada penelitian"}, status=404)

            pembimbings = penelitian.nip.all()  # valid karena ManyToManyField
            data = PembimbingSerializer(pembimbings, many=True).data
            return Response(data)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        
class DetailBimbinganAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        bimbingan = get_object_or_404(Bimbingan, pk=pk)

        # Hanya izinkan mahasiswa pemilik data
        if bimbingan.penelitian_id.nim.admin != request.user:
            return Response({"error": "Unauthorized"}, status=403)

        data = BimbinganSerializer(bimbingan).data
        return Response(data)
    
class EditBimbinganAPI(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        bimbingan = get_object_or_404(Bimbingan, pk=pk)

        # Cek hak akses
        if bimbingan.penelitian_id.nim.admin != request.user:
            return Response({"error": "Unauthorized"}, status=403)

        # Tidak bisa edit jika sudah disetujui
        if bimbingan.status == "Disetujui":
            return Response({"error": "Bimbingan sudah disetujui dan tidak dapat diubah."}, status=403)

        form = BimbinganForm(request.data, request.FILES, instance=bimbingan, penelitian=bimbingan.penelitian_id)

        if form.is_valid():
            form.save()
            return Response({"message": "Bimbingan berhasil diperbarui."})
        else:
            return Response({"error": form.errors}, status=400)
        
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profil_mahasiswa(request):
    try:
        mahasiswa = Mhs.objects.get(admin=request.user)
        serializer = MhsSerializer(mahasiswa)
        return Response(serializer.data)
    except Mhs.DoesNotExist:
        return Response({"error": "Data mahasiswa tidak ditemukan"}, status=404)
    

class ProfilPembimbingAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            pembimbing = Pembimbing.objects.get(admin=request.user)
            serializer = PembimbingSerializer(pembimbing)
            return Response(serializer.data)
        except Pembimbing.DoesNotExist:
            return Response({"error": "Pembimbing tidak ditemukan"}, status=404)
        

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mahasiswa_detail_view(request, nim):
    pembimbing = get_object_or_404(Pembimbing, admin=request.user)

    # Pastikan hanya mahasiswa yang dibimbing
    penelitian = get_object_or_404(Penelitian, nim__nim=nim, nip=pembimbing)
    mhs = penelitian.nim

    bimbingan = (
        Bimbingan.objects.filter(penelitian_id=penelitian)
        .select_related('penelitian_id__nim')
        .order_by('-tanggal_mulai')
    )

    data = {
        'mahasiswa': {
            'nama_Mhs': mhs.nama_Mhs,
            'nim': mhs.nim,
            'tahun_masuk': mhs.tahun_masuk,
        },
        'bimbingan': [
            {
                'id': b.id,
                'deskripsi_kegiatan': b.deskripsi_kegiatan,
                'tanggal_mulai': b.tanggal_mulai.isoformat(),
                'tanggal_selesai': b.tanggal_selesai.isoformat(),
                'status': b.status,
            } for b in bimbingan
        ]
    }
    return Response(data)