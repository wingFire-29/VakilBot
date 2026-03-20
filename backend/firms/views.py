from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import LawFirm
from .serializers import LawFirmSerializer, LawFirmPublicSerializer
import uuid


def _get_user_firm(user):
    """Safely retrieve a user's firm - tries owned_firm first, then FK."""
    try:
        firm = user.owned_firm
        if firm:
            return firm
    except Exception:
        pass
    if user.firm_id:
        return user.firm
    return None


class FirmDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get the current user's firm details."""
        firm = _get_user_firm(request.user)
        if not firm:
            return Response({'error': 'No firm associated with this account.'}, status=404)
        return Response(LawFirmSerializer(firm).data)

    def put(self, request):
        """Update firm details (owner only)."""
        firm = _get_user_firm(request.user)
        if not firm:
            return Response({'error': 'No firm associated with this account.'}, status=404)
        # Only the owner can update
        try:
            if firm.owner_id != request.user.pk:
                return Response({'error': 'Only the firm owner can update firm details.'}, status=403)
        except Exception:
            pass
        serializer = LawFirmSerializer(firm, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


class RegenerateEmbedKeyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Generate a new embed key for the firm."""
        firm = _get_user_firm(request.user)
        if not firm:
            return Response({'error': 'No firm associated with this account.'}, status=404)
        try:
            if firm.owner_id != request.user.pk:
                return Response({'error': 'Only the firm owner can regenerate the embed key.'}, status=403)
        except Exception:
            pass
        firm.embed_key = uuid.uuid4().hex
        firm.save()
        return Response({'embed_key': firm.embed_key})


class ValidateEmbedKeyView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        """Widget uses this to validate its embed key."""
        key = request.query_params.get('key')
        if not key:
            return Response({'valid': False, 'error': 'No key provided'}, status=400)
        # Allow demo mode
        if key == 'demo':
            return Response({
                'valid': True,
                'firm': {'id': 0, 'name': 'VakilBot Demo', 'is_active': True, 'allowed_domains': ''}
            })
        try:
            firm = LawFirm.objects.get(embed_key=key, is_active=True)
            return Response({
                'valid': True,
                'firm': LawFirmPublicSerializer(firm).data
            })
        except LawFirm.DoesNotExist:
            return Response({'valid': False, 'error': 'Invalid or inactive key'}, status=404)
