from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import ChatSession, Message
from .serializers import (
    AskQuestionSerializer, ChatSessionSerializer,
    ChatSessionListSerializer, MessageSerializer
)
from firms.models import LawFirm


def _get_chat_history(session):
    """Build LangChain-compatible chat history from session messages."""
    messages = session.messages.all()
    history = []
    user_msg = None
    for msg in messages:
        if msg.role == 'user':
            user_msg = msg.content
        elif msg.role == 'assistant' and user_msg:
            history.append((user_msg, msg.content))
            user_msg = None
    return history


class AskView(APIView):
    """
    Main chatbot endpoint.
    Accepts questions from both authenticated users and anonymous widget users (via embed_key).
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = AskQuestionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        question = serializer.validated_data['question']
        session_id = serializer.validated_data.get('session_id')
        embed_key = serializer.validated_data.get('embed_key', '')

        # Resolve firm
        firm = None
        if embed_key and embed_key != 'demo':
            try:
                firm = LawFirm.objects.get(embed_key=embed_key, is_active=True)
            except LawFirm.DoesNotExist:
                return Response({'error': 'Invalid embed key.'}, status=403)
        elif request.user.is_authenticated and request.user.firm:
            firm = request.user.firm

        # Resolve or create session
        session = None
        if session_id:
            try:
                session = ChatSession.objects.get(session_id=session_id)
            except ChatSession.DoesNotExist:
                pass

        if not session:
            session = ChatSession.objects.create(
                firm=firm,
                user=request.user if request.user.is_authenticated else None,
                client_name=serializer.validated_data.get('client_name', ''),
                client_email=serializer.validated_data.get('client_email', ''),
            )

        # Build chat history for RAG
        chat_history = _get_chat_history(session)

        # Save user message
        Message.objects.create(session=session, role='user', content=question)

        # Run RAG chain
        try:
            from rag.chain import ask_legal_question
            result = ask_legal_question(question, chat_history)
            answer = result['answer']
            sources = result['sources']
        except FileNotFoundError:
            answer = (
                "⚠️ The legal knowledge base is not yet initialized. "
                "Please run: cd backend && python rag/ingest.py"
            )
            sources = []
        except Exception as e:
            err_msg = str(e)
            if "Invalid API Key" in err_msg or "401" in err_msg:
                answer = "⚠️ I cannot answer right now because my Groq API Key is not configured correctly. The server admin needs to put a valid key in the backend/.env file."
            elif "GROQ_API_KEY not set" in err_msg:
                answer = "⚠️ My GROQ API key is missing. The server admin needs to set it in backend/.env."
            else:
                answer = "I'm sorry, I encountered an error processing your question. Please try again."
            sources = []
            print(f"RAG Error: {e}")

        # Save assistant message
        Message.objects.create(
            session=session,
            role='assistant',
            content=answer,
            sources=sources
        )

        return Response({
            'session_id': str(session.session_id),
            'answer': answer,
            'sources': sources,
        })


class ChatHistoryView(APIView):
    """List all chat sessions for the user's firm (lightweight, no messages)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.firm:
            sessions = ChatSession.objects.filter(
                firm=request.user.firm
            ).order_by('-last_active')
        else:
            sessions = ChatSession.objects.filter(
                user=request.user
            ).order_by('-last_active')

        serializer = ChatSessionListSerializer(sessions, many=True)
        return Response(serializer.data)


class SessionDetailView(APIView):
    """Get all messages for a specific session."""
    permission_classes = [AllowAny]

    def get(self, request, session_id):
        try:
            session = ChatSession.objects.prefetch_related('messages').get(session_id=session_id)
        except ChatSession.DoesNotExist:
            return Response({'error': 'Session not found.'}, status=404)

        messages = session.messages.all().order_by('timestamp')
        return Response({
            'session_id': str(session.session_id),
            'client_name': session.client_name,
            'is_active': session.is_active,
            'messages': MessageSerializer(messages, many=True).data
        })


class ChatStatsView(APIView):
    """Usage stats for the firm dashboard."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        firm = request.user.firm
        if not firm:
            # Try owned_firm
            try:
                firm = request.user.owned_firm
            except Exception:
                return Response({'error': 'No firm associated.'}, status=404)

        if not firm:
            return Response({'error': 'No firm associated.'}, status=404)

        total_sessions = ChatSession.objects.filter(firm=firm).count()
        total_messages = Message.objects.filter(session__firm=firm).count()
        recent_sessions = ChatSession.objects.filter(firm=firm).order_by('-last_active')[:5]

        return Response({
            'total_sessions': total_sessions,
            'total_messages': total_messages,
            'ai_responses': Message.objects.filter(session__firm=firm, role='assistant').count(),
            'recent_sessions': ChatSessionListSerializer(recent_sessions, many=True).data,
        })
