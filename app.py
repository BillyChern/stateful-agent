from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
from dotenv import load_dotenv
import os
import json
from pathlib import Path
from agent_manager import agent_manager

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'your-secret-key')
socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/labs', methods=['GET'])
def get_labs():
    try:
        labs = agent_manager.get_labs()
        # Ensure labs is a list of dictionaries with all required fields
        if isinstance(labs, list):
            return jsonify({'labs': labs})
        elif isinstance(labs, dict) and 'error' in labs:
            return jsonify({'error': labs['error']}), 500
        else:
            return jsonify({'labs': []}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/papers', methods=['GET'])
def get_papers():
    try:
        lab_name = request.args.get('lab_name')
        papers = agent_manager.get_papers(lab_name)
        return jsonify({'papers': papers})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/labs', methods=['POST'])
def create_lab():
    try:
        data = request.json
        lab = agent_manager.create_lab(
            name=data['name'],
            institution=data['institution'],
            leader=data['leader']
        )
        return jsonify(lab)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/labs/<lab_name>/members', methods=['POST'])
def add_lab_member(lab_name):
    try:
        data = request.json
        member = agent_manager.add_lab_member(
            lab_name=lab_name,
            member_name=data['name'],
            scholar_url=data['scholar_url']
        )
        return jsonify(member)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/labs/<lab_name>/papers/collect', methods=['POST'])
def collect_papers(lab_name):
    try:
        papers = agent_manager.collect_papers(lab_name)
        return jsonify({'papers': papers})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/labs/<lab_name>/papers/recommend', methods=['GET'])
def recommend_papers(lab_name):
    try:
        days = int(request.args.get('days', 30))
        limit = int(request.args.get('limit', 5))
        papers = agent_manager.recommend_papers(lab_name, days, limit)
        return jsonify({'papers': papers})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/linkedin/post', methods=['POST'])
def post_to_linkedin():
    """Post content to LinkedIn."""
    data = request.json
    content = data.get('content')
    paper_url = data.get('paper_url')
    
    if not content:
        return jsonify({'error': 'Content is required'}), 400
        
    result = agent_manager.post_to_linkedin(content, paper_url)
    
    if result['success']:
        return jsonify(result)
    else:
        return jsonify({'error': result['message']}), 500

@app.route('/api/linkedin/posts', methods=['GET'])
def get_linkedin_posts():
    """Get recent LinkedIn posts."""
    limit = request.args.get('limit', 5, type=int)
    posts = agent_manager.linkedin_agent.get_recent_posts(limit)
    return jsonify({'posts': posts})

@socketio.on('chat_message')
def handle_chat_message(data):
    try:
        message = data.get('message', '')
        response = agent_manager.process_message(message)
        emit('agent_response', {'message': response})
    except Exception as e:
        emit('agent_response', {'error': str(e)})

@socketio.on('connect')
def handle_connect():
    emit('connection_response', {'status': 'connected'})

if __name__ == '__main__':
    # Ensure required directories exist
    Path('data/recommendation').mkdir(parents=True, exist_ok=True)
    
    # Start the server
    socketio.run(app, debug=True, host='0.0.0.0', port=5000) 