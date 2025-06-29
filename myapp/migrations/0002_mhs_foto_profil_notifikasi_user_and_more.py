# Generated by Django 5.2 on 2025-06-08 10:22

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='mhs',
            name='foto_profil',
            field=models.ImageField(blank=True, help_text='Upload foto profil mahasiswa (maks 2MB)', null=True, upload_to='foto_profil/'),
        ),
        migrations.AddField(
            model_name='notifikasi',
            name='user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='pembimbing',
            name='foto_profil_Dosen',
            field=models.ImageField(blank=True, help_text='Upload foto profil (maks 2MB)', null=True, upload_to='foto_profil/'),
        ),
    ]
