from rest_framework import serializers
from .models import Milestone, Pembimbing, Bimbingan, Mhs

class MilestoneTimelineSerializer(serializers.ModelSerializer):
    label = serializers.SerializerMethodField()

    class Meta:
        model = Milestone
        fields = ['id', 'label', 'is_approved', 'status']

    def get_label(self, obj):
        return obj.jenis_milestone
    

class PembimbingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pembimbing
        fields = ['id', 'nama_Dosen', 'nip', 'foto_profil_Dosen']

class BimbinganSerializer(serializers.ModelSerializer):
    pembimbing_nama = serializers.SerializerMethodField()
    class Meta:
        model = Bimbingan
        fields = '__all__'

    def get_pembimbing_nama(self, obj):
        if obj.pembimbing:
            return obj.pembimbing.nama_Dosen
        return "-"
    

class MhsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mhs
        fields = ['nama_Mhs', 'nim', 'foto_profil']
